import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('WeatherPulse caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-8 rounded-3xl text-center space-y-5 border border-rose-500/30 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto ring-8 ring-rose-500/10">
              <AlertCircle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-white tracking-tight m-0">
                WeatherPulse Encountered an Issue
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                {this.state.error?.message || 'A script error occurred while rendering the dashboard.'}
              </p>
            </div>

            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-sky-500/25 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload WeatherPulse</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
