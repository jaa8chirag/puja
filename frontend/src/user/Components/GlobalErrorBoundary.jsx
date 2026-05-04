import React from 'react';
import { RefreshCcw, Home } from 'lucide-react';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔱 Sri Vedic Puja - Global Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFF4E1] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-orange-200 shadow-xl">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-600">
              <span className="text-4xl font-serif">ॐ</span>
            </div>
            
            <h1 className="text-2xl font-serif font-bold text-gray-900 mb-3">
              Something went wrong
            </h1>
            
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Don't worry, the divine energy is still with you. A small technical glitch occurred. Please try refreshing the page.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-100"
              >
                <RefreshCcw size={18} /> Refresh Page
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-white text-orange-600 border border-orange-200 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-50 transition-all active:scale-95"
              >
                <Home size={18} /> Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
