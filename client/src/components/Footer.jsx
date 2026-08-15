import { Link } from 'react-router-dom';
import Container from './Container';
import { APP_PATHS } from '@/constants';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 py-8 mt-auto transition-colors duration-200">
      <Container>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div>
            © {new Date().getFullYear()} DevAtlas. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link to={APP_PATHS.TERMS} className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              Terms of Use
            </Link>
            <Link to={APP_PATHS.PRIVACY} className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              Privacy Policy
            </Link>
            <a
              href="https://github.com/mansoorxdev/devatlas-platform"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
