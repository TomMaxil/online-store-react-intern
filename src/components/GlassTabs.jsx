import { forwardRef, useCallback, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

const VARIANTS = {
  ink: "glass-ink",
  ember: "glass-ember",
  ocean: "glass-ocean",
  forest: "glass-forest",
  aurora: "glass-aurora",
  clear: "glass-clear",
};

const joinClasses = (...parts) => parts.filter(Boolean).join(" ");

const GlassTabs = forwardRef(function GlassTabs(
  {
    tabs = [],
    value,
    defaultValue,
    onChange,
    variant = "ocean",
    activation = "automatic",
    fullWidth = false,
    label,
    id,
    className = "",
    style,
    panelClassName = "",
    panelStyle,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const baseId = id || generatedId;
  const listRef = useRef(null);
  const tabRefs = useRef({});
  const isControlled = value !== undefined;
  const firstEnabled = tabs.find((tab) => !tab.disabled);
  const [internal, setInternal] = useState(defaultValue !== undefined ? defaultValue : firstEnabled ? firstEnabled.id : undefined);
  const [indicator, setIndicator] = useState({ left: 0, top: 0, width: 0, height: 0, ready: false });
  const activeId = isControlled ? value : internal;
  const hasPanels = tabs.some((tab) => tab.content !== undefined);

  const enabledTabs = useMemo(() => tabs.filter((tab) => !tab.disabled), [tabs]);

  const select = useCallback(
    (tabId) => {
      if (!isControlled) setInternal(tabId);
      if (onChange && tabId !== activeId) onChange(tabId);
    },
    [isControlled, onChange, activeId]
  );

  const measure = useCallback(() => {
    const node = tabRefs.current[activeId];
    if (!node) return;
    setIndicator({
      left: node.offsetLeft,
      top: node.offsetTop,
      width: node.offsetWidth,
      height: node.offsetHeight,
      ready: true,
    });
  }, [activeId]);

  useLayoutEffect(() => {
    measure();
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    Object.values(tabRefs.current).forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, [measure, tabs]);

  const focusTab = (tabId) => {
    const node = tabRefs.current[tabId];
    if (node) node.focus();
    if (activation === "automatic") select(tabId);
  };

  const handleKeyDown = (event) => {
    if (!enabledTabs.length) return;
    const currentIndex = enabledTabs.findIndex((tab) => tab.id === document.activeElement?.dataset?.tabId);
    const index = currentIndex >= 0 ? currentIndex : Math.max(enabledTabs.findIndex((tab) => tab.id === activeId), 0);
    let target = null;
    if (event.key === "ArrowRight") target = enabledTabs[(index + 1) % enabledTabs.length];
    else if (event.key === "ArrowLeft") target = enabledTabs[(index - 1 + enabledTabs.length) % enabledTabs.length];
    else if (event.key === "Home") target = enabledTabs[0];
    else if (event.key === "End") target = enabledTabs[enabledTabs.length - 1];
    if (target) {
      event.preventDefault();
      focusTab(target.id);
    }
  };

  const tabDomId = (tabId) => `${baseId}-tab-${tabId}`;
  const panelDomId = (tabId) => `${baseId}-panel-${tabId}`;

  return (
    <div className={className} style={style}>
      <div
        className={joinClasses("glass", "glass-capsule", VARIANTS[variant] || VARIANTS.ocean)}
        style={{ display: fullWidth ? "block" : "inline-block", maxWidth: "100%", padding: "0.4rem" }}
      >
        <div
          ref={(node) => {
            listRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          role="tablist"
          aria-orientation="horizontal"
          aria-label={label}
          onKeyDown={handleKeyDown}
          style={{
            position: "relative",
            display: "flex",
            gap: "0.25rem",
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          {...rest}
        >
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: indicator.width,
              height: indicator.height,
              transform: `translate(${indicator.left}px, ${indicator.top}px)`,
              opacity: indicator.ready ? 1 : 0,
              borderRadius: "999px",
              pointerEvents: "none",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.05) 45%, color-mix(in srgb, var(--glow-color) 38%, rgba(0,0,0,0.5)))",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 0 0 1px rgba(255,255,255,0.14), inset 0 -8px 14px -6px color-mix(in srgb, var(--glow-color) 80%, transparent), 0 10px 20px -10px color-mix(in srgb, var(--glow-color) 70%, transparent)",
              transition: indicator.ready
                ? "transform 0.55s cubic-bezier(0.34, 1.2, 0.5, 1), width 0.45s cubic-bezier(0.22, 1, 0.36, 1), height 0.3s"
                : "none",
            }}
          />
          {tabs.map((tab) => {
            const selected = tab.id === activeId;
            return (
              <button
                key={tab.id}
                ref={(node) => {
                  if (node) tabRefs.current[tab.id] = node;
                  else delete tabRefs.current[tab.id];
                }}
                id={tabDomId(tab.id)}
                data-tab-id={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={hasPanels ? panelDomId(tab.id) : undefined}
                tabIndex={selected ? 0 : -1}
                disabled={tab.disabled}
                onClick={() => select(tab.id)}
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  flex: fullWidth ? "1 1 0" : "0 0 auto",
                  minHeight: "2.75rem",
                  padding: "0.5rem 1.35rem",
                  border: 0,
                  borderRadius: "999px",
                  background: "transparent",
                  color: selected ? "var(--text-high)" : "var(--text-mid)",
                  fontSize: "0.95rem",
                  fontWeight: selected ? 600 : 500,
                  whiteSpace: "nowrap",
                  cursor: tab.disabled ? "not-allowed" : "pointer",
                  opacity: tab.disabled ? 0.4 : 1,
                  transition: "color 0.3s, font-weight 0.3s",
                }}
              >
                {tab.icon ? (
                  <span aria-hidden="true" style={{ display: "inline-grid", placeItems: "center" }}>
                    {tab.icon}
                  </span>
                ) : null}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      {hasPanels
        ? tabs.map((tab) => {
            const selected = tab.id === activeId;
            return (
              <div
                key={tab.id}
                id={panelDomId(tab.id)}
                role="tabpanel"
                aria-labelledby={tabDomId(tab.id)}
                hidden={!selected}
                tabIndex={0}
                className={panelClassName}
                style={panelStyle}
              >
                {selected ? tab.content : null}
              </div>
            );
          })
        : null}
    </div>
  );
});

export default GlassTabs;
