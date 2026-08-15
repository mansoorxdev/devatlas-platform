import http from 'http';
import mongoose from 'mongoose';
import config from '#config/env.config.js';
import app from '../src/app.js';

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

async function requestHelper(server, path, options = {}) {
  const address = server.address();
  const port = address.port;
  const url = `http://127.0.0.1:${port}${path}`;

  const headers = options.headers || {};
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let json = null;
  let text = '';
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    json = await res.json();
  } else {
    text = await res.text();
  }

  return {
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
    body: json || text,
  };
}

async function runSecurityAudit() {
  console.log('\n--- DEVATLAS STEP 4B: PRODUCTION SECURITY & RATE LIMITING VERIFICATION SUITE ---\n');

  let server;
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('  Connected to MongoDB for security testing.\n');

    // Start ephemeral HTTP server on dynamic port
    await new Promise((resolve) => {
      server = http.createServer(app).listen(0, '127.0.0.1', () => {
        resolve();
      });
    });

    // 1. Security Headers Verification
    console.log('--- 1. Security Headers Verification ---');
    const headerRes = await requestHelper(server, '/api/v1/health');
    assert(headerRes.status === 200, 'Health endpoint returns HTTP 200');
    assert(headerRes.headers['x-content-type-options'] === 'nosniff', 'Helmet nosniff header present');
    assert(headerRes.headers['x-dns-prefetch-control'] === 'off', 'Helmet DNS prefetch off header present');

    // 2. CORS Hardening Verification
    console.log('\n--- 2. CORS Hardening Verification ---');
    const corsAllowedRes = await requestHelper(server, '/api/v1/health', {
      headers: { Origin: config.CLIENT_URL },
    });
    assert(
      corsAllowedRes.headers['access-control-allow-origin'] === config.CLIENT_URL,
      `Allowed origin [${config.CLIENT_URL}] succeeds with Access-Control-Allow-Origin`
    );
    assert(
      corsAllowedRes.headers['access-control-allow-credentials'] === 'true',
      'Allowed origin returns Access-Control-Allow-Credentials: true'
    );

    const corsBlockedRes = await requestHelper(server, '/api/v1/health', {
      headers: { Origin: 'http://malicious-unauthorized-site.com' },
    });
    assert(
      !corsBlockedRes.headers['access-control-allow-origin'],
      'Unauthorized origin does not receive Access-Control-Allow-Origin header'
    );

    // 3. Unauthenticated Public Endpoint Accessibility
    console.log('\n--- 3. Public Unauthenticated Endpoint Access ---');
    const articlesRes = await requestHelper(server, '/api/v1/articles');
    assert(articlesRes.status === 200 && articlesRes.body.success, 'GET /api/v1/articles is publicly accessible (HTTP 200)');

    const snippetsRes = await requestHelper(server, '/api/v1/snippets');
    assert(snippetsRes.status === 200 && snippetsRes.body.success, 'GET /api/v1/snippets is publicly accessible (HTTP 200)');

    const errorsRes = await requestHelper(server, '/api/v1/errors');
    assert(errorsRes.status === 200 && errorsRes.body.success, 'GET /api/v1/errors is publicly accessible (HTTP 200)');

    const searchRes = await requestHelper(server, '/api/v1/search?q=javascript');
    assert(searchRes.status === 200 && searchRes.body.success, 'GET /api/v1/search?q=javascript is publicly accessible (HTTP 200)');

    const sitemapRes = await requestHelper(server, '/sitemap.xml');
    assert(sitemapRes.status === 200 && sitemapRes.headers['content-type'].includes('application/xml'), 'GET /sitemap.xml returns HTTP 200 application/xml');

    // 4. Protected Admin Endpoint Security
    console.log('\n--- 4. Protected Admin Endpoint Authorization ---');
    const unauthMeRes = await requestHelper(server, '/api/v1/auth/me');
    assert(
      unauthMeRes.status === 401 && unauthMeRes.body.error?.code === 'UNAUTHORIZED',
      'Unauthenticated GET /api/v1/auth/me is blocked with HTTP 401 UNAUTHORIZED'
    );

    // 5. Search Query Validation & Injection Safety
    console.log('\n--- 5. Search Input Validation & Safety ---');
    const shortSearchRes = await requestHelper(server, '/api/v1/search?q=a');
    assert(
      shortSearchRes.status === 400 && shortSearchRes.body.error?.code === 'VALIDATION_FAILED',
      'Search query < 2 chars is rejected with HTTP 400 VALIDATION_FAILED'
    );

    const longSearchRes = await requestHelper(server, `/api/v1/search?q=${'a'.repeat(101)}`);
    assert(
      longSearchRes.status === 400 && longSearchRes.body.error?.code === 'VALIDATION_FAILED',
      'Search query > 100 chars is rejected with HTTP 400 VALIDATION_FAILED'
    );

    // 6. Login Brute-Force Rate Limiter Test (HTTP 429)
    console.log('\n--- 6. Login Brute-Force Rate Limiting (429) ---');
    let ratelimited = false;
    let rateLimitResponse = null;

    // Send 6 login attempts (max limit is 5 per 15 mins)
    for (let i = 1; i <= 6; i++) {
      const res = await requestHelper(server, '/api/v1/auth/login', {
        method: 'POST',
        body: { email: `test${i}@devatlas.test`, password: 'WrongPassword123!' },
      });

      if (res.status === 429) {
        ratelimited = true;
        rateLimitResponse = res;
        break;
      }
    }

    assert(ratelimited, 'Login rate limiter triggers HTTP 429 Too Many Requests on 6th attempt');
    assert(
      rateLimitResponse?.body?.error?.code === 'TOO_MANY_REQUESTS',
      'Rate limit response returns standard error code TOO_MANY_REQUESTS'
    );

    console.log(`\n--- SECURITY HARDENING VERIFICATION COMPLETE: ${passedCount}/${totalCount} TESTS PASSED ---\n`);
  } catch (err) {
    console.error('Security audit execution failed with exception:', err);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
}

runSecurityAudit();
