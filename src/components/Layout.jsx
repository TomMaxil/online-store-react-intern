import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FluidCursor from "./FluidCursor";

const hiddenStyle = {
  position: "absolute",
  width: "1px",
  height: "1px",
  margin: "-1px",
  padding: 0,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

function SkipLink() {
  const [focused, setFocused] = useState(false);
  return (
    <a
      href="#main-content"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="glass glass-capsule glass-aurora"
      style={
        focused
          ? {
              position: "fixed",
              top: "1rem",
              left: "1rem",
              zIndex: 100,
              padding: "0.75rem 1.4rem",
              fontWeight: 600,
            }
          : hiddenStyle
      }
    >
      Skip to content
    </a>
  );
}

function Backdrop() {
  return (
    <div aria-hidden="true" className="backdrop">
      <div className="backdrop-mesh backdrop-mesh-mint" />
      <div className="backdrop-mesh backdrop-mesh-lime" />
      <div className="backdrop-mesh backdrop-mesh-violet" />
      <div className="backdrop-mesh backdrop-mesh-blue" />
      <div className="backdrop-grid" />
      <div className="backdrop-vignette" />
    </div>
  );
}

export default function Layout({ children }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Backdrop />
      <SkipLink />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="main-content">
        {children !== undefined && children !== null ? children : <Outlet />}
      </main>
      <Footer />
      <FluidCursor />
    </div>
  );
}
