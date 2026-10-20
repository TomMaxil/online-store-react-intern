import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { VisorSketch, VisorSolid } from './VisorArt';

const MAX_TILT = 9;
const formatPrice = value => `$${value.toLocaleString()}`;

export default function HeroShowcase({ product, stats }) {
  const heroRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    const scene = sceneRef.current;
    if (!hero || !scene) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        hero.dataset.live = String(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(hero);

    const canTilt =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let frame = 0;
    let rx = 0;
    let ry = 0;

    const paint = () => {
      frame = 0;
      scene.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onMove = event => {
      const rect = hero.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      ry = nx * MAX_TILT * 2;
      rx = -ny * MAX_TILT * 2;
      schedule();
    };

    const onLeave = () => {
      rx = 0;
      ry = 0;
      schedule();
    };

    if (canTilt) {
      hero.addEventListener('pointermove', onMove, { passive: true });
      hero.addEventListener('pointerleave', onLeave, { passive: true });
    }

    return () => {
      observer.disconnect();
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const scrollToCatalog = () => {
    document.getElementById('catalog')?.scrollIntoView({ block: 'start' });
  };

  const chips = product.specs.slice(0, 3);
  const lowStock = product.stockStatus === 'low-stock';

  return (
    <section ref={heroRef} className="sf-hero" data-live="true" aria-labelledby="hero-title">
      <div className="sf-hero-copy">
        <h1 id="hero-title" className="sf-hero-title">
          <span>Quantum</span>
          <span>AR Visor</span>
        </h1>
        <p className="sf-hero-lede">{product.tagline}</p>
        <p className="sf-hero-text">{product.description}</p>

        <div className="sf-hero-buy">
          <span className="sf-hero-price">{formatPrice(product.price)}</span>
          <span className={lowStock ? 'sf-stock sf-stock-low' : 'sf-stock'}>
            {lowStock ? 'Low stock' : 'In stock'}
          </span>
        </div>

        <div className="sf-hero-actions">
          <Link className="sf-btn sf-btn-primary" to={`/product/${product.id}`}>
            View the visor
          </Link>
          <button type="button" className="sf-btn sf-btn-ghost" onClick={scrollToCatalog}>
            Browse the catalog
          </button>
        </div>

        <dl className="sf-hero-stats">
          {stats.map(stat => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="sf-stage" aria-hidden="true">
        <div ref={sceneRef} className="sf-scene">
          <span className="sf-word">AR</span>
          <span className="sf-ring sf-ring-a" />
          <span className="sf-ring sf-ring-b" />
          <span className="sf-floor" />
          <span className="sf-glow" />
          <div className="sf-product">
            <span className="sf-shadow" />
            <VisorSketch />
            <div className="sf-solid-wrap">
              <div className="sf-solid-inner">
                <VisorSolid />
              </div>
              <span className="sf-scan" />
            </div>
          </div>
          {chips.map((spec, index) => (
            <span key={spec} className={`sf-chip sf-chip-${index + 1}`}>
              <span style={{ animationDelay: `${index * -1.8}s` }}>{spec}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
