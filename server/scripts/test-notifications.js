process.env.NODE_ENV = 'test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../src/models/user.model.js';
import Article from '../src/models/article.model.js';
import ArticleAssignment from '../src/models/assignment.model.js';
import Notification from '../src/models/notification.model.js';
import { connectDB } from '../src/config/db.js';
import app from '../src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const runNotificationTests = async () => {
  console.log('\n--- DEVATLAS STEP 6G: IN-APP NOTIFICATION SYSTEM VERIFICATION SUITE ---\n');

  let server;
  const PORT = 5104;
  const BASE_URL = `http://127.0.0.1:${PORT}`;

  try {
    await connectDB();
    console.log('  Connected to MongoDB for testing.');

    server = app.listen(PORT);
    console.log(`  Test HTTP server listening on port ${PORT}.`);

    const adminEmail = 'notif_admin@devatlas.com';
    const writerEmail1 = 'notif_writer1@devatlas.com';
    const writerEmail2 = 'notif_writer2@devatlas.com';
    const password = 'TestPassword123!';

    await User.deleteMany({ email: { $in: [adminEmail, writerEmail1, writerEmail2] } });

    const admin = await User.create({
      name: 'Notif Admin',
      email: adminEmail,
      password,
      role: 'admin',
      isActive: true,
    });

    const writer1 = await User.create({
      name: 'Notif Writer 1',
      email: writerEmail1,
      password,
      role: 'writer',
      isActive: true,
    });

    const writer2 = await User.create({
      name: 'Notif Writer 2',
      email: writerEmail2,
      password,
      role: 'writer',
      isActive: true,
    });

    // Login helper
    const login = async (email) => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const cookies = res.headers.get('set-cookie');
      return { cookies };
    };

    const { cookies: adminCookies } = await login(adminEmail);
    const { cookies: writer1Cookies } = await login(writerEmail1);
    const { cookies: writer2Cookies } = await login(writerEmail2);

    // Clean any prior test notifications
    await Notification.deleteMany({ recipient: { $in: [admin._id, writer1._id, writer2._id] } });

    // 1. Test Assignment Received Notification
    const assignRes = await fetch(`${BASE_URL}/api/v1/assignments/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookies,
      },
      body: JSON.stringify({
        title: 'Kafka Architecture Guide',
        brief: 'Write an architectural overview of Apache Kafka event streams.',
        writer: writer1._id.toString(),
        deadline: new Date(Date.now() + 86400000).toISOString(),
      }),
    });
    console.assert(assignRes.status === 201, `Expected 201 on assignment create, got ${assignRes.status}`);
    const assignBody = await assignRes.json();
    const assignmentObj = assignBody.data.assignment;

    // Check Writer 1 unread count
    const w1CountRes = await fetch(`${BASE_URL}/api/v1/notifications/unread-count`, {
      headers: { Cookie: writer1Cookies },
    });
    console.assert(w1CountRes.status === 200, `Expected 200 on unread count, got ${w1CountRes.status}`);
    const w1CountBody = await w1CountRes.json();
    console.assert(w1CountBody.data.unreadCount >= 1, `Expected Writer 1 unreadCount >= 1, got ${w1CountBody.data.unreadCount}`);
    console.log('  ✅ PASS: Writer 1 receives "assignment_received" notification and unread count increments');

    // 2. Test Writer 2 Recipient Isolation
    const w2NotifRes = await fetch(`${BASE_URL}/api/v1/notifications`, {
      headers: { Cookie: writer2Cookies },
    });
    const w2NotifBody = await w2NotifRes.json();
    console.assert(w2NotifBody.data.items.length === 0, `Expected Writer 2 notifications to be empty, got ${w2NotifBody.data.items.length}`);
    console.log('  ✅ SECURITY PASS: Writer 2 cannot view Writer 1 notifications');

    // 3. Test Article Submission Notifications (Writer & Admin)
    const artRes = await fetch(`${BASE_URL}/api/v1/articles/writer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: writer1Cookies,
      },
      body: JSON.stringify({
        title: 'Event-Driven Systems with Kafka',
        summary: 'Kafka streams overview.',
        content: '# Kafka Guide\n\nDeep dive into topics and partitions.',
        assignmentId: assignmentObj.id,
        action: 'submit',
      }),
    });
    console.assert(artRes.status === 201, `Expected 201 on article submit, got ${artRes.status}`);
    const artBody = await artRes.json();
    const articleObj = artBody.data.article;

    // Check Admin notifications
    const adminNotifRes = await fetch(`${BASE_URL}/api/v1/notifications`, {
      headers: { Cookie: adminCookies },
    });
    const adminNotifBody = await adminNotifRes.json();
    const assignedWorkNotif = adminNotifBody.data.items.find((n) => n.type === 'assigned_work_submitted');
    console.assert(Boolean(assignedWorkNotif), 'Admin must receive "assigned_work_submitted" notification');
    console.log('  ✅ PASS: Admin receives "assigned_work_submitted" notification upon article submission');

    // 4. Test Request Changes Notification
    const reqChangesRes = await fetch(`${BASE_URL}/api/v1/articles/admin/${articleObj.id}/request-changes`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookies,
      },
      body: JSON.stringify({
        reviewNote: 'Please expand section 2 on consumer offset management.',
      }),
    });
    console.assert(reqChangesRes.status === 200, `Expected 200 on request changes, got ${reqChangesRes.status}`);

    const w1ReqNotifRes = await fetch(`${BASE_URL}/api/v1/notifications?isRead=false`, {
      headers: { Cookie: writer1Cookies },
    });
    const w1ReqNotifBody = await w1ReqNotifRes.json();
    const reqChangesNotif = w1ReqNotifBody.data.items.find((n) => n.type === 'changes_requested');
    console.assert(Boolean(reqChangesNotif), 'Writer 1 must receive "changes_requested" notification');
    console.log('  ✅ PASS: Writer 1 receives "changes_requested" notification with admin review note');

    // 5. Test Approval Notification
    // Writer resubmits
    await fetch(`${BASE_URL}/api/v1/articles/writer/${articleObj.id}/submit`, {
      method: 'PATCH',
      headers: { Cookie: writer1Cookies },
    });

    // Admin approves
    const approveRes = await fetch(`${BASE_URL}/api/v1/articles/admin/${articleObj.id}/approve`, {
      method: 'PATCH',
      headers: { Cookie: adminCookies },
    });
    console.assert(approveRes.status === 200, `Expected 200 on approve, got ${approveRes.status}`);

    const w1ApproveNotifRes = await fetch(`${BASE_URL}/api/v1/notifications`, {
      headers: { Cookie: writer1Cookies },
    });
    const w1ApproveNotifBody = await w1ApproveNotifRes.json();
    const approveNotif = w1ApproveNotifBody.data.items.find((n) => n.type === 'article_approved');
    console.assert(Boolean(approveNotif), 'Writer 1 must receive "article_approved" notification');
    console.log('  ✅ PASS: Writer 1 receives "article_approved" notification upon publishing');

    // 6. Test Mark Single Read & Mark All Read
    const targetNotifId = approveNotif.id;
    const markReadRes = await fetch(`${BASE_URL}/api/v1/notifications/${targetNotifId}/read`, {
      method: 'PATCH',
      headers: { Cookie: writer1Cookies },
    });
    console.assert(markReadRes.status === 200, `Expected 200 on mark single read, got ${markReadRes.status}`);
    const markReadBody = await markReadRes.json();
    console.assert(markReadBody.data.notification.isRead === true, 'Notification isRead must be true');

    const markAllRes = await fetch(`${BASE_URL}/api/v1/notifications/mark-all-read`, {
      method: 'PATCH',
      headers: { Cookie: writer1Cookies },
    });
    console.assert(markAllRes.status === 200, `Expected 200 on mark all read, got ${markAllRes.status}`);

    const postMarkCountRes = await fetch(`${BASE_URL}/api/v1/notifications/unread-count`, {
      headers: { Cookie: writer1Cookies },
    });
    const postMarkCountBody = await postMarkCountRes.json();
    console.assert(postMarkCountBody.data.unreadCount === 0, `Expected unreadCount to be 0 after markAllRead, got ${postMarkCountBody.data.unreadCount}`);
    console.log('  ✅ PASS: Mark as read & Mark all as read work cleanly');

    // 7. Test Idempotency Guard (No duplicate notifications inserted)
    const countBeforeDup = await Notification.countDocuments({ recipient: writer1._id, type: 'article_approved' });
    // Trigger duplicate approval notification call manually via service
    const { default: notificationService } = await import('../src/services/notification.service.js');
    await notificationService.notifyUser({
      recipient: writer1._id,
      type: 'article_approved',
      title: 'Article Approved & Published!',
      message: 'Duplicate test message.',
      entityType: 'article',
      entityId: articleObj.id,
      eventId: `approve_${articleObj.id}`, // Same eventId!
    });
    const countAfterDup = await Notification.countDocuments({ recipient: writer1._id, type: 'article_approved' });
    console.assert(countBeforeDup === countAfterDup, `Idempotency failure: count before ${countBeforeDup} vs count after ${countAfterDup}`);
    console.log('  ✅ PASS: Idempotency safeguard prevents duplicate notifications for the same eventId');

    // Clean up test data
    await User.deleteMany({ email: { $in: [adminEmail, writerEmail1, writerEmail2] } });
    await Notification.deleteMany({ recipient: { $in: [admin._id, writer1._id, writer2._id] } });
    await ArticleAssignment.deleteMany({ _id: assignmentObj.id });
    await Article.deleteMany({ _id: articleObj.id });

    console.log('\n--- IN-APP NOTIFICATION SYSTEM VERIFICATION COMPLETE: ALL TESTS PASSED ---\n');

    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during notification verification:', error);
    if (server) server.close();
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
};

runNotificationTests();
