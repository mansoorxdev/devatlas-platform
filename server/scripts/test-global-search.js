import mongoose from 'mongoose';
import config from '#config/env.config.js';
import Article from '#models/article.model.js';
import Snippet from '#models/snippet.model.js';
import ErrorSolution from '#models/error.model.js';
import User from '#models/user.model.js';
import searchService from '#services/search.service.js';
import { searchQuerySchema } from '#validators/search.validator.js';

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
  console.log('\n--- DEVATLAS GLOBAL SEARCH API VERIFICATION SUITE ---\n');

  try {
    // 1. Zod Validation Tests
    console.log('  Testing Zod Validation Schema...');

    const invalidMissing = searchQuerySchema.safeParse({ query: {} });
    assert(!invalidMissing.success, 'Validation fails when "q" is missing');

    const invalidEmpty = searchQuerySchema.safeParse({ query: { q: '   ' } });
    assert(!invalidEmpty.success, 'Validation fails when "q" is empty whitespace');

    const invalidShort = searchQuerySchema.safeParse({ query: { q: 'a' } });
    assert(!invalidShort.success, 'Validation fails when "q" length < 2');

    const invalidLong = searchQuerySchema.safeParse({ query: { q: 'a'.repeat(101) } });
    assert(!invalidLong.success, 'Validation fails when "q" length > 100');

    const validQuery = searchQuerySchema.safeParse({ query: { q: '  jwt auth  ' } });
    assert(validQuery.success && validQuery.data.query.q === 'jwt auth', 'Valid "q" is trimmed successfully');

    // 2. Database Integration Tests
    await mongoose.connect(config.MONGO_URI);
    console.log('\n  Connected to MongoDB for testing.');

    // Find test admin user for authorship
    let testUser = await User.findOne({ role: 'admin' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Search Test Admin',
        email: 'searchadmin@devatlas.test',
        password: 'password123',
        role: 'admin',
      });
    }

    // Clean up test items from prior runs
    await Article.deleteMany({ title: { $regex: /^TEST_SEARCH_/ } });
    await Snippet.deleteMany({ title: { $regex: /^TEST_SEARCH_/ } });
    await ErrorSolution.deleteMany({ title: { $regex: /^TEST_SEARCH_/ } });

    // Seed Published & Draft Items
    console.log('  Seeding test articles, snippets, and errors...');

    // 4 Published Articles
    for (let i = 1; i <= 4; i++) {
      await Article.create({
        title: `TEST_SEARCH_ARTICLE_${i} Authentication and Security Tutorial`,
        slug: `test-search-article-${i}-${Date.now()}`,
        summary: `Summary for test search article ${i} covering JWT auth and security.`,
        content: `Full content for test search article ${i}.`,
        tags: ['auth', 'jwt', 'security'],
        status: 'published',
        author: testUser._id,
        publishedAt: new Date(),
      });
    }

    // 1 Draft Article (MUST NOT APPEAR)
    await Article.create({
      title: `TEST_SEARCH_ARTICLE_DRAFT Secret Internal Guide`,
      slug: `test-search-article-draft-${Date.now()}`,
      summary: `Draft summary for test search article covering JWT auth secret details.`,
      content: `Draft content.`,
      tags: ['auth', 'jwt'],
      status: 'draft',
      author: testUser._id,
    });

    // 4 Published Snippets
    for (let i = 1; i <= 4; i++) {
      await Snippet.create({
        title: `TEST_SEARCH_SNIPPET_${i} Authentication Helper Code`,
        slug: `test-search-snippet-${i}-${Date.now()}`,
        summary: `Snippet summary ${i} for authentication code.`,
        code: `const auth${i} = require('jwt');`,
        language: 'javascript',
        tags: ['auth', 'jwt'],
        status: 'published',
        author: testUser._id,
        publishedAt: new Date(),
      });
    }

    // 1 Draft Snippet (MUST NOT APPEAR)
    await Snippet.create({
      title: `TEST_SEARCH_SNIPPET_DRAFT Secret Auth Code`,
      slug: `test-search-snippet-draft-${Date.now()}`,
      summary: `Draft snippet summary.`,
      code: `const secret = '123';`,
      language: 'javascript',
      tags: ['auth', 'jwt'],
      status: 'draft',
      author: testUser._id,
    });

    // 4 Published Errors
    for (let i = 1; i <= 4; i++) {
      await ErrorSolution.create({
        title: `TEST_SEARCH_ERROR_${i} Authentication JWT Invalid Token Exception`,
        slug: `test-search-error-${i}-${Date.now()}`,
        errorMessage: `JsonWebTokenError: invalid signature in authentication test ${i}`,
        category: 'authentication',
        language: 'javascript',
        cause: `Invalid JWT secret key specified in test ${i}.`,
        solution: `Verify JWT_SECRET environment variable matches in test ${i}.`,
        codeFix: `const token${i} = jwt.verify(t, SECRET);`,
        tags: ['auth', 'jwt'],
        status: 'published',
        author: testUser._id,
        publishedAt: new Date(),
      });
    }

    // 1 Draft Error (MUST NOT APPEAR)
    await ErrorSolution.create({
      title: `TEST_SEARCH_ERROR_DRAFT Internal Key Exception`,
      slug: `test-search-error-draft-${Date.now()}`,
      errorMessage: `Draft error message for JWT authentication.`,
      category: 'authentication',
      language: 'javascript',
      cause: `Draft cause.`,
      solution: `Draft solution.`,
      codeFix: `draft fix;`,
      tags: ['auth', 'jwt'],
      status: 'draft',
      author: testUser._id,
    });

    console.log('  Seeding complete. Executing database search assertions...\n');

    // DB TEST 1: Service returns results for valid query 'TEST_SEARCH'
    const searchData = await searchService.globalSearch('TEST_SEARCH');
    assert(searchData !== null && typeof searchData === 'object', 'Service returns a valid result object');
    assert(searchData.query === 'TEST_SEARCH', 'Query matches input search term');

    // DB TEST 2: Articles results present and max 3
    assert(Array.isArray(searchData.results.articles), 'Results contain articles array');
    assert(searchData.results.articles.length <= 3, 'Articles result count capped at maximum 3');

    // DB TEST 3: Snippets results present and max 3
    assert(Array.isArray(searchData.results.snippets), 'Results contain snippets array');
    assert(searchData.results.snippets.length <= 3, 'Snippets result count capped at maximum 3');

    // DB TEST 4: Errors results present and max 3
    assert(Array.isArray(searchData.results.errors), 'Results contain errors array');
    assert(searchData.results.errors.length <= 3, 'Error solutions result count capped at maximum 3');

    // DB TEST 5: Total matches returned sum
    const expectedTotal =
      searchData.results.articles.length +
      searchData.results.snippets.length +
      searchData.results.errors.length;
    assert(searchData.total === expectedTotal, `Total count (${searchData.total}) matches sum of groups (${expectedTotal})`);

    // DB TEST 6: Draft Articles strictly excluded
    const hasDraftArticle = searchData.results.articles.some((a) => a.title.includes('DRAFT'));
    assert(!hasDraftArticle, 'Draft articles are strictly excluded from search results');

    // DB TEST 7: Draft Snippets strictly excluded
    const hasDraftSnippet = searchData.results.snippets.some((s) => s.title.includes('DRAFT'));
    assert(!hasDraftSnippet, 'Draft snippets are strictly excluded from search results');

    // DB TEST 8: Draft Errors strictly excluded
    const hasDraftError = searchData.results.errors.some((e) => e.title.includes('DRAFT'));
    assert(!hasDraftError, 'Draft error solutions are strictly excluded from search results');

    // DB TEST 9: Article item fields schema integrity
    if (searchData.results.articles.length > 0) {
      const art = searchData.results.articles[0];
      assert(art.type === 'article', 'Article result item contains type: "article"');
      assert(art.title && art.slug && art.summary, 'Article result contains title, slug, and summary');
      assert(art.content === undefined, 'Article result excludes full content body');
    }

    // DB TEST 10: Snippet item fields schema integrity
    if (searchData.results.snippets.length > 0) {
      const snip = searchData.results.snippets[0];
      assert(snip.type === 'snippet', 'Snippet result item contains type: "snippet"');
      assert(snip.title && snip.slug && snip.language, 'Snippet result contains title, slug, and language');
      assert(snip.code === undefined, 'Snippet result excludes full code body');
    }

    // DB TEST 11: Error item fields schema integrity
    if (searchData.results.errors.length > 0) {
      const errItem = searchData.results.errors[0];
      assert(errItem.type === 'error', 'Error result item contains type: "error"');
      assert(errItem.title && errItem.slug && errItem.errorMessage, 'Error result contains title, slug, and errorMessage');
      assert(errItem.solution === undefined, 'Error result excludes full solution text');
    }

    // DB TEST 12: Special regex characters do not crash query
    const specialQuery = 'TEST_SEARCH (.*+?^${})|[|\\]';
    const specialData = await searchService.globalSearch(specialQuery);
    assert(specialData && typeof specialData.total === 'number', 'Special regex characters execute safely without crashing');

    // DB TEST 13: Non-matching query returns empty arrays and total = 0
    const emptyData = await searchService.globalSearch('NON_EXISTENT_QUERY_XYZ_999');
    assert(
      emptyData.total === 0 &&
        emptyData.results.articles.length === 0 &&
        emptyData.results.snippets.length === 0 &&
        emptyData.results.errors.length === 0,
      'Non-matching query returns HTTP 200 structure with total: 0 and empty arrays'
    );

    // Clean up test items
    await Article.deleteMany({ title: { $regex: /^TEST_SEARCH_/ } });
    await Snippet.deleteMany({ title: { $regex: /^TEST_SEARCH_/ } });
    await ErrorSolution.deleteMany({ title: { $regex: /^TEST_SEARCH_/ } });

    console.log(`\n--- VERIFICATION COMPLETE: ${passedCount}/${totalCount} TESTS PASSED ---\n`);
  } catch (err) {
    console.error('Test execution failed with exception:', err);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();
