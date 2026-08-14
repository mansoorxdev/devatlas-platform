import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Terminal } from 'lucide-react';
import { useAuthStore } from '@features/auth/store/useAuthStore.js';
import { APP_PATHS } from '@/constants';
import Container from '@components/Container';

export function AdminDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    navigate(APP_PATHS.HOME, { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - DevAtlas</title>
        <meta name="description" content="DevAtlas admin dashboard." />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {/* Top Bar */}
        <header className="border-b border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <Container>
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                  <Terminal size={18} />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  DevAtlas Admin
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline">
                  {user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </Container>
        </header>

        {/* Main Content */}
        <Container>
          <div className="py-10">
            {/* Welcome Card */}
            <div className="bg-gradient-to-br from-brand-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-brand-500/20 mb-8">
              <div className="flex items-center gap-3 mb-2">
                <LayoutDashboard size={24} />
                <h1 className="text-2xl font-bold">Welcome, {user?.name || 'Admin'}</h1>
              </div>
              <p className="text-brand-100 text-sm">
                You are signed in as <span className="font-semibold">{user?.email}</span> with{' '}
                <span className="font-semibold">{user?.role}</span> privileges.
              </p>
            </div>

            {/* Placeholder Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Articles', 'Snippets', 'Settings'].map((label) => (
                <div
                  key={label}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {label}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {label} management will be available in upcoming phases.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}

export default AdminDashboard;
