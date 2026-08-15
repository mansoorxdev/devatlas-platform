import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, Terminal, LogOut, User, PenTool, CheckSquare } from 'lucide-react';
import { useTheme } from '../context/ThemeProvider';
import { useAuthStore } from '@features/auth/store/useAuthStore.js';
import { APP_PATHS } from '../constants';
import Container from './Container';

export function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const navLinks = [
    { name: 'Articles', path: APP_PATHS.ARTICLES },
    { name: 'Snippets', path: APP_PATHS.SNIPPETS },
    { name: 'Error Solutions', path: APP_PATHS.ERRORS },
    { name: 'DevTools', path: APP_PATHS.DEVTOOLS },
  ];

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate(APP_PATHS.HOME, { replace: true });
  };

  return (
    <nav className="border-b border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-200">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 hover:opacity-90">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Terminal size={18} />
            </div>
            DevAtlas
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-brand-500 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {['writer', 'admin'].includes(user?.role) && (
                  <Link
                    to={APP_PATHS.WRITER}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold hover:bg-brand-500/20 transition-colors"
                  >
                    <PenTool size={13} />
                    <span>Writer Portal</span>
                  </Link>
                )}

                {user?.role === 'admin' && (
                  <>
                    <Link
                      to={APP_PATHS.ADMIN_REVIEW_QUEUE}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
                    >
                      <CheckSquare size={13} />
                      <span>Review Queue</span>
                    </Link>

                    <Link
                      to={APP_PATHS.ADMIN}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <User size={13} className="text-brand-500" />
                      <span>Admin</span>
                    </Link>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to={APP_PATHS.LOGIN}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Content */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  isActive(link.path)
                    ? 'text-brand-500 font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <Link
                  to={APP_PATHS.ADMIN}
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-semibold text-brand-500"
                >
                  Admin Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-rose-500"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to={APP_PATHS.LOGIN}
                onClick={() => setIsOpen(false)}
                className="block py-2 text-sm font-medium text-slate-600 dark:text-slate-400"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </Container>
    </nav>
  );
}

export default Navbar;
