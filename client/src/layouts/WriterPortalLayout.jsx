import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FileSpreadsheet,
  Bell,
  User,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Terminal,
  Feather,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '@features/auth/store/useAuthStore.js';
import { notificationService } from '@/services/notificationService.js';
import { resolveAvatarUrl } from '@/constants/avatars.js';
import { APP_PATHS, STORAGE_KEYS, THEMES } from '@/constants';
import Container from '@components/Container';

export function WriterPortalLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || THEMES.DARK;
  });

  // Fetch unread notification count
  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const response = await notificationService.getUnreadCount();
        if (response?.success && isMounted) {
          setUnreadCount(response.data.unreadCount || 0);
        }
      } catch (e) {}
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Theme Toggle Handler
  const toggleTheme = () => {
    const nextTheme = theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    setTheme(nextTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, nextTheme);

    if (nextTheme === THEMES.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (theme === THEMES.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    navigate(APP_PATHS.WRITER_PORTAL_LOGIN, { replace: true });
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: APP_PATHS.WRITER_PORTAL,
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: 'My Articles',
      path: APP_PATHS.WRITER_PORTAL_ARTICLES,
      icon: FileText,
      end: true,
    },
    {
      label: 'Assignments',
      path: APP_PATHS.WRITER_PORTAL_ASSIGNMENTS,
      icon: FileSpreadsheet,
      end: false,
    },
    {
      label: 'Notifications',
      path: APP_PATHS.WRITER_PORTAL_NOTIFICATIONS,
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
      end: false,
    },
    {
      label: 'Writer Profile',
      path: APP_PATHS.WRITER_PORTAL_PROFILE,
      icon: User,
      end: false,
    },
  ];

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200">
        {/* Sidebar for Desktop */}
        <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 sticky top-0 h-screen z-30">
          {/* Logo & Portal Indicator */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <Link to={APP_PATHS.WRITER_PORTAL} className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Terminal size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-black text-sm tracking-tight text-slate-900 dark:text-white">
                  <span>DevAtlas</span>
                  <span className="px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 text-[10px] font-extrabold border border-brand-200 dark:border-brand-800">
                    WRITER
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Contributor Workspace</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Writer Portal Sidebar Navigation" className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile & Footer Controls */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img
                  src={resolveAvatarUrl(user?.avatar)}
                  alt={user?.name || 'Writer'}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 object-cover flex-shrink-0"
                />
                <div className="truncate text-xs">
                  <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{user?.name || 'Writer'}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                </div>
              </div>

              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={theme === THEMES.DARK ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === THEMES.DARK ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={APP_PATHS.HOME}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold transition-colors"
                title="View Public DevAtlas Platform"
              >
                <ExternalLink size={13} />
                Public Site
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                title="Log Out of Writer Portal"
              >
                <LogOut size={13} />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Header Bar */}
        <header className="md:hidden sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 h-16 flex items-center justify-between">
          <Link to={APP_PATHS.WRITER_PORTAL} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/20">
              <Terminal size={16} />
            </div>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">DevAtlas Portal</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg cursor-pointer"
            >
              {theme === THEMES.DARK ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* Mobile Drawer Drawer Navigation */}
        {isMobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
            <div className="w-72 bg-white dark:bg-slate-900 h-full p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Feather size={16} className="text-brand-600" />
                    Writer Workspace
                  </div>
                  <button onClick={() => setIsMobileOpen(false)} className="p-1 text-slate-400">
                    <X size={18} />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        onClick={() => setIsMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-brand-600 text-white font-bold'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                            {item.badge}
                          </span>
                        ) : null}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={resolveAvatarUrl(user?.avatar)}
                    alt={user?.name || 'Writer'}
                    className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 object-cover"
                  />
                  <div className="truncate text-xs">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{user?.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut size={14} />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default WriterPortalLayout;
