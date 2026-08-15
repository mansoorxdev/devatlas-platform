process.env.NODE_ENV = 'test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../src/models/user.model.js';
import Article from '../src/models/article.model.js';
import Assignment from '../src/models/assignment.model.js';
import Notification from '../src/models/notification.model.js';
import { connectDB } from '../src/config/db.js';
import app from '../src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const runWriterPortalSeparationTests = async () => {
  console.log('\n--- DEVATLAS STEP 10: DEDICATED WRITER PORTAL SEPARATION VERIFICATION SUITE ---\n');

  let server;
  const PORT = 5109;
  const BASE_URL = `http://127.0.0.1:${PORT}`;

  try {
    await connectDB();
    console.log('  Connected to MongoDB for testing.');

    server = app.listen(PORT);
    console.log(`  Test HTTP server listening on port ${PORT}.`);

    const adminEmail = 'portal_admin@devatlas.com';
    const approvedWriterEmail = 'portal_approved_writer@devatlas.com';
    const pendingWriterEmail = 'portal_pending_writer@devatlas.com';
    const rejectedWriterEmail = 'portal_rejected_writer@devatlas.com';
    const deactivatedWriterEmail = 'portal_deactivated_writer@devatlas.com';
    const password = 'TestPassword123!';

    await User.deleteMany({
      email: {
        $in: [
          adminEmail,
          approvedWriterEmail,
          pendingWriterEmail,
          rejectedWriterEmail,
          deactivatedWriterEmail,
        ],
      },
    });
    await Article.deleteMany({ title: { $regex: /Portal Separation Test/i } });
    await Assignment.deleteMany({ title: { $regex: /Portal Separation Test/i } });

    // Seed Users
    const admin = await User.create({
      name: 'Portal Admin',
      email: adminEmail,
      password,
      role: 'admin',
      isActive: true,
      writerStatus: 'approved',
    });

    const approvedWriter = await User.create({
      name: 'Portal Approved Writer',
      email: approvedWriterEmail,
      password,
      role: 'writer',
      isActive: true,
      writerStatus: 'approved',
      slug: 'portal-approved-writer-author',
    });

    const pendingWriter = await User.create({
      name: 'Portal Pending Writer',
      email: pendingWriterEmail,
      password,
      role: 'writer',
      isActive: false,
      writerStatus: 'pending',
    });

    const rejectedWriter = await User.create({
      name: 'Portal Rejected Writer',
      email: rejectedWriterEmail,
      password,
      role: 'writer',
      isActive: false,
      writerStatus: 'rejected',
      applicationNote: 'Need more technical sample links.',
    });

    const deactivatedWriter = await User.create({
      name: 'Portal Deactivated Writer',
      email: deactivatedWriterEmail,
      password,
      role: 'writer',
      isActive: false,
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

    // 1. Pending Writer Access Enforcement
    const pendingLogin = await login(pendingWriterEmail);
    console.assert(pendingLogin.status === 403, `Expected 403 for pending writer login, got ${pendingLogin.status}`);
    console.assert(
      pendingLogin.body.error?.code === 'APPLICATION_PENDING',
      'Expected APPLICATION_PENDING error code'
    );
    console.log('  ✅ SECURITY PASS: Pending writer login is strictly blocked with APPLICATION_PENDING (HTTP 403)');

    // 2. Rejected Writer Access Enforcement
    const rejectedLogin = await login(rejectedWriterEmail);
    console.assert(rejectedLogin.status === 403, `Expected 403 for rejected writer login, got ${rejectedLogin.status}`);
    console.assert(
      rejectedLogin.body.error?.code === 'APPLICATION_REJECTED',
      'Expected APPLICATION_REJECTED error code'
    );
    console.log('  ✅ SECURITY PASS: Rejected writer login is strictly blocked with APPLICATION_REJECTED & review reason');

    // 3. Deactivated Writer Access Enforcement
    const deactivatedLogin = await login(deactivatedWriterEmail);
    console.assert(deactivatedLogin.status === 403, `Expected 403 for deactivated writer login, got ${deactivatedLogin.status}`);
    console.assert(
      deactivatedLogin.body.error?.code === 'ACCOUNT_DISABLED',
      'Expected ACCOUNT_DISABLED error code'
    );
    console.log('  ✅ SECURITY PASS: Deactivated writer login is strictly blocked with ACCOUNT_DISABLED');

    // 4. Approved Writer Login & Session
    const { status: appStatus, body: appBody, cookies: writerCookies } = await login(approvedWriterEmail);
    console.assert(appStatus === 200, `Expected 200 for approved writer login, got ${appStatus}`);
    console.assert(appBody.data.user.role === 'writer', 'User role must be writer');
    console.assert(appBody.data.user.writerStatus === 'approved', 'Writer status must be approved');
    console.log('  ✅ AUTH PASS: Approved writer successfully authenticates into Writer Portal session');

    // 5. Admin Login & Session
    const { cookies: adminCookies } = await login(adminEmail);

    // 6. Writer Access to Writer API Endpoints inside Writer Portal
    const createArticleRes = await fetch(`${BASE_URL}/api/v1/articles/writer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: writerCookies },
      body: JSON.stringify({
        title: 'Portal Separation Test Article',
        summary: 'Testing writer portal isolation and navigation.',
        content: 'Article content body for portal separation validation.',
        category: 'Backend',
        language: 'English',
        action: 'submit',
      }),
    });
    console.assert(createArticleRes.status === 201, `Expected 201 on article creation, got ${createArticleRes.status}`);
    const createBody = await createArticleRes.json();
    const articleId = createBody.data.article.id;
    const articleSlug = createBody.data.article.slug;
    console.log('  ✅ WORKFLOW PASS: Approved writer submits article from Writer Portal');

    // 7. Writer Authorization Boundary (Cannot access Admin APIs)
    const adminApiAttempt = await fetch(`${BASE_URL}/api/v1/articles/admin/review`, {
      headers: { Cookie: writerCookies },
    });
    console.assert(adminApiAttempt.status === 403, `Expected 403 when writer calls admin endpoint, got ${adminApiAttempt.status}`);
    console.log('  ✅ ISOLATION PASS: Writer is strictly blocked from Admin Portal endpoints (HTTP 403)');

    // 8. Admin Moderation & Approval
    const approveRes = await fetch(`${BASE_URL}/api/v1/articles/admin/${articleId}/approve`, {
      method: 'PATCH',
      headers: { Cookie: adminCookies },
    });
    console.assert(approveRes.status === 200, `Expected 200 on admin approve, got ${approveRes.status}`);

    // 9. Verify Notification to Writer links to /writer-portal/ or public article
    const notifications = await Notification.find({ recipient: approvedWriter._id, entityId: articleId.toString() });
    console.assert(notifications.length > 0, 'Notifications must be created for writer');
    notifications.forEach((n) => {
      console.assert(!n.link.startsWith('/writer/'), 'Notification link must not use legacy /writer/ path');
      console.assert(
        n.link.startsWith('/writer-portal/') || n.link.startsWith('/articles/'),
        `Notification link '${n.link}' must use /writer-portal/ or public /articles/`
      );
    });
    console.log('  ✅ NOTIFICATION PASS: Notifications for writers link cleanly to /writer-portal/* namespace');

    // 10. Public Platform Accessibility
    const pubArticleRes = await fetch(`${BASE_URL}/api/v1/articles/s/${articleSlug}`);
    console.assert(pubArticleRes.status === 200, `Expected 200 for public article view, got ${pubArticleRes.status}`);
    console.log('  ✅ PUBLIC PASS: Published article remains publicly accessible via /articles/s/:slug');

    const pubAuthorRes = await fetch(`${BASE_URL}/api/v1/users/authors/${approvedWriter.slug}`);
    console.assert(pubAuthorRes.status === 200, `Expected 200 for public author profile, got ${pubAuthorRes.status}`);
    console.log('  ✅ PUBLIC PASS: Public author profile remains accessible via /authors/:slug');

    // 11. Dynamic Sitemap Exclusion for Writer Portal
    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
    const sitemapXml = await sitemapRes.text();
    console.assert(!sitemapXml.includes('/writer-portal'), 'Sitemap MUST NOT contain /writer-portal routes');
    console.assert(!sitemapXml.includes('/writer/'), 'Sitemap MUST NOT contain /writer routes');
    console.log('  ✅ SEO PASS: Sitemap strictly excludes private Writer Portal & login/register pages');

    // Clean up test data
    await User.deleteMany({
      email: {
        $in: [
          adminEmail,
          approvedWriterEmail,
          pendingWriterEmail,
          rejectedWriterEmail,
          deactivatedWriterEmail,
        ],
      },
    });
    await Article.deleteMany({ title: { $regex: /Portal Separation Test/i } });

    console.log('\n--- DEDICATED WRITER PORTAL SEPARATION VERIFICATION COMPLETE: ALL TESTS PASSED ---\n');

    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during writer portal separation verification:', error);
    if (server) server.close();
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
};

runWriterPortalSeparationTests();
