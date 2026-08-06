import React from 'react';
import { AlertOctagon } from 'lucide-react';
import Container from './Container';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log exception details for production auditing
    console.error('ErrorBoundary caught uncaught React exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <Container className="max-w-md flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-6">
              <AlertOctagon size={32} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-3">Something went wrong</h1>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              An unexpected error occurred in the user interface. Please try reloading the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-950/30 transition-all cursor-pointer"
            >
              Reload Page
            </button>
          </Container>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
