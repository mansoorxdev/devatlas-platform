import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import Container from '../components/Container';
import userService from '../services/userService';
import { resolveAvatarUrl } from '../constants/avatars';
import {
  UserCheck,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Award,
  Check,
  Ban,
  MessageSquare,
} from 'lucide-react';

export function AdminWriterApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Sync parameters with URL search params
  const currentStatus = searchParams.get('status') || 'pending';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await userService.getWriterApplications({
        status: currentStatus,
        search: currentSearch,
        page: currentPage,
        limit: 10,
      });

      if (res.success) {
        setApplications(res.data.items || []);
        setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch writer applications.');
    } finally {
      setIsLoading(false);
    }
  }, [currentStatus, currentSearch, currentPage]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleTabChange = (status) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('status', status);
      p.set('page', '1');
      return p;
    });
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (val) p.set('search', val);
      else p.delete('search');
      p.set('page', '1');
      return p;
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('page', newPage.toString());
      return p;
    });
  };

  const handleApprove = async (appId) => {
    setIsProcessing(true);
    setModalError(null);
    try {
      const res = await userService.approveWriterApplication(appId);
      if (res.success) {
        setActionSuccess('Writer application approved successfully!');
        setSelectedApp(null);
        fetchApplications();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      setModalError(err.response?.data?.error?.message || 'Failed to approve writer application.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (appId) => {
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      setModalError('Rejection reason must be at least 5 characters long.');
      return;
    }

    setIsProcessing(true);
    setModalError(null);
    try {
      const res = await userService.rejectWriterApplication(appId, rejectionReason);
      if (res.success) {
        setActionSuccess('Writer application rejected.');
        setSelectedApp(null);
        setRejectionReason('');
        setShowRejectInput(false);
        fetchApplications();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      setModalError(err.response?.data?.error?.message || 'Failed to reject writer application.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Writer Applications & Contributor Review | Admin Portal</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10">
        <Container className="max-w-6xl">
          {/* Header */}
          <div className="pb-6 border-b border-slate-200 dark:border-slate-800 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold mb-2">
                <UserCheck size={14} />
                <span>Editorial Onboarding Queue</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Writer Applications</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Review contributor applications, evaluate technical experience, and grant writer privileges.
              </p>
            </div>
          </div>

          {/* Banners */}
          {actionSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl mb-6 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{actionSuccess}</span>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-4 rounded-2xl mb-6 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
            {/* Status Tabs */}
            <div className="flex items-center bg-slate-200/60 dark:bg-slate-900 p-1 rounded-2xl gap-1 overflow-x-auto">
              {[
                { id: 'pending', label: 'Pending Review' },
                { id: 'approved', label: 'Approved Writers' },
                { id: 'rejected', label: 'Rejected' },
                { id: 'all', label: 'All Applications' },
              ].map((tab) => {
                const isActive = currentStatus === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search applicant name or email..."
                value={currentSearch}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="py-20 text-center text-slate-500 text-xs">
                <RefreshCw size={24} className="mx-auto text-brand-500 animate-spin mb-2" />
                <span>Loading writer applications...</span>
              </div>
            ) : applications.length === 0 ? (
              <div className="py-20 text-center space-y-2">
                <UserCheck size={32} className="mx-auto text-slate-400 opacity-60" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No applications found</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  There are no writer applications matching the selected criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                    <tr>
                      <th className="py-4 px-6">Applicant</th>
                      <th className="py-4 px-6">Applied Date</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Expertise</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {applications.map((app) => {
                      const isPending = app.writerStatus === 'pending';
                      const isApproved = app.writerStatus === 'approved';
                      const isRejected = app.writerStatus === 'rejected';

                      return (
                        <tr key={app._id || app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={resolveAvatarUrl(app.avatar)}
                                alt={app.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 dark:text-slate-100">{app.name}</div>
                                <div className="text-[11px] text-slate-500 font-mono">{app.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap">
                            {isPending && (
                              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                                <Clock size={12} />
                                <span>Pending</span>
                              </span>
                            )}
                            {isApproved && (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                                <CheckCircle2 size={12} />
                                <span>Approved</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                                <XCircle size={12} />
                                <span>Rejected</span>
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-6">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {app.expertise?.slice(0, 3).map((exp) => (
                                <span
                                  key={exp}
                                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-400"
                                >
                                  {exp}
                                </span>
                              ))}
                              {app.expertise?.length > 3 && (
                                <span className="text-[10px] text-slate-400 font-bold">+{app.expertise.length - 3}</span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                setRejectionReason('');
                                setShowRejectInput(false);
                                setModalError(null);
                              }}
                              className="px-3 py-1.5 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                              Review Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4">
              <img
                src={resolveAvatarUrl(selectedApp.avatar)}
                alt={selectedApp.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-brand-500/20"
              />
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{selectedApp.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedApp.email}</p>
                <div className="mt-1">
                  {selectedApp.writerStatus === 'pending' && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-600">
                      Status: Pending Review
                    </span>
                  )}
                  {selectedApp.writerStatus === 'approved' && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                      Status: Approved Writer
                    </span>
                  )}
                  {selectedApp.writerStatus === 'rejected' && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-600">
                      Status: Rejected
                    </span>
                  )}
                </div>
              </div>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 rounded-xl flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{modalError}</span>
              </div>
            )}

            {/* Bio & Expertise */}
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                  <FileText size={12} />
                  <span>Author Bio / Experience</span>
                </h4>
                <p className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedApp.bio || 'No bio provided.'}
                </p>
              </div>

              <div>
                <h4 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                  <Award size={12} />
                  <span>Expertise Tags</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApp.expertise?.length > 0 ? (
                    selectedApp.expertise.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No expertise specified.</span>
                  )}
                </div>
              </div>

              {selectedApp.applicationNote && (
                <div>
                  <h4 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                    <MessageSquare size={12} />
                    <span>Review Feedback Note</span>
                  </h4>
                  <p className="p-3 bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-300 font-medium">
                    "{selectedApp.applicationNote}"
                  </p>
                </div>
              )}
            </div>

            {/* Rejection Form Input */}
            {showRejectInput && (
              <div className="p-4 bg-rose-50/50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                  Rejection Feedback Reason (Min 5 Characters) *
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide a constructive reason explaining why the application was declined..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
            )}

            {/* Modal Action Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
              {showRejectInput ? (
                <>
                  <button
                    onClick={() => handleReject(selectedApp._id || selectedApp.id)}
                    disabled={isProcessing}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Ban size={14} />}
                    <span>Confirm Rejection</span>
                  </button>
                  <button
                    onClick={() => setShowRejectInput(false)}
                    disabled={isProcessing}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleApprove(selectedApp._id || selectedApp.id)}
                    disabled={isProcessing || selectedApp.writerStatus === 'approved'}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                    <span>Approve Writer Application</span>
                  </button>
                  <button
                    onClick={() => setShowRejectInput(true)}
                    disabled={isProcessing}
                    className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Ban size={14} />
                    <span>Reject Application</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminWriterApplicationsPage;
