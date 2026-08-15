import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { homeService } from '@/features/home';
import Container from '../components/Container';
import { APP_PATHS } from '@/constants';

export function HomePage() {
  // --- Homepage Feeds State ---
  const [latestArticles, setLatestArticles] = useState([]);
  const [latestSnippets, setLatestSnippets] = useState([]);
  const [latestErrors, setLatestErrors] = useState([]);

  // --- Independent Feed Loading States ---
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [isLoadingSnippets, setIsLoadingSnippets] = useState(true);
  const [isLoadingErrors, setIsLoadingErrors] = useState(true);

  // --- Independent Feed Error States ---
  const [articlesError, setArticlesError] = useState(null);
  const [snippetsError, setSnippetsError] = useState(null);
  const [errorsError, setErrorsError] = useState(null);

  // --- Global Search State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Initial load of latest published feeds in parallel
  const fetchHomepageFeeds = useCallback(async () => {
    setIsLoadingArticles(true);
    setIsLoadingSnippets(true);
    setIsLoadingErrors(true);

    setArticlesError(null);
    setSnippetsError(null);
    setErrorsError(null);

    // Parallel Settled Requests so one failing feed does not crash or block others
    const results = await Promise.allSettled([
      homeService.getLatestArticles(),
      homeService.getLatestSnippets(),
      homeService.getLatestErrors(),
    ]);

    // Articles feed result
    if (results[0].status === 'fulfilled' && results[0].value?.success) {
      setLatestArticles(results[0].value.data?.items || []);
    } else {
      setArticlesError('Unable to load latest articles.');
    }
    setIsLoadingArticles(false);

    // Snippets feed result
    if (results[1].status === 'fulfilled' && results[1].value?.success) {
      setLatestSnippets(results[1].value.data?.items || []);
    } else {
      setSnippetsError('Unable to load latest code snippets.');
    }
    setIsLoadingSnippets(false);

    // Errors feed result
    if (results[2].status === 'fulfilled' && results[2].value?.success) {
      setLatestErrors(results[2].value.data?.items || []);
    } else {
      setErrorsError('Unable to load latest error solutions.');
    }
    setIsLoadingErrors(false);
  }, []);

  useEffect(() => {
    fetchHomepageFeeds();
  }, [fetchHomepageFeeds]);

  // Handle Search Submission
  const handleSearchSubmit = async (e) => {
    e?.preventDefault();

    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) return;
    if (trimmedQuery === activeQuery && searchResults) return;

    setIsSearching(true);
    setSearchError(null);
    setActiveQuery(trimmedQuery);

    try {
      const response = await homeService.searchContent(trimmedQuery);
      if (response?.success && response?.data) {
        setSearchResults(response.data);
      } else {
        setSearchResults({
          query: trimmedQuery,
          results: { articles: [], snippets: [], errors: [] },
          total: 0,
        });
      }
    } catch (err) {
      console.error('Homepage global search error:', err);
      setSearchError(err.response?.data?.error?.message || 'Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Clear active search
  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveQuery('');
    setSearchResults(null);
    setSearchError(null);
  };

  return (
    <>
      <Helmet>
        <title>DevAtlas - Unified Developer Knowledge & Search Platform</title>
        <meta
          name="description"
          content="The ultimate single point of reference developer platform connecting technical articles, copyable code snippets, stack trace error solutions, and developer tools."
        />
      </Helmet>

      <Container className="flex-grow flex flex-col py-10 relative overflow-hidden">
        {/* Hero & Global Search Data Integration Section */}
        <div className="max-w-4xl mx-auto w-full text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
            DevAtlas Knowledge Engine v1.1.0
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-slate-100">
            Unified Developer Knowledge Graph
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Search across published articles, copyable code snippets, and stack trace error solutions in one place.
          </p>

          {/* Search Data Integration Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center gap-2 mb-4">
            <input
              type="text"
              placeholder="Search articles, code snippets, or raw exception logs (min 2 chars)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={isSearching || searchQuery.trim().length < 2}
              className="px-5 py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
            {activeQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-3 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </form>

          {/* Search Data Results Output State */}
          {searchError && <p className="text-xs text-rose-500 mt-2">{searchError}</p>}

          {searchResults && (
            <div className="max-w-2xl mx-auto mt-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-left shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Search Results for "{searchResults.query}"
                </span>
                <span className="text-slate-500">{searchResults.total} matches found</span>
              </div>

              {searchResults.total === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No published results found for your query.</p>
              ) : (
                <div className="space-y-3">
                  {/* Article Search Results */}
                  {searchResults.results.articles.map((item) => (
                    <div key={item.slug} className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 uppercase mb-1">
                        Article
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-brand-500">
                        <Link to={`/articles/${item.slug}`}>{item.title}</Link>
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{item.summary}</p>
                    </div>
                  ))}

                  {/* Snippet Search Results */}
                  {searchResults.results.snippets.map((item) => (
                    <div key={item.slug} className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 uppercase mb-1">
                        Snippet ({item.language})
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-brand-500">
                        <Link to={`/snippets/${item.slug}`}>{item.title}</Link>
                      </h4>
                      {item.summary && <p className="text-[11px] text-slate-500 line-clamp-1">{item.summary}</p>}
                    </div>
                  ))}

                  {/* Error Search Results */}
                  {searchResults.results.errors.map((item) => (
                    <div key={item.slug} className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 uppercase mb-1">
                        Error Solution
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-brand-500">
                        <Link to={`/errors/${item.slug}`}>{item.title}</Link>
                      </h4>
                      <p className="text-[11px] text-rose-500 dark:text-rose-400 font-mono line-clamp-1">{item.errorMessage}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Feeds Data Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {/* Latest Articles Feed */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Latest Articles
                </h3>
                <Link to={APP_PATHS.ARTICLES} className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                  View All →
                </Link>
              </div>

              {isLoadingArticles ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                </div>
              ) : articlesError ? (
                <p className="text-xs text-slate-500">{articlesError}</p>
              ) : latestArticles.length === 0 ? (
                <p className="text-xs text-slate-500">No published articles yet.</p>
              ) : (
                <ul className="space-y-3 text-xs">
                  {latestArticles.map((art) => (
                    <li key={art.id || art.slug} className="border-b border-slate-100 dark:border-slate-800/80 pb-2.5 last:border-0">
                      <Link to={`/articles/${art.slug}`} className="font-bold text-slate-800 dark:text-slate-200 hover:text-brand-500 transition-colors line-clamp-1">
                        {art.title}
                      </Link>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{art.summary}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Latest Snippets Feed */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Code Snippets
                </h3>
                <Link to={APP_PATHS.SNIPPETS} className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                  View All →
                </Link>
              </div>

              {isLoadingSnippets ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                </div>
              ) : snippetsError ? (
                <p className="text-xs text-slate-500">{snippetsError}</p>
              ) : latestSnippets.length === 0 ? (
                <p className="text-xs text-slate-500">No published snippets yet.</p>
              ) : (
                <ul className="space-y-3 text-xs">
                  {latestSnippets.map((snip) => (
                    <li key={snip.id || snip.slug} className="border-b border-slate-100 dark:border-slate-800/80 pb-2.5 last:border-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <Link to={`/snippets/${snip.slug}`} className="font-bold text-slate-800 dark:text-slate-200 hover:text-brand-500 transition-colors line-clamp-1">
                          {snip.title}
                        </Link>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 uppercase">
                          {snip.language}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Latest Errors Feed */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Error Solutions
                </h3>
                <Link to={APP_PATHS.ERRORS} className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                  View All →
                </Link>
              </div>

              {isLoadingErrors ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                </div>
              ) : errorsError ? (
                <p className="text-xs text-slate-500">{errorsError}</p>
              ) : latestErrors.length === 0 ? (
                <p className="text-xs text-slate-500">No published error solutions yet.</p>
              ) : (
                <ul className="space-y-3 text-xs">
                  {latestErrors.map((errItem) => (
                    <li key={errItem.id || errItem.slug} className="border-b border-slate-100 dark:border-slate-800/80 pb-2.5 last:border-0">
                      <Link to={`/errors/${errItem.slug}`} className="font-bold text-slate-800 dark:text-slate-200 hover:text-brand-500 transition-colors line-clamp-1">
                        {errItem.title}
                      </Link>
                      <p className="text-[11px] font-mono text-rose-500 dark:text-rose-400 line-clamp-1 mt-0.5">
                        {errItem.errorMessage}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}

export default HomePage;
