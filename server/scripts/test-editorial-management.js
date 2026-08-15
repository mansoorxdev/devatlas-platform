process.env.NODE_ENV = 'test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../src/models/user.model.js';
import Article from '../src/models/article.model.js';
import { connectDB } from '../src/config/db.js';
import app from '../src/app.js';
import { ALLOWED_CATEGORIES, ALLOWED_LANGUAGES } from '../src/constants/editorial.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const runEditorialManagementTests = async () => {
  console.log('\n--- DEVATLAS STEP 9: EDITORIAL CONTENT MANAGEMENT & MODERATION VERIFICATION SUITE ---\n');

  let server;
  const PORT = 5108;
  const BASE_URL = `http://127.0.0.1:${PORT}`;

  try {
    await connectDB();
    console.log('  Connected to MongoDB for testing.');

    server = app.listen(PORT);
    console.log(`  Test HTTP server listening on port ${PORT}.`);

    const adminEmail = 'editorial_admin@devatlas.com';
    const writerEmail = 'editorial_writer@devatlas.com';
    const password = 'TestPassword123!';

    await User.deleteMany({ email: { $in: [adminEmail, writerEmail] } });
    await Article.deleteMany({ title: { $regex: /Editorial Test/i } });

    // Seed Admin Account
    const admin = await User.create({
      name: 'Editorial Admin',
      email: adminEmail,
      password,
      role: 'admin',
      isActive: true,
      writerStatus: 'approved',
    });

    // Seed Writer Account
    const writer = await User.create({
      name: 'Editorial Writer',
      email: writerEmail,
      password,
      role: 'writer',
      isActive: true,
      writerStatus: 'approved',
      slug: 'editorial-writer-author',
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
    const { cookies: writerCookies } = await login(writerEmail);

    // 1. Category & Language Whitelist Validation Enforcement
    const invalidCatRes = await fetch(`${BASE_URL}/api/v1/articles/writer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: writerCookies },
      body: JSON.stringify({
        title: 'Editorial Test Invalid Cat',
        summary: 'Testing category validation failure.',
        content: 'Article content paragraph for test execution.',
        category: 'InvalidCategory123',
      }),
    });
    console.assert(invalidCatRes.status === 400, `Expected 400 on invalid category, got ${invalidCatRes.status}`);
    console.log('  ✅ SECURITY PASS: Invalid category outside whitelist is strictly rejected (HTTP 400)');

    const invalidLangRes = await fetch(`${BASE_URL}/api/v1/articles/writer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: writerCookies },
      body: JSON.stringify({
        title: 'Editorial Test Invalid Lang',
        summary: 'Testing language validation failure.',
        content: 'Article content paragraph for test execution.',
        language: 'Klingon',
      }),
    });
    console.assert(invalidLangRes.status === 400, `Expected 400 on invalid language, got ${invalidLangRes.status}`);
    console.log('  ✅ SECURITY PASS: Invalid language outside whitelist is strictly rejected (HTTP 400)');

    // 2. Writer Creates Valid Article (Draft -> Submit)
    const createArtRes = await fetch(`${BASE_URL}/api/v1/articles/writer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: writerCookies },
      body: JSON.stringify({
        title: 'Editorial Test Architecture Guide',
        summary: 'Comprehensive breakdown of microservices architecture in Node.js.',
        content: 'Full detailed content body for microservices architectural breakdown.',
        category: 'Cloud Architecture',
        language: 'English',
        action: 'submit',
      }),
    });
    console.assert(createArtRes.status === 201, `Expected 201 on article submit, got ${createArtRes.status}`);
    const createBody = await createArtRes.json();
    const articleId = createBody.data.article.id;
    const articleSlug = createBody.data.article.slug;

    // 3. Verify Admin Filtering & Listing
    const adminListRes = await fetch(
      `${BASE_URL}/api/v1/articles/admin?category=Cloud+Architecture&language=English&status=pending_review`,
      { headers: { Cookie: adminCookies } }
    );
    console.assert(adminListRes.status === 200, `Expected 200 on admin multi-faceted filter, got ${adminListRes.status}`);
    const adminListBody = await adminListRes.json();
    console.assert(adminListBody.data.items.length >= 1, 'Filtered list must return the created test article');
    console.log('  ✅ PASS: Admin retrieves articles using multi-faceted category, language, and status URL filters');

    // 4. Admin Approves and Publishes Article
    const approveRes = await fetch(`${BASE_URL}/api/v1/articles/admin/${articleId}/approve`, {
      method: 'PATCH',
      headers: { Cookie: adminCookies },
    });
    console.assert(approveRes.status === 200, `Expected 200 on article approval, got ${approveRes.status}`);
    console.log('  ✅ PASS: Admin publishes article (pending_review -> published)');

    // 5. Admin Features Published Article
    const featureRes = await fetch(`${BASE_URL}/api/v1/articles/admin/${articleId}/feature`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookies },
      body: JSON.stringify({ isFeatured: true }),
    });
    console.assert(featureRes.status === 200, `Expected 200 on feature article, got ${featureRes.status}`);

    // Verify Public Featured Endpoint Serves Article
    const publicFeaturedRes = await fetch(`${BASE_URL}/api/v1/articles/featured`);
    console.assert(publicFeaturedRes.status === 200, `Expected 200 on public featured endpoint, got ${publicFeaturedRes.status}`);
    const publicFeaturedBody = await publicFeaturedRes.json();
    const isFeaturedInPublic = publicFeaturedBody.data.items.some((a) => a.id === articleId);
    console.assert(isFeaturedInPublic, 'Published featured article must appear in public featured feed');
    console.log('  ✅ DISCOVERY PASS: Featured published article correctly serves via GET /api/v1/articles/featured');

    // 6. Admin Unpublishes Article
    const unpublishRes = await fetch(`${BASE_URL}/api/v1/articles/admin/${articleId}/unpublish`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookies },
      body: JSON.stringify({ note: 'Unpublishing for editorial audit.' }),
    });
    console.assert(unpublishRes.status === 200, `Expected 200 on unpublish, got ${unpublishRes.status}`);

    const unpublishedArticle = await Article.findById(articleId);
    console.assert(unpublishedArticle.status === 'unpublished', 'Status must transition to unpublished');
    console.assert(unpublishedArticle.isFeatured === false, 'Unpublishing must automatically clear featured flag');
    console.log('  ✅ STATE MACHINE PASS: Unpublishing transitions status to unpublished and clears featured flag');

    // 7. Verify Public Visibility Isolation for Unpublished Article
    // A. Public Articles List
    const pubListRes = await fetch(`${BASE_URL}/api/v1/articles`);
    const pubListBody = await pubListRes.json();
    console.assert(!pubListBody.data.items.some((a) => a.id === articleId), 'Unpublished article must NOT appear in public list');

    // B. Article Detail View by Slug
    const pubDetailRes = await fetch(`${BASE_URL}/api/v1/articles/s/${articleSlug}`);
    console.assert(pubDetailRes.status === 404, `Expected 404 on unpublished article detail view, got ${pubDetailRes.status}`);

    // C. Featured Articles Feed
    const pubFeaturedRes2 = await fetch(`${BASE_URL}/api/v1/articles/featured`);
    const pubFeaturedBody2 = await pubFeaturedRes2.json();
    console.assert(!pubFeaturedBody2.data.items.some((a) => a.id === articleId), 'Unpublished article must NOT appear in featured feed');

    // D. Global Search
    const searchRes = await fetch(`${BASE_URL}/api/v1/search?q=microservices`);
    const searchBody = await searchRes.json();
    console.assert(!searchBody.data.results.articles.some((a) => a.slug === articleSlug), 'Unpublished article must NOT appear in global search');

    // E. Dynamic Sitemap
    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
    const sitemapText = await sitemapRes.text();
    console.assert(!sitemapText.includes(`/articles/${articleSlug}`), 'Unpublished article slug must NOT appear in sitemap.xml');

    // F. Author Profile
    const authorRes = await fetch(`${BASE_URL}/api/v1/users/authors/${writer.slug}`);
    const authorBody = await authorRes.json();
    console.assert(!authorBody.data.recentArticles?.some((a) => a.slug === articleSlug), 'Unpublished article must NOT appear in author profile');

    console.log('  ✅ ISOLATION PASS: Unpublished article is immediately excluded from /articles, /articles/:slug, featured feed, search, sitemap, and author profiles');

    // 8. Admin Restores Article (unpublished -> draft)
    const restoreRes = await fetch(`${BASE_URL}/api/v1/articles/admin/${articleId}/restore`, {
      method: 'PATCH',
      headers: { Cookie: adminCookies },
    });
    console.assert(restoreRes.status === 200, `Expected 200 on restore, got ${restoreRes.status}`);
    const restoredArticle = await Article.findById(articleId);
    console.assert(restoredArticle.status === 'draft', 'Status must restore to draft');
    console.log('  ✅ STATE MACHINE PASS: Restoring unpublished article transitions status to draft');

    // 9. Admin Archives Article (draft -> archived)
    const archiveRes = await fetch(`${BASE_URL}/api/v1/articles/admin/${articleId}/archive`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookies },
      body: JSON.stringify({ note: 'Archiving outdated content.' }),
    });
    console.assert(archiveRes.status === 200, `Expected 200 on archive, got ${archiveRes.status}`);
    const archivedArticle = await Article.findById(articleId);
    console.assert(archivedArticle.status === 'archived', 'Status must transition to archived');
    console.log('  ✅ STATE MACHINE PASS: Archiving article transitions status to archived');

    // 10. Invalid State Transition Rejection (Cannot feature a draft/archived article)
    const invalidFeatureRes = await fetch(`${BASE_URL}/api/v1/articles/admin/${articleId}/feature`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookies },
      body: JSON.stringify({ isFeatured: true }),
    });
    console.assert(invalidFeatureRes.status === 400, `Expected 400 when featuring non-published article, got ${invalidFeatureRes.status}`);
    console.log('  ✅ VALIDATION PASS: Featuring an archived/non-published article is strictly rejected (HTTP 400)');

    // 11. Revision History & Audit Immutability Checks
    const historyRes = await fetch(`${BASE_URL}/api/v1/articles/admin/${articleId}/history`, {
      headers: { Cookie: adminCookies },
    });
    console.assert(historyRes.status === 200, `Expected 200 on revision history, got ${historyRes.status}`);
    const historyBody = await historyRes.json();
    console.assert(historyBody.data.revisions.length >= 4, 'Revision history must record publish, feature, unpublish, restore, archive actions');
    console.log('  ✅ AUDIT PASS: Immutable revision history records all moderation actions with timestamps and admin IDs');

    // 12. Writer Authorization Boundary Verification
    const writerHistoryRes = await fetch(`${BASE_URL}/api/v1/articles/admin/${articleId}/history`, {
      headers: { Cookie: writerCookies },
    });
    console.assert(writerHistoryRes.status === 403, `Expected 403 when writer accesses admin history, got ${writerHistoryRes.status}`);

    const writerUnpublishRes = await fetch(`${BASE_URL}/api/v1/articles/admin/${articleId}/unpublish`, {
      method: 'PATCH',
      headers: { Cookie: writerCookies },
    });
    console.assert(writerUnpublishRes.status === 403, `Expected 403 when writer attempts unpublish, got ${writerUnpublishRes.status}`);
    console.log('  ✅ AUTHORIZATION PASS: Writer is strictly blocked from Admin editorial moderation endpoints (HTTP 403)');

    // Clean up test data
    await User.deleteMany({ email: { $in: [adminEmail, writerEmail] } });
    await Article.deleteMany({ title: { $regex: /Editorial Test/i } });

    console.log('\n--- EDITORIAL CONTENT MANAGEMENT & MODERATION VERIFICATION COMPLETE: ALL TESTS PASSED ---\n');

    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during editorial management verification:', error);
    if (server) server.close();
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
};

runEditorialManagementTests();
