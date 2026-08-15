import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Container from '../components/Container';
import editorialService from '../services/editorialService';
import AdminReviewModal from '../components/AdminReviewModal';
import { APP_PATHS } from '../constants';
import {
  CheckSquare,
  Search,
  RefreshCw,
  AlertCircle,
  Clock,
  User,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react';

const STATUS_BADGES = {
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

export function AdminReviewQueuePage() {
  const [queueItems, setQueueItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [activeStatus, setActiveStatus] = useState('pending_review');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review modal target article
  const [selectedArticle, setSelectedArticle] = useState(null);

  const fetchReviewQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await editorialService.getReviewQueue({
        page: pagination.page,
        status: activeStatus,
        search: searchQuery,
      });

      if (res.success) {
        setQueueItems(res.data.items || []);
        setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch editorial review queue.');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, activeStatus, searchQuery]);

  useEffect(() => {
    fetchReviewQueue();
  }, [fetchReviewQueue]);

  return (
    <>
      <Helmet>
        <title>Editorial Review Queue — DevAtlas Master</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10">
        <Container className="max-w-6xl">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link
              to={APP_PATHS.ADMIN}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Admin Master</span>
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold mb-2">
                <CheckSquare size={14} />
                <span>Editorial Workflow</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Article Review Queue</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Review contributor submissions, request changes, or approve and publish to DevAtlas.
              </p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {[
                { id: 'pending_review', label: 'Pending Review' },
                { id: 'changes_requested', label: 'Changes Requested' },
                { id: 'rejected', label: 'Rejected' },
                { id: 'all', label: 'All Review Items' },
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
                placeholder="Search queue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Queue Content */}
          {isLoading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
              <RefreshCw size={24} className="mx-auto text-brand-500 animate-spin mb-3" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading review queue...</p>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm">
              <AlertCircle size={32} className="mx-auto text-rose-500 mb-2" />
              <p className="text-xs text-rose-500 font-medium">{error}</p>
              <button
                onClick={fetchReviewQueue}
                className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : queueItems.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
              <CheckSquare size={40} className="mx-auto text-emerald-400 mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Review Queue Empty</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {activeStatus === 'pending_review'
                  ? 'All contributor submissions have been reviewed!'
                  : 'No articles match the selected review status.'}
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Submitted Article</th>
                      <th className="py-3.5 px-4">Author</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Updated</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {queueItems.map((article) => {
                      const badge = STATUS_BADGES[article.status] || STATUS_BADGES.pending_review;
                      const formattedDate = new Date(article.updatedAt || article.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });

                      const authorName = article.author?.name || 'Unknown Author';
                      const authorEmail = article.author?.email || '';

                      return (
                        <tr key={article.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                            <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{article.title}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{article.summary}</div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{authorName}</div>
                            <div className="text-[11px] text-slate-400">{authorEmail}</div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px]">
                            {formattedDate}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => setSelectedArticle(article)}
                              className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                            >
                              <Eye size={13} />
                              <span>Review Submission</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
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

      {/* Review Modal */}
      {selectedArticle && (
        <AdminReviewModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onSuccess={fetchReviewQueue}
        />
      )}
    </>
  );
}

export default AdminReviewQueuePage;
