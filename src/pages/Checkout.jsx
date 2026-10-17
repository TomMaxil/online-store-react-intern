import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import GlassButton from "../components/GlassButton";
import GlassCard from "../components/GlassCard";
import GlassInput from "../components/GlassInput";

const DESKTOP_QUERY = "(min-width: 1024px)";
const COMPACT_QUERY = "(max-width: 480px)";
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const FREE_SHIPPING_THRESHOLD = 99;
const FLAT_SHIPPING = 9.99;
const TAX_RATE = 0.08;
const FIELD_ORDER = ["name", "email", "address", "cardNumber", "expiry", "cvc"];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const formatPrice = (value) => currency.format(Number(value) || 0);

const roundMoney = (value) => Math.round(value * 100) / 100;

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

function IconBase({ size = 20, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const CardIcon = () => (
  <IconBase>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="M3 10h18M7 15h3" />
  </IconBase>
);

const LockIcon = () => (
  <IconBase size={18}>
    <rect x="5" y="11" width="14" height="9" rx="2.5" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </IconBase>
);

const CheckIcon = ({ size = 20 }) => (
  <IconBase size={size}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </IconBase>
);

const BagIcon = ({ size = 20 }) => (
  <IconBase size={size}>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </IconBase>
);

const ChevronLeftIcon = () => (
  <IconBase>
    <path d="m15 6-6 6 6 6" />
  </IconBase>
);

function digitsOnly(value) {
  return value.replace(/\D/g, "");
}

function formatCardNumber(value) {
  return digitsOnly(value)
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value) {
  const digits = digitsOnly(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (values.address.trim().length < 6) errors.address = "Enter your street, city, and country.";

  const cardDigits = digitsOnly(values.cardNumber);
  if (cardDigits.length < 15 || cardDigits.length > 16) errors.cardNumber = "Enter a 15 or 16 digit card number.";

  const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(values.expiry);
  if (!expiryMatch) {
    errors.expiry = "Use the format MM/YY.";
  } else {
    const month = Number(expiryMatch[1]);
    const year = 2000 + Number(expiryMatch[2]);
    if (month < 1 || month > 12) errors.expiry = "Enter a valid month.";
    else if (new Date(year, month, 1) <= new Date()) errors.expiry = "This card has expired.";
  }

  if (!/^\d{3,4}$/.test(values.cvc)) errors.cvc = "Enter the 3 or 4 digit code.";
  return errors;
}

function resolveImage(item) {
  if (item.image) return item.image;
  if (item.imageUrl) return item.imageUrl;
  if (item.thumbnail) return item.thumbnail;
  return null;
}

function Thumb({ item }) {
  const [failed, setFailed] = useState(false);
  const src = resolveImage(item);
  const initial = String(item.name || "A").charAt(0).toUpperCase();

  return (
    <span
      style={{
        display: "grid",
        placeItems: "center",
        flex: "none",
        width: "3rem",
        height: "3rem",
        overflow: "hidden",
        borderRadius: "14px",
        background: "radial-gradient(circle at 50% 40%, rgba(95,224,184,0.28), rgba(0,0,0,0.45))",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    >
      {src && !failed ? (
        <img
          src={src}
          alt=""
          onError={() => setFailed(true)}
          decoding="async"
          style={{ width: "86%", height: "86%", objectFit: "contain" }}
        />
      ) : (
        <span className="text-gradient-aurora" style={{ fontSize: "1.25rem", fontWeight: 700 }}>
          {initial}
        </span>
      )}
    </span>
  );
}

function Field({ id, label, error, hint, icon, ...inputProps }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", minWidth: 0 }}>
      <label htmlFor={id} style={{ paddingLeft: "0.5rem", fontSize: "0.85rem", fontWeight: 500, color: "var(--text-mid)" }}>
        {label}
      </label>
      <GlassInput
        id={id}
        variant={error ? "ember" : "clear"}
        icon={icon === undefined ? null : icon}
        aria-label={label}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" style={{ margin: 0, paddingLeft: "0.5rem", fontSize: "0.8rem", color: "#ff8a96" }}>
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} style={{ margin: 0, paddingLeft: "0.5rem", fontSize: "0.8rem", color: "var(--text-low)" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Section({ title, step, children, compact }) {
  return (
    <GlassCard
      as="section"
      aria-label={title}
      variant="ocean"
      shape="tile"
      padding={compact ? "sm" : "md"}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: compact ? "0.6rem" : "0.8rem",
          marginBottom: compact ? "0.9rem" : "1.15rem",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: "grid",
            placeItems: "center",
            width: compact ? "1.7rem" : "2rem",
            height: compact ? "1.7rem" : "2rem",
            borderRadius: "999px",
            fontSize: compact ? "0.8rem" : "0.9rem",
            fontWeight: 700,
            color: "#04120f",
            background: "linear-gradient(135deg, var(--aurora-lime), var(--aurora-mint))",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 6px 14px -6px rgba(95,224,184,0.8)",
            flex: "none",
          }}
        >
          {step}
        </span>
        <h2 style={{ fontSize: compact ? "1.05rem" : "1.2rem", margin: 0 }}>{title}</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: compact ? "0.85rem" : "1.1rem" }}>
        {children}
      </div>
    </GlassCard>
  );
}

function SummaryRow({ label, value, strong = false, compact = false }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: "0.75rem",
        minWidth: 0,
      }}
    >
      <dt
        style={{
          margin: 0,
          color: strong ? "var(--text-high)" : "var(--text-mid)",
          fontSize: strong ? (compact ? "0.95rem" : "1.1rem") : compact ? "0.85rem" : "1rem",
          fontWeight: strong ? 600 : 400,
        }}
      >
        {label}
      </dt>
      <dd
        style={{
          margin: 0,
          fontSize: strong ? (compact ? "1.25rem" : "1.6rem") : compact ? "0.9rem" : "1rem",
          fontWeight: strong ? 700 : 500,
          letterSpacing: strong ? "-0.02em" : 0,
          textAlign: "right",
        }}
      >
        {value}
      </dd>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "55vh", padding: "0 0.5rem" }}>
      <GlassCard variant="aurora" padding="lg" style={{ width: "min(100%, 34rem)", textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <span
            aria-hidden="true"
            style={{
              display: "grid",
              placeItems: "center",
              width: "4rem",
              height: "4rem",
              borderRadius: "999px",
              color: "var(--aurora-mint)",
              background: "linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.03))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 0 0 1px rgba(255,255,255,0.12), 0 14px 28px -12px rgba(95,224,184,0.6)",
            }}
          >
            <BagIcon size={28} />
          </span>
          <h1 style={{ fontSize: "clamp(1.5rem, 5vw, 2.2rem)", margin: 0 }}>Your cart is empty</h1>
          <p style={{ maxWidth: "34ch", lineHeight: 1.55, margin: 0, fontSize: "0.95rem" }}>
            Add something from the store and it will show up here, ready for checkout.
          </p>
          <GlassButton as={Link} to="/" variant="aurora" size="lg" icon={<ChevronLeftIcon />} style={{ marginTop: "0.5rem" }}>
            Back to store
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
}

function Confirmation({ order }) {
  const [visible, setVisible] = useState(false);
  const headingRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const frame = requestAnimationFrame(() => setVisible(true));
    if (headingRef.current) headingRef.current.focus({ preventScroll: true });
    return () => cancelAnimationFrame(frame);
  }, []);

  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "60vh",
        padding: "0 0.5rem",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(18px) scale(0.97)",
        transition: `opacity 0.7s ${EASE}, transform 0.8s ${EASE}`,
      }}
    >
      <GlassCard variant="aurora" padding="lg" style={{ width: "min(100%, 40rem)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", textAlign: "center" }}>
          <span
            aria-hidden="true"
            style={{
              display: "grid",
              placeItems: "center",
              width: "4.5rem",
              height: "4.5rem",
              borderRadius: "999px",
              color: "#04120f",
              background: "linear-gradient(145deg, var(--aurora-lime), var(--aurora-mint) 60%, var(--aurora-teal))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -8px 14px -6px rgba(0,60,50,0.45), 0 18px 34px -12px rgba(95,224,184,0.8)",
              transform: visible ? "scale(1)" : "scale(0.4)",
              transition: "transform 0.9s cubic-bezier(0.34, 1.6, 0.5, 1) 0.2s",
            }}
          >
            <CheckIcon size={34} />
          </span>
          <h1
            ref={headingRef}
            tabIndex={-1}
            style={{ fontSize: "clamp(1.5rem, 5vw, 2.3rem)", outline: "none", margin: 0 }}
          >
            Order confirmed
          </h1>
          <p style={{ maxWidth: "40ch", lineHeight: 1.55, margin: 0, fontSize: "0.95rem" }}>
            Thanks, {order.name.trim().split(" ")[0]}. A confirmation for order{" "}
            <strong style={{ color: "var(--text-high)" }}>{order.orderId}</strong> is on its way to {order.email}.
          </p>
          <dl
            className="glass-surface"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.65rem",
              width: "100%",
              margin: "0.5rem 0 0",
              padding: "1.1rem 1.2rem",
              borderRadius: "20px",
              textAlign: "left",
            }}
          >
            <SummaryRow label={`Items (${itemCount})`} value={formatPrice(order.subtotal)} />
            <SummaryRow label="Shipping" value={order.shipping === 0 ? "Free" : formatPrice(order.shipping)} />
            <SummaryRow label="Estimated tax" value={formatPrice(order.tax)} />
            <div style={{ height: "1px", background: "rgba(255,255,255,0.1)" }} />
            <SummaryRow label="Total paid" value={formatPrice(order.total)} strong />
          </dl>
          <p style={{ fontSize: "0.85rem", color: "var(--text-low)", margin: 0 }}>
            Shipping to {order.address} · Estimated delivery in 3–5 business days
          </p>
          <GlassButton as={Link} to="/" variant="aurora" size="lg" fullWidth style={{ marginTop: "0.5rem" }}>
            Continue shopping
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
}

export default function Checkout() {
  const { cart, subtotal, clearCart } = useCart();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const isCompact = useMediaQuery(COMPACT_QUERY);
  const [values, setValues] = useState({ name: "", email: "", address: "", cardNumber: "", expiry: "", cvc: "" });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const totals = useMemo(() => {
    const base = Number(subtotal) || 0;
    const shipping = base === 0 || base >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
    const tax = roundMoney(base * TAX_RATE);
    return { subtotal: base, shipping, tax, total: roundMoney(base + shipping + tax) };
  }, [subtotal]);

  const itemCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);

  const setField = (key, formatter) => (event) => {
    const next = formatter ? formatter(event.target.value) : event.target.value;
    setValues((current) => ({ ...current, [key]: next }));
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (processing || cart.length === 0) return;
    const nextErrors = validate(values);
    setErrors(nextErrors);
    const firstInvalid = FIELD_ORDER.find((key) => nextErrors[key]);
    if (firstInvalid) {
      const node = document.getElementById(`checkout-${firstInvalid}`);
      if (node) node.focus();
      return;
    }
    setProcessing(true);
    const snapshot = {
      orderId: `AUR-${Date.now().toString(36).toUpperCase()}`,
      name: values.name,
      email: values.email.trim(),
      address: values.address.trim(),
      items: cart.map((item) => ({ ...item })),
      ...totals,
    };
    timerRef.current = setTimeout(() => {
      clearCart();
      setOrder(snapshot);
      setProcessing(false);
    }, 1800);
  };

  if (order) return <Confirmation order={order} />;

  if (cart.length === 0) return <EmptyState />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isCompact ? "1rem" : "1.5rem", minWidth: 0, width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", minWidth: 0 }}>
        <h1 style={{ fontSize: "clamp(1.6rem, 5vw, 3rem)", margin: 0, lineHeight: 1.1 }}>Checkout</h1>
        <p style={{ margin: 0, fontSize: isCompact ? "0.9rem" : "1rem" }}>
          Review your details and confirm your order.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isDesktop ? "minmax(0, 1.1fr) minmax(0, 0.9fr)" : "minmax(0, 1fr)",
          gap: isDesktop ? "2rem" : isCompact ? "1rem" : "1.5rem",
          alignItems: "start",
          minWidth: 0,
          width: "100%",
        }}
      >
        <form
          id="checkout-form"
          noValidate
          onSubmit={handleSubmit}
          aria-busy={processing}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: isCompact ? "0.9rem" : "1.25rem",
            minWidth: 0,
          }}
        >
          <Section title="Contact" step="1" compact={isCompact}>
            <Field
              id="checkout-name"
              label="Full name"
              name="name"
              autoComplete="name"
              placeholder="Alex Morgan"
              value={values.name}
              onChange={setField("name")}
              error={errors.name}
              disabled={processing}
            />
            <Field
              id="checkout-email"
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="alex@example.com"
              value={values.email}
              onChange={setField("email")}
              error={errors.email}
              disabled={processing}
            />
          </Section>

          <Section title="Shipping" step="2" compact={isCompact}>
            <Field
              id="checkout-address"
              label="Shipping location"
              name="address"
              autoComplete="street-address"
              placeholder="Street, city, country"
              value={values.address}
              onChange={setField("address")}
              error={errors.address}
              disabled={processing}
            />
          </Section>

          <Section title="Payment" step="3" compact={isCompact}>
            <Field
              id="checkout-cardNumber"
              label="Card number"
              name="cardNumber"
              autoComplete="cc-number"
              inputMode="numeric"
              placeholder="1234 5678 9012 3456"
              icon={<CardIcon />}
              value={values.cardNumber}
              onChange={setField("cardNumber", formatCardNumber)}
              error={errors.cardNumber}
              disabled={processing}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: isCompact ? "0.75rem" : "1rem",
                minWidth: 0,
              }}
            >
              <Field
                id="checkout-expiry"
                label="Expiry"
                name="expiry"
                autoComplete="cc-exp"
                inputMode="numeric"
                placeholder="MM/YY"
                value={values.expiry}
                onChange={setField("expiry", formatExpiry)}
                error={errors.expiry}
                disabled={processing}
              />
              <Field
                id="checkout-cvc"
                label="Security code"
                name="cvc"
                autoComplete="cc-csc"
                inputMode="numeric"
                placeholder="CVC"
                value={values.cvc}
                onChange={setField("cvc", (value) => digitsOnly(value).slice(0, 4))}
                error={errors.cvc}
                disabled={processing}
              />
            </div>
          </Section>
        </form>

        <aside
          aria-label="Order summary"
          style={{
            minWidth: 0,
            width: "100%",
            ...(isDesktop ? { position: "sticky", top: "6.75rem" } : null),
          }}
        >
          <GlassCard variant="aurora" shape="panel" padding={isCompact ? "sm" : "md"}>
            <div style={{ display: "flex", flexDirection: "column", gap: isCompact ? "0.9rem" : "1.25rem", minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.75rem", minWidth: 0 }}>
                <h2 style={{ fontSize: isCompact ? "1.1rem" : "1.3rem", margin: 0 }}>Order summary</h2>
                <span style={{ fontSize: "0.85rem", color: "var(--text-low)" }}>
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>

              <ul
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  maxHeight: isCompact ? "14rem" : "22rem",
                  margin: 0,
                  padding: 0,
                  overflowY: "auto",
                  listStyle: "none",
                }}
              >
                {cart.map((item) => {
                  const unit = Number(item.price) || 0;
                  return (
                    <li key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.7rem", minWidth: 0 }}>
                      <Thumb item={item} />
                      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                        <p
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontWeight: 500,
                            color: "var(--text-high)",
                            margin: 0,
                            fontSize: "0.9rem",
                          }}
                        >
                          {item.name}
                        </p>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-low)", margin: "0.15rem 0 0" }}>
                          {formatPrice(unit)} each
                        </p>
                      </div>
                      <span
                        style={{
                          flex: "none",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "999px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          background: "rgba(255,255,255,0.08)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
                        }}
                        aria-label={`Quantity ${item.quantity}`}
                      >
                        ×{item.quantity}
                      </span>
                      <span
                        style={{
                          flex: "none",
                          minWidth: "3.75rem",
                          textAlign: "right",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                        }}
                      >
                        {formatPrice(unit * item.quantity)}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <dl style={{ display: "flex", flexDirection: "column", gap: "0.6rem", margin: 0 }}>
                <SummaryRow label="Subtotal" value={formatPrice(totals.subtotal)} compact={isCompact} />
                <SummaryRow
                  label="Shipping"
                  value={totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
                  compact={isCompact}
                />
                <SummaryRow label="Estimated tax" value={formatPrice(totals.tax)} compact={isCompact} />
                <div style={{ height: "1px", background: "rgba(255,255,255,0.1)" }} />
                <SummaryRow label="Total" value={formatPrice(totals.total)} strong compact={isCompact} />
              </dl>

              <GlassButton
                type="submit"
                form="checkout-form"
                variant="aurora"
                size={isCompact ? "md" : "lg"}
                fullWidth
                icon={processing ? null : <CheckIcon />}
                disabled={processing}
              >
                {processing ? "Processing…" : "Confirm Transaction"}
              </GlassButton>

              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  fontSize: "0.78rem",
                  color: "var(--text-low)",
                  textAlign: "center",
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                <LockIcon />
                Demo checkout. No payment is processed and no card data is stored.
              </p>
            </div>
          </GlassCard>
        </aside>
      </div>
    </div>
  );
}