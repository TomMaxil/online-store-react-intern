import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import GlassButton from './GlassButton';
import { useCart } from '../context/CartContext';

const TINTS = ['var(--aurora-mint)', 'var(--glow-blue)', 'var(--glow-violet)', 'var(--aurora-lime)'];
const CHUNK = 6;

const TEMPLATES = {
  6: [
    [1, 1, 1, 2, 'tall'],
    [2, 2, 1, 1, 'wide'],
    [2, 1, 2, 1, 'sm'],
    [3, 1, 2, 1, 'sm'],
    [1, 2, 3, 1, 'wide'],
    [3, 1, 3, 1, 'sm']
  ],
  5: [
    [1, 1, 1, 2, 'tall'],
    [2, 2, 1, 1, 'wide'],
    [2, 1, 2, 1, 'sm'],
    [3, 1, 2, 1, 'sm'],
    [1, 3, 3, 1, 'wide']
  ],
  4: [
    [1, 1, 1, 2, 'tall'],
    [2, 2, 1, 1, 'wide'],
    [2, 1, 2, 1, 'sm'],
    [3, 1, 2, 1, 'sm']
  ],
  3: [
    [1, 1, 1, 2, 'tall'],
    [2, 2, 1, 1, 'wide'],
    [2, 2, 2, 1, 'wide']
  ],
  2: [
    [1, 2, 1, 1, 'wide'],
    [3, 1, 1, 1, 'sm']
  ],
  1: [[1, 3, 1, 1, 'wide']]
};

function placement(index, total) {
  const chunk = Math.floor(index / CHUNK);
  const size = Math.min(CHUNK, total - chunk * CHUNK);
  const [col, colSpan, row, rowSpan, shape] = TEMPLATES[size][index % CHUNK];
  return {
    shape,
    col: `${col} / span ${colSpan}`,
    row: `${row + chunk * 3} / span ${rowSpan}`
  };
}

function RatingStars({ rating }) {
  const rounded = Math.round(rating);
  return (
    <span className="sf-stars" role="img" aria-label={`Rated ${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map(i => (
        <i key={i} className={i < rounded ? 'fa-solid fa-star' : 'fa-regular fa-star'} aria-hidden="true" />
      ))}
    </span>
  );
}

function BentoCard({ product, index, total }) {
  const { addToCart } = useCart();
  const spotRef = useRef(null);
  const frameRef = useRef(0);
  const { shape, col, row } = placement(index, total);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const onPointerMove = event => {
    if (event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      if (spotRef.current) {
        spotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
    });
  };

  return (
    <article
      className="sf-card"
      data-shape={shape}
      style={{ '--col': col, '--row': row, '--tint': TINTS[index % TINTS.length] }}
      onPointerMove={onPointerMove}
    >
      <div className="sf-card-art" aria-hidden="true">
        <img
          src={product.image}
          alt=""
          width="600"
          height="400"
          loading={index < 3 ? 'eager' : 'lazy'}
          decoding="async"
        />
      </div>
      <span ref={spotRef} className="sf-spot" aria-hidden="true" />

      <div className="sf-card-body">
        <span className="sf-card-brand">{product.brand}</span>
        <h3 className="sf-card-name">
          <Link className="sf-card-link" to={`/product/${product.id}`}>
            {product.name}
          </Link>
        </h3>
        <p className="sf-card-tagline">{product.tagline}</p>
        <div className="sf-card-meta">
          <RatingStars rating={product.rating} />
          {product.stockStatus === 'low-stock' && <span className="sf-stock sf-stock-low">Low stock</span>}
        </div>
      </div>

      <div className="sf-card-foot">
        <span className="sf-price">${product.price.toLocaleString()}</span>
        <div className="sf-card-cta">
          <GlassButton variant="ocean" size="sm" onClick={() => addToCart(product)}>
            Add to cart
          </GlassButton>
        </div>
      </div>
    </article>
  );
}

export default function BentoGrid({ products }) {
  return (
    <div className="sf-bento">
      {products.map((product, index) => (
        <BentoCard key={product.id} product={product} index={index} total={products.length} />
      ))}
    </div>
  );
}
