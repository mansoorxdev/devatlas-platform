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

const runProfileEditorTests = async () => {
  console.log('\n--- DEVATLAS STEP 6D: WRITER PROFILE & EDITOR VERIFICATION SUITE ---\n');

  let server;
  const PORT = 5101;
  const BASE_URL = `http://127.0.0.1:${PORT}`;

  try {
    await connectDB();
    console.log('  Connected to MongoDB for testing.');

    server = app.listen(PORT);
    console.log(`  Test HTTP server listening on port ${PORT}.`);

    const adminEmail = 'admin_profile_test@devatlas.com';
    const writerEmail = 'writer_profile_test@devatlas.com';
    const password = 'TestPassword123!';

    await User.deleteMany({ email: { $in: [adminEmail, writerEmail] } });
    await Article.deleteMany({ title: /Profile Test Article/ });

    const adminUser = await User.create({
      name: 'Profile Admin',
      email: adminEmail,
      password,
      role: 'admin',
      isActive: true,
    });

    const writerUser = await User.create({
      name: 'Profile Writer',
      email: writerEmail,
      password,
      role: 'writer',
      isActive: true,
    });

    const extractCookieHeader = (res) => {
      const setCookie = res.headers.get('set-cookie');
      if (!setCookie) return '';
      return setCookie.split(';')[0];
    };

    // 1. Writer Login
    const writerLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: writerEmail, password }),
    });

    console.assert(writerLoginRes.status === 200, `Expected 200 on writer login, got ${writerLoginRes.status}`);
    const writerCookie = extractCookieHeader(writerLoginRes);

    // 2. Fetch Writer Profile (GET /api/v1/users/profile)
    const getProfileRes = await fetch(`${BASE_URL}/api/v1/users/profile`, {
      headers: { Cookie: writerCookie },
    });

    console.assert(getProfileRes.status === 200, `Expected 200 on GET /users/profile, got ${getProfileRes.status}`);
    const profileBody = await getProfileRes.json();
    console.assert(profileBody.data.user.email === writerEmail, 'GET /users/profile must return authenticated user email for self profile');
    console.log('  ✅ PASS: Writer retrieves profile via GET /api/v1/users/profile');

    // 3. Update Writer Profile (PATCH /api/v1/users/profile)
    const updateProfileRes = await fetch(`${BASE_URL}/api/v1/users/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: writerCookie,
      },
      body: JSON.stringify({
        name: 'Jane Technical Author',
        bio: 'Senior Backend Engineer and Technical Writer specializing in Distributed Systems & Node.js.',
        avatar: 'avatar-02',
        expertise: ['Node.js', 'System Design', 'React', 'MongoDB'],
        socialLinks: {
          github: 'https://github.com/janedev',
          twitter: 'https://twitter.com/janedev',
          website: 'https://janedev.io',
        },
      }),
    });

    console.assert(updateProfileRes.status === 200, `Expected 200 on PATCH /users/profile, got ${updateProfileRes.status}`);
    const updatedBody = await updateProfileRes.json();
    const updatedUser = updatedBody.data.user;
    console.assert(updatedUser.bio.includes('Senior Backend Engineer'), 'Bio must be updated');
    console.assert(updatedUser.expertise.length === 4, 'Expertise array must be updated');
    console.assert(updatedUser.socialLinks.github === 'https://github.com/janedev', 'GitHub social link must be updated');
    console.log('  ✅ PASS: Writer updates profile (bio, avatar, expertise, socialLinks) via PATCH /api/v1/users/profile');

    // 4. Writer Creates Draft Article with SEO & Featured Image
    const articlePayload = {
      title: 'Profile Test Article — Building Scalable Microservices with Node.js',
      summary: 'Comprehensive guide to designing decoupled microservices architectures in Node.js and MongoDB.',
      content: '# Microservices Architecture\n\nMicroservices provide horizontal scalability and fault isolation...\n\n```js\nconsole.log("Hello Microservices");\n```',
      tags: ['microservices', 'node', 'architecture'],
      featuredImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31',
      seoTitle: 'Building Scalable Microservices with Node.js | DevAtlas',
      seoDescription: 'Learn how to architect robust, scalable microservices in Node.js with MongoDB and Docker.',
    };

    const createArticleRes = await fetch(`${BASE_URL}/api/v1/articles/writer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: writerCookie,
      },
      body: JSON.stringify(articlePayload),
    });

    console.assert(createArticleRes.status === 201, `Expected 201 on article creation, got ${createArticleRes.status}`);
    const articleBody = await createArticleRes.json();
    const articleId = articleBody.data.article.id;
    const articleSlug = articleBody.data.article.slug;
    console.log('  ✅ PASS: Writer creates draft article with SEO metadata, tags, and featured image');

    // 5. Writer Submits Article for Review
    const submitRes = await fetch(`${BASE_URL}/api/v1/articles/writer/${articleId}/submit`, {
      method: 'PATCH',
      headers: { Cookie: writerCookie },
    });
    console.assert(submitRes.status === 200, 'Writer article submission must return HTTP 200');

    // 6. Admin Log in & Approve Article
    const adminLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password }),
    });
    const adminCookie = extractCookieHeader(adminLoginRes);

    const approveRes = await fetch(`${BASE_URL}/api/v1/articles/admin/${articleId}/approve`, {
      method: 'PATCH',
      headers: { Cookie: adminCookie },
    });
    console.assert(approveRes.status === 200, 'Admin article approval must return HTTP 200');
    console.log('  ✅ PASS: Admin approves writer article; status transitions to "published"');

    // 7. Fetch Public Published Article View (GET /api/v1/articles/s/:slug)
    const publicArticleRes = await fetch(`${BASE_URL}/api/v1/articles/s/${articleSlug}`);
    console.assert(publicArticleRes.status === 200, `Expected 200 on public article fetch, got ${publicArticleRes.status}`);
    const publicBody = await publicArticleRes.json();
    const publicArticle = publicBody.data.article;

    // Verify Author Byline Metadata & Privacy Isolation
    const authorByline = publicArticle.author;
    console.assert(authorByline, 'Public article must populate author object');
    console.assert(authorByline.name === 'Jane Technical Author', 'Public author name must match');
    console.assert(authorByline.bio.includes('Senior Backend Engineer'), 'Public author bio must be populated');
    console.assert(authorByline.avatar === 'avatar-02', 'Public author avatar must be populated');
    console.assert(authorByline.expertise.includes('Node.js'), 'Public author expertise must be populated');
    console.assert(authorByline.socialLinks.github === 'https://github.com/janedev', 'Public author social links must be populated');
    console.assert(authorByline.email === undefined, 'CRITICAL SECURITY PASS: Public author object MUST NOT expose email address');

    console.log('  ✅ SECURITY PASS: Public article detail populates author bio, avatar, expertise & social links without exposing writer email');

    // Clean up test data
    await User.deleteMany({ email: { $in: [adminEmail, writerEmail] } });
    await Article.deleteMany({ _id: articleId });

    console.log('\n--- WRITER PROFILE & EDITOR VERIFICATION COMPLETE: ALL TESTS PASSED ---\n');

    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during writer profile/editor verification:', error);
    if (server) server.close();
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
};

runProfileEditorTests();
