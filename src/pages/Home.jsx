import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import GlassTabs from '../components/GlassTabs';
import HeroShowcase from '../components/HeroShowcase';
import BentoGrid from '../components/BentoGrid';
import { mockProducts } from '../data/mockProducts';
import '../styles/storefront.css';

const categoryTabs = [
  { id: 'all', label: 'All Gadgets' },
  { id: 'wearables', label: 'Wearables' },
  { id: 'holographics', label: 'Holographics' },
  { id: 'hardware', label: 'Hardware' }
];

const flagship = mockProducts.find(product => product.id === 'qx-001') ?? mockProducts[0];

const heroStats = [
  { value: String(mockProducts.length), label: 'Flagship assets' },
  {
    value: (mockProducts.reduce((sum, product) => sum + product.rating, 0) / mockProducts.length).toFixed(1),
    label: 'Average rating'
  },
  { value: '48h', label: 'Express dispatch' }
];

function Home() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return mockProducts.filter(product => {
      const matchesCategory = activeCategory === 'all' || product.categories.includes(activeCategory);
      const matchesSearch =
        product.name.toLowerCase().includes(query) || product.tagline.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="sf-home">
      <HeroShowcase product={flagship} stats={heroStats} />

      <section id="catalog" className="sf-catalog" aria-labelledby="catalog-title">
        <header className="sf-catalog-head">
          <h2 id="catalog-title">Built for the way you work.</h2>
          <p>Wearables, holographics and hardware, each tuned to move with your workflow.</p>
        </header>

        <div className="sf-tabs-scroll">
          <div className="sf-tabs-track">
            <GlassTabs tabs={categoryTabs} activeTab={activeCategory} onChange={setActiveCategory} />
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <BentoGrid products={filteredProducts} />
        ) : (
          <div className="sf-empty" role="status">
            <p>
              {searchQuery ? `No gadgets match “${searchQuery}”.` : 'No gadgets in this category yet.'}
            </p>
            <div className="sf-empty-actions">
              {activeCategory !== 'all' && (
                <button type="button" className="sf-btn sf-btn-ghost" onClick={() => setActiveCategory('all')}>
                  Show all gadgets
                </button>
              )}
              {searchQuery && (
                <Link className="sf-btn sf-btn-ghost" to="/">
                  Clear search
                </Link>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
