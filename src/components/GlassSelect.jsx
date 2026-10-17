import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

const VARIANTS = {
  ink: "glass-ink",
  ember: "glass-ember",
  ocean: "glass-ocean",
  forest: "glass-forest",
  aurora: "glass-aurora",
  clear: "glass-clear",
};

const joinClasses = (...parts) => parts.filter(Boolean).join(" ");

function Chevron({ open }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

const GlassSelect = forwardRef(function GlassSelect(
  {
    options = [],
    value,
    defaultValue,
    onChange,
    placeholder = "Select",
    label,
    name,
    variant = "forest",
    disabled = false,
    id,
    className = "",
    style,
    onKeyDown,
    onBlur,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const baseId = id || generatedId;
  const listId = `${baseId}-listbox`;
  const labelId = `${baseId}-label`;
  const wrapperRef = useRef(null);
  const typeRef = useRef({ buffer: "", timer: null });
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const currentValue = isControlled ? value : internal;

  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === currentValue),
    [options, currentValue]
  );
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;

  const enabledIndexes = useMemo(
    () => options.map((option, index) => (option.disabled ? -1 : index)).filter((index) => index >= 0),
    [options]
  );

  const stepFrom = useCallback(
    (from, direction) => {
      if (!enabledIndexes.length) return -1;
      if (from < 0) return direction > 0 ? enabledIndexes[0] : enabledIndexes[enabledIndexes.length - 1];
      const position = enabledIndexes.indexOf(from);
      if (position === -1) {
        const fallback = enabledIndexes.find((index) => (direction > 0 ? index > from : index < from));
        return fallback === undefined ? enabledIndexes[direction > 0 ? enabledIndexes.length - 1 : 0] : fallback;
      }
      const next = Math.min(Math.max(position + direction, 0), enabledIndexes.length - 1);
      return enabledIndexes[next];
    },
    [enabledIndexes]
  );

  const openMenu = useCallback(
    (preferred) => {
      if (disabled || !enabledIndexes.length) return;
      const start =
        preferred !== undefined
          ? preferred
          : selectedIndex >= 0 && !options[selectedIndex].disabled
          ? selectedIndex
          : enabledIndexes[0];
      setActiveIndex(start);
      setOpen(true);
    },
    [disabled, enabledIndexes, options, selectedIndex]
  );

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  const commit = useCallback(
    (index) => {
      const option = options[index];
      if (!option || option.disabled) return;
      if (!isControlled) setInternal(option.value);
      if (onChange) onChange(option.value, option);
      setOpen(false);
    },
    [isControlled, onChange, options]
  );

  useEffect(() => {
    if (!open) return undefined;
    const handlePointer = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
    };
  }, [open]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const node = document.getElementById(`${listId}-option-${activeIndex}`);
    if (node && node.scrollIntoView) node.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, listId]);

  useEffect(() => {
    const state = typeRef.current;
    return () => clearTimeout(state.timer);
  }, []);

  const typeAhead = (character) => {
    const state = typeRef.current;
    clearTimeout(state.timer);
    state.buffer += character.toLowerCase();
    state.timer = setTimeout(() => {
      state.buffer = "";
    }, 500);
    const origin = open ? activeIndex : selectedIndex;
    const offset = state.buffer.length === 1 ? 1 : 0;
    for (let step = 0; step < options.length; step += 1) {
      const index = (Math.max(origin, 0) + offset + step) % options.length;
      const option = options[index];
      if (!option.disabled && String(option.label).toLowerCase().startsWith(state.buffer)) {
        if (open) setActiveIndex(index);
        else if (!isControlled) setInternal(option.value);
        if (!open && onChange) onChange(option.value, option);
        return;
      }
    }
  };

  const handleKeyDown = (event) => {
    if (onKeyDown) onKeyDown(event);
    if (event.defaultPrevented || disabled) return;
    const { key } = event;

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " ", "Home", "End"].includes(key)) {
        event.preventDefault();
        if (key === "Home") openMenu(enabledIndexes[0]);
        else if (key === "End") openMenu(enabledIndexes[enabledIndexes.length - 1]);
        else openMenu();
        return;
      }
      if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) typeAhead(key);
      return;
    }

    if (key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => stepFrom(current, 1));
    } else if (key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => stepFrom(current, -1));
    } else if (key === "Home") {
      event.preventDefault();
      setActiveIndex(enabledIndexes[0]);
    } else if (key === "End") {
      event.preventDefault();
      setActiveIndex(enabledIndexes[enabledIndexes.length - 1]);
    } else if (key === "Enter" || key === " ") {
      event.preventDefault();
      commit(activeIndex);
    } else if (key === "Escape") {
      event.preventDefault();
      closeMenu();
    } else if (key === "Tab") {
      closeMenu();
    } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      typeAhead(key);
    }
  };

  const handleBlur = (event) => {
    if (onBlur) onBlur(event);
    if (wrapperRef.current && !wrapperRef.current.contains(event.relatedTarget)) closeMenu();
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", display: "inline-block", width: "100%", ...style }} className={className}>
      {label ? (
        <span id={labelId} className="visually-hidden">
          {label}
        </span>
      ) : null}
      <button
        ref={ref}
        id={baseId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={label ? `${labelId} ${baseId}` : undefined}
        aria-activedescendant={open && activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={joinClasses("glass", "glass-capsule", "glass-interactive", VARIANTS[variant] || VARIANTS.forest)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          width: "100%",
          minHeight: "3.5rem",
          padding: "0.45rem 0.5rem 0.45rem 1.6rem",
          fontSize: "1rem",
          fontWeight: 500,
          textAlign: "left",
        }}
        {...rest}
      >
        <span
          style={{
            flex: "1 1 auto",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: selectedOption ? "var(--text-high)" : "var(--text-mid)",
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span
          aria-hidden="true"
          style={{
            display: "grid",
            placeItems: "center",
            flex: "none",
            width: "2.6rem",
            height: "2.6rem",
            borderRadius: "16px",
            background: "linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05))",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 0 0 1px rgba(255,255,255,0.1), 0 6px 12px -6px rgba(0,0,0,0.7)",
          }}
        >
          <Chevron open={open} />
        </span>
      </button>
      <ul
        id={listId}
        role="listbox"
        aria-labelledby={label ? labelId : baseId}
        tabIndex={-1}
        className={joinClasses("glass", "glass-panel", VARIANTS[variant] || VARIANTS.forest)}
        style={{
          position: "absolute",
          top: "calc(100% + 0.6rem)",
          left: 0,
          right: 0,
          zIndex: 40,
          margin: 0,
          padding: "0.5rem",
          listStyle: "none",
          maxHeight: "18rem",
          overflowY: "auto",
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          pointerEvents: open ? "auto" : "none",
          transform: open ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.98)",
          transformOrigin: "top center",
          transition:
            "opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.3s",
        }}
      >
        {options.map((option, index) => {
          const selected = index === selectedIndex;
          const active = index === activeIndex;
          return (
            <li
              key={option.value}
              id={`${listId}-option-${index}`}
              role="option"
              aria-selected={selected}
              aria-disabled={option.disabled || undefined}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => !option.disabled && setActiveIndex(index)}
              onClick={() => commit(index)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "20px",
                cursor: option.disabled ? "not-allowed" : "pointer",
                opacity: option.disabled ? 0.4 : 1,
                color: selected ? "var(--text-high)" : "var(--text-mid)",
                background: active ? "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))" : "transparent",
                boxShadow: active ? "inset 0 1px 0 rgba(255,255,255,0.22), inset 0 0 0 1px rgba(255,255,255,0.08)" : "none",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{option.label}</span>
              {selected ? (
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    flex: "none",
                    width: "1.9rem",
                    height: "1.9rem",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.12)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
                  }}
                >
                  <Check />
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
      {name ? <input type="hidden" name={name} value={currentValue ?? ""} /> : null}
    </div>
  );
});

export default GlassSelect;
