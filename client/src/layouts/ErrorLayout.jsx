import { Outlet } from 'react-router-dom';

export function ErrorLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-200">
      <Outlet />
    </div>
  );
}

export default ErrorLayout;
