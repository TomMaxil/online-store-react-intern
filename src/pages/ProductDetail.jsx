import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import * as catalogModule from "../data/mockProducts";
import { useCart } from "../context/CartContext";
import GlassButton from "../components/GlassButton";
import GlassCard from "../components/GlassCard";

const DESKTOP_QUERY = "(min-width: 1024px)";
const MAX_QUANTITY = 10;
const STAR_PATH = "M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const formatPrice = (value) => currency.format(Number(value) || 0);

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

function resolveCatalog() {
  const list = catalogModule.mockProducts ?? catalogModule.products ?? catalogModule.default;
  return Array.isArray(list) ? list : [];
}

function resolveImage(product) {
  if (product.image) return product.image;
  if (product.imageUrl) return product.imageUrl;
  if (product.thumbnail) return product.thumbnail;
  if (Array.isArray(product.images) && product.images.length) {
    const first = product.images[0];
    return typeof first === "string" ? first : first?.src || first?.url || null;
  }
  return null;
}

function resolveReviewCount(product) {
  const raw = product.reviewCount ?? product.reviews ?? product.numReviews ?? product.ratingCount;
  if (Array.isArray(raw)) return raw.length;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function resolveStock(product) {
  const raw = product.stockStatus ?? product.stock_status ?? product.inStock ?? product.stock;
  const units = Number(product.stock);
  const capped = Number.isFinite(units) && units > 0 ? Math.min(units, MAX_QUANTITY) : MAX_QUANTITY;

  if (typeof raw === "boolean") {
    return raw
      ? { tone: "in", label: "In stock", max: capped }
      : { tone: "out", label: "Out of stock", max: 0 };
  }

  if (typeof raw === "number") {
    if (raw <= 0) return { tone: "out", label: "Out of stock", max: 0 };
    if (raw <= 5) return { tone: "low", label: `Only ${raw} left`, max: Math.min(raw, MAX_QUANTITY) };
    return { tone: "in", label: "In stock", max: Math.min(raw, MAX_QUANTITY) };
  }

  if (typeof raw === "string" && raw.trim()) {
    const lowered = raw.toLowerCase();
    if (lowered.includes("out") || lowered.includes("sold") || lowered.includes("unavailable")) {
      return { tone: "out", label: raw, max: 0 };
    }
    if (lowered.includes("low") || lowered.includes("limited") || lowered.includes("few") || lowered.includes("left")) {
      return { tone: "low", label: raw, max: capped };
    }
    return { tone: "in", label: raw, max: capped };
  }

  return { tone: "in", label: "In stock", max: capped };
}

function prettifyKey(key) {
  const spaced = String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function normalizeSpecs(specs) {
  if (!specs) return [];
  if (Array.isArray(specs)) {
    return specs
      .map((item) => {
        if (typeof item === "string") {
          const split = item.indexOf(":");
          return split > 0
            ? { label: item.slice(0, split).trim(), value: item.slice(split + 1).trim() }
            : { label: "", value: item };
        }
        if (item && typeof item === "object") {
          const label = item.label ?? item.name ?? item.key ?? item.title ?? "";
          const value = item.value ?? item.detail ?? item.description ?? "";
          return { label: String(label), value: String(value) };
        }
        return null;
      })
      .filter((row) => row && (row.label || row.value));
  }
  if (typeof specs === "object") {
    return Object.entries(specs).map(([key, value]) => ({
      label: prettifyKey(key),
      value: Array.isArray(value) ? value.join(", ") : String(value),
    }));
  }
  return [];
}

const TONES = {
  in: "var(--glow-green)",
  low: "var(--glow-amber)",
  out: "#ff5d6c",
};

function RatingStars({ value = 0, size = 20 }) {
  const uid = useId();
  const clamped = Math.min(Math.max(Number(value) || 0, 0), 5);
  const percent = (clamped / 5) * 100;
  const gradientId = `${uid}-grad`;
  const clipId = `${uid}-clip`;
  const stars = [0, 1, 2, 3, 4];

  return (
    <span
      role="img"
      aria-label={`Rated ${clamped.toFixed(1)} out of 5`}
      style={{ display: "inline-flex", flex: "none" }}
    >
      <svg width={size * 5} height={size} viewBox="0 0 120 24" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--aurora-lime)" />
            <stop offset="100%" stopColor="var(--glow-amber)" />
          </linearGradient>
          <clipPath id={clipId}>
            <rect x="0" y="0" width={(120 * percent) / 100} height="24" />
          </clipPath>
        </defs>
        {stars.map((index) => (
          <path
            key={`base-${index}`}
            d={STAR_PATH}
            transform={`translate(${index * 24} 0)`}
            fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        ))}
        <g clipPath={`url(#${clipId})`}>
          {stars.map((index) => (
            <path
              key={`fill-${index}`}
              d={STAR_PATH}
              transform={`translate(${index * 24} 0)`}
              fill={`url(#${gradientId})`}
              strokeLinejoin="round"
            />
          ))}
        </g>
      </svg>
    </span>
  );
}

function IconBase({ children }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const MinusIcon = () => (
  <IconBase>
    <path d="M5 12h14" />
  </IconBase>
);

const PlusIcon = () => (
  <IconBase>
    <path d="M12 5v14M5 12h14" />
  </IconBase>
);

const CartIcon = () => (
  <IconBase>
    <path d="M3 4h2.2l2 11.2a1.6 1.6 0 0 0 1.6 1.3h8.1a1.6 1.6 0 0 0 1.6-1.2L20 8H6.2" />
    <circle cx="9.5" cy="20" r="1.2" />
    <circle cx="17" cy="20" r="1.2" />
  </IconBase>
);

const CheckIcon = () => (
  <IconBase>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </IconBase>
);

const ChevronLeftIcon = () => (
  <IconBase>
    <path d="m15 6-6 6 6 6" />
  </IconBase>
);

function Showcase({ product, imageSrc, stock, discount }) {
  const [failed, setFailed] = useState(false);
  const showImage = imageSrc && !failed;
  const initial = String(product.category || product.name || "A").charAt(0).toUpperCase();

  return (
    <GlassCard variant="aurora" padding="sm" style={{ width: "100%" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 3",
          maxHeight: "26rem",
          overflow: "hidden",
          borderRadius: "20px",
          display: "grid",
          placeItems: "center",
          background:
            "radial-gradient(circle at 50% 42%, rgba(95,224,184,0.32), rgba(42,166,160,0.12) 45%, transparent 72%), linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.45))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "12%",
            right: "12%",
            bottom: "7%",
            height: "14%",
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(95,224,184,0.55), rgba(95,224,184,0.12) 55%, transparent 75%)",
          }}
        />
        {showImage ? (
          <img
            src={imageSrc}
            alt={product.name}
            onError={() => setFailed(true)}
            decoding="async"
            style={{
              position: "relative",
              width: "70%",
              height: "70%",
              objectFit: "contain",
              filter: "drop-shadow(0 24px 30px rgba(0,0,0,0.6))",
            }}
          />
        ) : (
          <span
            aria-hidden="true"
            className="text-gradient-aurora"
            style={{ position: "relative", fontSize: "clamp(4.5rem, 12vw, 8rem)", fontWeight: 700, lineHeight: 1 }}
          >
            {initial}
          </span>
        )}

        {product.category ? (
          <span
            style={{
              position: "absolute",
              top: "1rem",
              left: "1rem",
              zIndex: 2,
              padding: "0.35rem 0.85rem",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#04120f",
              background: "linear-gradient(135deg, var(--aurora-lime), var(--aurora-mint))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 18px -8px rgba(95,224,184,0.8)",
            }}
          >
            {product.category}
          </span>
        ) : null}

        {discount > 0 ? (
          <span
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              zIndex: 2,
              padding: "0.35rem 0.75rem",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--text-high)",
              background: "linear-gradient(135deg, rgba(255,79,184,0.9), rgba(255,162,58,0.9))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), 0 8px 18px -8px rgba(255,79,184,0.8)",
            }}
          >
            -{discount}%
          </span>
        ) : null}

        <span
          style={{
            position: "absolute",
            left: "1rem",
            bottom: "1rem",
            zIndex: 2,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.4rem 0.85rem",
            borderRadius: "999px",
            fontSize: "0.8rem",
            fontWeight: 500,
            background: "rgba(4, 10, 13, 0.78)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 0 0 1px rgba(255,255,255,0.1)",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: "0.55rem",
              height: "0.55rem",
              borderRadius: "50%",
              background: TONES[stock.tone],
              boxShadow: `0 0 10px ${TONES[stock.tone]}`,
            }}
          />
          {stock.label}
        </span>
      </div>
    </GlassCard>
  );
}

function ProductView({ product }) {
  const { addToCart } = useCart();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const timerRef = useRef(null);

  const imageSrc = resolveImage(product);
  const stock = resolveStock(product);
  const specs = useMemo(() => normalizeSpecs(product.specs), [product.specs]);
  const reviewCount = resolveReviewCount(product);
  const rating = Number(product.rating) || 0;
  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice ?? product.oldPrice ?? product.compareAtPrice) || 0;
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const soldOut = stock.tone === "out";
  const maxQuantity = soldOut ? 0 : stock.max;
  const total = price * quantity;

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleAdd = () => {
    if (soldOut) return;
    addToCart(
      {
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        image: imageSrc,
        price,
      },
      quantity
    );
    setAdded(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 2400);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", minWidth: 0, width: "100%" }}>
      <div>
        <GlassButton as={Link} to="/" variant="clear" size="sm" icon={<ChevronLeftIcon />}>
          Back to store
        </GlassButton>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isDesktop ? "minmax(0, 1fr) minmax(0, 1fr)" : "minmax(0, 1fr)",
          gap: isDesktop ? "2rem" : "1.25rem",
          alignItems: "start",
          minWidth: 0,
          width: "100%",
        }}
      >
        <div
          style={{
            minWidth: 0,
            width: "100%",
            maxWidth: isDesktop ? "34rem" : "100%",
            ...(isDesktop ? { position: "sticky", top: "6.75rem", justifySelf: "start" } : null),
          }}
        >
          <Showcase product={product} imageSrc={imageSrc} stock={stock} discount={discount} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", minWidth: 0 }}>
          <section aria-labelledby="product-title" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.6rem", fontSize: "0.9rem" }}>
              {product.brand ? (
                <span className="text-gradient-aurora" style={{ fontWeight: 600 }}>
                  {product.brand}
                </span>
              ) : null}
              {product.brand && product.category ? (
                <span aria-hidden="true" style={{ color: "var(--text-low)" }}>
                  •
                </span>
              ) : null}
              {product.category ? <span style={{ color: "var(--text-mid)" }}>{product.category}</span> : null}
            </div>

            <h1
              id="product-title"
              style={{
                fontSize: "clamp(1.65rem, 4.2vw, 2.6rem)",
                lineHeight: 1.15,
                margin: 0,
                wordBreak: "break-word",
              }}
            >
              {product.name}
            </h1>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.65rem" }}>
              <RatingStars value={rating} />
              <span style={{ fontWeight: 600 }}>{rating ? rating.toFixed(1) : "No rating"}</span>
              {reviewCount ? (
                <span style={{ color: "var(--text-low)", fontSize: "0.9rem" }}>
                  ({reviewCount.toLocaleString("en-US")} reviews)
                </span>
              ) : null}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "0.75rem" }}>
              <span
                style={{
                  fontSize: "clamp(1.6rem, 3.6vw, 2.2rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                {formatPrice(price)}
              </span>
              {discount > 0 ? (
                <>
                  <span style={{ fontSize: "1rem", color: "var(--text-low)", textDecoration: "line-through" }}>
                    {formatPrice(originalPrice)}
                  </span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--aurora-lime)" }}>
                    Save {formatPrice(originalPrice - price)}
                  </span>
                </>
              ) : null}
            </div>

            {product.description ? (
              <p style={{ fontSize: "1rem", lineHeight: 1.6, maxWidth: "60ch", margin: 0 }}>
                {product.description}
              </p>
            ) : null}
          </section>

          {specs.length ? (
            <GlassCard as="section" aria-labelledby="specs-title" variant="ocean" shape="tile" padding="md">
              <h2 id="specs-title" style={{ fontSize: "1.1rem", margin: "0 0 0.5rem" }}>
                Specifications
              </h2>
              <dl style={{ margin: 0, display: "flex", flexDirection: "column" }}>
                {specs.map((row, index) => (
                  <div
                    key={`${row.label}-${index}`}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: "0.5rem 1rem",
                      padding: "0.75rem 0",
                      borderTop: index === 0 ? "0" : "1px solid rgba(255,255,255,0.08)",
                      minWidth: 0,
                    }}
                  >
                    {row.label ? (
                      <dt style={{ margin: 0, color: "var(--text-mid)", flex: "0 0 auto", fontSize: "0.9rem" }}>
                        {row.label}
                      </dt>
                    ) : null}
                    <dd
                      style={{
                        margin: 0,
                        fontWeight: 500,
                        textAlign: row.label ? "right" : "left",
                        flex: "1 1 auto",
                        minWidth: 0,
                        wordBreak: "break-word",
                        fontSize: "0.95rem",
                      }}
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </GlassCard>
          ) : null}

          <GlassCard as="section" aria-label="Purchase" variant="aurora" shape="panel" padding="md">
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.85rem",
                  minWidth: 0,
                }}
              >
                <div
                  role="group"
                  aria-label="Quantity"
                  className="glass glass-capsule glass-clear"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.3rem",
                    minHeight: "3.25rem",
                  }}
                >
                  <GlassButton
                    size="sm"
                    variant="ink"
                    icon={<MinusIcon />}
                    aria-label="Decrease quantity"
                    disabled={soldOut || quantity <= 1}
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  />
                  <output
                    aria-live="polite"
                    style={{ minWidth: "2.5rem", textAlign: "center", fontSize: "1.05rem", fontWeight: 600 }}
                  >
                    {quantity}
                  </output>
                  <GlassButton
                    size="sm"
                    variant="ink"
                    icon={<PlusIcon />}
                    aria-label="Increase quantity"
                    disabled={soldOut || quantity >= maxQuantity}
                    onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.2 }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-low)" }}>Total</span>
                  <span style={{ fontSize: "1.35rem", fontWeight: 700 }}>{formatPrice(total)}</span>
                </div>
              </div>

              <GlassButton
                variant="aurora"
                size="lg"
                fullWidth
                icon={added ? <CheckIcon /> : <CartIcon />}
                disabled={soldOut}
                onClick={handleAdd}
              >
                {soldOut ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
              </GlassButton>

              {added ? (
                <GlassButton as={Link} to="/checkout" variant="ink" fullWidth>
                  Go to checkout
                </GlassButton>
              ) : null}

              <span className="visually-hidden" role="status">
                {added ? `${quantity} × ${product.name} added to cart` : ""}
              </span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();

  const product = useMemo(
    () => resolveCatalog().find((item) => String(item.id) === String(id)),
    [id]
  );

  if (!product) return <Navigate to="/" replace />;

  return <ProductView key={product.id} product={product} />;
}