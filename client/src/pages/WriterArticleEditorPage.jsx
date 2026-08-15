import { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';

export function WriterArticleEditorPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    tagsString: '',
  });

  const [initialData, setInitialData] = useState({
    title: '',
    summary: '',
    content: '',
    tagsString: '',
  });

  const [articleStatus, setArticleStatus] = useState('draft');
  const [reviewNote, setReviewNote] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Confirmation Modal state
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);

  // Check for unsaved changes
  const isDirty =
    formData.title !== initialData.title ||
    formData.summary !== initialData.summary ||
    formData.content !== initialData.content ||
    formData.tagsString !== initialData.tagsString;

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
              tagsString: (article.tags || []).join(', '),
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

  const executeSaveOrSubmit = async (action = 'draft') => {
    setError(null);

    const tags = formData.tagsString
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      summary: formData.summary.trim(),
      content: formData.content,
      tags,
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
      // Reset dirty state
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
          {/* Top Bar */}
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
              <button
                type="button"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {isPreviewMode ? <Edit3 size={14} /> : <Eye size={14} />}
                <span>{isPreviewMode ? 'Edit Mode' : 'Preview Markdown'}</span>
              </button>
            </div>
          </div>

          {/* Workflow Banners */}
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
              <Link
                to={`/articles/${id}`}
                target="_blank"
                className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-semibold"
              >
                View Published Article
              </Link>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-4 rounded-2xl mb-6 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Editor Form */}
          <form onSubmit={(e) => handleFormSubmit(e, 'draft')} className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Summary / Teaser (Max 500 Chars) *
                </label>
                <textarea
                  rows={2}
                  required
                  disabled={isReadOnly}
                  placeholder="Brief overview summarizing key takeaways of this article..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Tags (Comma Separated)
                </label>
                <div className="relative">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    disabled={isReadOnly}
                    placeholder="react, javascript, architecture, nodejs"
                    value={formData.tagsString}
                    onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Content Body (Markdown) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Article Content (Markdown Supported) *
                  </label>
                  <span className="text-[11px] text-slate-400">Supports Github Flavored Markdown</span>
                </div>

                {isPreviewMode ? (
                  <div className="w-full min-h-[350px] p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs leading-relaxed text-slate-800 dark:text-slate-200 overflow-y-auto whitespace-pre-wrap font-mono">
                    {formData.content || '_No content written yet._'}
                  </div>
                ) : (
                  <textarea
                    rows={14}
                    required
                    disabled={isReadOnly}
                    placeholder="# Introduction&#10;&#10;Write your technical article body here using Markdown formatting..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 leading-relaxed"
                  />
                )}
              </div>
            </div>

            {/* Action Buttons Footer */}
            {!isReadOnly && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isSaving || isSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{isSaving ? 'Saving Draft...' : 'Save Draft'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleFormSubmit(e, articleStatus === 'changes_requested' ? 'resubmit' : 'submit')}
                  disabled={isSaving || isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50"
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <button
              onClick={() => setShowSubmitConfirmModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center mb-4">
              <Send size={20} />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Submit Article for Editorial Review?
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Once submitted, your article will enter the admin review queue and you will not be able to edit it until an admin reviews it or requests changes.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeSaveOrSubmit(articleStatus === 'changes_requested' ? 'resubmit' : 'submit')}
                disabled={isSubmitting}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
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
