import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Container from '../components/Container';
import userService from '../services/userService';
import { APP_PATHS } from '../constants';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Globe,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Sparkles,
  BarChart3,
  Award,
  BookOpen,
  RefreshCw,
  Ban,
  ShieldCheck,
  Tag,
  ExternalLink,
} from 'lucide-react';

export function AdminWriterPerformancePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    fetchPerformanceData();
  }, [id]);

  const fetchPerformanceData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await userService.getWriterPerformance(id);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load writer performance data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!data?.writer) return;
    setIsTogglingStatus(true);
    try {
      const newStatus = !data.writer.isActive;
      await userService.toggleWriterStatus(id, newStatus);
      setShowStatusModal(false);
      fetchPerformanceData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update writer status.');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10">
        <Container className="max-w-5xl text-center py-20">
          <RefreshCw size={32} className="mx-auto text-brand-500 animate-spin mb-4" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading writer performance analytics...</p>
        </Container>
      </div>
    );
  }

  if (error || !data?.writer) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10">
        <Container className="max-w-5xl">
          <Link
            to={APP_PATHS.ADMIN_WRITERS}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-500 mb-6"
          >
            <ArrowLeft size={14} />
            <span>Back to Writer Management</span>
          </Link>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
            <AlertCircle size={36} className="mx-auto text-rose-500 mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Error Loading Writer</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">{error || 'Writer not found.'}</p>
          </div>
        </Container>
      </div>
    );
  }

  const { writer, articleStats, assignmentStats, performanceMetrics, recentArticles, recentAssignments } = data;

  return (
    <>
      <Helmet>
        <title>{writer.name} — Writer Performance Dashboard</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10">
        <Container className="max-w-5xl">
          {/* Back Navigation */}
          <Link
            to={APP_PATHS.ADMIN_WRITERS}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-500 mb-6 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Writer Directory</span>
          </Link>

          {/* Header Profile Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4">
                {writer.avatar ? (
                  <img
                    src={writer.avatar}
                    alt={writer.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-brand-500/20"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 text-2xl font-black flex items-center justify-center border-2 border-brand-500/20">
                    {writer.name[0].toUpperCase()}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                      {writer.name}
                    </h1>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        writer.isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {writer.isActive ? 'Active Writer' : 'Deactivated'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap mb-2">
                    <span className="flex items-center gap-1"><Mail size={13} /> {writer.email}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar size={13} /> Joined {new Date(writer.createdAt).toLocaleDateString()}</span>
                  </p>

                  {writer.bio && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                      {writer.bio}
                    </p>
                  )}

                  {writer.expertise?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {writer.expertise.map((exp) => (
                        <span key={exp} className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {exp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <button
                  onClick={() => setShowStatusModal(true)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    writer.isActive
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200'
                  }`}
                >
                  {writer.isActive ? <Ban size={14} /> : <ShieldCheck size={14} />}
                  <span>{writer.isActive ? 'Deactivate Writer' : 'Activate Writer'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Performance Gauges Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Publication Rate</span>
                <Award size={18} className="text-brand-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
                {performanceMetrics.publicationRate}%
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Published vs Total Submissions</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Assignment Completion</span>
                <BarChart3 size={18} className="text-indigo-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
                {performanceMetrics.assignmentCompletionRate}%
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Completed vs Assigned Briefs</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Articles Published</span>
                <CheckCircle2 size={18} className="text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
                {articleStats.published}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Total Live Articles</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
                <Clock size={18} className="text-amber-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
                {articleStats.pending_review}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Awaiting Admin Review</p>
            </div>
          </div>

          {/* Stats Breakdown Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Article Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText size={16} className="text-brand-500" />
                <span>Article Editorial Breakdown</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Articles</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{articleStats.total}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Published</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{articleStats.published}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Drafts</span>
                  <span className="text-lg font-bold text-slate-600 dark:text-slate-400">{articleStats.draft}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pending Review</span>
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{articleStats.pending_review}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Changes Requested</span>
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{articleStats.changes_requested}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Rejected</span>
                  <span className="text-lg font-bold text-rose-600 dark:text-rose-400">{articleStats.rejected}</span>
                </div>
              </div>
            </div>

            {/* Assignment Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-500" />
                <span>Assignment & Brief Breakdown</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Assignments</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{assignmentStats.total}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Completed</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{assignmentStats.completed}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{assignmentStats.assigned}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">In Progress</span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{assignmentStats.in_progress}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Submitted</span>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{assignmentStats.submitted}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Cancelled</span>
                  <span className="text-lg font-bold text-rose-600 dark:text-rose-400">{assignmentStats.cancelled}</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Toggle Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-xl relative">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-2">
              {writer.isActive ? 'Deactivate Writer Account?' : 'Activate Writer Account?'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {writer.isActive
                ? `Deactivating ${writer.name} will block them from logging in and submitting articles. Published articles will remain visible.`
                : `Activating ${writer.name} will restore their access to the Writer Portal and content editor.`}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={isTogglingStatus}
                className={`px-5 py-2 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50 ${
                  writer.isActive ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                }`}
              >
                {isTogglingStatus ? <RefreshCw size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                <span>Confirm {writer.isActive ? 'Deactivation' : 'Activation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminWriterPerformancePage;
