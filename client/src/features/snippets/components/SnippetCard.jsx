import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, Calendar, ArrowRight, Tag, Code2, Copy, Check, FileCode } from 'lucide-react';

/**
 * SnippetCard Component for public snippet listing grid.
 * Displays title, summary, language badge, code preview with Copy button, metadata, tags, and link to single snippet reader.
 */
export function SnippetCard({ snippet }) {
  const [copied, setCopied] = useState(false);

  if (!snippet) return null;

  const publishedDate = snippet.publishedAt
    ? new Date(snippet.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date(snippet.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

  const handleCopyCode = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!snippet.code) return;

    try {
      navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy code snippet:', err);
    }
  };

  // Preview code lines (max 5 lines for card preview)
  const codeLines = snippet.code ? snippet.code.trim().split('\n').slice(0, 5).join('\n') : '';

  return (
    <article className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 rounded-2xl p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Top Header & Language Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-bold uppercase tracking-wider">
            <FileCode size={13} />
            {snippet.language}
          </span>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>{snippet.code ? snippet.code.split('\n').length : 1} lines</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 mb-2">
          <Link to={`/snippets/${snippet.slug}`}>{snippet.title}</Link>
        </h3>

        {/* Summary Excerpt */}
        {snippet.summary && (
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {snippet.summary}
          </p>
        )}

        {/* Code Preview Box */}
        <div className="relative group/code my-3 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner font-mono text-xs text-slate-200">
          {/* Top Bar with Copy Button */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/80 border-b border-slate-800/80 text-[11px] text-slate-400">
            <span className="uppercase tracking-wider font-semibold font-mono text-[10px]">
              {snippet.language}
            </span>
            <button
              onClick={handleCopyCode}
              type="button"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
              title="Copy Code Snippet"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Preformatted Code Content */}
          <pre className="p-3.5 overflow-x-auto max-h-36 leading-relaxed font-mono text-[11.5px] text-slate-200">
            <code>{codeLines}</code>
          </pre>
        </div>

        {/* Tags */}
        {snippet.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 my-3">
            {snippet.tags.slice(0, 4).map((tag) => (
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

      {/* Footer Meta & View Link */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
            <User size={13} className="text-slate-400" />
            {snippet.author?.name || 'DevAtlas'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar size={13} className="text-slate-400" />
            {publishedDate}
          </span>
        </div>

        <Link
          to={`/snippets/${snippet.slug}`}
          className="inline-flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 group-hover:translate-x-0.5 transition-transform"
        >
          View Snippet
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}

export default SnippetCard;
