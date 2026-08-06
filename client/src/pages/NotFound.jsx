import { Link } from 'react-router-dom';
import { Compass, MoveLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Container from '../components/Container';

export function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found - DevAtlas</title>
      </Helmet>
      <div className="flex-grow flex items-center justify-center p-6 text-center">
        <Container className="max-w-md flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 mb-8 animate-bounce">
            <Compass size={40} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-slate-100">
            Lost in the Atlas?
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            The page you are looking for doesn't exist or has been moved. Let's find your way back.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-brand-950/40 hover:shadow-brand-900/40 transition-all"
          >
            <MoveLeft size={16} />
            Back to Dashboard
          </Link>
        </Container>
      </div>
    </>
  );
}

export default NotFound;
