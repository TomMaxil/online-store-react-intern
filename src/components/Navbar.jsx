import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import GlassButton from "./GlassButton";
import GlassInput from "./GlassInput";
import { useCart } from "../context/CartContext";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
  { to: "/new-arrivals", label: "New Arrivals" },
  { to: "/deals", label: "Deals" },
  { to: "/about", label: "About Us" },
];

const DESKTOP_QUERY = "(min-width: 1200px)";
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";


function useMediaQuery(query) {
  const subscribe = useCallback(
    (notify) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", notify);
      return () => media.removeEventListener("change", notify);
    },
    [query]
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 4h2.2l2 11.2a1.6 1.6 0 0 0 1.6 1.3h8.1a1.6 1.6 0 0 0 1.6-1.2L20 8H6.2" />
      <circle cx="9.5" cy="20" r="1.2" />
      <circle cx="17" cy="20" r="1.2" />
    </svg>
  );
}

function MenuIcon({ open }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <path
        d="M4 7h16"
        style={{
          transformOrigin: "12px 12px",
          transform: open ? "translateY(5px) rotate(45deg)" : "none",
          transition: `transform 0.45s ${EASE}`,
        }}
      />
      <path
        d="M4 12h16"
        style={{ opacity: open ? 0 : 1, transition: "opacity 0.2s" }}
      />
      <path
        d="M4 17h16"
        style={{
          transformOrigin: "12px 12px",
          transform: open ? "translateY(-5px) rotate(-45deg)" : "none",
          transition: `transform 0.45s ${EASE}`,
        }}
      />
    </svg>
  );
}

function BrandMark() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "grid",
        placeItems: "center",
        flex: "none",
        width: "2.5rem",
        height: "2.5rem",
        borderRadius: "999px",
        color: "#04120f",
        background: "linear-gradient(145deg, var(--aurora-lime), var(--aurora-mint) 55%, var(--aurora-teal))",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -6px 10px -4px rgba(0,60,50,0.45), 0 8px 18px -8px rgba(95,224,184,0.75)",
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 19 7-14 7 14" />
        <path d="M8.6 14h6.8" />
      </svg>
    </span>
  );
}

function Brand() {
  return (
    <Link
      to="/"
      aria-label="Aurora Store home"
      style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", flex: "none", borderRadius: "999px" }}
    >
      <BrandMark />
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
        <span className="text-gradient-aurora" style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Aurora
        </span>
        <span style={{ fontSize: "0.72rem", color: "var(--text-low)", letterSpacing: "0.18em" }}>store</span>
      </span>
    </Link>
  );
}

function DesktopLink({ to, end, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <NavLink
      to={to}
      end={end}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={({ isActive }) => ({
        display: "inline-flex",
        alignItems: "center",
        minHeight: "2.5rem",
        padding: "0.5rem 1rem",
        borderRadius: "999px",
        fontSize: "0.95rem",
        fontWeight: isActive ? 600 : 500,
        whiteSpace: "nowrap",
        color: isActive || hovered ? "var(--text-high)" : "var(--text-mid)",
        background: isActive
          ? "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 50%, rgba(95,224,184,0.2))"
          : hovered
          ? "rgba(255,255,255,0.07)"
          : "transparent",
        boxShadow: isActive
          ? "inset 0 1px 0 rgba(255,255,255,0.5), inset 0 0 0 1px rgba(255,255,255,0.12), inset 0 -8px 12px -6px rgba(95,224,184,0.7)"
          : "none",
        transition: `background 0.3s ${EASE}, color 0.3s, box-shadow 0.3s`,
      })}
    >
      {children}
    </NavLink>
  );
}

function MobileLink({ to, end, open, index, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      tabIndex={open ? 0 : -1}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: "3.5rem",
        padding: "0.75rem 1.4rem",
        borderRadius: "999px",
        fontSize: "1.1rem",
        fontWeight: isActive ? 600 : 500,
        color: isActive ? "var(--text-high)" : "var(--text-mid)",
        background: isActive
          ? "linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.04) 50%, rgba(95,224,184,0.22))"
          : "rgba(255,255,255,0.04)",
        boxShadow: isActive
          ? "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 0 0 1px rgba(255,255,255,0.12)"
          : "inset 0 0 0 1px rgba(255,255,255,0.06)",
        opacity: open ? 1 : 0,
        transform: open ? "translateY(0)" : "translateY(14px)",
        transition: `opacity 0.5s ${EASE} ${open ? 0.08 + index * 0.05 : 0}s, transform 0.55s ${EASE} ${open ? 0.08 + index * 0.05 : 0}s, background 0.3s`,
      })}
    >
      {children}
    </NavLink>
  );
}

function SearchForm({ query, onQueryChange, onSubmit, width }) {
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      style={{ width, flex: width ? "none" : "1 1 auto", minWidth: 0 }}
    >
      <GlassInput
        type="search"
        name="search"
        label="Search products"
        placeholder="Search for products"
        autoComplete="off"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onAction={onSubmit}
        actionLabel="Search"
        variant="clear"
        style={{ minHeight: "3.25rem" }}
      />
    </form>
  );
}

function CartLink({ count, label, tabIndex }) {
  const display = count > 99 ? "99+" : String(count);
  return (
    <span style={{ position: "relative", display: "inline-flex", flex: "none" }}>
      <GlassButton
        as={Link}
        to="/checkout"
        variant="aurora"
        icon={<CartIcon />}
        aria-label={label}
        tabIndex={tabIndex}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-0.35rem",
          right: "-0.35rem",
          zIndex: 3,
          display: "grid",
          placeItems: "center",
          minWidth: "1.45rem",
          height: "1.45rem",
          padding: "0 0.4rem",
          borderRadius: "999px",
          fontSize: "0.72rem",
          fontWeight: 700,
          color: "#04120f",
          background: "linear-gradient(160deg, var(--aurora-lime), var(--aurora-mint))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 6px 14px -4px rgba(95,224,184,0.8)",
          transform: count > 0 ? "scale(1)" : "scale(0)",
          opacity: count > 0 ? 1 : 0,
          pointerEvents: "none",
          transition: "transform 0.5s cubic-bezier(0.34, 1.6, 0.5, 1), opacity 0.2s",
        }}
      >
        {display}
      </span>
    </span>
  );
}

export default function Navbar() {
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get("search") || "");
  const toggleRef = useRef(null);
  const panelRef = useRef(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (query.trim() === "" && location.search.includes("search=")) {
      navigate("/");
    }
  }, [query, navigate, location.search]);

  const cartLabel = itemCount === 1 ? "Cart, 1 item" : `Cart, ${itemCount} items`;
  const mobileOpen = menuOpen && !isDesktop;

  const submitSearch = useCallback(() => {
    const term = query.trim();
    navigate(term ? `/?search=${encodeURIComponent(term)}` : "/");
    setMenuOpen(false);
  }, [navigate, query]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (isDesktop) setMenuOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen) {
      if (panelRef.current) panelRef.current.focus({ preventScroll: true });
    } else if (wasOpen.current && toggleRef.current) {
      toggleRef.current.focus({ preventScroll: true });
    }
    wasOpen.current = mobileOpen;
  }, [mobileOpen]);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, padding: "0.9rem 0" }}>
      <div style={{ width: "min(100% - 2.5rem, 1280px)", marginInline: "auto" }}>
        <div
          className="glass glass-capsule glass-aurora"
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            minHeight: "4rem",
            padding: "0.5rem 0.5rem 0.5rem 1.1rem",
          }}
        >
          <Brand />
          {isDesktop ? (
            <>
              <nav aria-label="Primary" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                {NAV_LINKS.map((link) => (
                  <DesktopLink key={link.to} to={link.to} end={link.end}>
                    {link.label}
                  </DesktopLink>
                ))}
              </nav>
              <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                <SearchForm query={query} onQueryChange={setQuery} onSubmit={submitSearch} width="16rem" />
                <CartLink count={itemCount} label={cartLabel} />
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <CartLink count={itemCount} label={cartLabel} />
              <GlassButton
                ref={toggleRef}
                variant="ink"
                icon={<MenuIcon open={menuOpen} />}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                onClick={() => setMenuOpen((current) => !current)}
              />
            </div>
          )}
        </div>
        {!isDesktop ? (
          <nav
            id="mobile-menu"
            aria-label="Mobile"
            onClick={(event) => {
              if (event.target === event.currentTarget) setMenuOpen(false);
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              overflowY: "auto",
              padding: "6.75rem 1.25rem 2rem",
              background: "rgba(3, 8, 11, 0.72)",
              WebkitBackdropFilter: "blur(22px) saturate(140%)",
              backdropFilter: "blur(22px) saturate(140%)",
              opacity: mobileOpen ? 1 : 0,
              visibility: mobileOpen ? "visible" : "hidden",
              pointerEvents: mobileOpen ? "auto" : "none",
              transition: `opacity 0.4s ${EASE}, visibility 0.4s`,
            }}
          >
            <div
              ref={panelRef}
              tabIndex={-1}
              className="glass glass-panel glass-ocean"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                width: "min(100%, 30rem)",
                padding: "1.1rem",
                outline: "none",
                transform: mobileOpen ? "translateY(0) scale(1)" : "translateY(-16px) scale(0.97)",
                transformOrigin: "top center",
                transition: `transform 0.55s ${EASE}`,
              }}
            >
              <div style={{ marginBottom: "0.4rem" }}>
                <SearchForm query={query} onQueryChange={setQuery} onSubmit={submitSearch} />
              </div>
              {NAV_LINKS.map((link, index) => (
                <MobileLink key={link.to} to={link.to} end={link.end} open={mobileOpen} index={index}>
                  {link.label}
                </MobileLink>
              ))}
              <GlassButton
                as={Link}
                to="/checkout"
                variant="aurora"
                size="lg"
                icon={<CartIcon />}
                fullWidth
                tabIndex={mobileOpen ? 0 : -1}
                style={{ marginTop: "0.5rem" }}
              >
                {itemCount > 0 ? `View cart (${itemCount})` : "View cart"}
              </GlassButton>
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
