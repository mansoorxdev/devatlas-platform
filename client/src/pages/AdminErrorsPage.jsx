import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  AlertOctagon,
  Clock,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  LogOut,
  X,
  Filter,
  Layers,
} from 'lucide-react';
import { useAuthStore } from '@features/auth/store/useAuthStore.js';
import { errorService } from '@features/errors';
import { APP_PATHS } from '@/constants';
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

export function AdminErrorsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query params synchronization
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentStatus = searchParams.get('status') || 'all';
  const currentCategory = searchParams.get('category') || '';
  const currentLanguage = searchParams.get('language') || '';
  const currentSearch = searchParams.get('search') || '';

  // Data & Pagination states
  const [errorsList, setErrorsList] = useState([]);
  const [pagination, setPagination] = useState({ page: currentPage, limit: 10, total: 0, pages: 1 });
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Action States
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [deleteModalError, setDeleteModalError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Sync search input if URL query changes directly
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Helper to update search params
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

  // Fetch admin errors from backend API
  const fetchErrors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await errorService.getAdminErrors({
        page: currentPage,
        limit: 10,
        status: currentStatus,
        category: currentCategory,
        language: currentLanguage,
        search: currentSearch,
      });

      if (response?.success && response?.data) {
        setErrorsList(response.data.items || []);
        setPagination({
          page: response.data.pagination?.page || 1,
          limit: response.data.pagination?.limit || 10,
          total: response.data.pagination?.total || 0,
          pages: response.data.pagination?.pages || 1,
        });
      }
    } catch (err) {
      console.error('Failed to load admin error solutions:', err);
      setError(err.response?.data?.error?.message || 'Failed to load error solutions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, currentStatus, currentCategory, currentLanguage, currentSearch]);

  useEffect(() => {
    fetchErrors();
  }, [fetchErrors]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateQueryParams({ search: searchInput.trim(), page: '1' });
  };

  // Handle Status Filter Tab Switch
  const handleStatusChange = (status) => {
    updateQueryParams({ status, page: '1' });
  };

  // Handle Category Filter Switch
  const handleCategoryChange = (category) => {
    updateQueryParams({ category, page: '1' });
  };

  // Handle Language Filter Switch
  const handleLanguageChange = (language) => {
    updateQueryParams({ language, page: '1' });
  };

  // Handle Clear Filters
  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  // Handle Publish / Unpublish Toggle
  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'published' ? 'draft' : 'published';
    setActionLoadingId(item.id);
    try {
      const response = await errorService.toggleErrorStatus(item.id, nextStatus);
      if (response?.success) {
        setFeedbackMessage({
          type: 'success',
          text: `Error solution "${item.title}" is now ${nextStatus}.`,
        });
        await fetchErrors();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.error?.message || 'Failed to update error solution status.',
      });
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteModalError) return;
    setIsDeleting(true);
    try {
      const response = await errorService.deleteError(deleteModalError.id);
      if (response?.success) {
        setFeedbackMessage({
          type: 'success',
          text: `Error solution "${deleteModalError.title}" deleted successfully.`,
        });
        setDeleteModalError(null);
        await fetchErrors();
      }
    } catch (err) {
      console.error('Failed to delete error solution:', err);
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.error?.message || 'Failed to delete error solution.',
      });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  return (
    <>
      <Helmet>
        <title>Manage Error Solutions - DevAtlas Admin</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
          <Container>
            <div className="h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  to={APP_PATHS.ADMIN}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Dashboard
                </Link>
                <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-600 to-amber-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    <AlertOctagon size={16} />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold leading-tight">Error Solutions</h1>
                    <p className="text-[11px] text-slate-400">DevAtlas Content Portal</p>
                  </div>
                </div>
              </div>

              {/* Right User Bar & Create Button */}
              <div className="flex items-center gap-3">
                <Link
                  to={APP_PATHS.ADMIN_ERROR_NEW}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-colors cursor-pointer"
                >
                  <Plus size={16} />
                  Create Solution
                </Link>

                <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                <button
                  onClick={logout}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </Container>
        </header>

        {/* Feedback Alert Toast */}
        {feedbackMessage && (
          <div
            className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-xl border text-xs font-medium max-w-md flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-rose-500 flex-shrink-0" />
            )}
            <span className="flex-grow">{feedbackMessage.text}</span>
            <button onClick={() => setFeedbackMessage(null)} className="opacity-60 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <Container className="py-8 flex-grow">
          {/* Header Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Error Solution Repository</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage developer crash resolutions, stack trace fixes, and exception troubleshooting guides.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchErrors}
                disabled={isLoading}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Refresh Table"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Search, Filter Bar & Status Tabs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-xs flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Status Filter Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 text-xs font-semibold self-start lg:self-auto">
              {['all', 'published', 'draft'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-3.5 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                    currentStatus === status
                      ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {status === 'all' ? 'All Errors' : status}
                </button>
              ))}
            </div>

            {/* Category & Language Filters + Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-grow max-w-3xl">
              {/* Category Dropdown */}
              <div className="flex items-center gap-1.5">
                <Layers size={14} className="text-slate-400 hidden sm:block" />
                <select
                  value={currentCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {SUPPORTED_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Dropdown */}
              <div className="flex items-center gap-1.5">
                <Filter size={14} className="text-slate-400 hidden sm:block" />
                <select
                  value={currentLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-grow">
                <div className="relative flex-grow">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by title, raw error text..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('');
                        updateQueryParams({ search: '', page: '1' });
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          {/* Active Filter Indicators */}
          {(currentSearch || currentCategory || currentLanguage || currentStatus !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
              <span className="text-slate-500 font-medium">Active Filters:</span>
              {currentStatus !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 font-medium">
                  Status: {currentStatus}
                </span>
              )}
              {currentCategory && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-medium">
                  Category: {currentCategory}
                </span>
              )}
              {currentLanguage && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-medium">
                  Lang: {currentLanguage}
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

          {/* Table Container Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            {isLoading ? (
              // Table Skeleton Loading View
              <div className="p-6 space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
                ))}
              </div>
            ) : error ? (
              // Error State View
              <div className="p-12 text-center">
                <AlertCircle size={40} className="mx-auto text-rose-500 mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Unable to load error solutions</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">{error}</p>
                <button
                  onClick={fetchErrors}
                  className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            ) : errorsList.length === 0 ? (
              // Empty State View
              <div className="p-12 text-center">
                <AlertOctagon size={40} className="mx-auto text-slate-400 mb-3 opacity-60" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No error solutions found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {currentSearch || currentCategory || currentLanguage || currentStatus !== 'all'
                    ? 'No error solutions matched your filter criteria.'
                    : 'Get started by creating your first error solution troubleshooting guide!'}
                </p>
                {currentSearch || currentCategory || currentLanguage || currentStatus !== 'all' ? (
                  <button
                    onClick={handleClearFilters}
                    className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <Link
                    to={APP_PATHS.ADMIN_ERROR_NEW}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Plus size={16} />
                    Create First Solution
                  </Link>
                )}
              </div>
            ) : (
              // Responsive Errors Data Table
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Error Title & Stack Trace</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Language</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Author</th>
                      <th className="py-3.5 px-4">Published Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {errorsList.map((item) => {
                      const publishedDateFormatted = item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—';

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Title & Raw Error Excerpt */}
                          <td className="py-4 px-4 max-w-xs sm:max-w-sm">
                            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1 mb-0.5">
                              {item.title}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 text-xs line-clamp-1 font-mono">
                              Error: {item.errorMessage}
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-mono text-[11px] font-bold uppercase tracking-wider">
                              {item.category}
                            </span>
                          </td>

                          {/* Language Badge */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-bold uppercase tracking-wider">
                              {item.language}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                                item.status === 'published'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                              />
                              {item.status}
                            </span>
                          </td>

                          {/* Author */}
                          <td className="py-4 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                            {item.author?.name || 'Admin'}
                          </td>

                          {/* Published Date */}
                          <td className="py-4 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px]">
                            {publishedDateFormatted}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-4 px-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Toggle Publish Status */}
                              <button
                                onClick={() => handleToggleStatus(item)}
                                disabled={actionLoadingId === item.id}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                                  item.status === 'published'
                                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                                }`}
                              >
                                {actionLoadingId === item.id ? (
                                  <RefreshCw size={12} className="animate-spin" />
                                ) : item.status === 'published' ? (
                                  'Unpublish'
                                ) : (
                                  'Publish'
                                )}
                              </button>

                              {/* Edit Action */}
                              <Link
                                to={`/portal-master/errors/${item.id}/edit`}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                                title="Edit Error Solution"
                              >
                                <Edit size={14} />
                              </Link>

                              {/* Delete Action */}
                              <button
                                onClick={() => setDeleteModalError(item)}
                                className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                                title="Delete Error Solution"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && errorsList.length > 0 && pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div>
                  Page <span className="font-semibold text-slate-900 dark:text-slate-100">{pagination.page}</span> of{' '}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{pagination.pages}</span> ({pagination.total} error solutions)
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQueryParams({ page: String(Math.max(1, pagination.page - 1)) })}
                    disabled={pagination.page <= 1}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => updateQueryParams({ page: String(Math.min(pagination.pages, pagination.page + 1)) })}
                    disabled={pagination.page >= pagination.pages}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Container>

        {/* Delete Confirmation Modal */}
        {deleteModalError && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mb-4">
                <Trash2 size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Delete Error Solution</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-slate-100">"{deleteModalError.title}"</span>? This action is permanent and cannot be undone.
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteModalError(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isDeleting ? <RefreshCw size={14} className="animate-spin" /> : null}
                  Delete Solution
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminErrorsPage;
