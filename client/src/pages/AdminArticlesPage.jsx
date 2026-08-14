import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuthStore } from '@features/auth/store/useAuthStore.js';
import { articleService } from '@features/articles/services/articleService.js';
import { APP_PATHS } from '@/constants';
import Container from '@components/Container';

export function AdminArticlesPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Filter & Pagination States
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Action States
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [deleteModalArticle, setDeleteModalArticle] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Fetch articles from backend
  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await articleService.getAdminArticles({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
        search: activeSearch,
      });

      if (response?.success && response?.data) {
        setArticles(response.data.items || []);
        setPagination((prev) => ({
          ...prev,
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
  }, [pagination.page, pagination.limit, statusFilter, activeSearch]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Handle Search Form Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    setActiveSearch(searchInput.trim());
  };

  // Handle Status Toggle (Publish / Unpublish)
  const handleToggleStatus = async (article) => {
    const nextStatus = article.status === 'published' ? 'draft' : 'published';
    setActionLoadingId(article.id);
    try {
      const response = await articleService.toggleArticleStatus(article.id, nextStatus);
      if (response?.success) {
        setFeedbackMessage({
          type: 'success',
          text: `Article "${article.title}" is now ${nextStatus}.`,
        });
        await fetchArticles();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.error?.message || 'Failed to update publication status.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteModalArticle) return;
    setIsDeleting(true);
    try {
      const response = await articleService.deleteArticle(deleteModalArticle.id);
      if (response?.success) {
        setFeedbackMessage({
          type: 'success',
          text: `Article "${deleteModalArticle.title}" deleted successfully.`,
        });
        setDeleteModalArticle(null);
        await fetchArticles();
      }
    } catch (err) {
      console.error('Failed to delete article:', err);
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.error?.message || 'Failed to delete article.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    navigate(APP_PATHS.HOME, { replace: true });
  };

  // Auto-dismiss feedback alert after 4 seconds
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  return (
    <>
      <Helmet>
        <title>Manage Articles - DevAtlas Admin</title>
        <meta name="description" content="Manage platform articles in DevAtlas." />
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
                  Articles
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

        {/* Main Section */}
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
                  className="text-xs font-bold uppercase opacity-75 hover:opacity-100"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Title Bar & Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Articles</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Manage platform tutorials, technical guides, and architectural breakdowns.
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

            {/* Filter Tabs & Search Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              {/* Tabs */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
                {[
                  { key: 'all', label: 'All Articles' },
                  { key: 'published', label: 'Published' },
                  { key: 'draft', label: 'Drafts' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setStatusFilter(tab.key);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      statusFilter === tab.key
                        ? 'bg-white dark:bg-slate-950 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <div className="relative flex-grow min-w-[240px]">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search by title, summary..."
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
            </div>

            {/* Articles Table Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              {isLoading ? (
                // Skeleton Rows
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="h-16 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : error ? (
                // Error State
                <div className="p-12 text-center">
                  <AlertCircle size={40} className="mx-auto text-rose-500 mb-3" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Failed to Load Articles
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    {error}
                  </p>
                  <button
                    onClick={fetchArticles}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <RefreshCw size={14} />
                    Retry
                  </button>
                </div>
              ) : articles.length === 0 ? (
                // Empty State
                <div className="p-12 text-center">
                  <FileText size={44} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    No Articles Found
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {activeSearch
                      ? `No articles matched your search "${activeSearch}".`
                      : statusFilter !== 'all'
                      ? `No ${statusFilter} articles available.`
                      : 'Get started by creating your first article.'}
                  </p>
                  {activeSearch || statusFilter !== 'all' ? (
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setSearchInput('');
                        setActiveSearch('');
                      }}
                      className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <Link
                      to={APP_PATHS.ADMIN_ARTICLE_NEW}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-colors"
                    >
                      <Plus size={14} />
                      Create Article
                    </Link>
                  )}
                </div>
              ) : (
                // Data Table
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <th className="px-6 py-4">Title & Excerpt</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Author</th>
                        <th className="px-6 py-4">Read Time</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                      {articles.map((article) => (
                        <tr
                          key={article.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          {/* Title & Summary */}
                          <td className="px-6 py-4 max-w-xs sm:max-w-sm">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {article.title}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {article.summary}
                            </div>
                            {article.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {article.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {article.status === 'published' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-400 text-xs font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Draft
                              </span>
                            )}
                          </td>

                          {/* Author */}
                          <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-1.5 text-xs font-medium">
                              <User size={14} className="text-slate-400" />
                              <span>{article.author?.name || 'Admin'}</span>
                            </div>
                          </td>

                          {/* Read Time */}
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} className="text-slate-400" />
                              <span>{article.readTime || 1} min read</span>
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
                            <div className="flex items-center justify-end gap-2">
                              {/* Publish / Unpublish Toggle */}
                              <button
                                onClick={() => handleToggleStatus(article)}
                                disabled={actionLoadingId === article.id}
                                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                                  article.status === 'published'
                                    ? 'border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                    : 'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                }`}
                                title={article.status === 'published' ? 'Unpublish to draft' : 'Publish live'}
                              >
                                {actionLoadingId === article.id ? (
                                  <RefreshCw size={14} className="animate-spin" />
                                ) : article.status === 'published' ? (
                                  'Unpublish'
                                ) : (
                                  'Publish'
                                )}
                              </button>

                              {/* Edit Button */}
                              <Link
                                to={`/portal-master/articles/${article.id}/edit`}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                                title="Edit Article"
                              >
                                <Edit size={15} />
                              </Link>

                              {/* Delete Button */}
                              <button
                                onClick={() => setDeleteModalArticle(article)}
                                className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Delete Article"
                              >
                                <Trash2 size={15} />
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
                    Showing page <span className="font-semibold text-slate-900 dark:text-slate-100">{pagination.page}</span> of{' '}
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{pagination.pages}</span> ({pagination.total} total articles)
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page <= 1}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                      disabled={pagination.page >= pagination.pages}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>

        {/* Delete Confirmation Modal */}
        {deleteModalArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center">
                  <Trash2 size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Delete Article</h3>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-slate-100">"{deleteModalArticle.title}"</span>?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                This action cannot be undone and will permanently remove the article from the database.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteModalArticle(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer flex items-center gap-2 shadow-md shadow-rose-500/20"
                >
                  {isDeleting ? <RefreshCw size={14} className="animate-spin" /> : 'Confirm Delete'}
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
