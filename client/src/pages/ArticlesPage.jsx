import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  BookOpen,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpDown,
} from 'lucide-react';
import { articleService, ArticleCard } from '@features/articles';
import Container from '@components/Container';

export function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract filters from URL query state
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSearch = searchParams.get('search') || '';
  const currentTag = searchParams.get('tag') || '';
  const currentSort = searchParams.get('sort') || '-publishedAt';

  // Input states
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({ page: currentPage, limit: 9, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync search input if URL changes directly
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Fetch articles from backend API
  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await articleService.getArticles({
        page: currentPage,
        limit: 9,
        search: currentSearch,
        tag: currentTag,
        sort: currentSort,
      });

      if (response?.success && response?.data) {
        setArticles(response.data.items || []);
        setPagination({
          page: response.data.pagination?.page || 1,
          limit: response.data.pagination?.limit || 9,
          total: response.data.pagination?.total || 0,
          pages: response.data.pagination?.pages || 1,
        });
      }
    } catch (err) {
      console.error('Failed to fetch public articles:', err);
      setError(err.response?.data?.error?.message || 'Failed to load articles. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, currentSearch, currentTag, currentSort]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Update URL helper
  const updateQueryParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateQueryParams({ search: searchInput.trim(), page: '1' });
  };

  // Handle Clear All Filters
  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <>
      <Helmet>
        <title>Articles | DevAtlas</title>
        <meta
          name="description"
          content="Explore practical developer articles, tutorials, and engineering insights on DevAtlas."
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Articles | DevAtlas" />
        <meta
          property="og:description"
          content="Explore practical developer articles, tutorials, and engineering insights on DevAtlas."
        />
        <meta property="og:image" content={`${(import.meta.env.VITE_CLIENT_URL || window.location.origin).replace(/\/$/, '')}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Articles | DevAtlas" />
        <meta
          name="twitter:description"
          content="Explore practical developer articles, tutorials, and engineering insights on DevAtlas."
        />
        <meta name="twitter:image" content={`${(import.meta.env.VITE_CLIENT_URL || window.location.origin).replace(/\/$/, '')}/og-image.png`} />
      </Helmet>

      <div className="py-12 bg-slate-50/50 dark:bg-slate-950/50 min-h-[calc(100vh-4rem)]">
        <Container>
          {/* Hero / Page Header */}
          <div className="max-w-3xl mb-12 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/80 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-4">
              <BookOpen size={14} />
              <span>DevAtlas Knowledge Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
              Articles & Technical Tutorials
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Explore production-grade guides, system architecture breakdowns, performance optimizations, and developer tutorials.
            </p>
          </div>

          {/* Search, Tag & Sort Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-grow max-w-xl">
              <div className="relative flex-grow">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles by title, topic..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      updateQueryParams({ search: '', page: '1' });
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <ArrowUpDown size={14} />
                <span className="hidden sm:inline">Sort:</span>
              </div>
              <select
                value={currentSort}
                onChange={(e) => updateQueryParams({ sort: e.target.value, page: '1' })}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="-publishedAt">Newest First</option>
                <option value="publishedAt">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Active Filter Indicators */}
          {(currentSearch || currentTag) && (
            <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Active Filters:</span>

              {currentSearch && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-medium">
                  Search: "{currentSearch}"
                  <button
                    onClick={() => updateQueryParams({ search: '', page: '1' })}
                    className="hover:text-brand-900 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {currentTag && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-medium">
                  Tag: #{currentTag}
                  <button
                    onClick={() => updateQueryParams({ tag: '', page: '1' })}
                    className="hover:text-brand-900 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              <button
                onClick={handleClearFilters}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold underline underline-offset-2 ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Articles Content Section */}
          {isLoading ? (
            // Skeleton Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-64 animate-pulse flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-6 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                    <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded-md w-full" />
                    <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded-md w-2/3" />
                  </div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            // Error State
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm max-w-xl mx-auto my-8">
              <AlertCircle size={44} className="mx-auto text-rose-500 mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Unable to Load Articles</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{error}</p>
              <button
                onClick={fetchArticles}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-colors cursor-pointer"
              >
                <RefreshCw size={14} />
                Try Again
              </button>
            </div>
          ) : articles.length === 0 ? (
            // Empty State
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm max-w-xl mx-auto my-8">
              <BookOpen size={44} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No Articles Found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {currentSearch || currentTag
                  ? 'No published articles matched your search filters.'
                  : 'No articles published yet. Check back soon for new developer content!'}
              </p>
              {(currentSearch || currentTag) && (
                <button
                  onClick={handleClearFilters}
                  className="mt-6 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            // Responsive Article Cards Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!isLoading && articles.length > 0 && pagination.pages > 1 && (
            <div className="mt-12 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6 text-sm text-slate-500 dark:text-slate-400">
              <div>
                Page <span className="font-semibold text-slate-900 dark:text-slate-100">{pagination.page}</span> of{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-100">{pagination.pages}</span> ({pagination.total} articles)
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQueryParams({ page: String(Math.max(1, pagination.page - 1)) })}
                  disabled={pagination.page <= 1}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <button
                  onClick={() => updateQueryParams({ page: String(Math.min(pagination.pages, pagination.page + 1)) })}
                  disabled={pagination.page >= pagination.pages}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </Container>
      </div>
    </>
  );
}

export default ArticlesPage;
