import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { THEME_COLORS } from "../types";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full mx-4">
            <div
              className="bg-white rounded-lg shadow-lg border p-6 text-center"
              style={{ borderColor: THEME_COLORS.border }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${THEME_COLORS.status.error}20` }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: THEME_COLORS.status.error }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                予期しないエラーが発生しました
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                アプリケーションでエラーが発生しました。
                <br />
                ページを再読み込みしてお試しください。
              </p>
              {this.state.error && (
                <details className="mb-4 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                    エラー詳細を表示
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border overflow-auto max-h-32">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 hover:opacity-90"
                  style={{ backgroundColor: THEME_COLORS.accent }}
                >
                  ページを再読み込み
                </button>
                <button
                  onClick={() =>
                    this.setState({ hasError: false, error: null })
                  }
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  リトライ
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
