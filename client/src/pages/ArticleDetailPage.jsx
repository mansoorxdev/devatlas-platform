import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  User,
  Calendar,
  Tag,
  Share2,
  Check,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { articleService } from '@features/articles/services/articleService.js';
import Container from '@components/Container';
import MarkdownRenderer from '@components/MarkdownRenderer';

export function ArticleDetailPage() {
  const { slug } = useParams();

  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await articleService.getArticleBySlug(slug);
        if (response?.success && response?.data?.article) {
          setArticle(response.data.article);
        } else {
          setError('Article not found.');
        }
      } catch (err) {
        console.error('Failed to load article detail:', err);
        setError(err.response?.data?.error?.message || 'The article you are looking for does not exist or is no longer available.');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const formattedDate = article?.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : article?.createdAt
    ? new Date(article.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const canonicalUrl = `${window.location.origin}/articles/${slug}`;

  return (
    <>
      <Helmet>
        <title>{article ? `${article.title} | DevAtlas` : 'Article Reader | DevAtlas'}</title>
        {article && <meta name="description" content={article.summary} />}
        {article && <link rel="canonical" href={canonicalUrl} />}
        {article && <meta property="og:title" content={`${article.title} | DevAtlas`} />}
        {article && <meta property="og:description" content={article.summary} />}
        {article && <meta property="og:type" content="article" />}
        {article && <meta property="og:url" content={canonicalUrl} />}
        {article && <meta property="og:image" content={`${(import.meta.env.VITE_CLIENT_URL || window.location.origin).replace(/\/$/, '')}/og-image.png`} />}
        {article && <meta name="twitter:card" content="summary_large_image" />}
        {article && <meta name="twitter:title" content={`${article.title} | DevAtlas`} />}
        {article && <meta name="twitter:description" content={article.summary} />}
        {article && <meta name="twitter:image" content={`${(import.meta.env.VITE_CLIENT_URL || window.location.origin).replace(/\/$/, '')}/og-image.png`} />}
      </Helmet>

      <div className="py-12 bg-slate-50/50 dark:bg-slate-950/50 min-h-[calc(100vh-4rem)]">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <Link
                to="/articles"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-xs transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Articles
              </Link>

              {article && (
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {copiedShare ? (
                    <>
                      <Check size={14} className="text-emerald-500" />
                      <span className="text-emerald-500">Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={14} />
                      <span>Share Article</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Loading Skeleton View */}
            {isLoading ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-sm space-y-6 animate-pulse">
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
                <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
                <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
                  <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
                  <div className="h-4 w-4/6 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
                </div>
              </div>
            ) : error ? (
              // 404 / Error View
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
                <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Article Not Found</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">{error}</p>
                <Link
                  to="/articles"
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Explore Published Articles
                </Link>
              </div>
            ) : (
              // Article Reader View
              <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-12 shadow-sm overflow-hidden">
                {/* Header Meta */}
                <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
                  {/* Category & Read Time */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-xs font-semibold">
                      <BookOpen size={13} />
                      Article
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <Clock size={13} className="text-slate-400" />
                      {article.readTime || 1} min read
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-tight mb-4">
                    {article.title}
                  </h1>

                  {/* Summary */}
                  <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-normal">
                    {article.summary}
                  </p>

                  {/* Author & Published Info */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        {article.author?.name ? article.author.name[0].toUpperCase() : 'M'}
                      </div>
                      <div>
                        {article.author?.slug ? (
                          <Link
                            to={`/authors/${article.author.slug}`}
                            className="font-semibold text-slate-900 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-sm"
                          >
                            {article.author.name}
                          </Link>
                        ) : (
                          <div className="font-semibold text-slate-900 dark:text-slate-200 text-sm">
                            {article.author?.name || 'DevAtlas Team'}
                          </div>
                        )}
                        <div className="text-[11px] text-slate-400">Published on {formattedDate}</div>
                      </div>
                    </div>

                    {/* Tag Pills */}
                    {article.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {article.tags.map((tag) => (
                          <Link
                            key={tag}
                            to={`/articles?tag=${encodeURIComponent(tag)}`}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                          >
                            <Tag size={11} className="opacity-60" />
                            #{tag}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </header>

                {/* Markdown Content Reader Body */}
                <div className="mt-8">
                  <MarkdownRenderer content={article.content} />
                </div>

                {/* Author Byline Profile Card */}
                {article.author && (
                  <div className="mt-12 p-6 bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      {article.author.avatar ? (
                        <img
                          src={article.author.avatar}
                          alt={article.author.name}
                          className="w-14 h-14 rounded-full object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb';
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-md">
                          {article.author.name ? article.author.name[0].toUpperCase() : 'A'}
                        </div>
                      )}

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                              Written by {article.author.name || 'DevAtlas Contributor'}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Technical Writer & Developer</p>
                          </div>
                        </div>

                        {article.author.bio && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                            {article.author.bio}
                          </p>
                        )}

                        {article.author.expertise?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {article.author.expertise.map((exp) => (
                              <span
                                key={exp}
                                className="px-2.5 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                              >
                                {exp}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Article Footer */}
                <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Link
                    to="/articles"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Back to All Articles
                  </Link>

                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-colors cursor-pointer"
                  >
                    <Share2 size={16} />
                    Share this Guide
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

export default ArticleDetailPage;
