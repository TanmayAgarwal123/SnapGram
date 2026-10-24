import { Component, ErrorInfo, ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

/**
 * Catches render-time errors anywhere in the tree and shows a recoverable
 * fallback instead of a blank white screen.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this is where you'd report to Sentry/LogRocket/etc.
    console.error("Uncaught render error:", error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.assign("/");
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex-center min-h-screen w-full flex-col gap-5 bg-dark-1 p-5 text-center">
          <img
            src="/assets/images/logo.svg"
            alt="SnapGram"
            width={160}
            className="opacity-80"
          />
          <h1 className="h3-bold md:h2-bold text-light-1">
            Something went wrong
          </h1>
          <p className="body-medium max-w-md text-light-3">
            An unexpected error occurred. Try reloading the page — if it keeps
            happening, come back in a little while.
          </p>
          <button
            onClick={this.handleReload}
            className="bg-primary-500 hover:bg-primary-600 mt-2 rounded-lg px-6 py-3 text-light-1 transition"
          >
            Reload SnapGram
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
