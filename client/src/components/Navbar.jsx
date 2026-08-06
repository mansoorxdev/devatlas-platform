import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Terminal } from 'lucide-react';
import { useTheme } from '../context/ThemeProvider';
import { APP_PATHS } from '../constants';
import Container from './Container';

export function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Articles', path: APP_PATHS.ARTICLES },
    { name: 'Snippets', path: APP_PATHS.SNIPPETS },
    { name: 'DevTools', path: APP_PATHS.DEVTOOLS },
  ];

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const isActive = (path) => location.pathname === path;

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

            <hr className="w-px h-5 bg-slate-200 dark:bg-slate-800 border-none" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>

            {/* Login button */}
            <Link
              to={APP_PATHS.LOGIN}
              className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-slate-100 dark:text-slate-950 rounded-xl transition-all shadow-sm"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Actions (Menu + Theme toggle) */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
            </button>

            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-900 py-4 space-y-3 flex flex-col transition-all">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-base font-medium px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 ${
                  isActive(link.path)
                    ? 'text-brand-500 font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to={APP_PATHS.LOGIN}
              onClick={() => setIsOpen(false)}
              className="w-full text-center px-4 py-2.5 font-semibold text-white bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-slate-100 dark:text-slate-950 rounded-xl transition-all shadow-sm"
            >
              Sign In
            </Link>
          </div>
        )}
      </Container>
    </nav>
  );
}

export default Navbar;
