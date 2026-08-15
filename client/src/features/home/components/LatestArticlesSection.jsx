import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, RotateCcw, AlertCircle } from 'lucide-react';
import { ArticleCard } from '@features/articles/components/ArticleCard';
import { APP_PATHS } from '@/constants';

export function LatestArticlesSection({
  articles = [],
  isLoading = false,
  error = null,
  onRetry,
}) {
  return (
    <section className="mb-14">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
            <BookOpen size={14} />
            <span>Engineering Blog</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Latest Articles
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deep dives, tutorials, and practical engineering guides.
          </p>
        </div>

        <Link
          to={APP_PATHS.ARTICLES}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 transition-colors self-start sm:self-auto"
        >
          View All Articles
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Loading Skeleton View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 animate-pulse space-y-4"
            >
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
              <div className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
          <AlertCircle size={28} className="mx-auto text-amber-500 mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Retry Articles</span>
            </button>
          )}
        </div>
      ) : articles.length === 0 ? (
        /* Empty State */
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-500">
          No articles published yet.
        </div>
      ) : (
        /* 3-Column Articles Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.slice(0, 3).map((art) => (
            <ArticleCard key={art.id || art.slug} article={art} />
          ))}
        </div>
      )}
    </section>
  );
}

export default LatestArticlesSection;
