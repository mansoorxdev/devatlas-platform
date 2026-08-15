import { ArrowRight, Sparkles, Clock } from 'lucide-react';

export function ToolCard({
  id,
  title,
  description,
  category = 'Developer Utility',
  icon: IconComponent,
  isComingSoon = false,
  onClick,
}) {
  return (
    <div
      onClick={!isComingSoon ? onClick : undefined}
      role={!isComingSoon ? 'button' : undefined}
      tabIndex={!isComingSoon ? 0 : undefined}
      onKeyDown={(e) => {
        if (!isComingSoon && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`group bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-xs transition-all duration-300 flex flex-col justify-between ${
        isComingSoon
          ? 'border-slate-200 dark:border-slate-800/60 opacity-75 cursor-not-allowed'
          : 'border-slate-200 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 hover:shadow-xl cursor-pointer'
      }`}
    >
      <div>
        {/* Top Header & Icon */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
            {IconComponent ? <IconComponent size={20} /> : <Sparkles size={20} />}
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isComingSoon
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {isComingSoon ? (
              <>
                <Clock size={11} />
                Coming Soon
              </>
            ) : (
              <>
                <Sparkles size={11} />
                Ready
              </>
            )}
          </span>
        </div>

        {/* Title */}
        <h3
          className={`text-lg font-bold transition-colors mb-2 ${
            isComingSoon
              ? 'text-slate-700 dark:text-slate-300'
              : 'text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400'
          }`}
        >
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
          {description}
        </p>
      </div>

      {/* Footer Action Button */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold">
        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">
          {category}
        </span>

        {isComingSoon ? (
          <span className="text-slate-400 font-medium">In Development</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 group-hover:translate-x-0.5 transition-transform">
            Open Tool
            <ArrowRight size={14} />
          </span>
        )}
      </div>
    </div>
  );
}

export default ToolCard;
