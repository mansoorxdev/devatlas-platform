import { cn } from '../utils';

export function LoadingSpinner({ className, size = 'md', ...props }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={cn(
          'animate-spin rounded-full border-t-brand-500 border-slate-200 dark:border-slate-800',
          sizes[size],
          className
        )}
        role="status"
        aria-label="loading"
        {...props}
      />
    </div>
  );
}

export default LoadingSpinner;
