import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FileJson, KeyRound, Hash, Binary, Link2, ShieldCheck, Wrench } from 'lucide-react';
import Container from '../components/Container';
import {
  ToolCard,
  JsonFormatterTool,
  JwtDecoderTool,
  UuidGeneratorTool,
} from '@/features/devtools';

export function DevToolsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTool = searchParams.get('tool');

  const handleSelectTool = (toolId) => {
    setSearchParams({ tool: toolId });
  };

  const handleBackToHub = () => {
    setSearchParams({});
  };

  // Dynamic SEO Title based on selected tool
  let pageTitle = 'Developer Tools — DevAtlas Platform';
  if (selectedTool === 'json-formatter') {
    pageTitle = 'JSON Formatter & Validator — DevAtlas Tools';
  } else if (selectedTool === 'jwt-decoder') {
    pageTitle = 'JWT Inspector & Decoder — DevAtlas Tools';
  } else if (selectedTool === 'uuid-generator') {
    pageTitle = 'UUID & Key Generator — DevAtlas Tools';
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="Browser-based developer utilities for formatting JSON, inspecting JWT tokens, generating UUIDs, and encoding text safely client-side."
        />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10">
        <Container className="flex-grow flex flex-col relative">
          {selectedTool === 'json-formatter' ? (
            /* Active Tool 1: JSON Formatter & Validator */
            <JsonFormatterTool onBackToHub={handleBackToHub} />
          ) : selectedTool === 'jwt-decoder' ? (
            /* Active Tool 2: JWT Inspector & Decoder */
            <JwtDecoderTool onBackToHub={handleBackToHub} />
          ) : selectedTool === 'uuid-generator' ? (
            /* Active Tool 3: UUID & Key Generator */
            <UuidGeneratorTool onBackToHub={handleBackToHub} />
          ) : (
            /* DevTools Hub Grid View */
            <div className="max-w-5xl mx-auto w-full">
              {/* Hub Header */}
              <div className="text-center max-w-3xl mx-auto mb-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-xs font-semibold mb-4">
                  <Wrench size={14} className="text-brand-400" />
                  <span>Developer Utility Tools</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3 text-slate-900 dark:text-slate-100">
                  Developer Tools Hub
                </h1>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Browser-based utilities for common software development tasks. Fast, lightweight, and completely private.
                </p>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <ShieldCheck size={14} />
                  <span>100% Client-Side Execution — Your data stays in your browser.</span>
                </div>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Active Tool 1: JSON Formatter & Validator */}
                <ToolCard
                  id="json-formatter"
                  title="JSON Formatter & Validator"
                  description="Format, minify, validate, and inspect JSON payloads directly in your browser with line-level error checking."
                  category="JSON Utilities"
                  icon={FileJson}
                  onClick={() => handleSelectTool('json-formatter')}
                />

                {/* Active Tool 2: JWT Inspector */}
                <ToolCard
                  id="jwt-decoder"
                  title="JWT Inspector & Decoder"
                  description="Parse JWT token headers, payloads, claims, and expiration timestamps securely without sending tokens to a server."
                  category="Security"
                  icon={KeyRound}
                  onClick={() => handleSelectTool('jwt-decoder')}
                />

                {/* Active Tool 3: UUID Generator */}
                <ToolCard
                  id="uuid-generator"
                  title="UUID & Key Generator"
                  description="Generate cryptographically secure v4 UUIDs and random alphanumeric API secret keys in bulk."
                  category="Generators"
                  icon={Hash}
                  onClick={() => handleSelectTool('uuid-generator')}
                />

                {/* Coming Soon Tool 4: Base64 Tool */}
                <ToolCard
                  id="base64-tool"
                  title="Base64 Encoder / Decoder"
                  description="Encode plain text and UTF-8 strings into Base64 or decode Base64 back into readable text."
                  category="Encoders"
                  icon={Binary}
                  isComingSoon={true}
                />

                {/* Coming Soon Tool 5: URL Encoder */}
                <ToolCard
                  id="url-encoder"
                  title="URL Encoder / Decoder"
                  description="Safely escape special URI characters for query parameters or decode URL-encoded strings."
                  category="Encoders"
                  icon={Link2}
                  isComingSoon={true}
                />
              </div>
            </div>
          )}
        </Container>
      </div>
    </>
  );
}

export default DevToolsPage;
