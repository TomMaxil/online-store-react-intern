import { forwardRef } from "react";

const VARIANTS = {
  ink: "glass-ink",
  ember: "glass-ember",
  ocean: "glass-ocean",
  forest: "glass-forest",
  aurora: "glass-aurora",
  clear: "glass-clear",
};

const SIZES = {
  sm: { minHeight: "2.5rem", fontSize: "0.875rem", badge: "1.75rem", padX: "1.2rem", padEdge: "0.35rem" },
  md: { minHeight: "3rem", fontSize: "0.95rem", badge: "2.25rem", padX: "1.6rem", padEdge: "0.4rem" },
  lg: { minHeight: "3.75rem", fontSize: "1.1rem", badge: "2.9rem", padX: "2rem", padEdge: "0.45rem" },
};

const joinClasses = (...parts) => parts.filter(Boolean).join(" ");

const GlassButton = forwardRef(function GlassButton(
  {
    as: Component = "button",
    variant = "ink",
    size = "md",
    icon = null,
    iconPosition = "start",
    fullWidth = false,
    disabled = false,
    type = "button",
    className = "",
    style,
    children,
    ...rest
  },
  ref
) {
  const scale = SIZES[size] || SIZES.md;
  const hasLabel = children !== undefined && children !== null && children !== false;
  const hasIcon = Boolean(icon);
  const iconOnly = hasIcon && !hasLabel;
  const iconFirst = hasIcon && hasLabel && iconPosition === "start";
  const iconLast = hasIcon && hasLabel && iconPosition === "end";
  const isNativeButton = Component === "button";

  const badge = hasIcon ? (
    <span
      aria-hidden="true"
      style={{
        display: "inline-grid",
        placeItems: "center",
        flex: "none",
        width: scale.badge,
        height: scale.badge,
        borderRadius: "999px",
        background: "linear-gradient(160deg, rgba(255,255,255,0.14), rgba(255,255,255,0.02))",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 0 0 1px rgba(255,255,255,0.16), 0 6px 12px -6px rgba(0,0,0,0.7)",
      }}
    >
      {icon}
    </span>
  ) : null;

  const paddingLeft = iconFirst || iconOnly ? scale.padEdge : scale.padX;
  const paddingRight = iconLast || iconOnly ? scale.padEdge : scale.padX;

  const composedStyle = {
    minHeight: scale.minHeight,
    fontSize: scale.fontSize,
    paddingBlock: scale.padEdge,
    paddingLeft,
    paddingRight,
    width: fullWidth ? "100%" : iconOnly ? scale.minHeight : undefined,
    aspectRatio: iconOnly ? "1 / 1" : undefined,
    ...style,
  };

  const nativeProps = isNativeButton
    ? { type, disabled }
    : { "aria-disabled": disabled || undefined, tabIndex: disabled ? -1 : rest.tabIndex };

  return (
    <Component
      ref={ref}
      className={joinClasses(
        "glass",
        "glass-capsule",
        "glass-btn",
        "glass-interactive",
        VARIANTS[variant] || VARIANTS.ink,
        className
      )}
      style={composedStyle}
      {...nativeProps}
      {...rest}
    >
      {iconFirst || iconOnly ? badge : null}
      {hasLabel ? <span style={{ flex: "1 1 auto", textAlign: "center" }}>{children}</span> : null}
      {iconLast ? badge : null}
    </Component>
  );
});

export default GlassButton;
