import { forwardRef, useId, useState } from "react";

const VARIANTS = {
  ink: "glass-ink",
  ember: "glass-ember",
  ocean: "glass-ocean",
  forest: "glass-forest",
  aurora: "glass-aurora",
  clear: "glass-clear",
};

const SIZES = {
  sm: { trackW: 3.2, trackH: 1.9, knob: 1.4, pad: 0.25, minHeight: "2.75rem", fontSize: "0.9rem" },
  md: { trackW: 4.1, trackH: 2.4, knob: 1.9, pad: 0.25, minHeight: "3.5rem", fontSize: "1rem" },
  lg: { trackW: 5, trackH: 2.9, knob: 2.4, pad: 0.25, minHeight: "4.25rem", fontSize: "1.15rem" },
};

const PRESS_GROWTH = 0.35;

const joinClasses = (...parts) => parts.filter(Boolean).join(" ");

const GlassSwitch = forwardRef(function GlassSwitch(
  {
    checked,
    defaultChecked = false,
    onChange,
    label,
    variant = "ink",
    size = "md",
    disabled = false,
    id,
    name,
    className = "",
    style,
    onClick,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const labelId = `${id || generatedId}-label`;
  const scale = SIZES[size] || SIZES.md;
  const isControlled = checked !== undefined;
  const [internal, setInternal] = useState(defaultChecked);
  const [pressed, setPressed] = useState(false);
  const isOn = isControlled ? checked : internal;
  const hasLabel = label !== undefined && label !== null && label !== false;

  const handleClick = (event) => {
    if (onClick) onClick(event);
    if (disabled || event.defaultPrevented) return;
    const next = !isOn;
    if (!isControlled) setInternal(next);
    if (onChange) onChange(next, event);
  };

  const release = () => setPressed(false);

  const knobWidth = scale.knob + (pressed ? PRESS_GROWTH : 0);
  const travel = scale.trackW - scale.knob - scale.pad * 2 - (pressed ? PRESS_GROWTH : 0);

  const trackBackground = isOn
    ? "linear-gradient(180deg, color-mix(in srgb, var(--glow-color) 45%, #060a24) 0%, color-mix(in srgb, var(--glow-color) 92%, #000) 100%)"
    : "linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03) 40%, rgba(0,0,0,0.55))";

  const trackShadow = isOn
    ? "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 0 0 1px rgba(255,255,255,0.12), inset 0 -8px 14px -6px color-mix(in srgb, var(--glow-alt) 70%, transparent), 0 8px 18px -8px color-mix(in srgb, var(--glow-color) 70%, transparent)"
    : "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 0 0 1px rgba(255,255,255,0.1), inset 0 -6px 12px -8px rgba(0,0,0,0.8)";

  return (
    <button
      ref={ref}
      id={id}
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-labelledby={hasLabel ? labelId : undefined}
      disabled={disabled}
      onClick={handleClick}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onBlur={release}
      className={joinClasses(
        "glass",
        "glass-capsule",
        "glass-interactive",
        VARIANTS[variant] || VARIANTS.ink,
        className
      )}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: hasLabel ? "space-between" : "center",
        gap: "1.25rem",
        minHeight: scale.minHeight,
        padding: hasLabel ? "0.45rem 0.55rem 0.45rem 1.6rem" : "0.45rem",
        fontSize: scale.fontSize,
        fontWeight: 500,
        textAlign: "left",
        touchAction: "manipulation",
        ...style,
      }}
      {...rest}
    >
      {hasLabel ? (
        <span id={labelId} style={{ flex: "1 1 auto" }}>
          {label}
        </span>
      ) : null}
      <span
        aria-hidden="true"
        style={{
          position: "relative",
          display: "block",
          flex: "none",
          width: `${scale.trackW}rem`,
          height: `${scale.trackH}rem`,
          borderRadius: "999px",
          background: trackBackground,
          boxShadow: trackShadow,
          transition: "background 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: `${scale.pad}rem`,
            left: `${scale.pad}rem`,
            width: `${knobWidth}rem`,
            height: `${scale.knob}rem`,
            borderRadius: "999px",
            background: "radial-gradient(circle at 35% 28%, #ffffff 0%, #eceaff 55%, #cfd2ee 100%)",
            boxShadow: "0 6px 14px -4px rgba(0,0,0,0.65), inset 0 -3px 6px rgba(120,120,180,0.35), inset 0 1px 0 rgba(255,255,255,0.95)",
            transform: `translateX(${isOn ? travel : 0}rem)`,
            transition: "transform 0.5s cubic-bezier(0.34, 1.4, 0.5, 1), width 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </span>
      {name ? <input type="hidden" name={name} value={isOn ? "on" : "off"} /> : null}
    </button>
  );
});

export default GlassSwitch;
