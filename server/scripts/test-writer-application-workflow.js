process.env.NODE_ENV = 'test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../src/models/user.model.js';
import Notification from '../src/models/notification.model.js';
import { connectDB } from '../src/config/db.js';
import app from '../src/app.js';
import { DEFAULT_AVATAR_ID } from '../src/constants/avatars.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const runApplicationWorkflowTests = async () => {
  console.log('\n--- DEVATLAS STEP 8: WRITER APPLICATION & ADMIN APPROVAL VERIFICATION SUITE ---\n');

  let server;
  const PORT = 5107;
  const BASE_URL = `http://127.0.0.1:${PORT}`;

  try {
    await connectDB();
    console.log('  Connected to MongoDB for testing.');

    server = app.listen(PORT);
    console.log(`  Test HTTP server listening on port ${PORT}.`);

    const adminEmail = 'app_admin@devatlas.com';
    const applicant1Email = 'applicant_alice@devatlas.com';
    const applicant2Email = 'applicant_bob@devatlas.com';
    const password = 'TestPassword123!';

    // Clean up test data
    await User.deleteMany({ email: { $in: [adminEmail, applicant1Email, applicant2Email] } });
    await Notification.deleteMany({ 'recipient.email': { $in: [adminEmail, applicant1Email, applicant2Email] } });

    // Seed Admin Account
    const admin = await User.create({
      name: 'App Workflow Admin',
      email: adminEmail,
      password,
      role: 'admin',
      isActive: true,
      writerStatus: 'approved',
    });

    const login = async (email, pass = password) => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const cookies = res.headers.get('set-cookie');
      const body = await res.json();
      return { status: res.status, body, cookies };
    };

    const { cookies: adminCookies } = await login(adminEmail);

    // 1. Client Privilege Escalation Prevention
    const escRes = await fetch(`${BASE_URL}/api/v1/auth/writer/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hacker Applicant',
        email: applicant1Email,
        password,
        role: 'admin', // Privilege escalation attempt
      }),
    });
    console.assert(escRes.status === 400, `Expected 400 on privilege escalation attempt, got ${escRes.status}`);
    console.log('  ✅ SECURITY PASS: Client privilege escalation (role: admin in body) is strictly rejected (HTTP 400)');

    // 2. Submit Valid Writer Application (Applicant Alice)
    const applyRes = await fetch(`${BASE_URL}/api/v1/auth/writer/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Technical Writer',
        email: applicant1Email,
        password,
        bio: 'Senior Backend Engineer specializing in Distributed Systems.',
        expertise: ['Node.js', 'Distributed Systems'],
        avatar: 'avatar-03',
      }),
    });
    console.assert(applyRes.status === 201, `Expected 201 on valid application, got ${applyRes.status}`);
    const applyBody = await applyRes.json();
    const aliceId = applyBody.data.user.id;

    // Verify DB state for Alice
    const aliceUser = await User.findById(aliceId);
    console.assert(aliceUser.role === 'writer', 'Created role must be writer');
    console.assert(aliceUser.writerStatus === 'pending', 'Created status must be pending');
    console.assert(aliceUser.isActive === false, 'Created user must be inactive');
    console.assert(aliceUser.avatar === 'avatar-03', 'Avatar must be avatar-03');
    console.log('  ✅ PASS: Writer application submitted; created user receives role: writer, writerStatus: pending, isActive: false');

    // 3. Verify Admin Notification for New Application
    const adminNotifRes = await fetch(`${BASE_URL}/api/v1/notifications`, {
      headers: { Cookie: adminCookies },
    });
    const adminNotifBody = await adminNotifRes.json();
    const appNotif = adminNotifBody.data?.items?.find((n) => n.type === 'new_writer_application');
    console.assert(appNotif, 'Admin must receive new_writer_application notification');
    console.log('  ✅ NOTIFICATION PASS: Admin receives in-app notification for new writer application');

    // 4. Verify Pending Applicant Cannot Login
    const pendingLoginRes = await login(applicant1Email);
    console.assert(pendingLoginRes.status === 403, `Expected 403 on pending login, got ${pendingLoginRes.status}`);
    console.assert(pendingLoginRes.body.error.code === 'APPLICATION_PENDING', 'Error code must be APPLICATION_PENDING');
    console.log('  ✅ AUTHORIZATION PASS: Pending applicant login attempt blocked with HTTP 403 APPLICATION_PENDING');

    // 5. Verify Duplicate Email Protection
    const dupRes = await fetch(`${BASE_URL}/api/v1/auth/writer/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Duplicate',
        email: applicant1Email,
        password,
      }),
    });
    console.assert(dupRes.status === 409, `Expected 409 on duplicate email, got ${dupRes.status}`);
    console.log('  ✅ PASS: Duplicate email application is rejected with HTTP 409 DUPLICATE_EMAIL');

    // 6. Admin Lists Pending Applications
    const adminListRes = await fetch(`${BASE_URL}/api/v1/users/applications?status=pending`, {
      headers: { Cookie: adminCookies },
    });
    console.assert(adminListRes.status === 200, `Expected 200 on admin applications list, got ${adminListRes.status}`);
    const adminListBody = await adminListRes.json();
    const aliceInList = adminListBody.data.items.find((a) => a.email === applicant1Email);
    console.assert(aliceInList, 'Alice must be present in pending applications list');
    console.log('  ✅ PASS: Admin retrieves pending applications list via GET /api/v1/users/applications');

    // 7. Submit Application 2 (Bob) for Rejection Testing
    const applyBobRes = await fetch(`${BASE_URL}/api/v1/auth/writer/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bob Spam Writer',
        email: applicant2Email,
        password,
        bio: 'Spam bio',
      }),
    });
    const applyBobBody = await applyBobRes.json();
    const bobId = applyBobBody.data.user.id;

    // 8. Admin Rejection Without Reason Fails
    const rejectNoReasonRes = await fetch(`${BASE_URL}/api/v1/users/applications/${bobId}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookies },
      body: JSON.stringify({ rejectionReason: '  ' }),
    });
    console.assert(rejectNoReasonRes.status === 400, `Expected 400 on rejection without reason, got ${rejectNoReasonRes.status}`);
    console.log('  ✅ VALIDATION PASS: Admin rejection without valid reason (< 5 chars) is rejected (HTTP 400)');

    // 9. Admin Rejects Bob with Reason
    const rejectionReasonStr = 'Application does not meet DevAtlas technical content standards.';
    const rejectRes = await fetch(`${BASE_URL}/api/v1/users/applications/${bobId}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookies },
      body: JSON.stringify({ rejectionReason: rejectionReasonStr }),
    });
    console.assert(rejectRes.status === 200, `Expected 200 on valid rejection, got ${rejectRes.status}`);

    const bobUser = await User.findById(bobId);
    console.assert(bobUser.writerStatus === 'rejected', 'Bob status must be rejected');
    console.assert(bobUser.applicationNote === rejectionReasonStr, 'Rejection note must match');
    console.log('  ✅ PASS: Admin successfully rejects writer application with mandatory feedback note');

    // 10. Verify Rejected Writer Login Blocked with Reason Note
    const rejectedLoginRes = await login(applicant2Email);
    console.assert(rejectedLoginRes.status === 403, `Expected 403 on rejected login, got ${rejectedLoginRes.status}`);
    console.assert(rejectedLoginRes.body.error.code === 'APPLICATION_REJECTED', 'Error code must be APPLICATION_REJECTED');
    console.assert(rejectedLoginRes.body.error.message.includes(rejectionReasonStr), 'Error message must contain feedback note');
    console.log('  ✅ AUTHORIZATION PASS: Rejected applicant login blocked with HTTP 403 APPLICATION_REJECTED and feedback note');

    // 11. Admin Approves Alice Application
    const approveRes = await fetch(`${BASE_URL}/api/v1/users/applications/${aliceId}/approve`, {
      method: 'PATCH',
      headers: { Cookie: adminCookies },
    });
    console.assert(approveRes.status === 200, `Expected 200 on application approval, got ${approveRes.status}`);

    const aliceApproved = await User.findById(aliceId);
    console.assert(aliceApproved.writerStatus === 'approved', 'Alice status must be approved');
    console.assert(aliceApproved.isActive === true, 'Alice isActive must be true');
    console.log('  ✅ PASS: Admin approves application; status transitions to approved and isActive to true');

    // 12. Approved Writer Login & Portal Access Granted
    const aliceLogin = await login(applicant1Email);
    console.assert(aliceLogin.status === 200, `Expected 200 on approved writer login, got ${aliceLogin.status}`);
    const aliceCookies = aliceLogin.cookies;

    const aliceProfileRes = await fetch(`${BASE_URL}/api/v1/users/profile`, {
      headers: { Cookie: aliceCookies },
    });
    console.assert(aliceProfileRes.status === 200, `Expected 200 on writer portal profile access, got ${aliceProfileRes.status}`);
    console.log('  ✅ PASS: Approved writer logs in successfully and accesses Writer Portal endpoints');

    // 13. Verify Notification Generated for Approval & Isolation
    const aliceNotifRes = await fetch(`${BASE_URL}/api/v1/notifications`, {
      headers: { Cookie: aliceCookies },
    });
    const aliceNotifBody = await aliceNotifRes.json();
    const appApprovedNotif = aliceNotifBody.data?.items?.find((n) => n.type === 'application_approved');
    console.assert(appApprovedNotif, 'Alice must receive application_approved notification');
    console.log('  ✅ NOTIFICATION PASS: Applicant receives application_approved notification upon approval');

    // Clean up test data
    await User.deleteMany({ email: { $in: [adminEmail, applicant1Email, applicant2Email] } });
    await Notification.deleteMany({ 'recipient.email': { $in: [adminEmail, applicant1Email, applicant2Email] } });

    console.log('\n--- WRITER APPLICATION & ADMIN APPROVAL VERIFICATION COMPLETE: ALL TESTS PASSED ---\n');

    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during application workflow verification:', error);
    if (server) server.close();
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
};

runApplicationWorkflowTests();
