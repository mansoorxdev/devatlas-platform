import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  AlertOctagon,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  SlidersHorizontal,
  Tag,
} from 'lucide-react';
import { errorService, ErrorCard } from '@features/errors';
import Container from '@components/Container';

const SUPPORTED_CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'database', label: 'Database' },
  { value: 'authentication', label: 'Authentication' },
  { value: 'build-tooling', label: 'Build & Tooling' },
  { value: 'runtime-exception', label: 'Runtime Exception' },
  { value: 'api-network', label: 'API / Network' },
  { value: 'environment-config', label: 'Environment / Config' },
];

const SUPPORTED_LANGUAGES = [
  { value: '', label: 'All Languages' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'shell', label: 'Shell' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
];

export function ErrorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync URL query state
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentCategory = searchParams.get('category') || '';
  const currentLanguage = searchParams.get('language') || '';
  const currentTag = searchParams.get('tag') || '';
  const currentSort = searchParams.get('sort') || '-publishedAt';
  const currentSearch = searchParams.get('search') || '';

  // Data & State
  const [errorsList, setErrorsList] = useState([]);
  const [pagination, setPagination] = useState({ page: currentPage, limit: 9, total: 0, pages: 1 });
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [tagInput, setTagInput] = useState(currentTag);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync search & tag inputs if URL changes directly
  useEffect(() => {
    setSearchInput(currentSearch);
    setTagInput(currentTag);
  }, [currentSearch, currentTag]);

  // Helper to update URL search parameters
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

  // Fetch published error solutions from backend API
  const fetchErrors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await errorService.getErrors({
        page: currentPage,
        limit: 9,
        category: currentCategory,
        language: currentLanguage,
        tag: currentTag,
        sort: currentSort,
        search: currentSearch,
      });

      if (response?.success && response?.data) {
        setErrorsList(response.data.items || []);
        setPagination({
          page: response.data.pagination?.page || 1,
          limit: response.data.pagination?.limit || 9,
          total: response.data.pagination?.total || 0,
          pages: response.data.pagination?.pages || 1,
        });
      }
    } catch (err) {
      console.error('Failed to load public error solutions:', err);
      setError(err.response?.data?.error?.message || 'Failed to load error solutions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, currentCategory, currentLanguage, currentTag, currentSort, currentSearch]);

  useEffect(() => {
    fetchErrors();
  }, [fetchErrors]);

  // Search submission handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateQueryParams({ search: searchInput.trim(), page: '1' });
  };

  // Tag submission handler
  const handleTagSubmit = (e) => {
    e.preventDefault();
    const formatted = tagInput.trim().toLowerCase().replace(/^#/, '');
    updateQueryParams({ tag: formatted, page: '1' });
  };

  // Handle Card Tag Click
  const handleCardTagClick = (tag) => {
    updateQueryParams({ tag, page: '1' });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchInput('');
    setTagInput('');
    setSearchParams({});
  };

  return (
    <>
      <Helmet>
        <title>Error Solutions | DevAtlas</title>
        <meta
          name="description"
          content="DevAtlas provides practical solutions and verified fixes for developer errors, exceptions, build failures, and configuration issues."
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Error Solutions | DevAtlas" />
        <meta
          property="og:description"
          content="DevAtlas provides practical solutions and verified fixes for developer errors, exceptions, build failures, and configuration issues."
        />
        <meta property="og:image" content={`${(import.meta.env.VITE_CLIENT_URL || window.location.origin).replace(/\/$/, '')}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Error Solutions | DevAtlas" />
        <meta
          name="twitter:description"
          content="DevAtlas provides practical solutions and verified fixes for developer errors, exceptions, build failures, and configuration issues."
        />
        <meta name="twitter:image" content={`${(import.meta.env.VITE_CLIENT_URL || window.location.origin).replace(/\/$/, '')}/og-image.png`} />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10">
        <Container>
          {/* Public Hero Section */}
          <div className="max-w-3xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wider mb-4">
              <AlertOctagon size={14} />
              Developer Troubleshooting Directory
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Developer Error Solutions
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Find practical fixes for real-world development errors, exceptions, build failures, and configuration problems.
            </p>
          </div>

          {/* Search, Category, Language & Sort Controls Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-8 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="flex-grow max-w-xl flex items-center gap-2">
              <div className="relative flex-grow">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Paste exact raw error message or exception..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 font-medium"
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
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Category, Language & Sort Selectors */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Selector */}
              <div className="flex items-center gap-1.5">
                <Layers size={14} className="text-slate-400 hidden sm:block" />
                <select
                  value={currentCategory}
                  onChange={(e) => updateQueryParams({ category: e.target.value, page: '1' })}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {SUPPORTED_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-1.5">
                <Filter size={14} className="text-slate-400 hidden sm:block" />
                <select
                  value={currentLanguage}
                  onChange={(e) => updateQueryParams({ language: e.target.value, page: '1' })}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal size={14} className="text-slate-400 hidden sm:block" />
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
          </div>

          {/* Active Filter Indicators */}
          {(currentSearch || currentCategory || currentLanguage || currentTag) && (
            <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
              <span className="text-slate-500 font-medium">Active Filters:</span>
              {currentCategory && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-medium">
                  Category: {currentCategory}
                </span>
              )}
              {currentLanguage && (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-medium">
                  Language: {currentLanguage}
                </span>
              )}
              {currentTag && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-medium">
                  Tag: #{currentTag}
                </span>
              )}
              {currentSearch && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  Search: "{currentSearch}"
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

          {/* Loading Skeleton Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 animate-pulse space-y-4"
                >
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                  <div className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            // Error View
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg mx-auto">
              <AlertOctagon size={40} className="mx-auto text-rose-500 mb-3" />
              <h3 className="text-base font-bold">Unable to load error solutions</h3>
              <p className="text-xs text-slate-500 mt-1">{error}</p>
              <button
                onClick={fetchErrors}
                className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : errorsList.length === 0 ? (
            // Empty / No Results View
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md mx-auto">
              <AlertOctagon size={40} className="mx-auto text-slate-400 mb-3 opacity-60" />
              <h3 className="text-base font-bold">No error solutions found</h3>
              <p className="text-xs text-slate-500 mt-1">
                {currentSearch || currentCategory || currentLanguage || currentTag
                  ? 'No error solutions matched your filter criteria.'
                  : 'No error solutions published yet.'}
              </p>
              {(currentSearch || currentCategory || currentLanguage || currentTag) && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            // 3-Column Responsive Error Cards Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {errorsList.map((item) => (
                <ErrorCard key={item.id} errorSolution={item} onTagClick={handleCardTagClick} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!isLoading && errorsList.length > 0 && pagination.pages > 1 && (
            <div className="mt-10 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing Page <span className="font-bold text-slate-900 dark:text-slate-100">{pagination.page}</span> of{' '}
                <span className="font-bold text-slate-900 dark:text-slate-100">{pagination.pages}</span> ({pagination.total} published solutions)
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQueryParams({ page: String(Math.max(1, pagination.page - 1)) })}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => updateQueryParams({ page: String(Math.min(pagination.pages, pagination.page + 1)) })}
                  disabled={pagination.page >= pagination.pages}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                >
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

export default ErrorsPage;
