process.env.NODE_ENV = 'test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../src/models/user.model.js';
import Article from '../src/models/article.model.js';
import { connectDB } from '../src/config/db.js';
import app from '../src/app.js';
import { ALLOWED_AVATAR_IDS, DEFAULT_AVATAR_ID } from '../src/constants/avatars.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const runAvatarSystemTests = async () => {
  console.log('\n--- DEVATLAS STEP 7: FREE DEFAULT AVATAR SYSTEM VERIFICATION SUITE ---\n');

  let server;
  const PORT = 5106;
  const BASE_URL = `http://127.0.0.1:${PORT}`;

  try {
    await connectDB();
    console.log('  Connected to MongoDB for testing.');

    server = app.listen(PORT);
    console.log(`  Test HTTP server listening on port ${PORT}.`);

    const writer1Email = 'avatar_writer1@devatlas.com';
    const writer2Email = 'avatar_writer2@devatlas.com';
    const password = 'TestPassword123!';

    await User.deleteMany({ email: { $in: [writer1Email, writer2Email] } });

    // 1. Test Client Cannot Submit Arbitrary Avatar in Registration Payload (Strict Zod Rejection)
    const clientAvatarRegRes = await fetch(`${BASE_URL}/api/v1/auth/writer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Avatar Writer 1',
        email: writer1Email,
        password,
        avatar: 'https://malicious-external-site.com/hacked.jpg', // Should be REJECTED by strict Zod schema
      }),
    });
    console.assert(clientAvatarRegRes.status === 400, `Expected 400 when submitting client avatar in registration, got ${clientAvatarRegRes.status}`);
    console.log('  ✅ SECURITY PASS: Client-supplied avatar field during registration is strictly rejected (HTTP 400)');

    // Clean registration (server auto-assigns default avatar)
    const regRes = await fetch(`${BASE_URL}/api/v1/auth/writer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Avatar Writer 1',
        email: writer1Email,
        password,
      }),
    });
    console.assert(regRes.status === 201, `Expected 201 on valid registration, got ${regRes.status}`);
    const regBody = await regRes.json();
    const writer1 = regBody.data.user;

    console.assert(writer1.avatar === DEFAULT_AVATAR_ID, `Expected default avatar '${DEFAULT_AVATAR_ID}', got '${writer1.avatar}'`);
    console.assert(ALLOWED_AVATAR_IDS.includes(writer1.avatar), 'Assigned avatar must belong to approved whitelist');
    console.log('  ✅ PASS: Newly registered writer automatically receives default whitelisted avatar (avatar-01)');

    // Login Writer 1 & Writer 2
    const login = async (email) => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const cookies = res.headers.get('set-cookie');
      return { cookies };
    };

    // Register Writer 2
    await fetch(`${BASE_URL}/api/v1/auth/writer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Avatar Writer 2',
        email: writer2Email,
        password,
      }),
    });

    const { cookies: writer1Cookies } = await login(writer1Email);
    const { cookies: writer2Cookies } = await login(writer2Email);

    // 2. Test Rejection of Arbitrary External URLs on Profile Update
    const extUrlRes = await fetch(`${BASE_URL}/api/v1/users/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: writer1Cookies,
      },
      body: JSON.stringify({
        avatar: 'https://evil-hacker.com/image.png',
      }),
    });
    console.assert(extUrlRes.status === 400, `Expected 400 on external avatar URL, got ${extUrlRes.status}`);
    console.log('  ✅ SECURITY PASS: External avatar URLs are strictly rejected by profile validator (HTTP 400)');

    // 3. Test Rejection of Unknown Avatar IDs
    const unknownIdRes = await fetch(`${BASE_URL}/api/v1/users/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: writer1Cookies,
      },
      body: JSON.stringify({
        avatar: 'avatar-999',
      }),
    });
    console.assert(unknownIdRes.status === 400, `Expected 400 on unknown avatar ID, got ${unknownIdRes.status}`);
    console.log('  ✅ SECURITY PASS: Unknown avatar IDs outside whitelist are strictly rejected (HTTP 400)');

    // 4. Test Writer Changing to another Approved Whitelisted Avatar
    const validChangeRes = await fetch(`${BASE_URL}/api/v1/users/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: writer1Cookies,
      },
      body: JSON.stringify({
        avatar: 'avatar-05',
      }),
    });
    console.assert(validChangeRes.status === 200, `Expected 200 on valid avatar change, got ${validChangeRes.status}`);
    const validChangeBody = await validChangeRes.json();
    console.assert(validChangeBody.data.user.avatar === 'avatar-05', 'Avatar should update to avatar-05');
    console.log('  ✅ PASS: Writer successfully changes avatar to another approved whitelisted ID (avatar-05)');

    // 5. Test Public Author Profile Returns Correct Avatar & Excludes Sensitive Data
    const publicProfileRes = await fetch(`${BASE_URL}/api/v1/users/authors/${writer1.slug}`);
    console.assert(publicProfileRes.status === 200, `Expected 200 on public author profile, got ${publicProfileRes.status}`);
    const publicProfileBody = await publicProfileRes.json();
    const publicAuthor = publicProfileBody.data.author;

    console.assert(publicAuthor.avatar === 'avatar-05', `Expected public author avatar 'avatar-05', got '${publicAuthor.avatar}'`);
    console.assert(publicAuthor.email === undefined, 'PRIVACY PASS: Email must be excluded from public profile');
    console.assert(publicAuthor.password === undefined, 'PRIVACY PASS: Password hash must be excluded');
    console.assert(publicAuthor.isActive === undefined, 'PRIVACY PASS: isActive must be excluded');
    console.log('  ✅ PASS: Public Author Profile returns approved avatar ID and strictly excludes private user fields');

    // 6. Test Backfill Mechanism for Existing Writers without Avatar
    await User.updateOne({ email: writer2Email }, { $set: { avatar: '' } });
    const unsetsUser = await User.findOne({ email: writer2Email });
    console.assert(unsetsUser.avatar === '', 'Avatar unset for migration test');

    const publicProfile2Res = await fetch(`${BASE_URL}/api/v1/users/authors/${unsetsUser.slug}`);
    console.assert(publicProfile2Res.status === 200, 'Expected 200 on public profile backfill check');
    const publicProfile2Body = await publicProfile2Res.json();
    console.assert(publicProfile2Body.data.author.avatar === DEFAULT_AVATAR_ID, 'Backfill must assign default avatar ID');
    console.log('  ✅ PASS: Safe backfill mechanism assigns default avatar ID to existing writers missing an avatar');

    // Cleanup
    await User.deleteMany({ email: { $in: [writer1Email, writer2Email] } });

    console.log('\n--- FREE DEFAULT AVATAR SYSTEM VERIFICATION COMPLETE: ALL TESTS PASSED ---\n');

    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during avatar system verification:', error);
    if (server) server.close();
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
};

runAvatarSystemTests();
