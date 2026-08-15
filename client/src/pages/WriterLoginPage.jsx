import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Container from '../components/Container';
import useAuthStore from '../features/auth/store/useAuthStore';
import { APP_PATHS } from '../constants';
import { PenTool, Mail, Lock, AlertCircle, ArrowRight, RefreshCw, UserCheck } from 'lucide-react';

export function WriterLoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(formData.email.trim(), formData.password);
      navigate(APP_PATHS.WRITER, { replace: true });
    } catch (err) {
      const serverMessage = err.response?.data?.error?.message;
      if (err.response?.status === 403) {
        setError('Your account has been deactivated. Please contact a DevAtlas administrator.');
      } else {
        setError(serverMessage || 'Invalid email or password. Please verify your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Writer Portal Sign In — DevAtlas</title>
        <meta name="description" content="Sign in to your DevAtlas Writer Portal to write articles, respond to editorial feedback, and track review status." />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-16 flex items-center justify-center">
        <Container className="max-w-md w-full">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-brand-500/20">
                <PenTool size={22} />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">Writer Sign In</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Access your writer portal to manage technical article drafts and reviews.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 rounded-2xl text-xs text-rose-600 dark:text-rose-400 font-medium flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all cursor-pointer inline-flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                <span>{isLoading ? 'Signing In...' : 'Sign In to Writer Portal'}</span>
              </button>
            </form>

            {/* Footer Register Link */}
            <div className="text-center mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              Don't have a writer account yet?{' '}
              <Link to={APP_PATHS.WRITER_REGISTER} className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
                Become a Writer
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}

export default WriterLoginPage;
