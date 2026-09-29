// src/components/ErrorBanner.jsx
import React from "react";
import "./ErrorBanner.css";

/**
 * A reusable error banner that displays a title, an optional message
 * extracted from an Error object or a plain string, and an optional
 * retry callback.
 *
 * @param {{
 *   title?: string,
 *   error?: Error | string | null,
 *   message?: string,
 *   onRetry?: () => void,
 *   retryLabel?: string,
 *   className?: string,
 * }} props
 *
 * @example
 * <ErrorBanner
 *   title="Cannot connect to server"
 *   error={err}
 *   onRetry={handleRetry}
 * />
 */
const ErrorBanner = ({
  title = "Something went wrong",
  error = null,
  message,
  onRetry,
  retryLabel = "Try again",
  className = "",
}) => {
  // Resolve display message: explicit `message` prop wins, then Error.message.
  const displayMessage =
    message ||
    (error instanceof Error ? error.message : null) ||
    (typeof error === "string" ? error : null) ||
    "An unexpected error occurred. Please try again.";

  return (
    <div
      className={["error-banner", className].filter(Boolean).join(" ")}
      role="alert"
      aria-live="assertive"
    >
      {/* Error icon — inline SVG so there are no extra dependencies */}
      <svg
        className="error-banner__icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>

      <div className="error-banner__body">
        <h2 className="error-banner__title">{title}</h2>
        <p className="error-banner__message">{displayMessage}</p>

        {typeof onRetry === "function" && (
          <button
            type="button"
            className="error-banner__retry"
            onClick={onRetry}
          >
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBanner;
