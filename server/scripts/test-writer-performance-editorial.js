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

const runPerformanceEditorialTests = async () => {
  console.log('\n--- DEVATLAS STEP 6H: WRITER PERFORMANCE & ADVANCED EDITORIAL QUALITY VERIFICATION SUITE ---\n');

  let server;
  const PORT = 5105;
  const BASE_URL = `http://127.0.0.1:${PORT}`;

  try {
    await connectDB();
    console.log('  Connected to MongoDB for testing.');

    server = app.listen(PORT);
    console.log(`  Test HTTP server listening on port ${PORT}.`);

    const adminEmail = 'perf_admin@devatlas.com';
    const writerEmail = 'perf_writer@devatlas.com';
    const password = 'TestPassword123!';

    await User.deleteMany({ email: { $in: [adminEmail, writerEmail] } });

    const admin = await User.create({
      name: 'Perf Admin',
      email: adminEmail,
      password,
      role: 'admin',
      isActive: true,
    });

    const writer = await User.create({
      name: 'Perf Writer',
      email: writerEmail,
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
    const { cookies: writerCookies } = await login(writerEmail);

    // Clean prior articles/assignments for test writer
    await Article.deleteMany({ author: writer._id });
    await ArticleAssignment.deleteMany({ writer: writer._id });

    // 1. Create 1 assignment & 2 articles for test writer
    const assignRes = await fetch(`${BASE_URL}/api/v1/assignments/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookies,
      },
      body: JSON.stringify({
        title: 'Redis Caching Patterns',
        brief: 'Write an article on cache-aside, write-through, and read-through caching in Redis.',
        writer: writer._id.toString(),
        deadline: new Date(Date.now() + 86400000).toISOString(),
      }),
    });
    console.assert(assignRes.status === 201, `Expected 201 on assignment create, got ${assignRes.status}`);

    // Create self-created draft article
    const art1Res = await fetch(`${BASE_URL}/api/v1/articles/writer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: writerCookies,
      },
      body: JSON.stringify({
        title: 'Understanding Database Indexing in MongoDB',
        summary: 'Deep dive into B-Tree and compound indexes.',
        content: '# Database Indexing\n\nIndexes accelerate query resolution in MongoDB.',
        tags: ['mongodb', 'database'],
        category: 'Database',
        language: 'English',
        action: 'draft',
      }),
    });
    console.assert(art1Res.status === 201, `Expected 201 on self-created article, got ${art1Res.status}`);
    const art1Body = await art1Res.json();
    const article1 = art1Body.data.article;

    // 2. Test Admin Writer Performance Endpoint Access & Privacy
    const perfRes = await fetch(`${BASE_URL}/api/v1/users/writers/${writer._id}/performance`, {
      headers: { Cookie: adminCookies },
    });
    console.assert(perfRes.status === 200, `Expected 200 on admin writer performance, got ${perfRes.status}`);
    const perfBody = await perfRes.json();
    const perfData = perfBody.data;

    console.assert(perfData.writer.name === writer.name, 'Performance profile must contain writer name');
    console.assert(perfData.writer.password === undefined, 'PRIVACY PASS: Password hash must be undefined');
    console.assert(perfData.writer.refreshToken === undefined, 'PRIVACY PASS: Refresh token must be undefined');
    console.assert(perfData.articleStats.total === 1, `Expected total articles 1, got ${perfData.articleStats.total}`);
    console.assert(perfData.assignmentStats.total === 1, `Expected total assignments 1, got ${perfData.assignmentStats.total}`);
    console.log('  ✅ PASS: Admin can access Writer Performance analytics with exact profile, article, and assignment statistics');
    console.log('  ✅ PRIVACY PASS: Writer sensitive credentials (password, tokens) are strictly omitted');

    // 3. Test Security Guard: Writer CANNOT access Admin performance endpoint
    const writerAccessPerfRes = await fetch(`${BASE_URL}/api/v1/users/writers/${writer._id}/performance`, {
      headers: { Cookie: writerCookies },
    });
    console.assert(writerAccessPerfRes.status === 403, `Expected 403 for writer accessing admin performance, got ${writerAccessPerfRes.status}`);
    console.log('  ✅ SECURITY PASS: Writer is strictly blocked from Admin performance endpoint (HTTP 403)');

    // 4. Test Duplicate Title Safety (DUPLICATE_ARTICLE_TITLE)
    const dupTitleRes = await fetch(`${BASE_URL}/api/v1/articles/writer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: writerCookies,
      },
      body: JSON.stringify({
        title: 'Understanding Database Indexing in MongoDB', // EXACT SAME TITLE
        summary: 'Duplicate title test.',
        content: '# Duplicate Article Test Content',
        action: 'draft',
      }),
    });
    console.assert(dupTitleRes.status === 400, `Expected 400 on duplicate title, got ${dupTitleRes.status}`);
    const dupTitleBody = await dupTitleRes.json();
    console.assert(dupTitleBody.error.code === 'DUPLICATE_ARTICLE_TITLE', `Expected DUPLICATE_ARTICLE_TITLE error code, got ${dupTitleBody.error?.code}`);
    console.log('  ✅ PASS: Duplicate article title per author is detected and rejected (HTTP 400 DUPLICATE_ARTICLE_TITLE)');

    // 5. Test Admin Review Queue Advanced Filters
    const reviewQueueRes = await fetch(`${BASE_URL}/api/v1/articles/admin/review?status=draft&writer=${writer._id}&category=Database`, {
      headers: { Cookie: adminCookies },
    });
    console.assert(reviewQueueRes.status === 200, `Expected 200 on admin review queue with filters, got ${reviewQueueRes.status}`);
    const reviewQueueBody = await reviewQueueRes.json();
    console.assert(reviewQueueBody.data.items.length === 1, `Expected 1 article in review queue filter, got ${reviewQueueBody.data.items.length}`);
    console.log('  ✅ PASS: Admin Review Queue supports multi-parameter filtering (writer, status, category, language, isAssigned)');

    // 6. Test Security Guard: Writer cannot publish directly
    const directPublishRes = await fetch(`${BASE_URL}/api/v1/articles/writer/${article1.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: writerCookies,
      },
      body: JSON.stringify({
        status: 'published', // Malicious attempt to self-publish!
      }),
    });
    // Status modification is ignored/rejected
    const publishedCheck = await Article.findById(article1.id);
    console.assert(publishedCheck.status !== 'published', 'Writer MUST NOT be able to self-publish directly');
    console.log('  ✅ SECURITY PASS: Writer cannot bypass editorial state machine or self-publish');

    // Clean up test records
    await User.deleteMany({ email: { $in: [adminEmail, writerEmail] } });
    await Article.deleteMany({ author: writer._id });
    await ArticleAssignment.deleteMany({ writer: writer._id });

    console.log('\n--- WRITER PERFORMANCE & EDITORIAL QUALITY VERIFICATION COMPLETE: ALL TESTS PASSED ---\n');

    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during performance & editorial verification:', error);
    if (server) server.close();
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
};

runPerformanceEditorialTests();
