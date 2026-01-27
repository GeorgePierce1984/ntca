import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const debugEnabled =
        typeof window !== "undefined" &&
        (new URLSearchParams(window.location.search).has("debug") ||
          window.localStorage.getItem("debugErrors") === "true");

      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Something went wrong
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              An error occurred while loading this page. Please try refreshing.
            </p>
            {this.state.error?.message && (
              <p className="text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-700 rounded p-3">
                <span className="font-semibold">Error:</span> {this.state.error.message}
              </p>
            )}
            {(process.env.NODE_ENV === "development" || debugEnabled) && this.state.error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-neutral-500 mb-2">
                  Error Details {process.env.NODE_ENV === "development" ? "(Dev)" : "(Debug)"}
                </summary>
                <pre className="text-xs bg-neutral-100 dark:bg-neutral-900 p-3 rounded overflow-auto max-h-48">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

