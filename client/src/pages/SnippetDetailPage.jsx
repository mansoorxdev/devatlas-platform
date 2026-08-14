import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Calendar,
  Tag,
  Copy,
  Check,
  AlertCircle,
  Code2,
  Share2,
  FileCode,
  RefreshCw,
} from 'lucide-react';
import { snippetService } from '@features/snippets';
import Container from '@components/Container';

export function SnippetDetailPage() {
  const { slug } = useParams();

  const [snippet, setSnippet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    const fetchSnippet = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await snippetService.getSnippetBySlug(slug);
        if (response?.success && response?.data?.snippet) {
          setSnippet(response.data.snippet);
        } else {
          setError('Snippet not found.');
        }
      } catch (err) {
        console.error('Failed to load snippet detail:', err);
        setError(err.response?.data?.error?.message || 'The code snippet you are looking for does not exist or is no longer available.');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchSnippet();
    }
  }, [slug]);

  // Handle Copy Raw Code
  const handleCopyCode = () => {
    if (!snippet?.code) return;
    try {
      navigator.clipboard.writeText(snippet.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (err) {
      console.error('Failed to copy snippet code:', err);
    }
  };

  // Handle Share Link
  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  const formattedDate = snippet?.publishedAt
    ? new Date(snippet.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : snippet?.createdAt
    ? new Date(snippet.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const canonicalUrl = `${window.location.origin}/snippets/${slug}`;
  const codeLines = snippet?.code ? snippet.code.split('\n') : [];

  return (
    <>
      <Helmet>
        <title>{snippet ? `${snippet.title} | DevAtlas` : 'Snippet Reader | DevAtlas'}</title>
        {snippet && <meta name="description" content={snippet.summary || snippet.title} />}
        {snippet && <link rel="canonical" href={canonicalUrl} />}
        {snippet && <meta property="og:title" content={`${snippet.title} | DevAtlas`} />}
        {snippet && <meta property="og:description" content={snippet.summary || snippet.title} />}
        {snippet && <meta property="og:type" content="article" />}
        {snippet && <meta property="og:url" content={canonicalUrl} />}
        {snippet && <meta name="twitter:card" content="summary_large_image" />}
        {snippet && <meta name="twitter:title" content={`${snippet.title} | DevAtlas`} />}
        {snippet && <meta name="twitter:description" content={snippet.summary || snippet.title} />}
      </Helmet>

      <div className="py-12 bg-slate-50/50 dark:bg-slate-950/50 min-h-[calc(100vh-4rem)]">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Top Bar Navigation */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <Link
                to="/snippets"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-xs transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Snippets
              </Link>

              {snippet && (
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  {copiedShare ? (
                    <>
                      <Check size={14} className="text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={14} />
                      <span>Share</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Skeleton Loading State */}
            {isLoading ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-sm animate-pulse space-y-6">
                <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded-md w-1/2" />
                <div className="h-96 bg-slate-900 rounded-2xl w-full" />
              </div>
            ) : error ? (
              // 404 / Error View
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
                <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Snippet Not Found</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                  {error}
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <Link
                    to="/snippets"
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-500/20 transition-colors"
                  >
                    Back to Snippets
                  </Link>
                </div>
              </div>
            ) : (
              // Snippet Reader Article Block
              <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm">
                {/* Header Information */}
                <header className="border-b border-slate-100 dark:border-slate-800 pb-6 mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold uppercase tracking-wider">
                      <FileCode size={14} />
                      {snippet.language}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {codeLines.length} {codeLines.length === 1 ? 'line' : 'lines'}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-snug mb-3">
                    {snippet.title}
                  </h1>

                  {snippet.summary && (
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                      {snippet.summary}
                    </p>
                  )}

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 dark:text-slate-400 pt-2 font-medium">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">
                        {snippet.author?.name || 'DevAtlas Team'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{formattedDate}</span>
                    </div>

                    {/* Tag Pills */}
                    {snippet.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {snippet.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium"
                          >
                            <Tag size={11} className="opacity-60" />
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </header>

                {/* Primary Code Reader Container */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl font-mono text-xs sm:text-sm text-slate-100 my-4">
                  {/* Code Container Header */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                      <span className="ml-2 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                        {snippet.language}
                      </span>
                    </div>

                    <button
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                      title="Copy exact source code"
                    >
                      {copiedCode ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Preformatted Code Rendering Grid */}
                  <div className="p-4 overflow-x-auto leading-relaxed flex">
                    {/* Visual Line Numbers */}
                    <div className="select-none text-slate-600 text-right pr-4 border-r border-slate-800/80 font-mono text-xs leading-relaxed hidden sm:block">
                      {codeLines.map((_, i) => (
                        <div key={i}>{i + 1}</div>
                      ))}
                    </div>

                    {/* Preformatted Plain Text Source Code */}
                    <pre className="pl-4 pr-2 font-mono text-slate-100 text-xs sm:text-sm leading-relaxed overflow-x-auto w-full">
                      <code>{snippet.code}</code>
                    </pre>
                  </div>
                </div>

                {/* Footer Navigation */}
                <footer className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Link
                    to="/snippets"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Back to All Snippets
                  </Link>

                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                    {copiedCode ? 'Copied to Clipboard' : 'Copy Snippet Code'}
                  </button>
                </footer>
              </article>
            )}
          </div>
        </Container>
      </div>
    </>
  );
}

export default SnippetDetailPage;
