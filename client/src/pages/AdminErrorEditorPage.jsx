import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  AlertOctagon,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  X,
  Plus,
  RefreshCw,
  FileCode,
  Layers,
  HelpCircle,
  CheckSquare,
} from 'lucide-react';
import { errorService } from '@features/errors';
import { APP_PATHS } from '@/constants';
import Container from '@components/Container';

const SUPPORTED_CATEGORIES = [
  { value: 'database', label: 'Database' },
  { value: 'authentication', label: 'Authentication' },
  { value: 'build-tooling', label: 'Build & Tooling' },
  { value: 'runtime-exception', label: 'Runtime Exception' },
  { value: 'api-network', label: 'API / Network' },
  { value: 'environment-config', label: 'Environment / Config' },
];

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'shell', label: 'Shell' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
];

export function AdminErrorEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Form Field States
  const [title, setTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [category, setCategory] = useState('database');
  const [language, setLanguage] = useState('javascript');
  const [cause, setCause] = useState('');
  const [solution, setSolution] = useState('');
  const [codeFix, setCodeFix] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [initialError, setInitialError] = useState(null);

  // UI & Loading States
  const [isLoadingError, setIsLoadingError] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);

  // Fetch Error Solution for Edit Mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchErrorSolution = async () => {
      setIsLoadingError(true);
      setGlobalError(null);
      try {
        const response = await errorService.getAdminErrorById(id);
        if (response?.success && response?.data?.errorSolution) {
          const item = response.data.errorSolution;
          setInitialError(item);
          setTitle(item.title || '');
          setErrorMessage(item.errorMessage || '');
          setCategory(item.category || 'database');
          setLanguage(item.language || 'javascript');
          setCause(item.cause || '');
          setSolution(item.solution || '');
          setCodeFix(item.codeFix || '');
          setTags(item.tags || []);
        } else {
          setGlobalError('Error solution not found.');
        }
      } catch (err) {
        console.error('Failed to load error solution for edit:', err);
        setGlobalError(err.response?.data?.error?.message || 'Failed to load error solution details.');
      } finally {
        setIsLoadingError(false);
      }
    };

    fetchErrorSolution();
  }, [id, isEditMode]);

  // Code Fix Live Statistics
  const codeStats = {
    lines: codeFix ? codeFix.split('\n').length : 0,
    chars: codeFix.length,
    words: codeFix.trim() ? codeFix.trim().split(/\s+/).length : 0,
  };

  // Tag Manager Handlers
  const handleAddTag = () => {
    const formatted = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (!formatted) return;
    if (tags.includes(formatted)) {
      setTagInput('');
      return;
    }
    setTags((prev) => [...prev, formatted]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Client-side Field Validation
  const validateForm = () => {
    const errors = {};
    if (!title.trim()) {
      errors.title = 'Title is required.';
    } else if (title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters.';
    } else if (title.trim().length > 200) {
      errors.title = 'Title cannot exceed 200 characters.';
    }

    if (!errorMessage.trim()) {
      errors.errorMessage = 'Raw error message is required.';
    }

    if (!category) {
      errors.category = 'Category selection is required.';
    }

    if (!language) {
      errors.language = 'Language selection is required.';
    }

    if (!cause.trim()) {
      errors.cause = 'Cause explanation is required.';
    }

    if (!solution.trim()) {
      errors.solution = 'Solution walkthrough is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submission (Save Draft or Publish)
  const handleSubmit = async (targetStatus) => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setGlobalError(null);

    const payload = {
      title: title.trim(),
      errorMessage: errorMessage.trim(),
      category,
      language,
      cause: cause.trim(),
      solution: solution.trim(),
      codeFix: codeFix.trim(),
      tags,
      status: targetStatus,
    };

    try {
      if (isEditMode) {
        // Update existing error solution
        await errorService.updateError(id, payload);
        if (targetStatus === 'published' && initialError?.status !== 'published') {
          await errorService.toggleErrorStatus(id, 'published');
        }
      } else {
        // Create new error solution
        const createRes = await errorService.createError(payload);
        const newError = createRes.data?.errorSolution;
        if (targetStatus === 'published' && newError?.id) {
          await errorService.toggleErrorStatus(newError.id, 'published');
        }
      }

      // Redirect back to Admin Errors Table
      navigate(APP_PATHS.ADMIN_ERRORS);
    } catch (err) {
      console.error('Failed to save error solution:', err);
      setGlobalError(err.response?.data?.error?.message || 'Failed to save error solution. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <RefreshCw size={36} className="animate-spin mx-auto text-brand-500" />
          <p className="text-sm font-medium text-slate-500">Loading error solution details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEditMode ? 'Edit Error Solution' : 'Create Error Solution'} - DevAtlas Admin</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-16">
        {/* Top Navbar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
          <Container>
            <div className="h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  to={APP_PATHS.ADMIN_ERRORS}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Error Solutions List
                </Link>
                <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-600 to-amber-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    <AlertOctagon size={16} />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold leading-tight">
                      {isEditMode ? 'Edit Error Solution' : 'Create Error Solution'}
                    </h1>
                    <p className="text-[11px] text-slate-400">DevAtlas Troubleshooting Portal</p>
                  </div>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSubmit('draft')}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} />
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit(initialError?.status === 'published' ? 'published' : 'published')}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-colors disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  {isEditMode
                    ? initialError?.status === 'published'
                      ? 'Save Changes'
                      : 'Publish Solution'
                    : 'Publish Solution'}
                </button>
              </div>
            </div>
          </Container>
        </header>

        <Container className="py-8 flex-grow">
          {/* Global Error Banner */}
          {globalError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-medium flex items-center gap-3">
              <AlertCircle size={18} className="text-rose-500 flex-shrink-0" />
              <span className="flex-grow">{globalError}</span>
              <button onClick={() => setGlobalError(null)} className="opacity-60 hover:opacity-100">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Main Error Detail Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Error Title Field */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Error Solution Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. MongoServerError: language override unsupported"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: null }));
                  }}
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 ${
                    fieldErrors.title
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-800 focus:border-brand-500'
                  }`}
                />
                {fieldErrors.title && <p className="text-xs text-rose-500 mt-1.5">{fieldErrors.title}</p>}
                <div className="text-[11px] text-slate-400 text-right mt-1">{title.length}/200 chars</div>
              </div>

              {/* Raw Error Message / Exception Textarea */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Raw Error Message / Exception <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste the exact raw error exception, stack trace, or console error message developers search for..."
                  value={errorMessage}
                  onChange={(e) => {
                    setErrorMessage(e.target.value);
                    if (fieldErrors.errorMessage) setFieldErrors((prev) => ({ ...prev, errorMessage: null }));
                  }}
                  className={`w-full p-4 bg-slate-950 border rounded-xl font-mono text-xs text-rose-300 leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-500/20 placeholder-slate-600 ${
                    fieldErrors.errorMessage
                      ? 'border-rose-500'
                      : 'border-slate-800 focus:border-rose-500'
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                />
                {fieldErrors.errorMessage && (
                  <p className="text-xs text-rose-500 mt-1.5">{fieldErrors.errorMessage}</p>
                )}
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Paste the exact raw exception log string. This powers developer error log search matches.
                </p>
              </div>

              {/* Cause Explanation Field */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle size={16} className="text-amber-500" />
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Root Cause Explanation <span className="text-rose-500">*</span>
                  </label>
                </div>
                <textarea
                  rows={4}
                  placeholder="Explain WHY this error occurs (e.g. MongoDB text search defaults to using the language field for natural language stemming)..."
                  value={cause}
                  onChange={(e) => {
                    setCause(e.target.value);
                    if (fieldErrors.cause) setFieldErrors((prev) => ({ ...prev, cause: null }));
                  }}
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 ${
                    fieldErrors.cause
                      ? 'border-rose-500'
                      : 'border-slate-200 dark:border-slate-800 focus:border-brand-500'
                  }`}
                />
                {fieldErrors.cause && <p className="text-xs text-rose-500 mt-1.5">{fieldErrors.cause}</p>}
              </div>

              {/* Solution Walkthrough Field */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare size={16} className="text-emerald-500" />
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Step-by-Step Solution / Fix <span className="text-rose-500">*</span>
                  </label>
                </div>
                <textarea
                  rows={5}
                  placeholder="Provide step-by-step instructions on HOW to resolve the error..."
                  value={solution}
                  onChange={(e) => {
                    setSolution(e.target.value);
                    if (fieldErrors.solution) setFieldErrors((prev) => ({ ...prev, solution: null }));
                  }}
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 ${
                    fieldErrors.solution
                      ? 'border-rose-500'
                      : 'border-slate-200 dark:border-slate-800 focus:border-brand-500'
                  }`}
                />
                {fieldErrors.solution && <p className="text-xs text-rose-500 mt-1.5">{fieldErrors.solution}</p>}
              </div>

              {/* Code Fix Editor Area */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Code Fix Example <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-mono font-bold uppercase">
                    <FileCode size={12} />
                    {language}
                  </span>
                </div>

                {/* Dark Code Textarea */}
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs sm:text-sm text-slate-100 shadow-inner">
                  <textarea
                    rows={12}
                    placeholder={`// Provide the corrected code snippet here...`}
                    value={codeFix}
                    onChange={(e) => setCodeFix(e.target.value)}
                    className="w-full p-4 bg-transparent resize-y focus:outline-none leading-relaxed tracking-wide font-mono text-slate-100 placeholder-slate-600"
                    style={{ whiteSpace: 'pre', tabSize: 2 }}
                  />
                </div>

                {/* Code Statistics Bar */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <div>
                    Language: <span className="text-slate-200 font-bold uppercase">{language}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>{codeStats.lines} lines</span>
                    <span>•</span>
                    <span>{codeStats.words} words</span>
                    <span>•</span>
                    <span>{codeStats.chars} chars</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Category, Language, Tags & Metadata */}
            <div className="space-y-6">
              {/* Category Selector Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                  Error Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {SUPPORTED_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-2">
                  Select the domain category for structured error discovery.
                </p>
              </div>

              {/* Language Selector Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                  Programming Language <span className="text-rose-500">*</span>
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-2">
                  Select the target programming language or environment.
                </p>
              </div>

              {/* Tag Manager Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Tags & Search Keywords
                </label>
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative flex-grow">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Render Tag Pills */}
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-medium"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-brand-400 hover:text-brand-700 dark:hover:text-brand-200 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No tags added yet.</p>
                )}
              </div>

              {/* Read-Only Backend Metadata Card (Edit Mode Only) */}
              {isEditMode && initialError && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3 text-xs">
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-100 dark:border-slate-800 pb-2">
                    Backend Metadata (Read-Only)
                  </h3>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Slug:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{initialError.slug}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Author:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">
                      {initialError.author?.name || 'Admin'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Status:</span>
                    <span className="font-bold capitalize text-brand-600 dark:text-brand-400">{initialError.status}</span>
                  </div>

                  {initialError.publishedAt && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Published Date:</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {new Date(initialError.publishedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons Footer */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <Link
                  to={APP_PATHS.ADMIN_ERRORS}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSubmit('draft')}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit('published')}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {isSubmitting ? 'Saving...' : 'Publish'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}

export default AdminErrorEditorPage;
