import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Container from '../components/Container';
import userService from '../services/userService';
import { APP_PATHS } from '../constants';
import {
  Users,
  Search,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  UserCheck,
  UserX,
  X,
  BarChart3,
  BookOpen,
} from 'lucide-react';

export function AdminWritersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const searchQuery = searchParams.get('search') || '';
  const currentStatus = searchParams.get('status') || 'all';

  const [writers, setWriters] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status toggle confirmation modal state
  const [targetWriter, setTargetWriter] = useState(null);
  const [isToggling, setIsToggling] = useState(false);

  const updateFilters = (newParams) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all' || (key === 'page' && value === 1)) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });
    setSearchParams(nextParams);
  };

  const fetchWriters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await userService.getWriters({
        page: currentPage,
        search: searchQuery,
        status: currentStatus,
      });

      if (res.success) {
        setWriters(res.data.items || []);
        setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch writer contributors.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, currentStatus]);

  useEffect(() => {
    fetchWriters();
  }, [fetchWriters]);

  const handleToggleStatus = async () => {
    if (!targetWriter) return;
    setIsToggling(true);
    try {
      await userService.toggleWriterStatus(targetWriter.id, !targetWriter.isActive);
      setTargetWriter(null);
      await fetchWriters();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update writer status.');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Writer Management & Analytics — Admin Portal</title>
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
                <Users size={14} />
                <span>Contributor Management</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Writer Directory & Analytics</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage active writer accounts, review contribution metrics, and view performance dashboards.
              </p>
            </div>
          </div>

          {/* Toolbar with Search and Status Filter Tabs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              {[
                { id: 'all', label: 'All Writers' },
                { id: 'active', label: 'Active Writers' },
                { id: 'deactivated', label: 'Deactivated' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => updateFilters({ status: tab.id, page: 1 })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    currentStatus === tab.id
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search writer by name or email..."
                  value={searchQuery}
                  onChange={(e) => updateFilters({ search: e.target.value, page: 1 })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Total Writers: <span className="font-bold text-slate-900 dark:text-slate-100">{pagination.total || 0}</span>
              </div>
            </div>
          </div>

          {/* Writers Table */}
          {isLoading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
              <RefreshCw size={24} className="mx-auto text-brand-500 animate-spin mb-3" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading writers directory...</p>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-sm">
              <AlertCircle size={32} className="mx-auto text-rose-500 mb-2" />
              <p className="text-xs text-rose-500 font-medium">{error}</p>
              <button
                onClick={fetchWriters}
                className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : writers.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
              <Users size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">No Writer Contributors Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery || currentStatus !== 'all' ? 'No writers match your search or filter criteria.' : 'There are no writer accounts registered yet.'}
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Writer Profile</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Articles Breakdown</th>
                      <th className="py-4 px-6">Assignments</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {writers.map((writer) => {
                      const stats = writer.stats || {};
                      const isActive = writer.isActive !== false;

                      return (
                        <tr key={writer.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {writer.avatar ? (
                                <img
                                  src={writer.avatar}
                                  alt={writer.name}
                                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-extrabold text-xs flex items-center justify-center">
                                  {writer.name[0].toUpperCase()}
                                </div>
                              )}
                              <div>
                                <Link
                                  to={`/portal-master/writers/${writer.id}`}
                                  className="font-bold text-slate-900 dark:text-slate-100 hover:text-brand-500 transition-colors"
                                >
                                  {writer.name}
                                </Link>
                                <div className="text-[11px] text-slate-400">{writer.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                isActive
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                              }`}
                            >
                              {isActive ? <UserCheck size={11} /> : <UserX size={11} />}
                              <span>{isActive ? 'ACTIVE' : 'DEACTIVATED'}</span>
                            </span>
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="flex items-center gap-3 text-[11px]">
                              <span className="font-bold text-slate-900 dark:text-slate-100">{stats.totalArticles || 0} Total</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{stats.publishedArticles || 0} Published</span>
                              <span className="text-amber-600 dark:text-amber-400 font-semibold">{stats.pendingReviewArticles || 0} Reviewing</span>
                            </div>
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="flex items-center gap-3 text-[11px]">
                              <span className="font-bold text-slate-900 dark:text-slate-100">{stats.totalAssignments || 0} Total</span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{stats.completedAssignments || 0} Completed</span>
                            </div>
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/portal-master/writers/${writer.id}`}
                                className="p-2 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-semibold"
                                title="View Performance Analytics"
                              >
                                <BarChart3 size={15} />
                                <span>Performance</span>
                              </Link>

                              <button
                                onClick={() => setTargetWriter(writer)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1 ${
                                  isActive
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                                }`}
                              >
                                {isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                                <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                              </button>
                            </div>
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

      {/* Confirmation Modal */}
      {targetWriter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-xl relative">
            <button
              onClick={() => setTargetWriter(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${targetWriter.isActive ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
              {targetWriter.isActive ? <UserX size={20} /> : <UserCheck size={20} />}
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              {targetWriter.isActive ? 'Deactivate Writer Account?' : 'Reactivate Writer Account?'}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {targetWriter.isActive ? (
                <>
                  Are you sure you want to deactivate <span className="font-bold text-slate-900 dark:text-slate-100">{targetWriter.name}</span> ({targetWriter.email})? Deactivated writers cannot log in or create/submit articles. Existing published articles remain intact.
                </>
              ) : (
                <>
                  Are you sure you want to reactivate <span className="font-bold text-slate-900 dark:text-slate-100">{targetWriter.name}</span> ({targetWriter.email})? They will regain access to their writer portal.
                </>
              )}
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setTargetWriter(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={isToggling}
                className={`px-5 py-2 text-white rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50 ${
                  targetWriter.isActive ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {isToggling ? <RefreshCw size={13} className="animate-spin" /> : targetWriter.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                <span>{targetWriter.isActive ? 'Confirm Deactivation' : 'Confirm Reactivation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminWritersPage;
