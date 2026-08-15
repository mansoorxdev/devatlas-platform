import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  homeService,
  HeroSearch,
  SearchResults,
  LatestArticlesSection,
  LatestSnippetsSection,
  LatestErrorsSection,
} from '@/features/home';
import { DevToolsShowcaseSection } from '@/features/devtools';
import Container from '../components/Container';

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

    const results = await Promise.allSettled([
      homeService.getLatestArticles(),
      homeService.getLatestSnippets(),
      homeService.getLatestErrors(),
    ]);

    // --- 1. Latest Articles Feed ---
    if (results[0].status === 'fulfilled' && results[0].value?.success) {
      const items = Array.isArray(results[0].value.data?.items)
        ? results[0].value.data.items
        : Array.isArray(results[0].value.data)
        ? results[0].value.data
        : [];
      setLatestArticles(items);
      setArticlesError(null);
    } else {
      const message =
        results[0].status === 'rejected'
          ? results[0].reason?.response?.data?.error?.message ||
            results[0].reason?.message ||
            'Unable to load latest articles.'
          : results[0].value?.error?.message || 'Unable to load latest articles.';
      setArticlesError(message);
      setLatestArticles([]);
    }
    setIsLoadingArticles(false);

    // --- 2. Latest Snippets Feed ---
    if (results[1].status === 'fulfilled' && results[1].value?.success) {
      const items = Array.isArray(results[1].value.data?.items)
        ? results[1].value.data.items
        : Array.isArray(results[1].value.data)
        ? results[1].value.data
        : [];
      setLatestSnippets(items);
      setSnippetsError(null);
    } else {
      const message =
        results[1].status === 'rejected'
          ? results[1].reason?.response?.data?.error?.message ||
            results[1].reason?.message ||
            'Unable to load latest code snippets.'
          : results[1].value?.error?.message || 'Unable to load latest code snippets.';
      setSnippetsError(message);
      setLatestSnippets([]);
    }
    setIsLoadingSnippets(false);

    // --- 3. Latest Error Solutions Feed ---
    if (results[2].status === 'fulfilled' && results[2].value?.success) {
      const items = Array.isArray(results[2].value.data?.items)
        ? results[2].value.data.items
        : Array.isArray(results[2].value.data)
        ? results[2].value.data
        : [];
      setLatestErrors(items);
      setErrorsError(null);
    } else {
      const message =
        results[2].status === 'rejected'
          ? results[2].reason?.response?.data?.error?.message ||
            results[2].reason?.message ||
            'Unable to load latest error solutions.'
          : results[2].value?.error?.message || 'Unable to load latest error solutions.';
      setErrorsError(message);
      setLatestErrors([]);
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

  // Retry failed search
  const handleRetrySearch = () => {
    if (searchQuery.trim().length >= 2) {
      handleSearchSubmit();
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
        <title>DevAtlas — Developer Knowledge & Search Engine</title>
        <meta
          name="description"
          content="The single point of reference for technical articles, copyable code snippets, stack trace error resolutions, and browser developer utilities."
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="DevAtlas — Developer Knowledge & Search Engine" />
        <meta
          property="og:description"
          content="The single point of reference for technical articles, copyable code snippets, stack trace error resolutions, and browser developer utilities."
        />
        <meta property="og:image" content={`${(import.meta.env.VITE_CLIENT_URL || window.location.origin).replace(/\/$/, '')}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DevAtlas — Developer Knowledge & Search Engine" />
        <meta
          name="twitter:description"
          content="The single point of reference for technical articles, copyable code snippets, stack trace error resolutions, and browser developer utilities."
        />
        <meta name="twitter:image" content={`${(import.meta.env.VITE_CLIENT_URL || window.location.origin).replace(/\/$/, '')}/og-image.png`} />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10">
        <Container className="flex-grow flex flex-col relative overflow-hidden">
          {/* Step 3A: Hero & Global Search UI */}
          <HeroSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeQuery={activeQuery}
            isSearching={isSearching}
            handleSearchSubmit={handleSearchSubmit}
            handleClearSearch={handleClearSearch}
          />

          {/* Step 3A: Global Search Results UI */}
          <SearchResults
            searchResults={searchResults}
            searchError={searchError}
            handleClearSearch={handleClearSearch}
            handleRetrySearch={handleRetrySearch}
          />

          {/* Step 3B: Latest Articles Section */}
          <LatestArticlesSection
            articles={latestArticles}
            isLoading={isLoadingArticles}
            error={articlesError}
            onRetry={fetchHomepageFeeds}
          />

          {/* Step 3B: Latest Snippets Section */}
          <LatestSnippetsSection
            snippets={latestSnippets}
            isLoading={isLoadingSnippets}
            error={snippetsError}
            onRetry={fetchHomepageFeeds}
          />

          {/* Step 3B: Latest Error Solutions Section */}
          <LatestErrorsSection
            errors={latestErrors}
            isLoading={isLoadingErrors}
            error={errorsError}
            onRetry={fetchHomepageFeeds}
          />

          {/* Step 3C-4: Developer Tools Showcase Section */}
          <DevToolsShowcaseSection />
        </Container>
      </div>
    </>
  );
}

export default HomePage;
