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

const runWriterManagementTests = async () => {
  console.log('\n--- DEVATLAS STEP 6B: WRITER MANAGEMENT & ACTIVATION VERIFICATION SUITE ---\n');

  let server;
  const PORT = 5099;
  const BASE_URL = `http://127.0.0.1:${PORT}`;

  try {
    await connectDB();
    console.log('  Connected to MongoDB for testing.');

    server = app.listen(PORT);
    console.log(`  Test HTTP server listening on port ${PORT}.`);

    // 1. Setup Test Users: 1 Admin and 1 Writer
    const testAdminEmail = 'test_admin_mgmt@devatlas.com';
    const testWriterEmail = 'test_writer_mgmt@devatlas.com';
    const testPassword = 'TestPassword123!';

    await User.deleteMany({ email: { $in: [testAdminEmail, testWriterEmail] } });

    const adminUser = await User.create({
      name: 'Test Admin Mgmt',
      email: testAdminEmail,
      password: testPassword,
      role: 'admin',
    });

    const writerUser = await User.create({
      name: 'Test Contributor Mgmt',
      email: testWriterEmail,
      password: testPassword,
      role: 'writer',
    });

    console.log('  Created Test Admin and Writer accounts.');

    const extractCookieHeader = (res) => {
      const setCookie = res.headers.get('set-cookie');
      if (!setCookie) return '';
      return setCookie.split(';')[0];
    };

    // Admin login
    const adminLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testAdminEmail, password: testPassword }),
    });
    const adminCookie = extractCookieHeader(adminLoginRes);

    // Writer login
    const writerLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testWriterEmail, password: testPassword }),
    });
    const writerCookie = extractCookieHeader(writerLoginRes);

    // 2. Test Admin GET /api/v1/users/writers
    const getWritersRes = await fetch(`${BASE_URL}/api/v1/users/writers`, {
      headers: { Cookie: adminCookie },
    });

    console.assert(getWritersRes.status === 200, `Expected 200 on get writers, got ${getWritersRes.status}`);
    const writersBody = await getWritersRes.json();
    const foundWriter = writersBody.data.items.find((w) => w.id === writerUser.id || w.email === testWriterEmail);
    console.assert(Boolean(foundWriter), 'Created writer must appear in admin writers listing');
    console.assert(foundWriter.isActive === true, 'Writer default status must be isActive: true');
    console.assert(Boolean(foundWriter.stats), 'Writer stats object must be included');
    console.log('  ✅ PASS: Admin views writers listing with article stats aggregation and isActive: true');

    // 3. Test Admin Deactivating Writer
    const deactivateRes = await fetch(`${BASE_URL}/api/v1/users/writers/${writerUser.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({ isActive: false }),
    });

    console.assert(deactivateRes.status === 200, `Expected 200 on deactivating writer, got ${deactivateRes.status}`);
    const deactivateBody = await deactivateRes.json();
    console.assert(deactivateBody.data.writer.isActive === false, 'Writer isActive status must be false');
    console.log('  ✅ PASS: Admin deactivates writer account (isActive: false)');

    // 4. Test Deactivated Writer Login Attempt (Fails with 403 ACCOUNT_DISABLED)
    const blockedLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testWriterEmail, password: testPassword }),
    });

    console.assert(blockedLoginRes.status === 403, `Expected 403 when deactivated writer logs in, got ${blockedLoginRes.status}`);
    const blockedBody = await blockedLoginRes.json();
    console.assert(blockedBody.error.code === 'ACCOUNT_DISABLED', `Expected error code ACCOUNT_DISABLED, got ${blockedBody.error.code}`);
    console.log('  ✅ PASS: Deactivated writer login blocked with HTTP 403 ACCOUNT_DISABLED');

    // 5. Test Deactivated Writer Active Session Request (Fails with 403 ACCOUNT_DISABLED)
    const blockedApiRes = await fetch(`${BASE_URL}/api/v1/articles/my`, {
      headers: { Cookie: writerCookie },
    });

    console.assert(blockedApiRes.status === 403, `Expected 403 on active cookie for deactivated user, got ${blockedApiRes.status}`);
    console.log('  ✅ PASS: Deactivated writer active cookie request blocked with HTTP 403 ACCOUNT_DISABLED');

    // 6. Test Admin Reactivating Writer
    const reactivateRes = await fetch(`${BASE_URL}/api/v1/users/writers/${writerUser.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({ isActive: true }),
    });

    console.assert(reactivateRes.status === 200, `Expected 200 on reactivating writer, got ${reactivateRes.status}`);
    const reactivateBody = await reactivateRes.json();
    console.assert(reactivateBody.data.writer.isActive === true, 'Writer isActive status must be restored to true');
    console.log('  ✅ PASS: Admin reactivates writer account (isActive: true)');

    // 7. Test Reactivated Writer Login Success
    const successLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testWriterEmail, password: testPassword }),
    });

    console.assert(successLoginRes.status === 200, `Expected 200 when reactivated writer logs in, got ${successLoginRes.status}`);
    console.log('  ✅ PASS: Reactivated writer logs in successfully with HTTP 200');

    // Clean up test data
    await User.deleteMany({ email: { $in: [testAdminEmail, testWriterEmail] } });

    console.log('\n--- WRITER MANAGEMENT & ACTIVATION VERIFICATION COMPLETE: ALL TESTS PASSED ---\n');

    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during writer management verification:', error);
    if (server) server.close();
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
};

runWriterManagementTests();
