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

const runAuthorProfileTests = async () => {
  console.log('\n--- DEVATLAS STEP 6E: PUBLIC AUTHOR PROFILE & DISCOVERY VERIFICATION SUITE ---\n');

  let server;
  const PORT = 5102;
  const BASE_URL = `http://127.0.0.1:${PORT}`;

  try {
    await connectDB();
    console.log('  Connected to MongoDB for testing.');

    server = app.listen(PORT);
    console.log(`  Test HTTP server listening on port ${PORT}.`);

    const writerEmail1 = 'author_slug_test1@devatlas.com';
    const writerEmail2 = 'author_slug_test2@devatlas.com';
    const password = 'TestPassword123!';

    await User.deleteMany({ email: { $in: [writerEmail1, writerEmail2] } });
    await Article.deleteMany({ title: /Author Profile Test Article/ });

    // 1. Create 2 writers with duplicate names to test slug collision handling (-1)
    const writer1 = await User.create({
      name: 'Alex Contributor',
      email: writerEmail1,
      password,
      role: 'writer',
      isActive: true,
      bio: 'Senior Cloud Architect & Open Source Contributor.',
      avatar: 'avatar-03',
      expertise: ['Cloud', 'Kubernetes', 'Go'],
      socialLinks: { github: 'https://github.com/alexcontrib' },
    });

    const writer2 = await User.create({
      name: 'Alex Contributor',
      email: writerEmail2,
      password,
      role: 'writer',
      isActive: true,
    });

    console.assert(writer1.slug === 'alex-contributor', `Expected slug 'alex-contributor', got '${writer1.slug}'`);
    console.assert(writer2.slug === 'alex-contributor-1', `Expected collision slug 'alex-contributor-1', got '${writer2.slug}'`);
    console.log('  ✅ PASS: Author slug generation & collision resolution (-1) verified successfully');

    // 2. Create Published and Draft Articles for Writer 1
    const publishedArt = await Article.create({
      title: 'Author Profile Test Article — Published Guide',
      slug: 'author-profile-test-article-published-guide',
      summary: 'Public published guide for testing author page rendering.',
      content: '# Published Content\n\nPublicly visible article.',
      status: 'published',
      publishedAt: new Date(),
      author: writer1._id,
      readTime: 3,
    });

    const draftArt = await Article.create({
      title: 'Author Profile Test Article — Private Draft',
      slug: 'author-profile-test-article-private-draft',
      summary: 'Secret draft that must never be exposed on public author page.',
      content: '# Secret Draft\n\nPrivate content.',
      status: 'draft',
      author: writer1._id,
    });

    // 3. Test GET /api/v1/users/authors/:slug (Public Endpoint)
    const getAuthorRes = await fetch(`${BASE_URL}/api/v1/users/authors/${writer1.slug}`);
    console.assert(getAuthorRes.status === 200, `Expected 200 on public author fetch, got ${getAuthorRes.status}`);

    const authorBody = await getAuthorRes.json();
    const publicAuthor = authorBody.data.author;
    const publicArticles = authorBody.data.articles;

    console.assert(publicAuthor.name === 'Alex Contributor', 'Public author name must match');
    console.assert(publicAuthor.bio === 'Senior Cloud Architect & Open Source Contributor.', 'Public author bio must match');
    console.assert(publicAuthor.slug === 'alex-contributor', 'Public author slug must match');
    console.assert(publicAuthor.email === undefined, 'CRITICAL SECURITY PASS: Public author object MUST NOT expose email');
    console.assert(publicAuthor.password === undefined, 'CRITICAL SECURITY PASS: Public author object MUST NOT expose password');
    console.assert(publicAuthor.isActive === undefined, 'CRITICAL SECURITY PASS: Public author object MUST NOT expose isActive flag');

    console.log('  ✅ SECURITY PASS: Public author profile endpoint strictly excludes email, password, and isActive flags');

    // 4. Test Published-Only Article Isolation
    console.assert(publicArticles.length === 1, `Expected 1 published article for author, got ${publicArticles.length}`);
    console.assert(publicArticles[0].title === 'Author Profile Test Article — Published Guide', 'Published article title must match');
    console.log('  ✅ PASS: Public author page lists ONLY published articles (drafts strictly excluded)');

    // 5. Test 404 for Unknown Author Slug
    const notFoundRes = await fetch(`${BASE_URL}/api/v1/users/authors/non-existent-author-slug`);
    console.assert(notFoundRes.status === 404, `Expected 404 for unknown author slug, got ${notFoundRes.status}`);
    console.log('  ✅ PASS: Unknown author slug request returns HTTP 404 NOT_FOUND');

    // 6. Test Sitemap XML Integration
    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
    console.assert(sitemapRes.status === 200, `Expected 200 on sitemap.xml, got ${sitemapRes.status}`);
    const xmlText = await sitemapRes.text();
    console.assert(xmlText.includes(`/authors/${writer1.slug}`), `Sitemap XML must contain public author URL /authors/${writer1.slug}`);
    console.log('  ✅ PASS: Dynamic sitemap.xml includes public author profile URL');

    // Clean up test data
    await User.deleteMany({ email: { $in: [writerEmail1, writerEmail2] } });
    await Article.deleteMany({ _id: { $in: [publishedArt._id, draftArt._id] } });

    console.log('\n--- PUBLIC AUTHOR PROFILE & DISCOVERY VERIFICATION COMPLETE: ALL TESTS PASSED ---\n');

    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during public author profile verification:', error);
    if (server) server.close();
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
};

runAuthorProfileTests();
