'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-red-50 rounded-full">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">
                Something went wrong
              </h2>
              <p className="text-gray-600">
                We encountered an error while loading the H1B data. This might be a temporary issue.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/h1b-dashboard'}
                className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded border text-xs font-mono overflow-auto">
                  <div className="text-red-600 font-semibold">
                    {this.state.error.name}: {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <pre className="mt-2 text-gray-600 whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void,
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Specific error boundary for BigQuery operations
export function BigQueryErrorBoundary({ 
  children, 
  context = 'BigQuery operation', 
}: { 
  children: ReactNode;
  context?: string;
}) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error(`${context} error:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context,
    });
  };

  const fallback = (
    <div className="min-h-[300px] flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-amber-50 rounded-full">
            <AlertTriangle className="w-10 h-10 text-amber-500" />
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-gray-900">
            Data Temporarily Unavailable
          </h3>
          <p className="text-sm text-gray-600">
            We're having trouble loading the H1B data. Please try refreshing the page.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          <RefreshCcw className="w-3 h-3 mr-1" />
          Refresh Page
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}