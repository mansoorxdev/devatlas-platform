import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Container from '../components/Container';
import writerService from '../services/writerService';
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
} from 'lucide-react';

const STATUS_BADGES = {
  draft: {
    label: 'DRAFT',
    color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  },
  pending_review: {
    label: 'PENDING REVIEW',
    color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  },
  changes_requested: {
    label: 'CHANGES REQUESTED',
    color: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  },
  rejected: {
    label: 'REJECTED',
    color: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800',
  },
  published: {
    label: 'PUBLISHED',
    color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  },
};

export function WriterDashboardPage() {
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
  const [activeStatus, setActiveStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);

  // Feedback view modal state
  const [feedbackModalArticle, setFeedbackModalArticle] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, articlesRes] = await Promise.all([
        writerService.getMyStats(),
        writerService.getMyArticles({
          page: pagination.page,
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
  }, [pagination.page, activeStatus, searchQuery]);

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

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center shadow-sm">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 block mb-1">
                {stats.total || 0}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Created</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center shadow-sm">
              <span className="text-2xl font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                {stats.draft || 0}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Drafts</span>
            </div>

            <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-2xl p-4 text-center shadow-sm">
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 block mb-1">
                {stats.pending_review || 0}
              </span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Pending Review</span>
            </div>

            <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 rounded-2xl p-4 text-center shadow-sm">
              <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 block mb-1">
                {stats.changes_requested || 0}
              </span>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Action Required</span>
            </div>

            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl p-4 text-center shadow-sm">
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 block mb-1">
                {stats.published || 0}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Published</span>
            </div>

            <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/40 rounded-2xl p-4 text-center shadow-sm">
              <span className="text-2xl font-extrabold text-red-600 dark:text-red-400 block mb-1">
                {stats.rejected || 0}
              </span>
              <span className="text-xs font-semibold text-red-600 dark:text-red-400">Rejected</span>
            </div>
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
                  onClick={() => {
                    setActiveStatus(tab.id);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
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
                onChange={(e) => setSearchQuery(e.target.value)}
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
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">No Articles Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {activeStatus !== 'all' || searchQuery
                  ? 'No articles match your selected filter criteria.'
                  : 'You have not created any articles yet. Write your first technical guide!'}
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
                      <th className="py-3.5 px-4">Article</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Last Updated</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {articles.map((article) => {
                      const badge = STATUS_BADGES[article.status] || STATUS_BADGES.draft;
                      const formattedDate = new Date(article.updatedAt || article.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });

                      return (
                        <tr key={article.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                            <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{article.title}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{article.summary}</div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px]">
                            {formattedDate}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-2">
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
                              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 italic">
                                Under Review
                              </span>
                            )}

                            {article.status === 'published' && (
                              <Link
                                to={`/articles/${article.slug}`}
                                target="_blank"
                                className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 text-emerald-700 dark:text-emerald-300 font-semibold cursor-pointer inline-flex items-center gap-1"
                              >
                                <ExternalLink size={11} />
                                View Public
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
                      onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page <= 1}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                      disabled={pagination.page >= pagination.pages}
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

      {/* Admin Feedback View Modal */}
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
              <span className="font-bold block text-rose-700 dark:text-rose-300 mb-1">Admin Note:</span>
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
    </>
  );
}

export default WriterDashboardPage;
