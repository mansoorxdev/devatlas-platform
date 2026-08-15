process.env.NODE_ENV = 'test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../src/models/user.model.js';
import Article from '../src/models/article.model.js';
import ArticleAssignment from '../src/models/assignment.model.js';
import { connectDB } from '../src/config/db.js';
import app from '../src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const runAssignmentTests = async () => {
  console.log('\n--- DEVATLAS STEP 6F: ADMIN WRITER ASSIGNMENT & CONTENT BRIEF VERIFICATION SUITE ---\n');

  let server;
  const PORT = 5103;
  const BASE_URL = `http://127.0.0.1:${PORT}`;

  try {
    await connectDB();
    console.log('  Connected to MongoDB for testing.');

    server = app.listen(PORT);
    console.log(`  Test HTTP server listening on port ${PORT}.`);

    const adminEmail = 'assignment_admin@devatlas.com';
    const writerEmail1 = 'assignment_writer1@devatlas.com';
    const writerEmail2 = 'assignment_writer2@devatlas.com';
    const password = 'TestPassword123!';

    await User.deleteMany({ email: { $in: [adminEmail, writerEmail1, writerEmail2] } });

    const admin = await User.create({
      name: 'Assignment Admin',
      email: adminEmail,
      password,
      role: 'admin',
      isActive: true,
    });

    const writer1 = await User.create({
      name: 'Primary Writer',
      email: writerEmail1,
      password,
      role: 'writer',
      isActive: true,
    });

    const writer2 = await User.create({
      name: 'Secondary Writer',
      email: writerEmail2,
      password,
      role: 'writer',
      isActive: true,
    });

    // Helper: Login and get cookies
    const login = async (email) => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const cookies = res.headers.get('set-cookie');
      const body = await res.json();
      return { cookies, body };
    };

    const { cookies: adminCookies } = await login(adminEmail);
    const { cookies: writer1Cookies } = await login(writerEmail1);
    const { cookies: writer2Cookies } = await login(writerEmail2);

    // 1. Admin creates assignment for Writer 1
    const createRes = await fetch(`${BASE_URL}/api/v1/assignments/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookies,
      },
      body: JSON.stringify({
        title: 'Build Scalable Microservices with Node.js',
        brief: 'Comprehensive guide covering Event-Driven Microservices, Express, and RabbitMQ.',
        writer: writer1._id.toString(),
        category: 'Backend',
        targetWordCount: 1500,
        deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
        priority: 'high',
        targetKeywords: ['nodejs', 'microservices', 'express'],
      }),
    });

    console.assert(createRes.status === 201, `Expected 201 Created on assignment creation, got ${createRes.status}`);
    const createBody = await createRes.json();
    const assignment1 = createBody.data.assignment;

    console.assert(assignment1.title === 'Build Scalable Microservices with Node.js', 'Assignment title must match');
    console.assert(assignment1.status === 'assigned', `Expected status 'assigned', got '${assignment1.status}'`);
    console.assert(assignment1.priority === 'high', `Expected priority 'high', got '${assignment1.priority}'`);
    console.log('  ✅ PASS: Admin successfully created content brief assignment for Writer 1');

    // 2. Writer 1 retrieves own assignments
    const w1AssigRes = await fetch(`${BASE_URL}/api/v1/assignments/writer`, {
      headers: { Cookie: writer1Cookies },
    });
    console.assert(w1AssigRes.status === 200, `Expected 200 on writer assignments fetch, got ${w1AssigRes.status}`);
    const w1AssigBody = await w1AssigRes.json();
    console.assert(w1AssigBody.data.items.length === 1, `Expected 1 assignment for Writer 1, got ${w1AssigBody.data.items.length}`);
    console.log('  ✅ PASS: Writer 1 can view assigned content briefs');

    // 3. Writer 2 attempts to view Writer 1's assignment (Forbidden / Isolation)
    const w2GetRes = await fetch(`${BASE_URL}/api/v1/assignments/writer/${assignment1.id}`, {
      headers: { Cookie: writer2Cookies },
    });
    console.assert(w2GetRes.status === 403, `Expected 403 FORBIDDEN for secondary writer, got ${w2GetRes.status}`);
    console.log('  ✅ SECURITY PASS: Writer 2 strictly blocked from viewing Writer 1 assignment (HTTP 403)');

    // 4. Writer 1 starts assignment (assigned -> in_progress)
    const startRes = await fetch(`${BASE_URL}/api/v1/assignments/writer/${assignment1.id}/start`, {
      method: 'PATCH',
      headers: { Cookie: writer1Cookies },
    });
    console.assert(startRes.status === 200, `Expected 200 on start action, got ${startRes.status}`);
    const startBody = await startRes.json();
    console.assert(startBody.data.assignment.status === 'in_progress', `Expected status 'in_progress', got '${startBody.data.assignment.status}'`);
    console.log('  ✅ PASS: Writer 1 starts assignment (status transitions assigned -> in_progress)');

    // 5. Writer 1 creates article linked to assignment
    const createArticleRes = await fetch(`${BASE_URL}/api/v1/articles/writer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: writer1Cookies,
      },
      body: JSON.stringify({
        title: 'Building Event-Driven Microservices in Node.js',
        summary: 'Step-by-step guide to microservices architecture.',
        content: '# Microservices Guide\n\nDetailed content for event-driven system.',
        tags: ['backend', 'nodejs'],
        assignmentId: assignment1.id,
        action: 'draft',
      }),
    });

    console.assert(createArticleRes.status === 201, `Expected 201 Created on article creation, got ${createArticleRes.status}`);
    const artBody = await createArticleRes.json();
    const createdArticle = artBody.data.article;

    // Verify assignment is linked to article
    const updatedAssigRes = await fetch(`${BASE_URL}/api/v1/assignments/writer/${assignment1.id}`, {
      headers: { Cookie: writer1Cookies },
    });
    const updatedAssigBody = await updatedAssigRes.json();
    console.assert(updatedAssigBody.data.assignment.article.id === createdArticle.id, 'Assignment must link to created article ID');
    console.log('  ✅ PASS: Article created and linked to content brief server-side');

    // 6. Writer 1 submits article (in_progress -> submitted)
    const submitRes = await fetch(`${BASE_URL}/api/v1/articles/writer/${createdArticle.id}/submit`, {
      method: 'PATCH',
      headers: { Cookie: writer1Cookies },
    });
    console.assert(submitRes.status === 200, `Expected 200 on article submission, got ${submitRes.status}`);

    const postSubmitAssigRes = await fetch(`${BASE_URL}/api/v1/assignments/writer/${assignment1.id}`, {
      headers: { Cookie: writer1Cookies },
    });
    const postSubmitAssigBody = await postSubmitAssigRes.json();
    console.assert(postSubmitAssigBody.data.assignment.status === 'submitted', `Expected assignment status 'submitted', got '${postSubmitAssigBody.data.assignment.status}'`);
    console.log('  ✅ PASS: Submitting article transitions assignment status to "submitted"');

    // 7. Admin approves article (submitted -> completed)
    const approveRes = await fetch(`${BASE_URL}/api/v1/articles/admin/${createdArticle.id}/approve`, {
      method: 'PATCH',
      headers: { Cookie: adminCookies },
    });
    console.assert(approveRes.status === 200, `Expected 200 on admin approval, got ${approveRes.status}`);

    const postApproveAssigRes = await fetch(`${BASE_URL}/api/v1/assignments/admin/${assignment1.id}`, {
      headers: { Cookie: adminCookies },
    });
    const postApproveAssigBody = await postApproveAssigRes.json();
    console.assert(postApproveAssigBody.data.assignment.status === 'completed', `Expected assignment status 'completed', got '${postApproveAssigBody.data.assignment.status}'`);
    console.log('  ✅ PASS: Admin approving article automatically completes the assignment');

    // 8. Test Cancellation Guard
    const cancelledAssigRes = await fetch(`${BASE_URL}/api/v1/assignments/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookies,
      },
      body: JSON.stringify({
        title: 'Cancelled Test Assignment',
        brief: 'Test brief that will be cancelled.',
        writer: writer1._id.toString(),
        deadline: new Date(Date.now() + 86400000).toISOString(),
      }),
    });
    const cancelledAssigBody = await cancelledAssigRes.json();
    const cancelledId = cancelledAssigBody.data.assignment.id;

    // Admin cancels assignment
    const cancelRes = await fetch(`${BASE_URL}/api/v1/assignments/admin/${cancelledId}/cancel`, {
      method: 'PATCH',
      headers: { Cookie: adminCookies },
    });
    console.assert(cancelRes.status === 200, `Expected 200 on cancel action, got ${cancelRes.status}`);

    // Writer attempts to start cancelled assignment
    const tryStartCancelledRes = await fetch(`${BASE_URL}/api/v1/assignments/writer/${cancelledId}/start`, {
      method: 'PATCH',
      headers: { Cookie: writer1Cookies },
    });
    console.assert(tryStartCancelledRes.status === 400, `Expected 400 on starting cancelled assignment, got ${tryStartCancelledRes.status}`);
    console.log('  ✅ PASS: Cancelled assignment cannot be started by writer (HTTP 400)');

    // 9. Verify Non-Assignment Articles Work 100% Intact
    const selfArticleRes = await fetch(`${BASE_URL}/api/v1/articles/writer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: writer1Cookies,
      },
      body: JSON.stringify({
        title: 'Self-Created Independent Article Without Assignment',
        summary: 'Testing that writers can still publish without any brief.',
        content: '# Independent Article\n\nNon-assigned content.',
        tags: ['independent'],
        action: 'draft',
      }),
    });
    console.assert(selfArticleRes.status === 201, `Expected 201 Created for non-assignment article, got ${selfArticleRes.status}`);
    console.log('  ✅ REGRESSION PASS: Writers can freely create non-assignment articles as before');

    // Clean up test data
    await User.deleteMany({ email: { $in: [adminEmail, writerEmail1, writerEmail2] } });
    await ArticleAssignment.deleteMany({ _id: { $in: [assignment1.id, cancelledId] } });
    await Article.deleteMany({ author: { $in: [writer1._id, writer2._id] } });

    console.log('\n--- ADMIN WRITER ASSIGNMENT VERIFICATION COMPLETE: ALL TESTS PASSED ---\n');

    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during assignment verification:', error);
    if (server) server.close();
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
};

runAssignmentTests();
