import { forwardRef, useId, useState } from "react";

const VARIANTS = {
  ink: "glass-ink",
  ember: "glass-ember",
  ocean: "glass-ocean",
  forest: "glass-forest",
  aurora: "glass-aurora",
  clear: "glass-clear",
};

const joinClasses = (...parts) => parts.filter(Boolean).join(" ");

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  );
}

const GlassInput = forwardRef(function GlassInput(
  {
    variant = "clear",
    type = "text",
    icon,
    label,
    id,
    disabled = false,
    onFocus,
    onBlur,
    onAction,
    actionLabel = "Submit",
    className = "",
    style,
    inputClassName = "",
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [focused, setFocused] = useState(false);
  const trailingIcon = icon === undefined ? <SearchIcon /> : icon;

  const ringStyle = focused
    ? {
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -16px 24px -10px color-mix(in srgb, var(--glow-color) 70%, transparent), 0 0 0 3px color-mix(in srgb, var(--glow-color) 38%, transparent), 0 20px 36px -14px rgba(0,0,0,0.8)",
      }
    : null;

  const handleFocus = (event) => {
    setFocused(true);
    if (onFocus) onFocus(event);
  };

  const handleBlur = (event) => {
    setFocused(false);
    if (onBlur) onBlur(event);
  };

  const actionContent = trailingIcon ? (
    onAction ? (
      <button
        type="button"
        onClick={onAction}
        disabled={disabled}
        aria-label={actionLabel}
        style={{
          display: "grid",
          placeItems: "center",
          width: "100%",
          height: "100%",
          padding: 0,
          border: 0,
          background: "transparent",
          color: "inherit",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {trailingIcon}
      </button>
    ) : (
      <span aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
        {trailingIcon}
      </span>
    )
  ) : null;

  return (
    <div
      className={joinClasses("glass", "glass-capsule", VARIANTS[variant] || VARIANTS.clear, className)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        minHeight: "3.5rem",
        padding: "0.45rem",
        opacity: disabled ? 0.5 : 1,
        filter: disabled ? "grayscale(0.6)" : undefined,
        ...ringStyle,
        ...style,
      }}
    >
      {label ? (
        <label htmlFor={inputId} className="visually-hidden">
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        type={type}
        disabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-label={label ? undefined : rest["aria-label"] || rest.placeholder}
        className={joinClasses("glass-input-field", inputClassName)}
        style={{
          flex: "1 1 auto",
          minWidth: 0,
          height: "2.6rem",
          padding: "0 1.2rem",
          border: 0,
          outline: "none",
          borderRadius: "999px",
          color: "var(--text-high)",
          fontSize: "1rem",
          background: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -8px 14px -10px rgba(0,0,0,0.6)",
          cursor: disabled ? "not-allowed" : "text",
        }}
        {...rest}
      />
      {actionContent ? (
        <span
          style={{
            display: "grid",
            placeItems: "center",
            flex: "none",
            width: "2.6rem",
            height: "2.6rem",
            borderRadius: "999px",
            color: "var(--text-high)",
            background: "linear-gradient(160deg, rgba(0,0,0,0.78), rgba(8,12,15,0.95))",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22), inset 0 0 0 1px rgba(255,255,255,0.08)",
          }}
        >
          {actionContent}
        </span>
      ) : null}
    </div>
  );
});

export default GlassInput;
