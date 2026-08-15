import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  FileText,
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
  Terminal,
  Star,
  EyeOff,
  Archive,
  RotateCcw,
  History,
  Filter,
  X,
} from 'lucide-react';
import { useAuthStore } from '@features/auth/store/useAuthStore.js';
import { articleService } from '@features/articles/services/articleService.js';
import { editorialService } from '@/services/editorialService.js';
import { ALLOWED_CATEGORIES, ALLOWED_LANGUAGES } from '@/constants/editorial.js';
import { APP_PATHS } from '@/constants';
import Container from '@components/Container';

export function AdminArticlesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // URL-synchronized Filter State
  const page = parseInt(searchParams.get('page') || '1', 10);
  const statusFilter = searchParams.get('status') || 'all';
  const categoryFilter = searchParams.get('category') || '';
  const languageFilter = searchParams.get('language') || '';
  const isAssignedFilter = searchParams.get('isAssigned') || 'all';
  const isFeaturedFilter = searchParams.get('isFeatured') || 'all';
  const searchParam = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(searchParam);

  // Data States
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Action States
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Modal States
  const [unpublishModalArticle, setUnpublishModalArticle] = useState(null);
  const [unpublishNote, setUnpublishNote] = useState('');
  const [archiveModalArticle, setArchiveModalArticle] = useState(null);
  const [archiveNote, setArchiveNote] = useState('');
  const [deleteModalArticle, setDeleteModalArticle] = useState(null);
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);

  // Revision History Drawer State
  const [historyModalArticle, setHistoryModalArticle] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Update URL Search Params helper
  const updateFilters = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === '' || value === 'all' || value === null || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    // Reset to page 1 unless page is explicitly passed
    if (!newParams.page) {
      params.set('page', '1');
    }
    setSearchParams(params);
  };

  // Fetch articles from backend
  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await articleService.getAdminArticles({
        page,
        limit: 10,
        status: statusFilter,
        category: categoryFilter,
        language: languageFilter,
        isAssigned: isAssignedFilter,
        isFeatured: isFeaturedFilter,
        search: searchParam,
      });

      if (response?.success && response?.data) {
        setArticles(response.data.items || []);
        setPagination((prev) => ({
          ...prev,
          page,
          total: response.data.pagination?.total || 0,
          pages: response.data.pagination?.pages || 1,
        }));
      }
    } catch (err) {
      console.error('Failed to load admin articles:', err);
      setError(err.response?.data?.error?.message || 'Failed to load articles. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, categoryFilter, languageFilter, isAssignedFilter, isFeaturedFilter, searchParam]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Sync Search Input with URL
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  // Handle Search Form Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim(), page: 1 });
  };

  // Handle Publish Direct Action
  const handlePublish = async (article) => {
    setActionLoadingId(article.id);
    try {
      const response = await editorialService.approveArticle(article.id);
      if (response?.success) {
        setFeedbackMessage({
          type: 'success',
          text: `Article "${article.title}" published live successfully!`,
        });
        await fetchArticles();
      }
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.error?.message || 'Failed to publish article.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Unpublish Confirm
  const handleUnpublishConfirm = async () => {
    if (!unpublishModalArticle) return;
    setIsSubmittingModal(true);
    try {
      const response = await editorialService.unpublishArticle(unpublishModalArticle.id, unpublishNote);
      if (response?.success) {
        setFeedbackMessage({
          type: 'success',
          text: `Article "${unpublishModalArticle.title}" has been unpublished. It is immediately hidden from all public views.`,
        });
        setUnpublishModalArticle(null);
        setUnpublishNote('');
        await fetchArticles();
      }
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.error?.message || 'Failed to unpublish article.',
      });
    } finally {
      setIsSubmittingModal(false);
    }
  };

  // Handle Archive Confirm
  const handleArchiveConfirm = async () => {
    if (!archiveModalArticle) return;
    setIsSubmittingModal(true);
    try {
      const response = await editorialService.archiveArticle(archiveModalArticle.id, archiveNote);
      if (response?.success) {
        setFeedbackMessage({
          type: 'success',
          text: `Article "${archiveModalArticle.title}" archived successfully.`,
        });
        setArchiveModalArticle(null);
        setArchiveNote('');
        await fetchArticles();
      }
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.error?.message || 'Failed to archive article.',
      });
    } finally {
      setIsSubmittingModal(false);
    }
  };

  // Handle Restore
  const handleRestore = async (article) => {
    setActionLoadingId(article.id);
    try {
      const response = await editorialService.restoreArticle(article.id);
      if (response?.success) {
        setFeedbackMessage({
          type: 'success',
          text: `Article "${article.title}" restored to Draft status.`,
        });
        await fetchArticles();
      }
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.error?.message || 'Failed to restore article.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Toggle Featured
  const handleToggleFeatured = async (article) => {
    setActionLoadingId(article.id);
    const targetState = !article.isFeatured;
    try {
      const response = await editorialService.toggleFeatured(article.id, targetState);
      if (response?.success) {
        setFeedbackMessage({
          type: 'success',
          text: targetState
            ? `Article "${article.title}" marked as Featured.`
            : `Article "${article.title}" removed from Featured.`,
        });
        await fetchArticles();
      }
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.error?.message || 'Failed to update featured status.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteModalArticle) return;
    setIsSubmittingModal(true);
    try {
      const response = await articleService.deleteArticle(deleteModalArticle.id);
      if (response?.success) {
        setFeedbackMessage({
          type: 'success',
          text: `Article "${deleteModalArticle.title}" deleted permanently.`,
        });
        setDeleteModalArticle(null);
        await fetchArticles();
      }
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.error?.message || 'Failed to delete article.',
      });
    } finally {
      setIsSubmittingModal(false);
    }
  };

  // Open Revision History Modal
  const handleOpenHistory = async (article) => {
    setHistoryModalArticle(article);
    setIsLoadingHistory(true);
    setHistoryData(null);
    try {
      const response = await editorialService.getRevisionHistory(article.id);
      if (response?.success && response?.data) {
        setHistoryData(response.data);
      }
    } catch (err) {
      console.error('Failed to load revision history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    navigate(APP_PATHS.HOME, { replace: true });
  };

  // Auto-dismiss feedback alert
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Published
          </span>
        );
      case 'unpublished':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-semibold">
            <EyeOff size={12} />
            Unpublished
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">
            <Archive size={12} />
            Archived
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 text-xs font-semibold">
            <Clock size={12} />
            Pending Review
          </span>
        );
      case 'changes_requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-semibold">
            <AlertCircle size={12} />
            Changes Requested
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-semibold">
            <AlertCircle size={12} />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-semibold">
            Draft
          </span>
        );
    }
  };

  return (
    <>
      <Helmet>
        <title>Content Management & Moderation - DevAtlas Admin</title>
        <meta name="description" content="DevAtlas Admin Editorial Content Management & Moderation Portal." />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {/* Top Header */}
        <header className="border-b border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
          <Container>
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  to={APP_PATHS.ADMIN}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Back to Admin Dashboard"
                >
                  <ArrowLeft size={18} />
                </Link>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                  <Terminal size={18} />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  DevAtlas Admin
                </span>
                <span className="text-slate-400 dark:text-slate-600">/</span>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Editorial Management
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline">
                  {user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </Container>
        </header>

        {/* Main Content */}
        <Container>
          <div className="py-8">
            {/* Feedback Alert banner */}
            {feedbackMessage && (
              <div
                className={`mb-6 p-4 rounded-xl flex items-center justify-between text-sm ${
                  feedbackMessage.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {feedbackMessage.type === 'success' ? (
                    <CheckCircle size={18} />
                  ) : (
                    <AlertCircle size={18} />
                  )}
                  <span>{feedbackMessage.text}</span>
                </div>
                <button
                  onClick={() => setFeedbackMessage(null)}
                  className="text-xs font-bold uppercase opacity-75 hover:opacity-100 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Title Bar & Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Editorial Content Management
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Full control over article publishing lifecycle, unpublishing, archiving, featured content, and revision histories.
                </p>
              </div>

              <Link
                to={APP_PATHS.ADMIN_ARTICLE_NEW}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm shadow-md shadow-brand-500/20 transition-all cursor-pointer"
              >
                <Plus size={18} />
                Create Article
              </Link>
            </div>

            {/* URL-Synchronized Multi-Faceted Toolbar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1">
                  <div className="relative flex-grow">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Search articles by title, summary, or tag..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Search
                  </button>
                </form>

                {/* Filter Status Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'published', label: 'Published' },
                    { key: 'unpublished', label: 'Unpublished' },
                    { key: 'archived', label: 'Archived' },
                    { key: 'pending_review', label: 'Pending' },
                    { key: 'draft', label: 'Drafts' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => updateFilters({ status: tab.key, page: 1 })}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                        statusFilter === tab.key
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Filter Dropdowns Row */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => updateFilters({ category: e.target.value, page: 1 })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="">All Categories</option>
                    {ALLOWED_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Language
                  </label>
                  <select
                    value={languageFilter}
                    onChange={(e) => updateFilters({ language: e.target.value, page: 1 })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="">All Languages</option>
                    {ALLOWED_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assignment Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Assignment
                  </label>
                  <select
                    value={isAssignedFilter}
                    onChange={(e) => updateFilters({ isAssigned: e.target.value, page: 1 })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="all">All Workflows</option>
                    <option value="true">Assigned Briefs</option>
                    <option value="false">Self-Created Articles</option>
                  </select>
                </div>

                {/* Featured Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Featured State
                  </label>
                  <select
                    value={isFeaturedFilter}
                    onChange={(e) => updateFilters({ isFeatured: e.target.value, page: 1 })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="all">All Content</option>
                    <option value="true">Featured Only ⭐</option>
                    <option value="false">Standard Only</option>
                  </select>
                </div>

                {/* Clear Active Filters Button */}
                {(categoryFilter || languageFilter || isAssignedFilter !== 'all' || isFeaturedFilter !== 'all' || searchParam || statusFilter !== 'all') && (
                  <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-end">
                    <button
                      onClick={() => setSearchParams(new URLSearchParams())}
                      className="w-full py-1.5 px-3 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <X size={14} />
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Articles Table Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-16 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : error ? (
                <div className="p-12 text-center">
                  <AlertCircle size={40} className="mx-auto text-rose-500 mb-3" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Failed to Load Articles</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">{error}</p>
                  <button
                    onClick={fetchArticles}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <RefreshCw size={14} />
                    Retry
                  </button>
                </div>
              ) : articles.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText size={44} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">No Matching Articles</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    No articles matched the selected search or editorial filter options.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <th className="px-6 py-4">Article & Category</th>
                        <th className="px-6 py-4">Status & Featured</th>
                        <th className="px-6 py-4">Author</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                      {articles.map((article) => (
                        <tr key={article.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                          {/* Title, Category, Language */}
                          <td className="px-6 py-4 max-w-xs sm:max-w-sm">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 truncate flex items-center gap-2">
                              {article.title}
                              {article.assignment && (
                                <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                                  Brief
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {article.summary}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                                {article.category || 'Backend'}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px]">
                                🌐 {article.language || 'English'}
                              </span>
                            </div>
                          </td>

                          {/* Status Badge & Featured */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1.5 items-start">
                              {getStatusBadge(article.status)}
                              {article.isFeatured && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                                  <Star size={10} className="fill-amber-500 text-amber-500" />
                                  Featured
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Author */}
                          <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-1.5 text-xs font-medium">
                              <User size={14} className="text-slate-400" />
                              <span>{article.author?.name || 'Admin'}</span>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={14} className="text-slate-400" />
                              <span>
                                {article.publishedAt
                                  ? new Date(article.publishedAt).toLocaleDateString()
                                  : new Date(article.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Feature / Unfeature Button */}
                              {article.status === 'published' && (
                                <button
                                  onClick={() => handleToggleFeatured(article)}
                                  disabled={actionLoadingId === article.id}
                                  className={`p-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                                    article.isFeatured
                                      ? 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                                  }`}
                                  title={article.isFeatured ? 'Unfeature article' : 'Feature article on homepage'}
                                >
                                  <Star size={14} className={article.isFeatured ? 'fill-amber-500 text-amber-500' : ''} />
                                </button>
                              )}

                              {/* Publish Action */}
                              {article.status !== 'published' && article.status !== 'archived' && (
                                <button
                                  onClick={() => handlePublish(article)}
                                  disabled={actionLoadingId === article.id}
                                  className="px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  Publish
                                </button>
                              )}

                              {/* Unpublish Action */}
                              {article.status === 'published' && (
                                <button
                                  onClick={() => {
                                    setUnpublishModalArticle(article);
                                    setUnpublishNote('');
                                  }}
                                  className="px-2.5 py-1 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  Unpublish
                                </button>
                              )}

                              {/* Restore Action */}
                              {(article.status === 'archived' || article.status === 'unpublished') && (
                                <button
                                  onClick={() => handleRestore(article)}
                                  disabled={actionLoadingId === article.id}
                                  className="px-2.5 py-1 rounded-lg border border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <RotateCcw size={12} />
                                  Restore
                                </button>
                              )}

                              {/* Archive Action */}
                              {article.status !== 'archived' && (
                                <button
                                  onClick={() => {
                                    setArchiveModalArticle(article);
                                    setArchiveNote('');
                                  }}
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Archive Article"
                                >
                                  <Archive size={14} />
                                </button>
                              )}

                              {/* Revision History Action */}
                              <button
                                onClick={() => handleOpenHistory(article)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="View Revision History Audit"
                              >
                                <History size={14} />
                              </button>

                              {/* Edit Article */}
                              <Link
                                to={`/portal-master/articles/${article.id}/edit`}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                                title="Edit Content"
                              >
                                <Edit size={14} />
                              </Link>

                              {/* Delete Article */}
                              <button
                                onClick={() => setDeleteModalArticle(article)}
                                className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Delete Permanently"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Bar */}
              {!isLoading && articles.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div>
                    Page <span className="font-semibold text-slate-900 dark:text-slate-100">{pagination.page}</span> of{' '}
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{pagination.pages}</span> ({pagination.total} total items)
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateFilters({ page: Math.max(1, page - 1) })}
                      disabled={page <= 1}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => updateFilters({ page: Math.min(pagination.pages, page + 1) })}
                      disabled={page >= pagination.pages}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>

        {/* Unpublish Confirmation Modal */}
        {unpublishModalArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in duration-200">
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center">
                  <EyeOff size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Unpublish Article</h3>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                Unpublish <span className="font-semibold text-slate-900 dark:text-slate-100">"{unpublishModalArticle.title}"</span>?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                The article will immediately disappear from the public website, search results, and sitemap. Content data is safely preserved.
              </p>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Editorial Reason / Note (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Reason for unpublishing this content..."
                  value={unpublishNote}
                  onChange={(e) => setUnpublishNote(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setUnpublishModalArticle(null)}
                  disabled={isSubmittingModal}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnpublishConfirm}
                  disabled={isSubmittingModal}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer flex items-center gap-2 shadow-md shadow-rose-500/20"
                >
                  {isSubmittingModal ? <RefreshCw size={14} className="animate-spin" /> : 'Confirm Unpublish'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Archive Confirmation Modal */}
        {archiveModalArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in duration-200">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Archive size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Archive Article</h3>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                Archive <span className="font-semibold text-slate-900 dark:text-slate-100">"{archiveModalArticle.title}"</span>?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                Archived content is hidden from public discovery. You can restore it to draft status at any time.
              </p>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Archive Reason (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Reason for archiving..."
                  value={archiveNote}
                  onChange={(e) => setArchiveNote(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setArchiveModalArticle(null)}
                  disabled={isSubmittingModal}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleArchiveConfirm}
                  disabled={isSubmittingModal}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer flex items-center gap-2"
                >
                  {isSubmittingModal ? <RefreshCw size={14} className="animate-spin" /> : 'Confirm Archive'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in duration-200">
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center">
                  <Trash2 size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Delete Article</h3>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                Permanently delete <span className="font-semibold text-slate-900 dark:text-slate-100">"{deleteModalArticle.title}"</span>?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                This action cannot be undone. Consider unpublishing or archiving instead if you want to keep the historical record.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteModalArticle(null)}
                  disabled={isSubmittingModal}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isSubmittingModal}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer flex items-center gap-2 shadow-md shadow-rose-500/20"
                >
                  {isSubmittingModal ? <RefreshCw size={14} className="animate-spin" /> : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Revision History Audit Modal */}
        {historyModalArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in duration-200 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-lg">
                  <History size={20} />
                  <span>Revision Audit History</span>
                </div>
                <button
                  onClick={() => setHistoryModalArticle(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="py-3">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base">{historyModalArticle.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Current Status: {getStatusBadge(historyModalArticle.status)}</p>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 py-2">
                {isLoadingHistory ? (
                  <div className="p-8 text-center text-slate-400 text-xs">Loading audit trail...</div>
                ) : !historyData?.revisions || historyData.revisions.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">No editorial revisions recorded yet.</div>
                ) : (
                  <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
                    {historyData.revisions.map((rev, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-brand-600 ring-4 ring-white dark:ring-slate-900" />
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                              Action: {rev.action}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              {new Date(rev.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <div className="text-slate-600 dark:text-slate-300 font-medium">
                            {rev.note || 'No note attached.'}
                          </div>

                          <div className="flex items-center gap-2 text-slate-500 text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                            <User size={12} />
                            <span>Performed by: {rev.performedBy?.name || rev.performedBy?.email || 'Admin'}</span>
                          </div>

                          {rev.snapshot && (
                            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                              <div className="text-slate-400 font-semibold">Snapshot:</div>
                              <div>Title: {rev.snapshot.title}</div>
                              <div>Category: {rev.snapshot.category} | Language: {rev.snapshot.language}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setHistoryModalArticle(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  Close Audit History
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminArticlesPage;
