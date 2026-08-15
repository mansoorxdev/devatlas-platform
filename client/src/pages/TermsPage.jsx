import { Helmet } from 'react-helmet-async';
import Container from '../components/Container';
import { FileText, ShieldCheck } from 'lucide-react';

export function TermsPage() {
  return (
    <>
      <Helmet>
        <title>Terms of Use | DevAtlas</title>
        <meta
          name="description"
          content="DevAtlas Terms of Use. Guidelines, developer content licensing, platform usage, and disclaimers."
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Terms of Use | DevAtlas" />
        <meta
          property="og:description"
          content="DevAtlas Terms of Use. Guidelines, developer content licensing, platform usage, and disclaimers."
        />
        <meta property="og:image" content={`${(import.meta.env.VITE_CLIENT_URL || window.location.origin).replace(/\/$/, '')}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Terms of Use | DevAtlas" />
        <meta
          name="twitter:description"
          content="DevAtlas Terms of Use. Guidelines, developer content licensing, platform usage, and disclaimers."
        />
        <meta name="twitter:image" content={`${(import.meta.env.VITE_CLIENT_URL || window.location.origin).replace(/\/$/, '')}/og-image.png`} />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12">
        <Container className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold mb-3">
              <FileText size={14} />
              <span>Legal Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              Terms of Use
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Last Updated: August 15, 2026 • Please read these terms carefully before using DevAtlas.
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                1. Acceptable Use of the Platform
              </h2>
              <p>
                DevAtlas provides developer-focused technical articles, copyable code snippets, stack trace error resolutions, and browser-based developer utility tools. By accessing or using DevAtlas, you agree to comply with these Terms of Use.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                2. Developer Content & Snippet Licensing
              </h2>
              <p>
                Code snippets and technical solutions published on DevAtlas are provided for reference and integration into software projects. Unless specified otherwise, code snippets are provided under permissive MIT-style usage terms for practical development use.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                3. User Responsibilities & Conduct
              </h2>
              <p>
                Users agree not to misuse the platform by attempting unauthorized access to administrative portals, flooding API endpoints with malicious automated traffic, or attempting to compromise server infrastructure.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                4. Browser Utilities & Client-Side Tools
              </h2>
              <p>
                DevAtlas DevTools (including JSON Formatter, JWT Inspector, UUID Generator, Base64 Tool, and URL Encoder) execute 100% locally in your browser. DevAtlas does not process or store payload data inputted into client-side utilities on remote servers.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                5. Third-Party Links & External Resources
              </h2>
              <p>
                DevAtlas may contain references or links to third-party software documentation, repositories, or external resources. DevAtlas is not responsible for external content or third-party availability.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                6. Platform Availability & Disclaimers
              </h2>
              <p className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">
                  Disclaimer of Warranty:
                </span>
                DevAtlas is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. Developers are encouraged to test and verify code snippets in staging environments prior to production deployment.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                7. Contact & Platform Support
              </h2>
              <p>
                If you have questions regarding these Terms of Use, please contact us via our official repository at{' '}
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

export default TermsPage;
