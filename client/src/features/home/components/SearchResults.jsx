import { Link } from 'react-router-dom';
import {
  FileText,
  Code2,
  AlertOctagon,
  XCircle,
  ArrowRight,
  RotateCcw,
  Search,
} from 'lucide-react';

export function SearchResults({
  searchResults,
  searchError,
  handleClearSearch,
  handleRetrySearch,
}) {
  if (searchError) {
    return (
      <div className="max-w-3xl mx-auto mb-10 p-6 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-center shadow-md">
        <XCircle size={36} className="mx-auto text-rose-500 mb-2" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Search Request Failed
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">{searchError}</p>
        <button
          onClick={handleRetrySearch}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
        >
          <RotateCcw size={14} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  if (!searchResults) return null;

  const { query, results, total } = searchResults;
  const articles = results?.articles || [];
  const snippets = results?.snippets || [];
  const errors = results?.errors || [];

  return (
    <div className="max-w-3xl mx-auto mb-12 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 gap-2">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
            Search Results for "{query}"
          </h2>
          <p className="text-xs text-slate-500">
            {total} {total === 1 ? 'match' : 'matches'} found across DevAtlas modules
          </p>
        </div>

        <button
          onClick={handleClearSearch}
          className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline self-start sm:self-auto cursor-pointer"
        >
          Clear Search
        </button>
      </div>

      {/* Empty Search Results State */}
      {total === 0 ? (
        <div className="py-8 text-center">
          <Search size={36} className="mx-auto text-slate-400 opacity-60 mb-2" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            No results found for "{query}"
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try searching for other technical keywords like "jwt", "mongodb", "authentication", or "react".
          </p>
          <button
            onClick={handleClearSearch}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Article Results */}
          {articles.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
                <FileText size={14} />
                <span>Articles ({articles.length})</span>
              </div>
              <div className="space-y-2">
                {articles.map((item) => (
                  <div
                    key={item.slug}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 hover:border-brand-500/40 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-500 transition-colors">
                        <Link to={`/articles/${item.slug}`}>{item.title}</Link>
                      </h4>
                      <Link
                        to={`/articles/${item.slug}`}
                        className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Read <ArrowRight size={12} />
                      </Link>
                    </div>
                    {item.summary && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {item.summary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Snippet Results */}
          {snippets.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                <Code2 size={14} />
                <span>Code Snippets ({snippets.length})</span>
              </div>
              <div className="space-y-2">
                {snippets.map((item) => (
                  <div
                    key={item.slug}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 hover:border-brand-500/40 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 uppercase">
                          {item.language}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-500 transition-colors">
                          <Link to={`/snippets/${item.slug}`}>{item.title}</Link>
                        </h4>
                      </div>
                      <Link
                        to={`/snippets/${item.slug}`}
                        className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View Code <ArrowRight size={12} />
                      </Link>
                    </div>
                    {item.summary && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {item.summary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Results */}
          {errors.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2">
                <AlertOctagon size={14} />
                <span>Error Solutions ({errors.length})</span>
              </div>
              <div className="space-y-2">
                {errors.map((item) => (
                  <div
                    key={item.slug}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 hover:border-brand-500/40 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-500 transition-colors">
                        <Link to={`/errors/${item.slug}`}>{item.title}</Link>
                      </h4>
                      <Link
                        to={`/errors/${item.slug}`}
                        className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View Fix <ArrowRight size={12} />
                      </Link>
                    </div>
                    {item.errorMessage && (
                      <p className="text-[11px] font-mono text-rose-600 dark:text-rose-400 bg-slate-950 px-2 py-1 rounded text-rose-300 line-clamp-1 mt-1">
                        $ {item.errorMessage}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchResults;
