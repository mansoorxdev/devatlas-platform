import { Search, X, Loader2, Sparkles } from 'lucide-react';

export function HeroSearch({
  searchQuery,
  setSearchQuery,
  activeQuery,
  isSearching,
  handleSearchSubmit,
  handleClearSearch,
}) {
  return (
    <div className="max-w-4xl mx-auto w-full text-center mb-10">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-xs font-semibold mb-6 backdrop-blur-md">
        <Sparkles size={14} className="text-brand-400 animate-pulse" />
        <span>DevAtlas Developer Search Engine</span>
      </div>

      {/* Primary Heading */}
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-slate-100 leading-tight">
        Developer Knowledge & Search Engine
      </h1>

      {/* Supporting Subtitle */}
      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
        The single point of reference for technical articles, copyable code snippets, stack trace error resolutions, and browser developer utilities.
      </p>

      {/* Global Search Bar Form */}
      <form
        onSubmit={handleSearchSubmit}
        className="max-w-2xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg focus-within:ring-2 focus-within:ring-brand-500/20 transition-all"
      >
        <div className="relative flex-grow flex items-center">
          <Search size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            aria-label="Global search query input"
            placeholder="Search articles, code snippets, or raw error logs (min 2 chars)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search query"
              className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isSearching || searchQuery.trim().length < 2}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0"
        >
          {isSearching ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search size={16} />
              <span>Search</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default HeroSearch;
