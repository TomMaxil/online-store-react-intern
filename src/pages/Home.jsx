import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassTabs from '../components/GlassTabs';
import { useCart } from '../context/CartContext';
import { mockProducts } from '../data/mockProducts';

const categoryTabs = [
  { id: 'all', label: 'All Gadgets' },
  { id: 'wearables', label: 'Wearables' },
  { id: 'holographics', label: 'Holographics' },
  { id: 'hardware', label: 'Hardware' }
];

const heroStats = [
  { value: '8', label: 'Flagship Assets' },
  { value: '4.8', label: 'Average Rating' },
  { value: '48h', label: 'Express Dispatch' }
];

const footerColumns = [
  {
    title: 'Shop',
    links: ['All Gadgets', 'Wearables', 'Holographics', 'Hardware']
  },
  {
    title: 'Privacy',
    links: ['Privacy Policy', 'Terms of Service', 'Data Charter', 'Cookies']
  },
  {
    title: 'Metrics Matrix',
    links: ['System Status', 'API Latency', 'Node Uptime', 'Telemetry']
  }
];

function RatingStars({ rating }) {
  const rounded = Math.round(rating);
  return (
    <div style={{ display: 'flex', gap: '0.2rem', color: '#ffd45e', fontSize: '0.75rem' }}>
      {[...Array(5)].map((_, i) => (
        <i key={i} className={i < rounded ? 'fa-solid fa-star' : 'fa-regular fa-star'}></i>
      ))}
    </div>
  );
}

function Home() {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchParams] = useSearchParams(); 
  const searchQuery = searchParams.get('search') || ''; 

  const filteredProducts = useMemo(() => {
    return mockProducts.filter(p => {
      const matchesCategory = activeCategory === 'all' || p.categories.includes(activeCategory);

      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div style={{ display: 'grid', gap: '2.5rem', width: '100%', minWidth: 0, maxWidth: '100%' }}>
      <GlassCard
        shape="panel"
        padding="lg"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1.5rem',
          minWidth: 0,
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-5%',
            top: '-20%',
            width: '50%',
            height: '140%',
            opacity: 0.15,
            pointerEvents: 'none',
            background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
            filter: 'blur(20px)'
          }}
        ></div>

        <div style={{ display: 'grid', gap: '0.9rem', alignContent: 'center', zIndex: 2, minWidth: 0 }}>
          <span
            style={{
              fontSize: 'clamp(0.65rem, 2.4vw, 0.85rem)',
              fontWeight: 600,
              color: 'var(--accent)',
              letterSpacing: '0.05em'
            }}
          >
            NEW COLLECTION 2026
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.65rem, 8vw, 3.5rem)',
              fontWeight: 300,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              margin: 0,
              wordBreak: 'break-word'
            }}
          >
            Elevate Your Everyday
          </h2>
          <p
            style={{
              color: 'var(--ink-soft)',
              maxWidth: '32rem',
              opacity: 0.85,
              fontSize: 'clamp(0.8rem, 3.2vw, 1rem)',
              lineHeight: 1.5,
              margin: 0
            }}
          >
            Premium hardware, timeless industrial design. Experience the perfect blend of quantum-grade
            performance and liquid-smooth interaction.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginTop: '0.5rem'
            }}
          >
            <GlassButton variant="aurora">Shop Now</GlassButton>
            <GlassButton variant="clear">Explore Collection</GlassButton>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem 1.5rem',
            borderTop: '1px solid var(--glass-edge)',
            paddingTop: '1.25rem',
            zIndex: 2,
            minWidth: 0
          }}
        >
          {heroStats.map((stat, idx) => (
            <div key={idx} style={{ flex: '1 1 5.5rem', minWidth: 0 }}>
              <div style={{ fontSize: 'clamp(1.1rem, 4.5vw, 1.5rem)', fontWeight: 700 }}>
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 'clamp(0.6rem, 2.6vw, 0.75rem)',
                  color: 'var(--ink-soft)',
                  whiteSpace: 'normal',
                  lineHeight: 1.3
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <section style={{ display: 'grid', gap: '1.5rem', minWidth: 0, width: '100%' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            minWidth: 0
          }}
        >
          <h3 style={{ fontSize: 'clamp(1.05rem, 4vw, 1.25rem)', fontWeight: 650, margin: 0 }}>
            Catalog Matrix
          </h3>
          <div style={{ width: '100%', maxWidth: '28rem', minWidth: 0 }}>
            <div
              style={{
                width: '100%',
                minWidth: 0,
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              <div style={{ display: 'inline-flex', minWidth: 'min-content', paddingBottom: '2px' }}>
                <GlassTabs tabs={categoryTabs} activeTab={activeCategory} onChange={setActiveCategory} />
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
            gap: '1.25rem',
            minWidth: 0,
            width: '100%'
          }}
        >
          {filteredProducts.map(product => (
            <GlassCard
              key={product.id}
              shape="tile"
              padding="none"
              interactive
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                height: '100%',
                overflow: 'hidden',
                minWidth: 0
              }}
            >
              <Link
                to={`/product/${product.id}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  minWidth: 0
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '180px',
                    overflow: 'hidden',
                    borderBottom: '1px solid var(--glass-edge)'
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div
                  style={{
                    padding: '1rem',
                    flex: '1 1 auto',
                    display: 'grid',
                    gap: '0.4rem',
                    minWidth: 0
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--icon)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {product.brand}
                  </span>
                  <h4
                    style={{
                      fontSize: 'clamp(0.95rem, 3.6vw, 1.05rem)',
                      fontWeight: 650,
                      color: 'var(--ink)',
                      margin: 0,
                      wordBreak: 'break-word'
                    }}
                  >
                    {product.name}
                  </h4>
                  <p
                    style={{
                      fontSize: 'clamp(0.72rem, 3vw, 0.8rem)',
                      color: 'var(--ink-soft)',
                      opacity: 0.85,
                      margin: 0,
                      lineHeight: 1.4
                    }}
                  >
                    {product.tagline}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: 'auto',
                      paddingTop: '0.5rem'
                    }}
                  >
                    <RatingStars rating={product.rating} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                      ({product.rating})
                    </span>
                  </div>
                </div>
              </Link>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  borderTop: '1px solid var(--glass-edge)',
                  padding: '0.75rem 1rem 1rem 1rem',
                  flexWrap: 'wrap',
                  minWidth: 0
                }}
              >
                <div
                  style={{
                    fontSize: 'clamp(1rem, 4.2vw, 1.2rem)',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}
                >
                  ${product.price.toLocaleString()}
                </div>
                <GlassButton
                  variant="ocean"
                  size="sm"
                  onClick={e => {
                    e.preventDefault();
                    addToCart(product);
                  }}
                >
                  Add To Cart
                </GlassButton>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <footer
        style={{
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '1px solid var(--glass-edge)',
          display: 'grid',
          gap: '2rem',
          minWidth: 0,
          width: '100%'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
            gap: '1.75rem',
            minWidth: 0
          }}
        >
          <div style={{ display: 'grid', gap: '0.6rem', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '0.65rem',
                  background:
                    'linear-gradient(135deg, var(--accent), rgba(255,255,255,0.15))',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: 'var(--ink)'
                }}
              >
                A
              </div>
              <div style={{ display: 'grid', lineHeight: 1.15 }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>Aurora Store</span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    letterSpacing: '0.14em',
                    color: 'var(--ink-soft)',
                    textTransform: 'uppercase'
                  }}
                >
                  Quantum Commerce Hub
                </span>
              </div>
            </div>
            <p
              style={{
                fontSize: '0.78rem',
                color: 'var(--ink-soft)',
                opacity: 0.8,
                maxWidth: '22rem',
                lineHeight: 1.5,
                margin: 0
              }}
            >
              A future-forward commerce shell engineered for liquid interaction, quantum-grade
              performance, and timeless industrial design.
            </p>
          </div>

          {footerColumns.map(column => (
            <div key={column.title} style={{ display: 'grid', gap: '0.65rem', minWidth: 0 }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--ink)'
                }}
              >
                {column.title}
              </span>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'grid',
                  gap: '0.4rem'
                }}
              >
                {column.links.map(link => (
                  <li key={link}>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--ink-soft)',
                        opacity: 0.85,
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease'
                      }}
                    >
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: '1px solid var(--glass-edge)',
            paddingTop: '1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.75rem',
            color: 'var(--ink-soft)',
            minWidth: 0
          }}
        >
          <span>&copy; 2026 Aurora Store. All operational matrix nodes secured.</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
            <span style={{ cursor: 'pointer' }}>System Status</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;