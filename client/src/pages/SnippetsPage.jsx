import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Code2,
  Filter,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpDown,
} from 'lucide-react';
import { snippetService, SnippetCard } from '@features/snippets';
import Container from '@components/Container';

const LANGUAGE_OPTIONS = [
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

export function SnippetsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract filters from URL query state
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSearch = searchParams.get('search') || '';
  const currentLanguage = searchParams.get('language') || '';
  const currentTag = searchParams.get('tag') || '';
  const currentSort = searchParams.get('sort') || '-publishedAt';

  // State Management
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [snippets, setSnippets] = useState([]);
  const [pagination, setPagination] = useState({ page: currentPage, limit: 9, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync search input if URL changes directly
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Fetch public snippets from backend API
  const fetchSnippets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await snippetService.getSnippets({
        page: currentPage,
        limit: 9,
        search: currentSearch,
        language: currentLanguage,
        tag: currentTag,
        sort: currentSort,
      });

      if (response?.success && response?.data) {
        setSnippets(response.data.items || []);
        setPagination({
          page: response.data.pagination?.page || 1,
          limit: response.data.pagination?.limit || 9,
          total: response.data.pagination?.total || 0,
          pages: response.data.pagination?.pages || 1,
        });
      }
    } catch (err) {
      console.error('Failed to fetch public snippets:', err);
      setError(err.response?.data?.error?.message || 'Failed to load code snippets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, currentSearch, currentLanguage, currentTag, currentSort]);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

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
        <title>Snippets | DevAtlas</title>
        <meta
          name="description"
          content="Explore reusable developer code snippets, solutions, and practical examples on DevAtlas."
        />
      </Helmet>

      <div className="py-12 bg-slate-50/50 dark:bg-slate-950/50 min-h-[calc(100vh-4rem)]">
        <Container>
          {/* Hero / Page Header */}
          <div className="max-w-3xl mb-12 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
              <Code2 size={14} />
              <span>DevAtlas Code Vault</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
              Developer Code Snippets
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Explore production-ready code snippets, reusable utility functions, syntax breakdowns, and engineering scripts.
            </p>
          </div>

          {/* Search, Filter Bar & Controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-grow max-w-xl">
              <div className="relative flex-grow">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search code snippets by title, tag..."
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

            {/* Sort Selector */}
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

          {/* Language Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1 shrink-0">
              <Filter size={13} />
              Language:
            </span>
            {LANGUAGE_OPTIONS.map((lang) => {
              const isActive = currentLanguage === lang.value;
              return (
                <button
                  key={lang.value}
                  onClick={() => updateQueryParams({ language: lang.value, page: '1' })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>

          {/* Active Filter Indicators */}
          {(currentSearch || currentLanguage || currentTag) && (
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

              {currentLanguage && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-medium">
                  Lang: {currentLanguage}
                  <button
                    onClick={() => updateQueryParams({ language: '', page: '1' })}
                    className="hover:text-emerald-900 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {currentTag && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-medium">
                  Tag: #{currentTag}
                  <button
                    onClick={() => updateQueryParams({ tag: '', page: '1' })}
                    className="hover:text-indigo-900 cursor-pointer"
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

          {/* Snippets Grid Content Section */}
          {isLoading ? (
            // Skeleton Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-72 animate-pulse flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                    <div className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-full" />
                  </div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            // Error State
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm max-w-xl mx-auto my-8">
              <AlertCircle size={44} className="mx-auto text-rose-500 mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Unable to Load Snippets</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{error}</p>
              <button
                onClick={fetchSnippets}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-colors cursor-pointer"
              >
                <RefreshCw size={14} />
                Try Again
              </button>
            </div>
          ) : snippets.length === 0 ? (
            // Empty State
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm max-w-xl mx-auto my-8">
              <Code2 size={44} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No Code Snippets Found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {currentSearch || currentLanguage || currentTag
                  ? 'No published snippets matched your filter criteria.'
                  : 'No code snippets published yet. Check back soon for useful developer code!'}
              </p>
              {(currentSearch || currentLanguage || currentTag) && (
                <button
                  onClick={handleClearFilters}
                  className="mt-6 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            // Responsive Snippet Cards Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {snippets.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!isLoading && snippets.length > 0 && pagination.pages > 1 && (
            <div className="mt-12 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6 text-sm text-slate-500 dark:text-slate-400">
              <div>
                Page <span className="font-semibold text-slate-900 dark:text-slate-100">{pagination.page}</span> of{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-100">{pagination.pages}</span> ({pagination.total} snippets)
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

export default SnippetsPage;
