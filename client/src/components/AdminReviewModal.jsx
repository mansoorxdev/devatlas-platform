import { useState } from 'react';
import editorialService from '../services/editorialService';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  MessageSquare,
  X,
  User,
  Clock,
  Tag,
  RefreshCw,
  Send,
} from 'lucide-react';

export function AdminReviewModal({ article, onClose, onSuccess }) {
  const [activeAction, setActiveAction] = useState(null); // 'approve' | 'request_changes' | 'reject' | null
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!article) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await editorialService.approveArticle(article.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to approve article.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!reviewNote.trim() || reviewNote.trim().length < 5) {
      setError('Please provide feedback of at least 5 characters explaining requested changes.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await editorialService.requestChanges(article.id, reviewNote.trim());
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to request changes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!reviewNote.trim() || reviewNote.trim().length < 5) {
      setError('Please provide a rejection reason of at least 5 characters.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await editorialService.rejectArticle(article.id, reviewNote.trim());
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to reject article.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const authorName = article.author?.name || 'Unknown Writer';
  const authorEmail = article.author?.email || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold mb-2">
              <MessageSquare size={14} />
              <span>Editorial Review</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{article.title}</h2>
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="inline-flex items-center gap-1">
                <User size={13} />
                <span className="font-semibold text-slate-700 dark:text-slate-300">{authorName}</span> ({authorEmail})
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={13} />
                <span>{new Date(article.updatedAt || article.createdAt).toLocaleDateString()}</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Article Preview Scrollable Body */}
        <div className="py-5 overflow-y-auto space-y-4 flex-grow text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <div>
            <span className="font-bold block text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] mb-1">
              Summary
            </span>
            <p className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 italic">
              {article.summary}
            </p>
          </div>

          {article.tags?.length > 0 && (
            <div>
              <span className="font-bold block text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] mb-1">
                Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="font-bold block text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] mb-1">
              Markdown Content
            </span>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs whitespace-pre-wrap max-h-72 overflow-y-auto">
              {article.content}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-medium flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Action Decision Controls Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
          {activeAction === 'request_changes' || activeAction === 'reject' ? (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                {activeAction === 'request_changes' ? 'Specify Required Changes for Writer *' : 'Specify Rejection Reason *'}
              </label>
              <textarea
                rows={3}
                required
                placeholder={
                  activeAction === 'request_changes'
                    ? 'e.g. Please add practical code snippets to section 2 and clarify connection handling.'
                    : 'e.g. Article topic overlaps with existing published article.'
                }
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveAction(null);
                    setReviewNote('');
                    setError(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={activeAction === 'request_changes' ? handleRequestChanges : handleReject}
                  disabled={isSubmitting}
                  className={`px-4 py-2 text-white rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 ${
                    activeAction === 'request_changes' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-red-600 hover:bg-red-500'
                  }`}
                >
                  {isSubmitting ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                  <span>{activeAction === 'request_changes' ? 'Submit Feedback' : 'Confirm Reject'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveAction('request_changes')}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <AlertCircle size={14} />
                  <span>Request Changes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAction('reject')}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <XCircle size={14} />
                  <span>Reject</span>
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Approve & Publish</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminReviewModal;
