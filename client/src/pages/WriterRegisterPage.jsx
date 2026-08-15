import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Container from '../components/Container';
import useAuthStore from '../features/auth/store/useAuthStore';
import { APP_PATHS } from '../constants';
import { PenTool, Mail, Lock, User, AlertCircle, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

export function WriterRegisterPage() {
  const navigate = useNavigate();
  const registerWriter = useAuthStore((state) => state.registerWriter);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify both password fields.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      await registerWriter(formData.name.trim(), formData.email.trim(), formData.password);
      navigate(APP_PATHS.WRITER, { replace: true });
    } catch (err) {
      const serverMessage = err.response?.data?.error?.message;
      if (err.response?.status === 409) {
        setError('An account with this email address already exists. Please sign in instead.');
      } else {
        setError(serverMessage || 'Registration failed. Please check your details and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Become a Writer — DevAtlas</title>
        <meta name="description" content="Join DevAtlas as a technical writer contributor. Share your knowledge, write technical articles, and reach developer audiences." />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-16 flex items-center justify-center">
        <Container className="max-w-md w-full">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-brand-500/20">
                <PenTool size={22} />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">Become a Writer</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Join our developer contributor platform and share technical insights.
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
                  Full Name *
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

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
                  Password (Min 8 Chars) *
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                <span>{isLoading ? 'Creating Account...' : 'Register as Writer'}</span>
              </button>
            </form>

            {/* Footer Sign-In Link */}
            <div className="text-center mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              Already have a writer account?{' '}
              <Link to={APP_PATHS.WRITER_LOGIN} className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
                Sign in here
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}

export default WriterRegisterPage;
