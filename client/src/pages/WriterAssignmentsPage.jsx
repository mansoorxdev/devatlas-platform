import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Container from '../components/Container';
import assignmentService from '../services/assignmentService';
import { APP_PATHS } from '../constants';
import {
  FileText,
  Clock,
  Tag,
  AlertCircle,
  RefreshCw,
  Eye,
  PenTool,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export function WriterAssignmentsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentStatus = searchParams.get('status') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startingId, setStartingId] = useState(null);
  const [selectedBrief, setSelectedBrief] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, [currentStatus, currentPage]);

  const fetchAssignments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await assignmentService.getWriterAssignments({
        page: currentPage,
        limit: 9,
        status: currentStatus,
      });
      if (res.success && res.data) {
        setAssignments(res.data.items || []);
        setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load your content briefs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWriting = async (assignment) => {
    setStartingId(assignment.id);
    try {
      if (assignment.status === 'assigned') {
        await assignmentService.startAssignmentWriter(assignment.id);
      }
      navigate(`${APP_PATHS.WRITER_ARTICLE_NEW}?assignmentId=${assignment.id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to start assignment.');
    } finally {
      setStartingId(null);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'high':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'low':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'submitted':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'in_progress':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'cancelled':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <>
      <Helmet>
        <title>My Content Assignments — Writer Portal</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10">
        <Container className="max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">Assigned Content Briefs</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              View your editorial assignments, target keywords, word count goals, and deadlines.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 rounded-2xl text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2.5 shadow-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 mb-6">
            {['all', 'assigned', 'in_progress', 'submitted', 'completed', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setSearchParams({ status: st, page: '1' })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  currentStatus === st
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Assignments Grid */}
          {isLoading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
              <RefreshCw size={24} className="mx-auto text-brand-500 animate-spin mb-3" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Loading assigned briefs...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
              <FileText size={36} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Assignments Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                You have no assigned content briefs matching this status. You can still create independent articles anytime!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.map((item) => {
                const isOverdue = new Date(item.deadline) < new Date() && item.status !== 'completed' && item.status !== 'cancelled';
                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-brand-500/40 transition-colors"
                  >
                    <div>
                      {/* Priority & Status Header */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getPriorityBadge(item.priority)}`}>
                          {item.priority}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2 mb-2">
                        {item.title}
                      </h3>

                      {/* Brief Snippet */}
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                        {item.brief}
                      </p>

                      {/* Target Keywords */}
                      {item.targetKeywords?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {item.targetKeywords.map((kw) => (
                            <span key={kw} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                              #{kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Stats & Action */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock size={13} className={isOverdue ? 'text-rose-500' : 'text-slate-400'} />
                          <span className={isOverdue ? 'text-rose-500 font-bold' : ''}>
                            {new Date(item.deadline).toLocaleDateString()}
                          </span>
                        </span>
                        <span className="font-semibold">{item.targetWordCount} words</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedBrief(item)}
                          className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                        >
                          <Eye size={13} />
                          <span>View Brief</span>
                        </button>

                        {item.status !== 'cancelled' && item.status !== 'completed' && (
                          <button
                            onClick={() => handleStartWriting(item)}
                            disabled={startingId === item.id}
                            className="flex-1 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            {startingId === item.id ? (
                              <RefreshCw size={13} className="animate-spin" />
                            ) : (
                              <PenTool size={13} />
                            )}
                            <span>{item.status === 'assigned' ? 'Start Writing' : 'Continue Writing'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Footer */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-8">
              <button
                onClick={() => setSearchParams({ status: currentStatus, page: (currentPage - 1).toString() })}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                Page {currentPage} of {pagination.pages}
              </span>

              <button
                onClick={() => setSearchParams({ status: currentStatus, page: (currentPage + 1).toString() })}
                disabled={currentPage === pagination.pages}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </Container>
      </div>

      {/* Brief View Modal */}
      {selectedBrief && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-xl relative">
            <button
              onClick={() => setSelectedBrief(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <Eye size={18} />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-4">
              {selectedBrief.title}
            </h3>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs space-y-3 mb-6">
              <div>
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Content Brief</span>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedBrief.brief}</p>
              </div>

              {selectedBrief.targetKeywords?.length > 0 && (
                <div>
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Target SEO Keywords</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedBrief.targetKeywords.map((k) => (
                      <span key={k} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                        #{k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedBrief(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              {selectedBrief.status !== 'cancelled' && selectedBrief.status !== 'completed' && (
                <button
                  onClick={() => handleStartWriting(selectedBrief)}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <PenTool size={13} />
                  <span>Start Article</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default WriterAssignmentsPage;
