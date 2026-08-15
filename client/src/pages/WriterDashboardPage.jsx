import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Container from '../components/Container';
import writerService from '../services/writerService';
import ReviewHistory from '../components/ReviewHistory';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import { APP_PATHS } from '../constants';
import {
  PenTool,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  MessageSquare,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Send,
  Eye,
  X,
  User,
  History,
  Info,
  Bell,
} from 'lucide-react';

const STATUS_BADGES = {
  draft: {
    label: 'DRAFT',
    explanation: 'Saved locally as a draft. Click Submit for Review when ready.',
    color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  },
  pending_review: {
    label: 'PENDING REVIEW',
    explanation: 'Submitted and currently awaiting admin editorial review.',
    color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  },
  changes_requested: {
    label: 'CHANGES REQUESTED',
    explanation: 'Admin feedback requires updates before resubmission.',
    color: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  },
  rejected: {
    label: 'REJECTED',
    explanation: 'Article was reviewed and not accepted for publication.',
    color: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800',
  },
  published: {
    label: 'PUBLISHED',
    explanation: 'Live on DevAtlas and accessible to all public readers.',
    color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  },
};

export function WriterDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUser = useAuthStore((state) => state.user);

  // URL-synchronized state
  const activeStatus = searchParams.get('status') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const searchQuery = searchParams.get('search') || '';

  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    pending_review: 0,
    changes_requested: 0,
    rejected: 0,
    published: 0,
  });
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);

  // Modals state
  const [feedbackModalArticle, setFeedbackModalArticle] = useState(null);
  const [historyModalArticle, setHistoryModalArticle] = useState(null);

  const updateFilters = (newParams) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '' || (key === 'status' && value === 'all') || (key === 'page' && value === 1)) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });
    setSearchParams(nextParams);
  };

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, articlesRes] = await Promise.all([
        writerService.getMyStats(),
        writerService.getMyArticles({
          page: currentPage,
          status: activeStatus,
          search: searchQuery,
        }),
      ]);

      if (statsRes.success) setStats(statsRes.data.stats);
      if (articlesRes.success) {
        setArticles(articlesRes.data.items || []);
        setPagination(articlesRes.data.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load writer dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, activeStatus, searchQuery]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleSubmitForReview = async (id) => {
    setSubmittingId(id);
    try {
      await writerService.submitArticle(id);
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to submit article for review.');
    } finally {
      setSubmittingId(null);
    }
  };

  const actionRequiredCount = (stats.changes_requested || 0);

  return (
    <>
      <Helmet>
        <title>Writer Portal — DevAtlas</title>
        <meta name="description" content="Manage your contributed articles, track review statuses, and respond to admin feedback." />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10">
        <Container className="max-w-6xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold mb-2">
                <PenTool size={14} />
                <span>Contributor Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Writer Dashboard</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Create articles, submit for editorial review, and track publication progress.
              </p>
            </div>

            <Link
              to={APP_PATHS.WRITER_ARTICLE_NEW}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus size={16} />
              <span>Create New Article</span>
            </Link>
          </div>

          {/* Writer Identity Profile Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 w-full md:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-brand-500/20 shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'W'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{currentUser?.name || 'Writer Contributor'}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-bold uppercase">
                    {currentUser?.role || 'writer'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{currentUser?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-3 md:pt-0 md:pl-6 w-full md:w-auto justify-between md:justify-end">
              <div>
                <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider">Total Contributed</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">{stats.total || 0} Articles</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider">Live Published</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{stats.published || 0} Published</span>
              </div>
            </div>
          </div>

          {/* Action Required Notification Banner */}
          {actionRequiredCount > 0 && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-2xl p-4 mb-8 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Bell size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                    {actionRequiredCount} {actionRequiredCount === 1 ? 'Article Requires Your Attention' : 'Articles Require Your Attention'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Admin has requested changes on your submission. Review feedback notes and resubmit for publication.
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateFilters({ status: 'changes_requested', page: 1 })}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer"
              >
                View Items
              </button>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { id: 'all', count: stats.total, label: 'Total Articles', color: 'text-slate-900 dark:text-slate-100' },
              { id: 'draft', count: stats.draft, label: 'Drafts', color: 'text-slate-700 dark:text-slate-300' },
              { id: 'pending_review', count: stats.pending_review, label: 'Pending Review', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/40' },
              { id: 'changes_requested', count: stats.changes_requested, label: 'Action Required', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-800/40' },
              { id: 'published', count: stats.published, label: 'Published', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40' },
              { id: 'rejected', count: stats.rejected, label: 'Rejected', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50/50 dark:bg-red-950/20 border-red-200/60 dark:border-red-800/40' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => updateFilters({ status: st.id, page: 1 })}
                className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center shadow-sm hover:border-brand-500/50 transition-all cursor-pointer ${st.bg || ''} ${activeStatus === st.id ? 'ring-2 ring-brand-500/40' : ''}`}
              >
                <span className={`text-2xl font-extrabold block mb-1 ${st.color}`}>{st.count || 0}</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{st.label}</span>
              </button>
            ))}
          </div>

          {/* Filters & Search Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'draft', label: 'Drafts' },
                { id: 'pending_review', label: 'Pending Review' },
                { id: 'changes_requested', label: 'Changes Requested' },
                { id: 'published', label: 'Published' },
                { id: 'rejected', label: 'Rejected' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => updateFilters({ status: tab.id, page: 1 })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeStatus === tab.id
                      ? 'bg-brand-600 text-white font-semibold shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search my articles..."
                value={searchQuery}
                onChange={(e) => updateFilters({ search: e.target.value, page: 1 })}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Articles Listing Table */}
          {isLoading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
              <RefreshCw size={24} className="mx-auto text-brand-500 animate-spin mb-3" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading your articles...</p>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm">
              <AlertCircle size={32} className="mx-auto text-rose-500 mb-2" />
              <p className="text-xs text-rose-500 font-medium">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : articles.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
              <FileText size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">No Writer Articles Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {activeStatus !== 'all' || searchQuery
                  ? 'No articles match your selected filter criteria.'
                  : "You haven't created any articles yet. Write your first technical guide!"}
              </p>
              <Link
                to={APP_PATHS.WRITER_ARTICLE_NEW}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Plus size={14} />
                Create Article
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Article Title</th>
                      <th className="py-3.5 px-4">Editorial Status</th>
                      <th className="py-3.5 px-4">Updated / Published</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {articles.map((article) => {
                      const badge = STATUS_BADGES[article.status] || STATUS_BADGES.draft;
                      const formattedUpdated = new Date(article.updatedAt || article.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });

                      const formattedPublished = article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : null;

                      return (
                        <tr key={article.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                            <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{article.title}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{article.summary}</div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="group relative inline-block">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border cursor-help ${badge.color}`}>
                                <span>{badge.label}</span>
                                <Info size={11} className="opacity-60" />
                              </span>
                              <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-30 w-56 p-2 bg-slate-900 text-slate-100 text-[10px] rounded-lg shadow-lg leading-tight">
                                {badge.explanation}
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px]">
                            <div>Updated: {formattedUpdated}</div>
                            {formattedPublished && (
                              <div className="text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold mt-0.5">
                                Published: {formattedPublished}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-1.5">
                            {article.reviewHistory?.length > 0 && (
                              <button
                                onClick={() => setHistoryModalArticle(article)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer inline-flex items-center gap-1"
                                title="View Editorial History"
                              >
                                <History size={11} />
                                <span>History</span>
                              </button>
                            )}

                            {article.status === 'draft' && (
                              <>
                                <Link
                                  to={`/writer/articles/${article.id}/edit`}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                                >
                                  Edit
                                </Link>
                                <button
                                  onClick={() => handleSubmitForReview(article.id)}
                                  disabled={submittingId === article.id}
                                  className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                                >
                                  <Send size={11} />
                                  Submit
                                </button>
                              </>
                            )}

                            {article.status === 'changes_requested' && (
                              <>
                                <button
                                  onClick={() => setFeedbackModalArticle(article)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/80 hover:bg-rose-200 text-rose-700 dark:text-rose-300 font-semibold cursor-pointer inline-flex items-center gap-1"
                                >
                                  <MessageSquare size={11} />
                                  View Feedback
                                </button>
                                <Link
                                  to={`/writer/articles/${article.id}/edit`}
                                  className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold cursor-pointer"
                                >
                                  Edit & Resubmit
                                </Link>
                              </>
                            )}

                            {article.status === 'rejected' && (
                              <button
                                onClick={() => setFeedbackModalArticle(article)}
                                className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950 hover:bg-red-200 text-red-700 dark:text-red-300 font-semibold cursor-pointer inline-flex items-center gap-1"
                              >
                                <MessageSquare size={11} />
                                Rejection Reason
                              </button>
                            )}

                            {article.status === 'pending_review' && (
                              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 italic px-2">
                                Waiting for Admin Review
                              </span>
                            )}

                            {article.status === 'published' && (
                              <Link
                                to={`/articles/${article.slug}`}
                                target="_blank"
                                className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 text-emerald-700 dark:text-emerald-300 font-semibold cursor-pointer inline-flex items-center gap-1"
                              >
                                <ExternalLink size={11} />
                                View Published
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {pagination.pages > 1 && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div>
                    Page <span className="font-semibold text-slate-900 dark:text-slate-100">{pagination.page}</span> of{' '}
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{pagination.pages}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateFilters({ page: Math.max(1, currentPage - 1) })}
                      disabled={currentPage <= 1}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => updateFilters({ page: Math.min(pagination.pages, currentPage + 1) })}
                      disabled={currentPage >= pagination.pages}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Container>
      </div>

      {/* Feedback View Modal */}
      {feedbackModalArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl relative">
            <button
              onClick={() => setFeedbackModalArticle(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-semibold mb-3">
              <MessageSquare size={14} />
              <span>Editorial Feedback</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
              {feedbackModalArticle.title}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Review Status:{' '}
              <span className="font-semibold text-rose-600 dark:text-rose-400 uppercase">
                {feedbackModalArticle.status.replace('_', ' ')}
              </span>
            </p>

            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed mb-6">
              <span className="font-bold block text-rose-700 dark:text-rose-300 mb-1">Admin Feedback Note:</span>
              {feedbackModalArticle.reviewNote || 'No specific feedback provided.'}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setFeedbackModalArticle(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              {feedbackModalArticle.status === 'changes_requested' && (
                <Link
                  to={`/writer/articles/${feedbackModalArticle.id}/edit`}
                  onClick={() => setFeedbackModalArticle(null)}
                  className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Edit & Resubmit
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review History Modal */}
      {historyModalArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setHistoryModalArticle(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              {historyModalArticle.title}
            </h3>

            <div className="my-4">
              <ReviewHistory history={historyModalArticle.reviewHistory} />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setHistoryModalArticle(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default WriterDashboardPage;
