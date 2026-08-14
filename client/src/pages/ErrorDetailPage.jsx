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
  AlertOctagon,
  Share2,
  FileCode,
  HelpCircle,
  CheckSquare,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { errorService } from '@features/errors';
import { APP_PATHS } from '@/constants';
import Container from '@components/Container';

const CATEGORY_LABELS = {
  database: 'Database',
  authentication: 'Authentication',
  'build-tooling': 'Build & Tooling',
  'runtime-exception': 'Runtime Exception',
  'api-network': 'API / Network',
  'environment-config': 'Environment / Config',
};

const LANGUAGE_LABELS = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  go: 'Go',
  rust: 'Rust',
  html: 'HTML',
  css: 'CSS',
  sql: 'SQL',
  shell: 'Shell',
  json: 'JSON',
  yaml: 'YAML',
};

export function ErrorDetailPage() {
  const { slug } = useParams();

  const [errorSolution, setErrorSolution] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Copy Feedback States
  const [copiedError, setCopiedError] = useState(false);
  const [copiedCodeFix, setCopiedCodeFix] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    const fetchErrorSolution = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await errorService.getErrorBySlug(slug);
        if (response?.success && response?.data?.errorSolution) {
          setErrorSolution(response.data.errorSolution);
        } else {
          setError('Error Solution Not Found');
        }
      } catch (err) {
        console.error('Failed to load error solution detail:', err);
        setError(
          err.response?.data?.error?.message ||
            'The error solution you are looking for does not exist, is in draft, or has been removed.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchErrorSolution();
    }
  }, [slug]);

  // Copy Raw Error Exception Message
  const handleCopyErrorMessage = () => {
    if (!errorSolution?.errorMessage) return;
    try {
      navigator.clipboard.writeText(errorSolution.errorMessage);
      setCopiedError(true);
      setTimeout(() => setCopiedError(false), 2000);
    } catch (err) {
      console.error('Failed to copy error message:', err);
    }
  };

  // Copy Code Fix Example
  const handleCopyCodeFix = () => {
    if (!errorSolution?.codeFix) return;
    try {
      navigator.clipboard.writeText(errorSolution.codeFix);
      setCopiedCodeFix(true);
      setTimeout(() => setCopiedCodeFix(false), 2000);
    } catch (err) {
      console.error('Failed to copy code fix:', err);
    }
  };

  // Share Page Public URL
  const handleShareSolution = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch (err) {
      console.error('Failed to share URL:', err);
    }
  };

  // Render Skeleton Reader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
        <Container className="max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </Container>
      </div>
    );
  }

  // Render 404 Not Found State
  if (error || !errorSolution) {
    return (
      <>
        <Helmet>
          <title>Error Solution Not Found - DevAtlas</title>
        </Helmet>

        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl">
            <AlertOctagon size={48} className="mx-auto text-rose-500 mb-4" />
            <h1 className="text-xl font-bold mb-2">Error Solution Not Found</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {error || 'The requested error solution guide could not be found or is not published yet.'}
            </p>
            <Link
              to={APP_PATHS.ERRORS}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Error Solutions
            </Link>
          </div>
        </div>
      </>
    );
  }

  const {
    title,
    errorMessage,
    category,
    language,
    cause,
    solution,
    codeFix,
    tags = [],
    author,
    publishedAt,
  } = errorSolution;

  const categoryDisplay = CATEGORY_LABELS[category] || category?.toUpperCase() || 'GENERAL';
  const languageDisplay = LANGUAGE_LABELS[language] || language?.toUpperCase() || 'CODE';

  const publishedDateFormatted = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  // Code Fix Line Numbers Generation
  const codeLines = codeFix ? codeFix.split('\n') : [];

  return (
    <>
      <Helmet>
        <title>{title} - DevAtlas Error Solutions</title>
        <meta
          name="description"
          content={`Learn how to fix ${title}: ${cause ? cause.substring(0, 150) : 'Step-by-step developer error resolution guide.'}`}
        />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10">
        <Container className="max-w-4xl">
          {/* Top Bar: Back & Share Links */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to={APP_PATHS.ERRORS}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Error Solutions
            </Link>

            <button
              onClick={handleShareSolution}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              {copiedShare ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
              <span>{copiedShare ? 'URL Copied!' : 'Share Solution'}</span>
            </button>
          </div>

          {/* Header Metadata Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs mb-8">
            {/* Category & Language Badges */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-mono text-xs font-bold uppercase tracking-wider">
                {categoryDisplay}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold uppercase tracking-wider">
                {languageDisplay}
              </span>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-4 leading-tight">
              {title}
            </h1>

            {/* Author & Date Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <User size={14} className="text-brand-500" />
                <span>{author?.name || 'DevAtlas Team'}</span>
              </div>

              {publishedDateFormatted && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>{publishedDateFormatted}</span>
                </div>
              )}
            </div>

            {/* Tag Pills */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/errors?tag=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-300 text-xs font-medium transition-colors"
                  >
                    <Tag size={12} />
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 1: Raw Error / Exception Message Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs mb-8">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertOctagon size={18} className="text-rose-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Raw Error / Exception
                </h2>
              </div>

              <button
                onClick={handleCopyErrorMessage}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  copiedError
                    ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {copiedError ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copiedError ? 'Error Copied!' : 'Copy Error'}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs sm:text-sm text-rose-300 leading-relaxed overflow-x-auto">
              <pre className="whitespace-pre-wrap">{errorMessage}</pre>
            </div>
          </div>

          {/* SECTION 2: Why This Happens (Cause) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs mb-8">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle size={18} className="text-amber-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Why This Happens
              </h2>
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
              {cause}
            </div>
          </div>

          {/* SECTION 3: How to Fix It (Solution Walkthrough) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs mb-8">
            <div className="flex items-center gap-2 mb-4">
              <CheckSquare size={18} className="text-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                How to Fix It
              </h2>
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
              {solution}
            </div>
          </div>

          {/* SECTION 4: Code Fix Example (If Available) */}
          {codeFix && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs mb-8">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <FileCode size={18} className="text-indigo-500" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Code Fix Example
                  </h2>
                </div>

                <button
                  onClick={handleCopyCodeFix}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    copiedCodeFix
                      ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {copiedCodeFix ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span>{copiedCodeFix ? 'Fix Copied!' : 'Copy Code Fix'}</span>
                </button>
              </div>

              {/* Code Fix Block with Visual Line Numbers */}
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs sm:text-sm text-slate-100 shadow-inner p-4 overflow-x-auto">
                <div className="flex">
                  {/* Visual Line Numbers Sidebar */}
                  <div className="select-none text-slate-600 text-right pr-4 border-r border-slate-800 font-mono">
                    {codeLines.map((_, idx) => (
                      <div key={idx}>{idx + 1}</div>
                    ))}
                  </div>

                  {/* Clean Code Content */}
                  <pre className="pl-4 leading-relaxed font-mono whitespace-pre flex-grow text-slate-100">
                    <code>{codeFix}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}
        </Container>
      </div>
    </>
  );
}

export default ErrorDetailPage;
