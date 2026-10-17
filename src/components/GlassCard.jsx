import { forwardRef } from "react";

const VARIANTS = {
  ink: "glass-ink",
  ember: "glass-ember",
  ocean: "glass-ocean",
  forest: "glass-forest",
  aurora: "glass-aurora",
  clear: "glass-clear",
};

const SHAPES = {
  panel: "glass-panel",
  tile: "glass-tile",
  capsule: "glass-capsule",
};

const PADDING = {
  none: "0",
  sm: "1rem",
  md: "1.5rem",
  lg: "2rem",
};

const joinClasses = (...parts) => parts.filter(Boolean).join(" ");

const GlassCard = forwardRef(function GlassCard(
  {
    as: Component = "div",
    variant = "ink",
    shape = "panel",
    padding = "md",
    interactive = false,
    className = "",
    style,
    children,
    ...rest
  },
  ref
) {
  return (
    <Component
      ref={ref}
      className={joinClasses(
        "glass",
        SHAPES[shape] || SHAPES.panel,
        VARIANTS[variant] || VARIANTS.ink,
        interactive && "glass-interactive",
        className
      )}
      style={{
        padding: PADDING[padding] ?? PADDING.md,
        transform: interactive ? undefined : "translateZ(0)",
        willChange: interactive ? "transform, box-shadow" : undefined,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  );
});

export default GlassCard;
