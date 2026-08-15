import { Helmet } from 'react-helmet-async';
import Container from '../components/Container';
import { Lock, ShieldCheck } from 'lucide-react';

export function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | DevAtlas</title>
        <meta
          name="description"
          content="DevAtlas Privacy Policy. How authentication cookies, browser storage, and technical data are handled."
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Privacy Policy | DevAtlas" />
        <meta
          property="og:description"
          content="DevAtlas Privacy Policy. How authentication cookies, browser storage, and technical data are handled."
        />
        <meta property="og:image" content={`${(import.meta.env.VITE_CLIENT_URL || window.location.origin).replace(/\/$/, '')}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Privacy Policy | DevAtlas" />
        <meta
          name="twitter:description"
          content="DevAtlas Privacy Policy. How authentication cookies, browser storage, and technical data are handled."
        />
        <meta name="twitter:image" content={`${(import.meta.env.VITE_CLIENT_URL || window.location.origin).replace(/\/$/, '')}/og-image.png`} />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12">
        <Container className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 text-xs font-semibold mb-3 border border-emerald-200 dark:border-emerald-800">
              <Lock size={14} />
              <span>Data Protection</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Last Updated: August 15, 2026 • Learn how DevAtlas protects user privacy and handles data.
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                1. Privacy Overview
              </h2>
              <p>
                DevAtlas is committed to protecting developer privacy. Public features of DevAtlas (including reading technical articles, browsing code snippets, searching error solutions, and using browser utility tools) do not require registration or personal identity submission.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                2. Information We Collect
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-slate-900 dark:text-slate-100">Public Users:</strong> No personal profile data or account registration is collected for public browsing.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-slate-100">Admin Portal Users:</strong> Authenticated administrators provide email credentials and password hashes stored securely in MongoDB for portal access.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-slate-100">Server Logs:</strong> Standard HTTP request logs (IP address, user agent, request URL, status code) are maintained temporarily for system diagnostics and security monitoring.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                3. Cookies and Local Storage
              </h2>
              <p>
                DevAtlas uses secure, HttpOnly JWT cookies exclusively for administrative authentication. We use browser local storage solely to persist your UI dark/light theme preference (`devatlas_theme`). We do not use cross-site tracking cookies.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                4. Client-Side DevTools Privacy Guarantee
              </h2>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start gap-3">
                <ShieldCheck size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Zero Server Storage for Client Tools
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Input payloads entered into JSON Formatter, JWT Inspector, UUID Generator, Base64 Tool, or URL Encoder are processed 100% locally in your browser. Inputs are never logged, stored, or transmitted to remote servers.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                5. Third-Party Services
              </h2>
              <p>
                DevAtlas does not sell, rent, or trade user data to third-party advertising networks.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                6. Policy Contact
              </h2>
              <p>
                For privacy inquiries or technical questions regarding this policy, please reach out via our GitHub repository at{' '}
                <a
                  href="https://github.com/mansoorxdev/devatlas-platform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
                >
                  github.com/mansoorxdev/devatlas-platform
                </a>.
              </p>
            </section>
          </div>
        </Container>
      </div>
    </>
  );
}

export default PrivacyPage;
