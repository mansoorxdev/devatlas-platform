import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Container from '../components/Container';
import ArticleCard from '../features/articles/components/ArticleCard.jsx';
import userService from '../services/userService';
import {
  User,
  BookOpen,
  Tag,
  Globe,
  ArrowLeft,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const GithubIcon = ({ size = 15, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const TwitterIcon = ({ size = 15, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export function AuthorProfilePage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [author, setAuthor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuthorData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await userService.getPublicAuthorProfile(slug, {
          page: currentPage,
          limit: 9,
        });

        if (response.success && response.data) {
          setAuthor(response.data.author);
          setArticles(response.data.articles || []);
          setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 });
        }
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Author profile not found.');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchAuthorData();
    }
  }, [slug, currentPage]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const canonicalUrl = `${window.location.origin}/authors/${slug}`;

  return (
    <>
      <Helmet>
        <title>{author ? `${author.name} — Technical Author | DevAtlas` : 'Author Profile | DevAtlas'}</title>
        {author && <meta name="description" content={author.bio || `Read technical articles written by ${author.name} on DevAtlas.`} />}
        {author && <link rel="canonical" href={canonicalUrl} />}
        {author && <meta property="og:title" content={`${author.name} — Technical Author | DevAtlas`} />}
        {author && <meta property="og:description" content={author.bio || `Read technical articles by ${author.name}.`} />}
        {author && <meta property="og:url" content={canonicalUrl} />}
        {author && <meta name="twitter:card" content="summary" />}
        {author && <meta name="twitter:title" content={`${author.name} | DevAtlas`} />}
        {author && <meta name="twitter:description" content={author.bio || `Read technical articles by ${author.name}.`} />}
      </Helmet>

      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 py-12">
        <Container>
          <div className="max-w-5xl mx-auto">
            {/* Top Nav Back */}
            <div className="mb-8">
              <Link
                to="/articles"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-xs transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Explore All Articles</span>
              </Link>
            </div>

            {isLoading ? (
              /* Loading Skeleton */
              <div className="space-y-8 animate-pulse">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="space-y-2">
                      <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
                      <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
                    </div>
                  </div>
                  <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
                </div>
              </div>
            ) : error ? (
              /* 404 / Error State */
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
                <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Author Not Found</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">{error}</p>
                <Link
                  to="/articles"
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Browse Technical Articles</span>
                </Link>
              </div>
            ) : (
              /* Author Profile & Articles View */
              <div className="space-y-10">
                {/* Author Hero Header Card */}
                <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
                    <Sparkles size={160} className="text-brand-500" />
                  </div>

                  <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
                    {/* Avatar */}
                    {author.avatar ? (
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-brand-500/20 shadow-md shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20">
                        {author.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Author Meta Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                            {author.name}
                          </h1>
                          <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                            Technical Contributor & Writer
                          </p>
                        </div>

                        {/* Article Count Badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold">
                          <BookOpen size={13} />
                          <span>{pagination.total} Published {pagination.total === 1 ? 'Article' : 'Articles'}</span>
                        </div>
                      </div>

                      {/* Bio */}
                      {author.bio && (
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                          {author.bio}
                        </p>
                      )}

                      {/* Expertise Badges */}
                      {author.expertise?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {author.expertise.map((exp) => (
                            <span
                              key={exp}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                            >
                              <Tag size={11} className="text-brand-500" />
                              <span>{exp}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Social Links */}
                      {(author.socialLinks?.github || author.socialLinks?.twitter || author.socialLinks?.website) && (
                        <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-slate-500 dark:text-slate-400">
                          {author.socialLinks.github && (
                            <a
                              href={author.socialLinks.github}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors inline-flex items-center gap-1.5 text-xs font-medium"
                            >
                              <GithubIcon size={14} />
                              <span>GitHub</span>
                            </a>
                          )}
                          {author.socialLinks.twitter && (
                            <a
                              href={author.socialLinks.twitter}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-sky-500 transition-colors inline-flex items-center gap-1.5 text-xs font-medium"
                            >
                              <TwitterIcon size={14} />
                              <span>Twitter</span>
                            </a>
                          )}
                          {author.socialLinks.website && (
                            <a
                              href={author.socialLinks.website}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-brand-500 transition-colors inline-flex items-center gap-1.5 text-xs font-medium"
                            >
                              <Globe size={14} />
                              <span>Website</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </header>

                {/* Published Articles Grid Section */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                      Articles by {author.name}
                    </h2>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Showing {articles.length} of {pagination.total} articles
                    </span>
                  </div>

                  {articles.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
                      <BookOpen size={36} className="mx-auto text-slate-400 mb-3" />
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Published Articles Yet</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                        This author has not published any technical articles yet. Check back soon!
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((art) => (
                          <ArticleCard key={art.id || art._id} article={art} />
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      {pagination.pages > 1 && (
                        <div className="flex justify-center items-center gap-2 pt-6">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
                          >
                            <ChevronLeft size={16} />
                          </button>

                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                            Page {currentPage} of {pagination.pages}
                          </span>

                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === pagination.pages}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </section>
              </div>
            )}
          </div>
        </Container>
      </div>
    </>
  );
}

export default AuthorProfilePage;
