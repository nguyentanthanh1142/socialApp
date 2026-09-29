import React from "react";
import "./Spinner.css";

const Spinner = ({ size = "md", label, fullPage = false, className = "" }) => {
  const overlayClass = [
    "spinner-overlay",
    fullPage ? "spinner-overlay--fullpage" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const ringClass = ["spinner-ring", `spinner-ring--${size}`]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={overlayClass} role="status" aria-live="polite">
      <div className={ringClass} aria-hidden="true" />
      {label && <span className="spinner-label">{label}</span>}
      {!label && <span className="sr-only">Loading…</span>}
    </div>
  );
};

export default Spinner;
