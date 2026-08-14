import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  Code2,
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
} from 'lucide-react';
import { snippetService } from '@features/snippets';
import { APP_PATHS } from '@/constants';
import Container from '@components/Container';

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

export function AdminSnippetEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Form Field States
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [initialSnippet, setInitialSnippet] = useState(null);

  // UI & Loading States
  const [isLoadingSnippet, setIsLoadingSnippet] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);

  // Fetch Snippet for Edit Mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchSnippet = async () => {
      setIsLoadingSnippet(true);
      setGlobalError(null);
      try {
        const response = await snippetService.getAdminSnippetById(id);
        if (response?.success && response?.data?.snippet) {
          const s = response.data.snippet;
          setInitialSnippet(s);
          setTitle(s.title || '');
          setSummary(s.summary || '');
          setLanguage(s.language || 'javascript');
          setCode(s.code || '');
          setTags(s.tags || []);
        } else {
          setGlobalError('Snippet not found.');
        }
      } catch (err) {
        console.error('Failed to load snippet for edit:', err);
        setGlobalError(err.response?.data?.error?.message || 'Failed to load snippet details.');
      } finally {
        setIsLoadingSnippet(false);
      }
    };

    fetchSnippet();
  }, [id, isEditMode]);

  // Code Statistics
  const codeStats = {
    lines: code ? code.split('\n').length : 0,
    chars: code.length,
    words: code.trim() ? code.trim().split(/\s+/).length : 0,
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

  // Client-side Validation
  const validateForm = () => {
    const errors = {};
    if (!title.trim()) {
      errors.title = 'Title is required.';
    } else if (title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters.';
    } else if (title.trim().length > 200) {
      errors.title = 'Title cannot exceed 200 characters.';
    }

    if (summary.trim() && summary.trim().length > 500) {
      errors.summary = 'Summary cannot exceed 500 characters.';
    }

    if (!code.trim()) {
      errors.code = 'Code content is required.';
    }

    if (!language) {
      errors.language = 'Language selection is required.';
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
      summary: summary.trim(),
      language,
      code,
      tags,
      status: targetStatus,
    };

    try {
      if (isEditMode) {
        // Update existing snippet
        await snippetService.updateSnippet(id, payload);
        if (targetStatus === 'published' && initialSnippet?.status !== 'published') {
          await snippetService.toggleSnippetStatus(id, 'published');
        }
      } else {
        // Create new snippet
        const createRes = await snippetService.createSnippet(payload);
        const newSnippet = createRes.data?.snippet;
        if (targetStatus === 'published' && newSnippet?.id) {
          await snippetService.toggleSnippetStatus(newSnippet.id, 'published');
        }
      }

      // Redirect back to Admin Snippets Table
      navigate(APP_PATHS.ADMIN_SNIPPETS);
    } catch (err) {
      console.error('Failed to save snippet:', err);
      setGlobalError(err.response?.data?.error?.message || 'Failed to save code snippet. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingSnippet) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <RefreshCw size={36} className="animate-spin mx-auto text-brand-500" />
          <p className="text-sm font-medium text-slate-500">Loading code snippet details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEditMode ? 'Edit Snippet' : 'Create Snippet'} - DevAtlas Admin</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-16">
        {/* Top Navbar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
          <Container>
            <div className="h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  to={APP_PATHS.ADMIN_SNIPPETS}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Snippets List
                </Link>
                <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    <Code2 size={16} />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold leading-tight">
                      {isEditMode ? 'Edit Snippet' : 'Create New Snippet'}
                    </h1>
                    <p className="text-[11px] text-slate-400">DevAtlas Content Editor</p>
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
                  onClick={() => handleSubmit(initialSnippet?.status === 'published' ? 'published' : 'published')}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-colors disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  {isEditMode
                    ? initialSnippet?.status === 'published'
                      ? 'Save Changes'
                      : 'Publish Snippet'
                    : 'Publish Snippet'}
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
            {/* Left 2 Columns: Main Code & Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title Field */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Snippet Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Express.js Async JWT Auth Middleware"
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

              {/* Summary / Description Field */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Description / Excerpt <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe what this snippet does, usage instructions, or prerequisite packages..."
                  value={summary}
                  onChange={(e) => {
                    setSummary(e.target.value);
                    if (fieldErrors.summary) setFieldErrors((prev) => ({ ...prev, summary: null }));
                  }}
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 ${
                    fieldErrors.summary
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-800 focus:border-brand-500'
                  }`}
                />
                {fieldErrors.summary && <p className="text-xs text-rose-500 mt-1.5">{fieldErrors.summary}</p>}
                <div className="text-[11px] text-slate-400 text-right mt-1">{summary.length}/500 chars</div>
              </div>

              {/* Code Content Editor Area */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Code Content <span className="text-rose-500">*</span>
                  </label>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-mono font-bold uppercase">
                    <FileCode size={12} />
                    {language}
                  </span>
                </div>

                {/* Dark Code Editor Textarea */}
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs sm:text-sm text-slate-100 shadow-inner">
                  <textarea
                    rows={16}
                    placeholder={`// Enter your ${language} code snippet here...`}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      if (fieldErrors.code) setFieldErrors((prev) => ({ ...prev, code: null }));
                    }}
                    className={`w-full p-4 bg-transparent resize-y focus:outline-none leading-relaxed tracking-wide font-mono text-slate-100 placeholder-slate-600 ${
                      fieldErrors.code ? 'border-2 border-rose-500' : ''
                    }`}
                    style={{ whiteSpace: 'pre', tabSize: 2 }}
                  />
                </div>
                {fieldErrors.code && <p className="text-xs text-rose-500 mt-1.5">{fieldErrors.code}</p>}

                {/* Live Code Statistics Bar */}
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

            {/* Right Column: Metadata & Controls */}
            <div className="space-y-6">
              {/* Language Selection Card */}
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
                  Select the primary language to configure syntax tag badges.
                </p>
              </div>

              {/* Tag Manager Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Tags & Categories
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
              {isEditMode && initialSnippet && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3 text-xs">
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-100 dark:border-slate-800 pb-2">
                    Backend Metadata (Read-Only)
                  </h3>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Slug:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{initialSnippet.slug}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Author:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">
                      {initialSnippet.author?.name || 'Admin'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Status:</span>
                    <span className="font-bold capitalize text-brand-600 dark:text-brand-400">{initialSnippet.status}</span>
                  </div>

                  {initialSnippet.publishedAt && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Published Date:</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {new Date(initialSnippet.publishedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons Footer */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <Link
                  to={APP_PATHS.ADMIN_SNIPPETS}
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

export default AdminSnippetEditorPage;
