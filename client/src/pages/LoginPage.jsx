import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export function LoginPage() {
  return (
    <>
      <Helmet>
        <title>Sign In - DevAtlas</title>
      </Helmet>
      <div className="max-w-md mx-auto p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl text-center shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">Sign In</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">User Authentication has not been implemented yet.</p>
        <Link to="/" className="text-brand-500 font-semibold hover:underline">Back to Dashboard</Link>
      </div>
    </>
  );
}

export default LoginPage;
