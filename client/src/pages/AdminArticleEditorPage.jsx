import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  X,
  FileText,
  AlertCircle,
  Clock,
  User,
  Globe,
  Tag,
  RefreshCw,
  LogOut,
  Terminal,
} from 'lucide-react';
import { useAuthStore } from '@features/auth/store/useAuthStore.js';
import { articleService } from '@features/articles/services/articleService.js';
import { APP_PATHS } from '@/constants';
import Container from '@components/Container';
import LoadingSpinner from '@components/LoadingSpinner';

export function AdminArticleEditorPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Form Fields
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Loaded Article State (Edit mode only)
  const [existingArticle, setExistingArticle] = useState(null);

  // UI & Action States
  const [isLoadingArticle, setIsLoadingArticle] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAction, setActiveAction] = useState(null); // 'draft' | 'publish'
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  // Fetch article if in Edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchArticle = async () => {
      setIsLoadingArticle(true);
      setApiError(null);
      try {
        const response = await articleService.getAdminArticleById(id);
        if (response?.success && response?.data?.article) {
          const art = response.data.article;
          setExistingArticle(art);
          setTitle(art.title || '');
          setSummary(art.summary || '');
          setContent(art.content || '');
          setTags(art.tags || []);
        } else {
          setApiError('Article not found.');
        }
      } catch (err) {
        console.error('Failed to load article:', err);
        setApiError(err.response?.data?.error?.message || 'Failed to load article for editing.');
      } finally {
        setIsLoadingArticle(false);
      }
    };

    fetchArticle();
  }, [id, isEditMode]);

  // Statistics calculation for content
  const stats = useMemo(() => {
    const trimmed = content.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = content.length;
    const readTime = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readTime };
  }, [content]);

  // Tag Management
  const handleAddTag = () => {
    const rawTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (rawTag && !tags.includes(rawTag)) {
      setTags([...tags, rawTag]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required.';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters.';
    } else if (title.trim().length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters.';
    }

    if (!summary.trim()) {
      newErrors.summary = 'Summary is required.';
    } else if (summary.trim().length < 10) {
      newErrors.summary = 'Summary must be at least 10 characters.';
    } else if (summary.trim().length > 500) {
      newErrors.summary = 'Summary cannot exceed 500 characters.';
    }

    if (!content.trim()) {
      newErrors.content = 'Article content is required.';
    } else if (content.trim().length < 10) {
      newErrors.content = 'Content must be at least 10 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (targetStatus) => {
    setApiError(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    setActiveAction(targetStatus);

    const payload = {
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      tags,
    };

    try {
      if (isEditMode) {
        // Edit Mode: Update fields
        await articleService.updateArticle(id, payload);

        // If explicitly clicking publish or unpublish status change
        if (targetStatus === 'published' && existingArticle?.status !== 'published') {
          await articleService.toggleArticleStatus(id, 'published');
        } else if (targetStatus === 'draft' && existingArticle?.status !== 'draft') {
          await articleService.toggleArticleStatus(id, 'draft');
        }
      } else {
        // Create Mode: Create article with requested status directly
        payload.status = targetStatus;
        await articleService.createArticle(payload);
      }

      // Success: Navigate back to Admin Articles listing
      navigate(APP_PATHS.ADMIN_ARTICLES, { replace: true });
    } catch (err) {
      console.error('Failed to save article:', err);
      setApiError(err.response?.data?.error?.message || 'Failed to save article. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
      setActiveAction(null);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    navigate(APP_PATHS.HOME, { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>{isEditMode ? 'Edit Article' : 'Create Article'} - DevAtlas Admin</title>
        <meta name="description" content="Article editor in DevAtlas Admin." />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {/* Top Header */}
        <header className="border-b border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
          <Container>
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  to={APP_PATHS.ADMIN_ARTICLES}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Back to Articles List"
                >
                  <ArrowLeft size={18} />
                </Link>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                  <Terminal size={18} />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  DevAtlas Admin
                </span>
                <span className="text-slate-400 dark:text-slate-600">/</span>
                <Link
                  to={APP_PATHS.ADMIN_ARTICLES}
                  className="text-sm font-semibold text-slate-500 hover:text-brand-500 transition-colors"
                >
                  Articles
                </Link>
                <span className="text-slate-400 dark:text-slate-600">/</span>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {isEditMode ? 'Edit' : 'New'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline">
                  {user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </Container>
        </header>

        {/* Main Section */}
        <Container>
          <div className="py-8 max-w-4xl mx-auto">
            {/* Loading Article State (Edit mode) */}
            {isLoadingArticle ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">Loading article editor...</p>
              </div>
            ) : apiError && !title ? (
              // Error state if loading article failed
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
                <AlertCircle size={44} className="mx-auto text-rose-500 mb-3" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Unable to Edit Article</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">{apiError}</p>
                <Link
                  to={APP_PATHS.ADMIN_ARTICLES}
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Articles
                </Link>
              </div>
            ) : (
              // Article Editor Form
              <div className="space-y-6">
                {/* Global API Error Alert */}
                {apiError && (
                  <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={18} />
                      <span>{apiError}</span>
                    </div>
                    <button
                      onClick={() => setApiError(null)}
                      className="text-xs font-bold uppercase opacity-75 hover:opacity-100"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Page Title & Status Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                      <span>{isEditMode ? 'Edit Article' : 'Create New Article'}</span>
                      {isEditMode && existingArticle && (
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            existingArticle.status === 'published'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                              : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {existingArticle.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      )}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {isEditMode
                        ? 'Update your article details, tags, and markdown content.'
                        : 'Write a new technical article, tutorial, or architecture overview.'}
                    </p>
                  </div>
                </div>

                {/* Metadata Card (Edit mode read-only details) */}
                {isEditMode && existingArticle && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-brand-500" />
                      <span>Slug:</span>
                      <code className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                        {existingArticle.slug}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      <span>Author: <strong className="text-slate-700 dark:text-slate-300">{existingArticle.author?.name || 'Admin'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      <span>Read Time: <strong className="text-slate-700 dark:text-slate-300">{existingArticle.readTime} min</strong></span>
                    </div>
                  </div>
                )}

                {/* Form Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                  {/* Title Field */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Article Title <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-xs text-slate-400">{title.length}/200</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Architecting Scalable Microservices with Node.js"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
                      }}
                      maxLength={200}
                      className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-colors ${
                        errors.title
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-slate-200 dark:border-slate-800 focus:border-brand-500'
                      }`}
                    />
                    {errors.title && <p className="text-xs text-rose-500 mt-1.5">{errors.title}</p>}
                  </div>

                  {/* Summary Field */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Summary / Excerpt <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-xs text-slate-400">{summary.length}/500</span>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="A short, compelling summary of what developers will learn in this article..."
                      value={summary}
                      onChange={(e) => {
                        setSummary(e.target.value);
                        if (errors.summary) setErrors((prev) => ({ ...prev, summary: null }));
                      }}
                      maxLength={500}
                      className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-colors ${
                        errors.summary
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-slate-200 dark:border-slate-800 focus:border-brand-500'
                      }`}
                    />
                    {errors.summary && <p className="text-xs text-rose-500 mt-1.5">{errors.summary}</p>}
                  </div>

                  {/* Tags Field */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Tags <span className="text-xs font-normal text-slate-400">(Press Enter or comma to add)</span>
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-medium"
                        >
                          <Tag size={12} />
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-brand-400 hover:text-brand-600 dark:hover:text-brand-200 cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. nodejs, react, security"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        className="flex-grow px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Add Tag
                      </button>
                    </div>
                  </div>

                  {/* Markdown Content Editor */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Markdown Content <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>{stats.words} words</span>
                        <span>•</span>
                        <span>{stats.chars} chars</span>
                        <span>•</span>
                        <span>~{stats.readTime} min read</span>
                      </div>
                    </div>

                    <textarea
                      rows={14}
                      placeholder="# Write your article content in Markdown format...

## Introduction
Explain the core problem and why it matters.

```javascript
// Code examples supported
const example = 'Clean code';
```"
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                        if (errors.content) setErrors((prev) => ({ ...prev, content: null }));
                      }}
                      className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-colors ${
                        errors.content
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-slate-200 dark:border-slate-800 focus:border-brand-500'
                      }`}
                    />
                    {errors.content && <p className="text-xs text-rose-500 mt-1.5">{errors.content}</p>}
                    <p className="text-xs text-slate-400 mt-2">
                      💡 Tip: Use Markdown formatting (`# Headings`, `**bold**`, `\`code\``, `- lists`). Raw HTML is strictly sanitized.
                    </p>
                  </div>
                </div>

                {/* Bottom Action Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <Link
                    to={APP_PATHS.ADMIN_ARTICLES}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold text-center transition-colors"
                  >
                    Cancel
                  </Link>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Save Draft Button */}
                    <button
                      type="button"
                      onClick={() => handleSubmit('draft')}
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting && activeAction === 'draft' ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      Save Draft
                    </button>

                    {/* Publish Button */}
                    <button
                      type="button"
                      onClick={() => handleSubmit('published')}
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting && activeAction === 'published' ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      {isEditMode && existingArticle?.status === 'published' ? 'Update Article' : 'Publish Article'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Container>
      </div>
    </>
  );
}

export default AdminArticleEditorPage;
