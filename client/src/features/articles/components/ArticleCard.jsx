import { Link } from 'react-router-dom';
import { Clock, User, Calendar, ArrowRight, Tag, BookOpen } from 'lucide-react';

/**
 * ArticleCard Component for public article listing grid.
 * Displays title, summary, metadata, tags, and link to single article reader.
 */
export function ArticleCard({ article }) {
  if (!article) return null;

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date(article.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

  return (
    <article className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 rounded-2xl p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Top Header & Cover Accent */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <BookOpen size={18} />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Clock size={13} className="text-slate-400" />
            <span>{article.readTime || 1} min read</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 mb-2">
          <Link to={`/articles/${article.slug}`}>{article.title}</Link>
        </h3>

        {/* Summary Excerpt */}
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
          {article.summary}
        </p>

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {article.tags.slice(0, 4).map((tag) => (
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

      {/* Footer Meta & Read Link */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          {article.author?.slug ? (
            <Link
              to={`/authors/${article.author.slug}`}
              className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <User size={13} className="text-slate-400" />
              {article.author.name}
            </Link>
          ) : (
            <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
              <User size={13} className="text-slate-400" />
              {article.author?.name || 'DevAtlas'}
            </span>
          )}
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar size={13} className="text-slate-400" />
            {publishedDate}
          </span>
        </div>

        <Link
          to={`/articles/${article.slug}`}
          className="inline-flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 group-hover:translate-x-0.5 transition-transform"
        >
          Read
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}

export default ArticleCard;
