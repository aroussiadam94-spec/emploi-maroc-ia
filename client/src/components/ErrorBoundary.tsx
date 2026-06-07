/**
 * components/ErrorBoundary.tsx
 * React class component that catches uncaught render errors anywhere in its
 * subtree and displays a user-friendly fallback UI instead of a blank screen.
 *
 * React error boundaries must be class components because they rely on the
 * getDerivedStateFromError lifecycle which is not available in function components.
 *
 * Usage: Wrap the app root (or any risky subtree) with <ErrorBoundary>.
 */

import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

// Props: only children is required.
interface Props {
  children: ReactNode;
}

// Internal state tracks whether an error has been caught and the error itself.
interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // Start in the non-error state so the children render normally.
    this.state = { hasError: false, error: null };
  }

  /**
   * Static lifecycle method called by React when a descendant throws during render.
   * Returns the new state that will cause the fallback UI to be shown.
   */
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    // When an error has been caught, show the fallback UI.
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            {/* Warning icon to visually signal that something went wrong */}
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-4">An unexpected error occurred.</h2>

            {/* Display the full stack trace so developers can diagnose the issue */}
            <div className="p-4 w-full rounded bg-muted overflow-auto mb-6">
              <pre className="text-sm text-muted-foreground whitespace-break-spaces">
                {this.state.error?.stack}
              </pre>
            </div>

            {/* Reload button – the simplest recovery action for the user */}
            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer"
              )}
            >
              <RotateCcw size={16} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    // No error – render children normally.
    return this.props.children;
  }
}

export default ErrorBoundary;
