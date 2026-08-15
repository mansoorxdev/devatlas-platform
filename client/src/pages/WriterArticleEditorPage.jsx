import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Container from '../components/Container';
import writerService from '../services/writerService';
import { APP_PATHS } from '../constants';
import {
  ArrowLeft,
  Save,
  Send,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
  Edit3,
  Tag,
  X,
  Lock,
  Image as ImageIcon,
  FileText,
  Clock,
  Sparkles,
  RotateCcw,
  Check,
  Search,
} from 'lucide-react';

export function WriterArticleEditorPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    tags: [],
    featuredImage: '',
    seoTitle: '',
    seoDescription: '',
  });

  const [initialData, setInitialData] = useState({
    title: '',
    summary: '',
    content: '',
    tags: [],
    featuredImage: '',
    seoTitle: '',
    seoDescription: '',
  });

  const [tagInput, setTagInput] = useState('');
  const [articleStatus, setArticleStatus] = useState('draft');
  const [reviewNote, setReviewNote] = useState(null);
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [hasAutosaveDraft, setHasAutosaveDraft] = useState(false);
  const [autosaveNotice, setAutosaveNotice] = useState(null);

  // Confirmation Modal state
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);

  // Content Metrics Computation
  const metrics = useMemo(() => {
    const text = formData.content.trim();
    const charCount = formData.content.length;
    const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    return { charCount, wordCount, readTime };
  }, [formData.content]);

  // Check for unsaved changes
  const isDirty = useMemo(() => {
    return (
      formData.title !== initialData.title ||
      formData.summary !== initialData.summary ||
      formData.content !== initialData.content ||
      JSON.stringify(formData.tags) !== JSON.stringify(initialData.tags) ||
      formData.featuredImage !== initialData.featuredImage ||
      formData.seoTitle !== initialData.seoTitle ||
      formData.seoDescription !== initialData.seoDescription
    );
  }, [formData, initialData]);

  // LocalStorage autosave key
  const autosaveKey = isEditing ? `devatlas_writer_draft_${id}` : `devatlas_writer_draft_new`;

  // Unsaved changes browser prompt on tab close / refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty && !isSaving && !isSubmitting) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isSaving, isSubmitting]);

  // Autosave draft to LocalStorage every 5 seconds if dirty
  useEffect(() => {
    if (!isDirty || isReadOnly) return;
    const timer = setTimeout(() => {
      localStorage.setItem(
        autosaveKey,
        JSON.stringify({
          formData,
          savedAt: new Date().toISOString(),
        })
      );
      setAutosaveNotice('Draft autosaved locally.');
      setTimeout(() => setAutosaveNotice(null), 3000);
    }, 5000);

    return () => clearTimeout(timer);
  }, [formData, isDirty, autosaveKey]);

  // Check for existing LocalStorage draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(autosaveKey);
    if (saved) {
      setHasAutosaveDraft(true);
    }
  }, [autosaveKey]);

  // Load article if editing
  useEffect(() => {
    if (isEditing) {
      const fetchArticle = async () => {
        setIsLoading(true);
        try {
          const res = await writerService.getMyArticleById(id);
          if (res.success && res.data.article) {
            const article = res.data.article;
            const loaded = {
              title: article.title || '',
              summary: article.summary || '',
              content: article.content || '',
              tags: article.tags || [],
              featuredImage: article.featuredImage || '',
              seoTitle: article.seoTitle || '',
              seoDescription: article.seoDescription || '',
            };
            setFormData(loaded);
            setInitialData(loaded);
            setArticleStatus(article.status || 'draft');
            setReviewNote(article.reviewNote || null);
          }
        } catch (err) {
          setError(err.response?.data?.error?.message || 'Failed to load article.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchArticle();
    }
  }, [id, isEditing]);

  const handleRestoreAutosave = () => {
    const saved = localStorage.getItem(autosaveKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.formData) {
          setFormData(parsed.formData);
          setAutosaveNotice('Draft restored from local autosave.');
          setTimeout(() => setAutosaveNotice(null), 4000);
        }
      } catch (e) {}
    }
    setHasAutosaveDraft(false);
  };

  const handleAddTag = (e) => {
    if (e) e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    if (!tag) return;
    if (formData.tags.includes(tag)) {
      setTagInput('');
      return;
    }
    setFormData({
      ...formData,
      tags: [...formData.tags, tag],
    });
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tagToRemove),
    });
  };

  const executeSaveOrSubmit = async (action = 'draft') => {
    setError(null);

    const payload = {
      title: formData.title.trim(),
      summary: formData.summary.trim(),
      content: formData.content,
      tags: formData.tags,
      featuredImage: formData.featuredImage.trim(),
      seoTitle: formData.seoTitle.trim(),
      seoDescription: formData.seoDescription.trim(),
      action,
    };

    if (action === 'submit' || action === 'resubmit') setIsSubmitting(true);
    else setIsSaving(true);

    try {
      if (isEditing) {
        await writerService.updateArticle(id, payload);
      } else {
        await writerService.createArticle(payload);
      }
      // Clear LocalStorage autosave
      localStorage.removeItem(autosaveKey);
      setInitialData(formData);
      navigate(APP_PATHS.WRITER);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save article.');
    } finally {
      setIsSaving(false);
      setIsSubmitting(false);
      setShowSubmitConfirmModal(false);
    }
  };

  const handleFormSubmit = (e, action = 'draft') => {
    if (e) e.preventDefault();
    if (action === 'submit' || action === 'resubmit') {
      setShowSubmitConfirmModal(true);
    } else {
      executeSaveOrSubmit('draft');
    }
  };

  const isReadOnly = articleStatus === 'pending_review' || articleStatus === 'published';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 text-center">
        <Container className="max-w-4xl">
          <RefreshCw size={28} className="mx-auto text-brand-500 animate-spin mb-3" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading article editor...</p>
        </Container>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEditing ? `Edit Article | Writer Portal` : `Create Article | Writer Portal`}</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10">
        <Container className="max-w-4xl">
          {/* Top Navigation */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link
              to={APP_PATHS.WRITER}
              onClick={(e) => {
                if (isDirty && !window.confirm('You have unsaved changes. Leave without saving?')) {
                  e.preventDefault();
                }
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Writer Dashboard</span>
            </Link>

            <div className="flex items-center gap-2">
              {autosaveNotice && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/80">
                  {autosaveNotice}
                </span>
              )}
            </div>
          </div>

          {/* Autosave Recovery Banner */}
          {hasAutosaveDraft && !isReadOnly && (
            <div className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 p-4 rounded-2xl mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-xs text-indigo-900 dark:text-indigo-200 font-medium">
                <RotateCcw size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Found an unsaved draft backup from a previous session.</span>
              </div>
              <button
                type="button"
                onClick={handleRestoreAutosave}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Restore Draft
              </button>
            </div>
          )}

          {/* Workflow Status Banners */}
          {articleStatus === 'changes_requested' && reviewNote && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-2xl p-5 mb-6 shadow-sm">
              <div className="flex items-start gap-3">
                <MessageSquare size={18} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-extrabold uppercase text-rose-700 dark:text-rose-300 tracking-wider">
                    Admin Requested Changes
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-200 mt-1 leading-relaxed">{reviewNote}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 italic">
                    Please revise your content and click "Resubmit for Review".
                  </p>
                </div>
              </div>
            </div>
          )}

          {articleStatus === 'pending_review' && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 mb-6 text-xs text-amber-800 dark:text-amber-300 font-medium flex items-center gap-2">
              <Lock size={16} />
              <span>This article is currently under admin review and cannot be edited.</span>
            </div>
          )}

          {articleStatus === 'published' && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 mb-6 text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>This article has been published on DevAtlas.</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-4 rounded-2xl mb-6 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Editor Form */}
          <form onSubmit={(e) => handleFormSubmit(e, 'draft')} className="space-y-6">
            {/* Core Content Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  disabled={isReadOnly}
                  placeholder="e.g. Building Scalable Web Apps with React 19 and Node.js"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
                />
              </div>

              {/* Summary */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Summary / Teaser (Max 500 Chars) *
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">{formData.summary.length}/500</span>
                </div>
                <textarea
                  rows={2}
                  required
                  maxLength={500}
                  disabled={isReadOnly}
                  placeholder="Brief overview summarizing key takeaways of this article..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 resize-y"
                />
              </div>

              {/* Featured Image URL & Preview */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Featured Image URL
                </label>
                <div className="relative mb-3">
                  <ImageIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    disabled={isReadOnly}
                    placeholder="https://images.unsplash.com/photo-..."
                    value={formData.featuredImage}
                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
                  />
                </div>

                {formData.featuredImage && (
                  <div className="relative h-40 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                    <img
                      src={formData.featuredImage}
                      alt="Featured Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-1 rounded-md backdrop-blur-sm">
                      Featured Image Preview
                    </div>
                  </div>
                )}
              </div>

              {/* Tags Management */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Tags Management
                </label>
                {!isReadOnly && (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Type tag & press Enter (e.g. react, nodejs)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Add Tag
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                    >
                      <Tag size={12} className="text-brand-500" />
                      <span>{tag}</span>
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Markdown Content Editor with Tabbed Mode & Metrics */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  {/* Mode Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setActiveTab('write')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'write'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <Edit3 size={13} />
                      <span>Write Markdown</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'preview'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <Eye size={13} />
                      <span>Live Rendered Preview</span>
                    </button>
                  </div>

                  {/* Content Metrics Toolbar */}
                  <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <FileText size={12} />
                      <span>{metrics.wordCount} words</span>
                    </span>
                    <span>•</span>
                    <span>{metrics.charCount} chars</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{metrics.readTime} min read</span>
                    </span>
                  </div>
                </div>

                {activeTab === 'preview' ? (
                  <div className="w-full min-h-[380px] p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs leading-relaxed text-slate-800 dark:text-slate-200 overflow-y-auto whitespace-pre-wrap font-sans">
                    {formData.content ? (
                      <div className="prose dark:prose-invert max-w-none">
                        <div className="font-bold text-lg mb-4 text-slate-900 dark:text-slate-100">
                          {formData.title || 'Untitled Article'}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 mb-6 italic">{formData.summary}</div>
                        <div className="font-mono text-xs whitespace-pre-wrap">{formData.content}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No content written yet. Switch to Write Markdown tab to begin typing.</span>
                    )}
                  </div>
                ) : (
                  <textarea
                    rows={15}
                    required
                    disabled={isReadOnly}
                    placeholder="# Introduction&#10;&#10;Write your technical article content here using Github Flavored Markdown..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 leading-relaxed"
                  />
                )}
              </div>
            </div>

            {/* SEO Metadata Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">
                <Search size={14} className="text-brand-500" />
                <span>SEO & Social Preview Optimization</span>
              </div>

              {/* SEO Title */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    SEO Meta Title
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      formData.seoTitle.length > 60 ? 'text-amber-500 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {formData.seoTitle.length}/60 target
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={200}
                  disabled={isReadOnly}
                  placeholder="Defaults to article title if left blank..."
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
                />
              </div>

              {/* SEO Meta Description */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    SEO Meta Description
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      formData.seoDescription.length > 160 ? 'text-amber-500 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {formData.seoDescription.length}/160 target
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={300}
                  disabled={isReadOnly}
                  placeholder="Optimized meta description for Google search result snippets..."
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 resize-y"
                />
              </div>
            </div>

            {/* Action Buttons Footer */}
            {!isReadOnly && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isSaving || isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{isSaving ? 'Saving Draft...' : 'Save Draft'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleFormSubmit(e, articleStatus === 'changes_requested' ? 'resubmit' : 'submit')}
                  disabled={isSaving || isSubmitting}
                  className="w-full sm:w-auto px-7 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>
                    {isSubmitting
                      ? 'Submitting...'
                      : articleStatus === 'changes_requested'
                      ? 'Resubmit for Review'
                      : 'Submit for Review'}
                  </span>
                </button>
              </div>
            )}
          </form>
        </Container>
      </div>

      {/* Submission Confirmation Modal */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-xl relative">
            <button
              onClick={() => setShowSubmitConfirmModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-4">
              <Send size={22} />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-2">
              Submit Article for Editorial Review?
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Once submitted, your article will enter the admin review queue and you will not be able to edit it until an admin completes review or requests changes.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitConfirmModal(false)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeSaveOrSubmit(articleStatus === 'changes_requested' ? 'resubmit' : 'submit')}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                <span>Confirm Submission</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default WriterArticleEditorPage;
