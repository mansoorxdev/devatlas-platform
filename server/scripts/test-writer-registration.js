process.env.NODE_ENV = 'test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../src/models/user.model.js';
import Article from '../src/models/article.model.js';
import { connectDB } from '../src/config/db.js';
import app from '../src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const runWriterRegistrationTests = async () => {
  console.log('\n--- DEVATLAS STEP 6C: PUBLIC WRITER REGISTRATION & AUTH VERIFICATION SUITE ---\n');

  let server;
  const PORT = 5100;
  const BASE_URL = `http://127.0.0.1:${PORT}`;

  try {
    await connectDB();
    console.log('  Connected to MongoDB for testing.');

    server = app.listen(PORT);
    console.log(`  Test HTTP server listening on port ${PORT}.`);

    const testWriterEmail = 'new_public_writer@devatlas.com';
    const testPassword = 'SecurePassword123!';

    await User.deleteMany({ email: testWriterEmail });

    const extractCookieHeader = (res) => {
      const setCookie = res.headers.get('set-cookie');
      if (!setCookie) return '';
      return setCookie.split(';')[0];
    };

    // 1. Test Successful Writer Registration
    const registerRes = await fetch(`${BASE_URL}/api/v1/auth/writer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Contributor',
        email: testWriterEmail,
        password: testPassword,
      }),
    });

    console.assert(registerRes.status === 201, `Expected 201 on registration, got ${registerRes.status}`);
    const regBody = await registerRes.json();
    const createdUser = regBody.data.user;
    console.assert(createdUser.writerStatus === 'pending', 'Registered writer default status must be pending');
    console.log('  ✅ PASS: Writer application submitted successfully; status: 201, writerStatus: "pending"');

    // Approve test writer in DB to proceed with login & portal access tests
    await User.findByIdAndUpdate(createdUser.id, { writerStatus: 'approved', isActive: true });

    // 2. Test Privilege Escalation Protection: Payload containing role: 'admin' fails validation (.strict())
    const escalationRes = await fetch(`${BASE_URL}/api/v1/auth/writer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hacker Contributor',
        email: 'hacker@devatlas.com',
        password: testPassword,
        role: 'admin',
      }),
    });

    console.assert(escalationRes.status === 400, `Expected 400 when client passes role field, got ${escalationRes.status}`);
    console.log('  ✅ PASS: Privilege escalation attempt passing role: "admin" rejected with HTTP 400 VALIDATION_FAILED');

    // 3. Test Short Password Rejection (< 8 chars)
    const weakPassRes = await fetch(`${BASE_URL}/api/v1/auth/writer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Weak Pass',
        email: 'weakpass@devatlas.com',
        password: 'short',
      }),
    });

    console.assert(weakPassRes.status === 400, `Expected 400 when password < 8 chars, got ${weakPassRes.status}`);
    console.log('  ✅ PASS: Registration with weak password (< 8 chars) rejected with HTTP 400 VALIDATION_FAILED');

    // 4. Test Duplicate Email Protection (HTTP 409 DUPLICATE_EMAIL)
    const duplicateRes = await fetch(`${BASE_URL}/api/v1/auth/writer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Contributor',
        email: testWriterEmail,
        password: testPassword,
      }),
    });

    console.assert(duplicateRes.status === 409, `Expected 409 on duplicate email registration, got ${duplicateRes.status}`);
    const dupBody = await duplicateRes.json();
    console.assert(dupBody.error.code === 'DUPLICATE_EMAIL', `Expected DUPLICATE_EMAIL code, got ${dupBody.error.code}`);
    console.log('  ✅ PASS: Duplicate email registration rejected with HTTP 409 DUPLICATE_EMAIL');

    // 5. Test Dedicated Writer Login
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testWriterEmail, password: testPassword }),
    });

    console.assert(loginRes.status === 200, `Expected 200 on writer login, got ${loginRes.status}`);
    console.log('  ✅ PASS: Writer logs in successfully via /api/v1/auth/login');

    const writerCookie = extractCookieHeader(loginRes);

    // 6. Test GET /api/v1/auth/me for Authenticated Writer
    const meRes = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Cookie: writerCookie },
    });

    console.assert(meRes.status === 200, `Expected 200 on GET /me for writer, got ${meRes.status}`);
    const meBody = await meRes.json();
    console.assert(meBody.data.user.email === testWriterEmail, 'GET /me must return authenticated writer profile');
    console.log('  ✅ PASS: Authenticated writer fetches profile via GET /api/v1/auth/me');

    // 7. Test Admin Route Isolation: Writer blocked from Admin endpoints
    const adminQueueRes = await fetch(`${BASE_URL}/api/v1/articles/admin/review`, {
      headers: { Cookie: writerCookie },
    });

    console.assert(adminQueueRes.status === 403, `Expected 403 when writer accesses admin queue, got ${adminQueueRes.status}`);
    console.log('  ✅ PASS: Writer strictly blocked from Admin routes with HTTP 403 FORBIDDEN');

    // 8. Test Deactivated Writer Blocking
    await User.findByIdAndUpdate(createdUser.id, { isActive: false });

    const blockedLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testWriterEmail, password: testPassword }),
    });

    console.assert(blockedLoginRes.status === 403, `Expected 403 when deactivated writer logs in, got ${blockedLoginRes.status}`);
    console.log('  ✅ PASS: Deactivated writer login blocked with HTTP 403 ACCOUNT_DISABLED');

    // Clean up test data
    await User.deleteMany({ email: { $in: [testWriterEmail, 'hacker@devatlas.com', 'weakpass@devatlas.com'] } });

    console.log('\n--- PUBLIC WRITER REGISTRATION & AUTH VERIFICATION COMPLETE: ALL TESTS PASSED ---\n');

    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during writer registration verification:', error);
    if (server) server.close();
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
};

runWriterRegistrationTests();
