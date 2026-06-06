"use client";
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';
import Sentry from '@/lib/sentry';

/**
 * Error Boundary component to catch and handle React errors gracefully
 * Prevents the entire app from crashing when a component throws an error
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    const errorDetails = {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Send to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      Sentry.withScope((scope) => {
        scope.setContext("errorInfo", errorInfo);
        scope.setContext("componentStack", {
          stack: errorInfo.componentStack
        });
        scope.setLevel('error');
        scope.setTag('errorBoundary', 'true');
        Sentry.captureException(error);
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', errorDetails);
    }

    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-3xl font-bold text-slate-900 text-center mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-slate-600 text-center mb-8">
              We're sorry for the inconvenience. An unexpected error occurred while rendering this page.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 max-h-64 overflow-auto">
                <p className="font-mono text-sm text-red-600 mb-2">
                  <strong>Error:</strong> {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-slate-700 font-medium mb-2">
                      Component Stack Trace
                    </summary>
                    <pre className="text-xs text-slate-600 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid md:grid-cols-3 gap-3">
              <Button
                onClick={this.handleReset}
                className="bg-brand-purple hover:bg-[#3F2BD9] text-white flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              
              <Button
                onClick={this.handleReload}
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-6 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-500 mb-2">
                If this problem persists, please contact our support team
              </p>
              <a
                href="mailto:support@credsure.com"
                className="text-brand-purple hover:text-[#3F2BD9] font-medium text-sm"
              >
                support@credsure.com
              </a>
            </div>

            {/* Error Count (Development) */}
            {process.env.NODE_ENV === 'development' && this.state.errorCount > 1 && (
              <p className="mt-4 text-center text-xs text-slate-400">
                Error occurred {this.state.errorCount} times
              </p>
            )}
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
