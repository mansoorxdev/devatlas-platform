import { useEffect } from 'react';
import { useAuthStore } from '@features/auth/store/useAuthStore.js';
import LoadingSpinner from './components/LoadingSpinner';
import AppRoutes from './routes/AppRoutes';

function App() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const initializeSession = useAuthStore((state) => state.initializeSession);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Show full-screen spinner until session initialization completes
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <AppRoutes />;
}

export default App;
