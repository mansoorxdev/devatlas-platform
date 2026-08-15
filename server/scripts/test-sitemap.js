import mongoose from 'mongoose';
import config from '#config/env.config.js';
import Article from '#models/article.model.js';
import Snippet from '#models/snippet.model.js';
import ErrorSolution from '#models/error.model.js';
import User from '#models/user.model.js';
import sitemapService from '#services/sitemap.service.js';

let passedCount = 0;
let totalCount = 0;

function assert(condition, message) {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function runTests() {
  console.log('\n--- DEVATLAS SITEMAP XML VERIFICATION SUITE ---\n');

  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('  Connected to MongoDB for sitemap testing.\n');

    let testUser = await User.findOne({ role: 'admin' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Sitemap Test Admin',
        email: 'sitemapadmin@devatlas.test',
        password: 'password123',
        role: 'admin',
      });
    }

    // Clean up test items
    await Article.deleteMany({ title: { $regex: /^TEST_SITEMAP_/ } });
    await Snippet.deleteMany({ title: { $regex: /^TEST_SITEMAP_/ } });
    await ErrorSolution.deleteMany({ title: { $regex: /^TEST_SITEMAP_/ } });

    // Seed 1 Published Article with XML special chars in slug
    const pubArt = await Article.create({
      title: 'TEST_SITEMAP_ARTICLE Published Guide & Tutorial',
      slug: `test-sitemap-article-pub-ampersand-${Date.now()}`,
      summary: 'Published summary',
      content: 'Content',
      status: 'published',
      author: testUser._id,
      publishedAt: new Date(),
    });

    // Seed 1 Draft Article (MUST NOT APPEAR IN SITEMAP)
    const draftArt = await Article.create({
      title: 'TEST_SITEMAP_ARTICLE Draft Secret Guide',
      slug: `test-sitemap-article-draft-${Date.now()}`,
      summary: 'Draft summary',
      content: 'Draft Content',
      status: 'draft',
      author: testUser._id,
    });

    // Seed 1 Published Snippet
    const pubSnip = await Snippet.create({
      title: 'TEST_SITEMAP_SNIPPET Published Code',
      slug: `test-sitemap-snippet-pub-${Date.now()}`,
      summary: 'Snippet summary',
      code: 'const x = 1;',
      language: 'javascript',
      status: 'published',
      author: testUser._id,
      publishedAt: new Date(),
    });

    // Seed 1 Draft Snippet
    const draftSnip = await Snippet.create({
      title: 'TEST_SITEMAP_SNIPPET Draft Code',
      slug: `test-sitemap-snippet-draft-${Date.now()}`,
      summary: 'Draft snippet',
      code: 'const draft = 2;',
      language: 'javascript',
      status: 'draft',
      author: testUser._id,
    });

    // Seed 1 Published Error
    const pubErr = await ErrorSolution.create({
      title: 'TEST_SITEMAP_ERROR Published Fix',
      slug: `test-sitemap-error-pub-${Date.now()}`,
      errorMessage: 'Error message',
      category: 'authentication',
      language: 'javascript',
      cause: 'Cause',
      solution: 'Solution',
      status: 'published',
      author: testUser._id,
      publishedAt: new Date(),
    });

    // Seed 1 Draft Error
    const draftErr = await ErrorSolution.create({
      title: 'TEST_SITEMAP_ERROR Draft Fix',
      slug: `test-sitemap-error-draft-${Date.now()}`,
      errorMessage: 'Draft error message',
      category: 'authentication',
      language: 'javascript',
      cause: 'Draft cause',
      solution: 'Draft solution',
      status: 'draft',
      author: testUser._id,
    });

    // Generate XML Sitemap
    const xml = await sitemapService.generateSitemapXml();

    assert(typeof xml === 'string' && xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'Returns valid XML declaration header');
    assert(xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), 'Contains valid urlset xmlns header');
    assert(xml.includes('/articles</loc>') && xml.includes('/snippets</loc>') && xml.includes('/errors</loc>') && xml.includes('/devtools</loc>'), 'Includes static public routes');

    // Check Published vs Draft Inclusion
    assert(xml.includes(pubArt.slug), 'Published article slug appears in sitemap');
    assert(!xml.includes(draftArt.slug), 'Draft article slug is strictly excluded from sitemap');

    assert(xml.includes(pubSnip.slug), 'Published snippet slug appears in sitemap');
    assert(!xml.includes(draftSnip.slug), 'Draft snippet slug is strictly excluded from sitemap');

    assert(xml.includes(pubErr.slug), 'Published error solution slug appears in sitemap');
    assert(!xml.includes(draftErr.slug), 'Draft error solution slug is strictly excluded from sitemap');

    // Check No MongoDB ID Leakage
    assert(!xml.includes(pubArt._id.toString()), 'MongoDB ObjectIDs do not appear in sitemap URLs');

    // Clean up test items
    await Article.deleteMany({ title: { $regex: /^TEST_SITEMAP_/ } });
    await Snippet.deleteMany({ title: { $regex: /^TEST_SITEMAP_/ } });
    await ErrorSolution.deleteMany({ title: { $regex: /^TEST_SITEMAP_/ } });

    console.log(`\n--- SITEMAP VERIFICATION COMPLETE: ${passedCount}/${totalCount} TESTS PASSED ---\n`);
  } catch (err) {
    console.error('Test execution failed with exception:', err);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();
