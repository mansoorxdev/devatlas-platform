import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Container from '../components/Container';
import assignmentService from '../services/assignmentService';
import userService from '../services/userService';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  Eye,
  Calendar,
  Tag,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Ban,
  Sparkles,
} from 'lucide-react';

export function AdminAssignmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentStatus = searchParams.get('status') || 'all';
  const currentPriority = searchParams.get('priority') || 'all';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [writers, setWriters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Search input state
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Create Assignment Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    brief: '',
    writer: '',
    category: 'Backend',
    language: 'English',
    targetKeywords: [],
    targetWordCount: 1200,
    deadline: '',
    priority: 'medium',
    additionalInstructions: '',
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Detail View Modal State
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Cancel Confirmation Modal State
  const [cancelAssignmentId, setCancelAssignmentId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchWriters();
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [currentStatus, currentPriority, currentSearch, currentPage]);

  const fetchWriters = async () => {
    try {
      const res = await userService.getWriters({ limit: 100 });
      if (res.success && res.data?.items) {
        setWriters(res.data.items.filter((w) => w.isActive));
      }
    } catch (err) {}
  };

  const fetchAssignments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await assignmentService.getAdminAssignments({
        page: currentPage,
        limit: 10,
        status: currentStatus,
        priority: currentPriority,
        search: currentSearch,
      });
      if (res.success && res.data) {
        setAssignments(res.data.items || []);
        setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load content briefs & assignments.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilters = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() });
  };

  const handleAddKeyword = (e) => {
    if (e) e.preventDefault();
    const kw = keywordInput.trim();
    if (!kw) return;
    if (createFormData.targetKeywords.includes(kw)) {
      setKeywordInput('');
      return;
    }
    setCreateFormData({
      ...createFormData,
      targetKeywords: [...createFormData.targetKeywords, kw],
    });
    setKeywordInput('');
  };

  const handleRemoveKeyword = (kwToRemove) => {
    setCreateFormData({
      ...createFormData,
      targetKeywords: createFormData.targetKeywords.filter((k) => k !== kwToRemove),
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmittingCreate(true);

    try {
      await assignmentService.createAssignment(createFormData);
      setSuccessMessage('Content brief assignment created and sent to writer!');
      setTimeout(() => setSuccessMessage(''), 4000);
      setShowCreateModal(false);
      setCreateFormData({
        title: '',
        brief: '',
        writer: '',
        category: 'Backend',
        language: 'English',
        targetKeywords: [],
        targetWordCount: 1200,
        deadline: '',
        priority: 'medium',
        additionalInstructions: '',
      });
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create assignment.');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleCancelAssignment = async () => {
    if (!cancelAssignmentId) return;
    setIsCancelling(true);
    try {
      await assignmentService.cancelAssignmentAdmin(cancelAssignmentId);
      setSuccessMessage('Assignment cancelled.');
      setTimeout(() => setSuccessMessage(''), 3000);
      setCancelAssignmentId(null);
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to cancel assignment.');
    } finally {
      setIsCancelling(false);
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
        <title>Writer Assignments & Briefs — Admin Portal</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10">
        <Container className="max-w-6xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Writer Content Briefs & Assignments</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Assign editorial topics, content briefs, target keywords, and deadlines to writers.
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Plus size={16} />
              <span>Create Assignment</span>
            </button>
          </div>

          {/* Banners */}
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2.5 shadow-sm">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 rounded-2xl text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2.5 shadow-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Filters & Search Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm mb-6 space-y-4">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-4">
              {['all', 'assigned', 'in_progress', 'submitted', 'completed', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => updateFilters({ status: st })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer ${
                    currentStatus === st
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Search & Priority Filter Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by assignment title..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </form>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={currentPriority}
                  onChange={(e) => updateFilters({ priority: e.target.value })}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Assignments Table / List */}
          {isLoading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
              <RefreshCw size={24} className="mx-auto text-brand-500 animate-spin mb-3" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Loading writer assignments...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
              <FileText size={36} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Assignments Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                No content briefs match your filter criteria. Click "Create Assignment" to assign a new topic.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                  <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Assigned Writer</th>
                      <th className="px-6 py-4">Title / Category</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Deadline</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {assignments.map((item) => {
                      const isOverdue = new Date(item.deadline) < new Date() && item.status !== 'completed' && item.status !== 'cancelled';
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                              {item.writer?.avatar ? (
                                <img
                                  src={item.writer.avatar}
                                  alt={item.writer.name}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-500 font-extrabold text-xs flex items-center justify-center">
                                  {item.writer?.name ? item.writer.name[0].toUpperCase() : 'W'}
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100">
                                  {item.writer?.name || 'Unassigned'}
                                </div>
                                <div className="text-[10px] text-slate-400">{item.writer?.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                              {item.title}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{item.category} • {item.targetWordCount} words</div>
                          </td>

                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getPriorityBadge(item.priority)}`}>
                              {item.priority}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className={`flex items-center gap-1 text-xs font-semibold ${isOverdue ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                              <Clock size={12} />
                              <span>{new Date(item.deadline).toLocaleDateString()}</span>
                            </div>
                            {isOverdue && <span className="text-[9px] font-bold text-rose-500 uppercase">Overdue</span>}
                          </td>

                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(item.status)}`}>
                              {item.status.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedAssignment(item)}
                                className="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="View Assignment Details"
                              >
                                <Eye size={15} />
                              </button>

                              {item.status !== 'completed' && item.status !== 'cancelled' && (
                                <button
                                  onClick={() => setCancelAssignmentId(item.id)}
                                  className="p-1.5 text-slate-500 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Cancel Assignment"
                                >
                                  <Ban size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateFilters({ page: (currentPage - 1).toString() })}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => updateFilters({ page: (currentPage + 1).toString() })}
                      disabled={currentPage === pagination.pages}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Container>
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-xl relative my-8">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-1">
              Create Content Brief & Assignment
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Assign a technical topic with guidelines, target keywords, and deadline to a writer.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Select Writer *
                  </label>
                  <select
                    required
                    value={createFormData.writer}
                    onChange={(e) => setCreateFormData({ ...createFormData, writer: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="">-- Choose Active Writer --</option>
                    {writers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Priority *
                  </label>
                  <select
                    value={createFormData.priority}
                    onChange={(e) => setCreateFormData({ ...createFormData, priority: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master-Slave Replication in PostgreSQL"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Content Brief & Outline *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail the target audience, key subheadings, code examples expected, and depth..."
                  value={createFormData.brief}
                  onChange={(e) => setCreateFormData({ ...createFormData, brief: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={createFormData.category}
                    onChange={(e) => setCreateFormData({ ...createFormData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Target Word Count
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={20000}
                    value={createFormData.targetWordCount}
                    onChange={(e) => setCreateFormData({ ...createFormData, targetWordCount: parseInt(e.target.value, 10) })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={createFormData.deadline}
                    onChange={(e) => setCreateFormData({ ...createFormData, deadline: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* Target Keywords */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Target SEO Keywords
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Type keyword & press Enter"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddKeyword();
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Add Keyword
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {createFormData.targetKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-medium"
                    >
                      <Tag size={11} />
                      <span>{kw}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(kw)}
                        className="hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingCreate ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />}
                  <span>Assign Content Brief</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-xl relative">
            <button
              onClick={() => setSelectedAssignment(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getPriorityBadge(selectedAssignment.priority)}`}>
                {selectedAssignment.priority} Priority
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(selectedAssignment.status)}`}>
                {selectedAssignment.status.replace('_', ' ')}
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-4">
              {selectedAssignment.title}
            </h3>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs space-y-3 mb-6">
              <div>
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Content Brief</span>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedAssignment.brief}</p>
              </div>

              {selectedAssignment.targetKeywords?.length > 0 && (
                <div>
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">SEO Keywords</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedAssignment.targetKeywords.map((k) => (
                      <span key={k} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                        #{k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>Assigned Writer: <strong className="text-slate-900 dark:text-slate-100">{selectedAssignment.writer?.name}</strong></div>
                <div>Target Words: <strong className="text-slate-900 dark:text-slate-100">{selectedAssignment.targetWordCount} words</strong></div>
                <div>Deadline: <strong className="text-slate-900 dark:text-slate-100">{new Date(selectedAssignment.deadline).toLocaleDateString()}</strong></div>
                <div>Category: <strong className="text-slate-900 dark:text-slate-100">{selectedAssignment.category}</strong></div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelAssignmentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-xl relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
              <Ban size={22} />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-2">
              Cancel Content Brief Assignment?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              This will set the assignment status to cancelled. Any article created from this assignment will remain intact and will not be deleted.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelAssignmentId(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Keep Assignment
              </button>
              <button
                onClick={handleCancelAssignment}
                disabled={isCancelling}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {isCancelling ? <RefreshCw size={13} className="animate-spin" /> : <Ban size={13} />}
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminAssignmentsPage;
