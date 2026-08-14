import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Copy,
  Check,
  ArrowRight,
  User,
  Calendar,
  AlertOctagon,
  FileCode,
  Layers,
  CheckCircle,
} from 'lucide-react';

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

export function ErrorCard({ errorSolution }) {
  const [copied, setCopied] = useState(false);

  if (!errorSolution) return null;

  const {
    slug,
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
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  // Handle Copy Fix Code
  const handleCopyCodeFix = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!codeFix) return;

    try {
      navigator.clipboard.writeText(codeFix);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code fix:', err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-xl hover:border-brand-500/40 dark:hover:border-brand-500/40 transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-mono text-[10px] font-bold uppercase tracking-wider">
              {categoryDisplay}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold uppercase tracking-wider">
              {languageDisplay}
            </span>
          </div>

          {/* Copy Fix Button (If Code Fix Available) */}
          {codeFix && (
            <button
              onClick={handleCopyCodeFix}
              className={`inline-flex items-center gap-1.2 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border ${
                copied
                  ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Copy Code Fix"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy Fix</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Error Title */}
        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 mb-3 leading-snug">
          <Link to={`/errors/${slug}`}>{title}</Link>
        </h3>

        {/* Raw Error Message Exception Box */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-rose-300 line-clamp-2 leading-relaxed overflow-hidden">
            <span className="text-rose-500 font-bold select-none">$ </span>
            {errorMessage}
          </div>
        )}

        {/* Short Cause & Solution Preview */}
        <div className="space-y-2 mb-4 text-xs text-slate-600 dark:text-slate-400">
          {cause && (
            <p className="line-clamp-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">Cause: </span>
              {cause}
            </p>
          )}
          {solution && (
            <p className="line-clamp-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">Fix: </span>
              {solution}
            </p>
          )}
        </div>

        {/* Code Fix Preview Box (If Available) */}
        {codeFix && (
          <div className="mb-4 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-200 overflow-hidden line-clamp-3 leading-relaxed">
            <pre className="whitespace-pre overflow-x-auto">{codeFix}</pre>
          </div>
        )}

        {/* Tag Pills */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="text-[11px] text-slate-400 font-medium self-center">
                +{tags.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Metadata & View Solution Link */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {author?.name || 'DevAtlas Admin'}
          </span>
          {publishedDateFormatted && (
            <>
              <span>•</span>
              <span>{publishedDateFormatted}</span>
            </>
          )}
        </div>

        <Link
          to={`/errors/${slug}`}
          className="inline-flex items-center gap-1 font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 text-xs transition-colors group-hover:translate-x-0.5"
        >
          View Solution
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

export default ErrorCard;
