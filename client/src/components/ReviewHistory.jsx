import { Send, AlertCircle, CheckCircle2, XCircle, Clock, MessageSquare, History } from 'lucide-react';

const ACTION_CONFIG = {
  submit: {
    label: 'Submitted for Review',
    icon: Send,
    color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
  },
  resubmit: {
    label: 'Resubmitted for Review',
    icon: Send,
    color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
  },
  request_changes: {
    label: 'Changes Requested',
    icon: AlertCircle,
    color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
  },
  approve: {
    label: 'Approved & Published',
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
  },
  reject: {
    label: 'Article Rejected',
    icon: XCircle,
    color: 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-800',
  },
};

export function ReviewHistory({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 italic text-center">
        No editorial history recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
        <History size={14} className="text-brand-500" />
        <span>Editorial Review Timeline</span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {history.map((item, idx) => {
          const config = ACTION_CONFIG[item.action] || ACTION_CONFIG.submit;
          const Icon = config.icon;
          const formattedDate = new Date(item.createdAt || Date.now()).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div key={idx} className="relative group">
              {/* Timeline Bullet Node */}
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${config.color}`}>
                    <Icon size={12} />
                    <span>{config.label}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock size={11} />
                    {formattedDate}
                  </span>
                </div>

                {item.note && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200/60 dark:border-slate-800/60 font-medium">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block text-[11px] mb-0.5">
                      Reviewer Note:
                    </span>
                    {item.note}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ReviewHistory;
