import { Helmet } from 'react-helmet-async';
import Container from '../components/Container';

export function HomePage() {
  return (
    <>
      <Helmet>
        <title>DevAtlas - Unified Developer Platform</title>
      </Helmet>

      <Container className="flex-grow flex flex-col items-center justify-center py-12 relative overflow-hidden text-center">
        {/* Decorative gradient glowing backgrounds */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto z-10 flex flex-col items-center">
          {/* Logo/Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
            DevAtlas Platform v1.1.0 MVP
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-slate-900 via-slate-700 to-indigo-600 dark:from-slate-100 dark:via-slate-100 dark:to-brand-400 bg-clip-text text-transparent transition-colors">
            DevAtlas
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mb-8 leading-relaxed">
            The ultimate single-point-of-reference developer platform. Your unified knowledge graph connecting tutorials, code snippets, errors, and system architectures.
          </p>

          {/* Main Action Callouts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full text-left">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:border-brand-500/30 transition-all group">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-brand-500 transition-colors">Client App</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Vite + React 19 single-page application bootstrapped with Tailwind CSS v4.</p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:border-brand-500/30 transition-all group">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-brand-500 transition-colors">Server App</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Express.js API server configured with Layer-First repository pattern routing.</p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:border-brand-500/30 transition-all group">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-brand-500 transition-colors">Shared Workspaces</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Monorepo orchestration using npm workspaces for seamless development workflows.</p>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}

export default HomePage;
