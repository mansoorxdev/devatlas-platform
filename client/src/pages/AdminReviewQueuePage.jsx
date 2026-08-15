import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Container from '../components/Container';
import editorialService from '../services/editorialService';
import userService from '../services/userService';
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
  Filter,
  BookOpen,
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
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-synchronized filters
  const activeStatus = searchParams.get('status') || 'pending_review';
  const selectedWriter = searchParams.get('writer') || 'all';
  const selectedCategory = searchParams.get('category') || 'all';
  const selectedLanguage = searchParams.get('language') || 'all';
  const selectedIsAssigned = searchParams.get('isAssigned') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const searchQuery = searchParams.get('search') || '';

  const [queueItems, setQueueItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [writers, setWriters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review modal target article
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    fetchWritersList();
  }, []);

  const fetchWritersList = async () => {
    try {
      const res = await userService.getWriters({ limit: 100 });
      if (res.success && res.data?.items) {
        setWriters(res.data.items);
      }
    } catch (err) {}
  };

  const updateFilters = (newParams) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all' || (key === 'status' && value === 'pending_review') || (key === 'page' && value === 1)) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });
    setSearchParams(nextParams);
  };

  const fetchReviewQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await editorialService.getReviewQueue({
        page: currentPage,
        status: activeStatus,
        writer: selectedWriter,
        category: selectedCategory,
        language: selectedLanguage,
        isAssigned: selectedIsAssigned,
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
  }, [currentPage, activeStatus, selectedWriter, selectedCategory, selectedLanguage, selectedIsAssigned, searchQuery]);

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
          {/* Top Navigation */}
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold mb-2">
                <CheckSquare size={14} />
                <span>Editorial Governance</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Article Review Queue</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Review submitted writer articles, request revisions, and approve publications.
              </p>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm mb-6 space-y-4">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-4">
              {[
                { id: 'pending_review', label: 'Pending Review' },
                { id: 'changes_requested', label: 'Changes Requested' },
                { id: 'rejected', label: 'Rejected' },
                { id: 'published', label: 'Published' },
                { id: 'all', label: 'All Articles' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => updateFilters({ status: tab.id, page: 1 })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    activeStatus === tab.id
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sub-Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative sm:col-span-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search title, summary, or author..."
                  value={searchQuery}
                  onChange={(e) => updateFilters({ search: e.target.value, page: 1 })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              {/* Writer Filter */}
              <div>
                <select
                  value={selectedWriter}
                  onChange={(e) => updateFilters({ writer: e.target.value, page: 1 })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="all">All Writers</option>
                  {writers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignment Filter */}
              <div>
                <select
                  value={selectedIsAssigned}
                  onChange={(e) => updateFilters({ isAssigned: e.target.value, page: 1 })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="all">All Submissions</option>
                  <option value="true">Assigned Briefs Only</option>
                  <option value="false">Self-Created Only</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => updateFilters({ category: e.target.value, page: 1 })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="Backend">Backend</option>
                  <option value="Frontend">Frontend</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Database">Database</option>
                  <option value="Security">Security</option>
                </select>
              </div>
            </div>
          </div>

          {/* Queue List */}
          {isLoading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
              <RefreshCw size={24} className="mx-auto text-brand-500 animate-spin mb-3" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading review queue...</p>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-sm">
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
              <CheckSquare size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Review Queue Empty</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                No articles matching this status or filter criteria.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Submitted Article</th>
                      <th className="py-4 px-6">Author</th>
                      <th className="py-4 px-6">Source</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Submitted Date</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {queueItems.map((article) => {
                      const badge = STATUS_BADGES[article.status] || STATUS_BADGES.pending_review;
                      return (
                        <tr key={article.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1 max-w-xs">{article.title}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{article.category} • {article.readTime || 1} min read</div>
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {article.author?.avatar ? (
                                <img src={article.author.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                              ) : (
                                <User size={14} className="text-slate-400" />
                              )}
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{article.author?.name || 'Writer'}</span>
                            </div>
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap">
                            {article.assignment ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                <BookOpen size={10} />
                                <span>ASSIGNED</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-semibold uppercase">Self-Created</span>
                            )}
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${badge.color}`}>
                              {badge.label}
                            </span>
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px]">
                            {new Date(article.updatedAt || article.createdAt).toLocaleDateString()}
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap text-right">
                            <button
                              onClick={() => setSelectedArticle(article)}
                              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                            >
                              <Eye size={13} />
                              <span>Review Article</span>
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

      {/* Editorial Review Modal */}
      {selectedArticle && (
        <AdminReviewModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onActionSuccess={() => {
            setSelectedArticle(null);
            fetchReviewQueue();
          }}
        />
      )}
    </>
  );
}

export default AdminReviewQueuePage;
