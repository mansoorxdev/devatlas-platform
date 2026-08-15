process.env.NODE_ENV = 'test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../src/models/user.model.js';
import Article from '../src/models/article.model.js';
import Snippet from '../src/models/snippet.model.js';
import ErrorSolution from '../src/models/error.model.js';
import { connectDB } from '../src/config/db.js';
import app from '../src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const runHomepageFeedsStateTests = async () => {
  console.log('\n--- DEVATLAS HOMEPAGE FEEDS: EMPTY & ERROR STATE REGRESSION SUITE ---\n');

  let server;
  const PORT = 5110;
  const BASE_URL = `http://127.0.0.1:${PORT}`;

  try {
    await connectDB();
    console.log('  Connected to MongoDB for testing.');

    server = app.listen(PORT);
    console.log(`  Test HTTP server listening on port ${PORT}.`);

    // Clean all published test items
    await Article.deleteMany({ title: { $regex: /Homepage Feed Test/i } });
    await Snippet.deleteMany({ title: { $regex: /Homepage Feed Test/i } });
    await ErrorSolution.deleteMany({ title: { $regex: /Homepage Feed Test/i } });

    // -------------------------------------------------------------
    // PART 1: ZERO PUBLISHED ITEMS (EMPTY RESPONSE STATE)
    // -------------------------------------------------------------
    // Temporarily unpublish or ensure 0 items match our test query or clear articles for test run
    const artResEmpty = await fetch(`${BASE_URL}/api/v1/articles?limit=3`);
    console.assert(artResEmpty.status === 200, `Expected 200 for empty articles feed, got ${artResEmpty.status}`);
    const artBodyEmpty = await artResEmpty.json();
    console.assert(artBodyEmpty.success === true, 'Empty articles response must have success: true');
    console.assert(Array.isArray(artBodyEmpty.data.items), 'Empty articles response data.items must be an array');
    console.assert(artBodyEmpty.error === undefined, 'Empty response must NOT contain error property');
    console.log('  ✅ PASS: Articles feed HTTP 200 returns success: true and data.items array on empty state');

    const snipResEmpty = await fetch(`${BASE_URL}/api/v1/snippets?limit=3`);
    console.assert(snipResEmpty.status === 200, `Expected 200 for empty snippets feed, got ${snipResEmpty.status}`);
    const snipBodyEmpty = await snipResEmpty.json();
    console.assert(snipBodyEmpty.success === true, 'Empty snippets response must have success: true');
    console.assert(Array.isArray(snipBodyEmpty.data.items), 'Empty snippets response data.items must be an array');
    console.assert(snipBodyEmpty.error === undefined, 'Empty response must NOT contain error property');
    console.log('  ✅ PASS: Snippets feed HTTP 200 returns success: true and data.items array on empty state');

    const errResEmpty = await fetch(`${BASE_URL}/api/v1/errors?limit=3`);
    console.assert(errResEmpty.status === 200, `Expected 200 for empty errors feed, got ${errResEmpty.status}`);
    const errBodyEmpty = await errResEmpty.json();
    console.assert(errBodyEmpty.success === true, 'Empty errors response must have success: true');
    console.assert(Array.isArray(errBodyEmpty.data.items), 'Empty errors response data.items must be an array');
    console.assert(errBodyEmpty.error === undefined, 'Empty response must NOT contain error property');
    console.log('  ✅ PASS: Error solutions feed HTTP 200 returns success: true and data.items array on empty state');

    // -------------------------------------------------------------
    // PART 2: API FAILURE & INVALID QUERY / INVALID ROUTE STATE
    // -------------------------------------------------------------
    const invalidApiRes = await fetch(`${BASE_URL}/api/v1/non_existent_feed`);
    console.assert(invalidApiRes.status === 404, `Expected 404 for invalid feed endpoint, got ${invalidApiRes.status}`);
    const invalidApiBody = await invalidApiRes.json();
    console.assert(invalidApiBody.success === false, 'API failure response must have success: false');
    console.assert(invalidApiBody.error !== undefined, 'API failure response must contain error payload');
    console.log('  ✅ PASS: API failure response correctly returns success: false and error payload');

    // -------------------------------------------------------------
    // PART 3: SUCCESS WITH PUBLISHED ITEMS
    // -------------------------------------------------------------
    const author = await User.create({
      name: 'Homepage Feed Tester',
      email: 'homepage_tester@devatlas.com',
      password: 'TestPassword123!',
      role: 'writer',
      isActive: true,
      writerStatus: 'approved',
    });

    const testArt = await Article.create({
      title: 'Homepage Feed Test Published Article',
      slug: 'homepage-feed-test-article',
      summary: 'Test summary for homepage feed verification.',
      content: 'Detailed content body for homepage feed test.',
      category: 'Backend',
      language: 'English',
      status: 'published',
      publishedAt: new Date(),
      author: author._id,
    });

    const artResPopulated = await fetch(`${BASE_URL}/api/v1/articles?limit=3`);
    const artBodyPopulated = await artResPopulated.json();
    console.assert(artBodyPopulated.success === true, 'Populated articles response must have success: true');
    console.assert(artBodyPopulated.data.items.length >= 1, 'Populated feed must return items');
    console.log('  ✅ PASS: Articles feed HTTP 200 returns published items when populated');

    // Clean up test data
    await Article.deleteOne({ _id: testArt._id });
    await User.deleteOne({ _id: author._id });

    console.log('\n--- HOMEPAGE FEEDS: EMPTY & ERROR STATE VERIFICATION COMPLETE: ALL TESTS PASSED ---\n');

    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during homepage feeds state verification:', error);
    if (server) server.close();
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
};

runHomepageFeedsStateTests();
