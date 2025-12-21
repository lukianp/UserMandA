/**
 * Error Boundary Component
 *
 * Catches React errors in the component tree and displays a fallback UI.
 * Logs errors for debugging and provides recovery options.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';

import { Button } from './atoms/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showErrorDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showErrorDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send error to main process for logging (if available)
    try {
      if (window.electron?.logError) {
        window.electron.logError({
          message: error.message,
          stack: error.stack || '',
          componentStack: errorInfo.componentStack || '',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (e) {
      // Logging not available, ignore
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showErrorDetails: false,
    });
  };

  handleGoHome = (): void => {
    window.location.hash = '#/';
    this.handleReset();
  };

  handleReload = (): void => {
    window.location.reload();
  };

  toggleErrorDetails = (): void => {
    this.setState(prevState => ({
      showErrorDetails: !prevState.showErrorDetails,
    }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, showErrorDetails } = this.state;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Something Went Wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                We apologize for the inconvenience. An unexpected error has occurred.
              </p>
            </div>

            {/* Error Details (Collapsible) */}
            {this.props.showDetails !== false && (
              <div className="mb-6">
                <button
                  onClick={this.toggleErrorDetails}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-2"
                >
                  <Bug className="w-4 h-4" />
                  {showErrorDetails ? 'Hide' : 'Show'} Error Details
                </button>

                {showErrorDetails && (
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-md p-4 space-y-4">
                    {/* Error Message */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        Error Message:
                      </h3>
                      <p className="text-xs text-red-600 dark:text-red-400 font-mono">
                        {error?.message || 'Unknown error'}
                      </p>
                    </div>

                    {/* Stack Trace - REMOVED FOR SECURITY */}
                    {process.env.NODE_ENV === 'development' && error?.stack && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          Stack Trace (Development Only):
                        </h3>
                        <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono overflow-x-auto bg-white dark:bg-gray-800 p-2 rounded">
                          {error.stack}
                        </pre>
                      </div>
                    )}

                    {/* Component Stack */}
                    {errorInfo?.componentStack && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          Component Stack:
                        </h3>
                        <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono overflow-x-auto bg-white dark:bg-gray-800 p-2 rounded max-h-40">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                onClick={this.handleReset}
                icon={<RefreshCw className="w-4 h-4" />}
                className="flex-1"
              >
                Try Again
              </Button>
              <Button
                variant="secondary"
                onClick={this.handleGoHome}
                icon={<Home className="w-4 h-4" />}
                className="flex-1"
              >
                Go to Home
              </Button>
              <Button
                variant="secondary"
                onClick={this.handleReload}
                icon={<RefreshCw className="w-4 h-4" />}
                className="flex-1"
              >
                Reload App
              </Button>
            </div>

            {/* Helpful Tips */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Common Solutions:
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 dark:text-blue-400">•</span>
                  <span>Try refreshing the page or navigating back to home</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 dark:text-blue-400">•</span>
                  <span>Clear your browser cache if the error persists</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 dark:text-blue-400">•</span>
                  <span>Check your internet connection for network-related errors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 dark:text-blue-400">•</span>
                  <span>Restart the application if the problem continues</span>
                </li>
              </ul>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                If this problem persists, please{' '}
                <a
                  href="https://github.com/anthropics/claude-code/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  report the issue
                </a>
                {' '}with the error details above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap a component with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
): React.FC<P> {
  return (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
