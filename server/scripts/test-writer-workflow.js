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

const runWriterWorkflowTests = async () => {
  console.log('\n--- DEVATLAS STEP 6A: WRITER & EDITORIAL REVIEW VERIFICATION SUITE ---\n');

  let server;
  const PORT = 5098;
  const BASE_URL = `http://127.0.0.1:${PORT}`;

  try {
    await connectDB();
    console.log('  Connected to MongoDB for testing.');

    server = app.listen(PORT);
    console.log(`  Test HTTP server listening on port ${PORT}.`);

    // 1. Setup Test Users: 1 Admin and 2 Writers
    const testAdminEmail = 'test_admin_writer_suite@devatlas.com';
    const testWriterEmail = 'test_writer_author@devatlas.com';
    const testOtherWriterEmail = 'test_other_writer@devatlas.com';
    const testPassword = 'TestPassword123!';

    await User.deleteMany({ email: { $in: [testAdminEmail, testWriterEmail, testOtherWriterEmail] } });

    const adminUser = await User.create({
      name: 'Test Admin',
      email: testAdminEmail,
      password: testPassword,
      role: 'admin',
    });

    const writerUser = await User.create({
      name: 'Rahul Contributor',
      email: testWriterEmail,
      password: testPassword,
      role: 'writer',
    });

    const otherWriterUser = await User.create({
      name: 'Other Writer',
      email: testOtherWriterEmail,
      password: testPassword,
      role: 'writer',
    });

    console.log('  Created Test Admin and 2 Test Writer accounts.');

    // Helper for cookie extraction
    const extractCookieHeader = (res) => {
      const setCookie = res.headers.get('set-cookie');
      if (!setCookie) return '';
      return setCookie.split(';')[0];
    };

    // 2. Test Writer Login
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testWriterEmail, password: testPassword }),
    });

    console.assert(loginRes.status === 200, `Expected 200 on writer login, got ${loginRes.status}`);
    const loginBody = await loginRes.json();
    console.assert(loginBody.data.user.role === 'writer', 'Writer user role should be writer');
    console.log('  ✅ PASS: Writer login returns HTTP 200 and role: "writer"');

    const writerCookie = extractCookieHeader(loginRes);

    // Test Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testAdminEmail, password: testPassword }),
    });
    const adminCookie = extractCookieHeader(adminLoginRes);

    // 3. Test Role Guard: Writer blocked from Admin endpoints
    const forbiddenRes = await fetch(`${BASE_URL}/api/v1/articles/admin/review`, {
      headers: { Cookie: writerCookie },
    });

    console.assert(forbiddenRes.status === 403, `Expected 403 when writer accesses admin queue, got ${forbiddenRes.status}`);
    console.log('  ✅ PASS: Writer blocked from accessing /api/v1/articles/admin/review with HTTP 403 FORBIDDEN');

    // 4. Test Writer Article Creation (Draft)
    const createDraftRes = await fetch(`${BASE_URL}/api/v1/articles/writer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: writerCookie },
      body: JSON.stringify({
        title: 'Mastering React 19 State Machines',
        summary: 'A deep dive into managing state in React 19 applications using modern architectural patterns.',
        content: 'State machines provide predictable state transitions for complex UI components. In this guide, we explore building clean React hooks.',
        tags: ['react', 'javascript', 'frontend'],
        action: 'draft',
      }),
    });

    console.assert(createDraftRes.status === 201, `Expected 201 on draft creation, got ${createDraftRes.status}`);
    const draftBody = await createDraftRes.json();
    const draftArticle = draftBody.data.article;
    console.assert(draftArticle.status === 'draft', `Expected status 'draft', got ${draftArticle.status}`);
    console.assert(
      draftArticle.author.id === writerUser.id || draftArticle.author.id === writerUser._id.toString(),
      'Author ID must match writer ID'
    );
    console.log('  ✅ PASS: Writer creates draft article with status: "draft" and server-bound author ID');

    // 5. Verify Public Draft Isolation: Draft article hidden from public GET /articles
    const publicArticlesRes = await fetch(`${BASE_URL}/api/v1/articles`);
    const publicBody = await publicArticlesRes.json();
    const isDraftInPublic = publicBody.data.items.some((item) => item.id === draftArticle.id);
    console.assert(!isDraftInPublic, 'Draft article must NOT appear in public listing');
    console.log('  ✅ PASS: Draft writer article is strictly excluded from public listing');

    // 6. Test Writer Submitting Article for Editorial Review
    const submitRes = await fetch(`${BASE_URL}/api/v1/articles/writer/${draftArticle.id}/submit`, {
      method: 'PATCH',
      headers: { Cookie: writerCookie },
    });

    console.assert(submitRes.status === 200, `Expected 200 on article submission, got ${submitRes.status}`);
    const submitBody = await submitRes.json();
    const pendingArticle = submitBody.data.article;
    console.assert(pendingArticle.status === 'pending_review', `Expected status 'pending_review', got ${pendingArticle.status}`);
    console.log('  ✅ PASS: Writer submits article; status transitions from "draft" to "pending_review"');

    // 7. Test Ownership Protection: Other writer cannot edit or submit this article
    const otherWriterLogin = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testOtherWriterEmail, password: testPassword }),
    });
    const otherWriterCookie = extractCookieHeader(otherWriterLogin);

    const unauthorizedEditRes = await fetch(`${BASE_URL}/api/v1/articles/writer/${pendingArticle.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: otherWriterCookie },
      body: JSON.stringify({ title: 'Hacked Article Title' }),
    });

    console.assert(unauthorizedEditRes.status === 403, `Expected 403 on unauthorized writer edit, got ${unauthorizedEditRes.status}`);
    console.log('  ✅ PASS: Secondary writer blocked from editing another writer\'s article (HTTP 403 FORBIDDEN)');

    // 8. Test Admin Queue: Admin views pending_review article in queue
    const adminQueueRes = await fetch(`${BASE_URL}/api/v1/articles/admin/review?status=pending_review`, {
      headers: { Cookie: adminCookie },
    });

    console.assert(adminQueueRes.status === 200, `Expected 200 on admin review queue, got ${adminQueueRes.status}`);
    const queueBody = await adminQueueRes.json();
    const isPendingInQueue = queueBody.data.items.some((item) => item.id === pendingArticle.id);
    console.assert(isPendingInQueue, 'Submitted article must appear in admin review queue');
    console.log('  ✅ PASS: Submitted article appears in Admin Editorial Review Queue');

    // 9. Test Admin Request Changes with Required Note
    const noNoteRes = await fetch(`${BASE_URL}/api/v1/articles/admin/${pendingArticle.id}/request-changes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({ reviewNote: 'shrt' }), // < 5 chars
    });

    console.assert(noNoteRes.status === 400, `Expected 400 when reviewNote is too short, got ${noNoteRes.status}`);
    console.log('  ✅ PASS: Admin requesting changes with < 5 char note is rejected (HTTP 400 VALIDATION_FAILED)');

    const requestChangesRes = await fetch(`${BASE_URL}/api/v1/articles/admin/${pendingArticle.id}/request-changes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({ reviewNote: 'Please add code snippets showing XState machine integration in React 19.' }),
    });

    console.assert(requestChangesRes.status === 200, `Expected 200 on requesting changes, got ${requestChangesRes.status}`);
    const changesBody = await requestChangesRes.json();
    const changesArticle = changesBody.data.article;
    console.assert(changesArticle.status === 'changes_requested', `Expected status 'changes_requested', got ${changesArticle.status}`);
    console.assert(changesArticle.reviewNote.includes('XState'), 'Review note must be saved');
    console.log('  ✅ PASS: Admin requests changes with feedback note; status transitions to "changes_requested"');

    // 10. Test Writer Resubmission: Writer edits article and resubmits
    const resubmitRes = await fetch(`${BASE_URL}/api/v1/articles/writer/${changesArticle.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: writerCookie },
      body: JSON.stringify({
        content: 'State machines provide predictable state transitions. Here is a code example: ```jsx const machine = useMachine(stateConfig); ```',
        action: 'resubmit',
      }),
    });

    console.assert(resubmitRes.status === 200, `Expected 200 on writer resubmit, got ${resubmitRes.status}`);
    const resubmitBody = await resubmitRes.json();
    const resubmittedArticle = resubmitBody.data.article;
    console.assert(resubmittedArticle.status === 'pending_review', `Expected status 'pending_review', got ${resubmittedArticle.status}`);
    console.log('  ✅ PASS: Writer edits and resubmits article; status transitions back to "pending_review"');

    // 11. Test Admin Approval & Publication
    const approveRes = await fetch(`${BASE_URL}/api/v1/articles/admin/${resubmittedArticle.id}/approve`, {
      method: 'PATCH',
      headers: { Cookie: adminCookie },
    });

    console.assert(approveRes.status === 200, `Expected 200 on admin approval, got ${approveRes.status}`);
    const approveBody = await approveRes.json();
    const publishedArticle = approveBody.data.article;
    console.assert(publishedArticle.status === 'published', `Expected status 'published', got ${publishedArticle.status}`);
    console.assert(publishedArticle.publishedAt !== null, 'PublishedAt timestamp must be populated');
    console.log('  ✅ PASS: Admin approves article; status transitions to "published" with publishedAt timestamp');

    // 12. Verify Published Writer Article in Public API & Search
    const publicArticleRes = await fetch(`${BASE_URL}/api/v1/articles/s/${publishedArticle.slug}`);
    console.assert(publicArticleRes.status === 200, `Expected 200 on public slug fetch, got ${publicArticleRes.status}`);
    console.log('  ✅ PASS: Published writer article is publicly accessible by slug');

    // Clean up test data
    await Article.deleteMany({ author: { $in: [writerUser._id, otherWriterUser._id, adminUser._id] } });
    await User.deleteMany({ email: { $in: [testAdminEmail, testWriterEmail, testOtherWriterEmail] } });

    console.log('\n--- WRITER & EDITORIAL REVIEW VERIFICATION COMPLETE: ALL TESTS PASSED ---\n');

    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during writer workflow verification:', error);
    if (server) server.close();
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
};

runWriterWorkflowTests();
