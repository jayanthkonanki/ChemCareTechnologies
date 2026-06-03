import { useState } from 'react';

const FALLBACK_IMG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTRhM2I4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

const toTitle = s => (s || '').replace(/\b\w/g, c => c.toUpperCase());

// Category color palette — cycling
const CAT_COLORS = [
  { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8', active: '#3b82f6' },
  { bg: '#f0fdf4', border: '#22c55e', text: '#15803d', active: '#22c55e' },
  { bg: '#fff7ed', border: '#f97316', text: '#c2410c', active: '#f97316' },
  { bg: '#fdf4ff', border: '#a855f7', text: '#7e22ce', active: '#a855f7' },
  { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c', active: '#ef4444' },
  { bg: '#f0fdfa', border: '#14b8a6', text: '#0f766e', active: '#14b8a6' },
  { bg: '#fffbeb', border: '#f59e0b', text: '#b45309', active: '#f59e0b' },
  { bg: '#f8fafc', border: '#64748b', text: '#334155', active: '#64748b' },
];

const ProductModal = ({ product, onClose }) => {
  const [activeImg, setActiveImg] = useState(0);
  if (!product) return null;
  const { prodname, description, specifications = {}, images = [], thumbnail, price, category, min_order, unit } = product;
  const allImgs = images.length ? images : (thumbnail ? [thumbnail] : []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-content">
          <div className="modal-images">
            <img src={allImgs[activeImg] || FALLBACK_IMG} alt={prodname} className="modal-main-img"
              onError={e => { e.target.src = FALLBACK_IMG; }} />
            {allImgs.length > 1 && (
              <div className="modal-thumbs">
                {allImgs.map((img, i) => (
                  <img key={i} src={img} alt="" className={`modal-thumb${activeImg === i ? ' active' : ''}`}
                    onClick={() => setActiveImg(i)} onError={e => { e.target.src = FALLBACK_IMG; }} />
                ))}
              </div>
            )}
          </div>
          <div className="modal-info">
            <span className="product-cat-badge">{toTitle(category)}</span>
            <h2>{prodname}</h2>
            {price && <p className="modal-price">{price}{unit ? ` / ${unit}` : ''}</p>}
            {min_order && <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Min Order: {min_order}</p>}
            {description && (
              <div className="modal-desc"><h4>Description</h4><p>{description}</p></div>
            )}
            {Object.keys(specifications).length > 0 && (
              <div className="modal-specs">
                <h4>Specifications</h4>
                <div className="specs-grid">
                  {Object.entries(specifications).slice(0, 12).map(([k, v]) => (
                    <div key={k} className="spec-row">
                      <span className="spec-key">{k}</span>
                      <span className="spec-val">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <a href="https://www.indiamart.com/chemcaretechnologies/" target="_blank"
               rel="noopener noreferrer" className="btn btn-primary modal-cta">
              Send Enquiry →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, colorIdx, onClick }) => {
  const img = product.thumbnail || product.images?.[0] || FALLBACK_IMG;
  const col = CAT_COLORS[colorIdx % CAT_COLORS.length];
  return (
    <div className="product-card glass" onClick={() => onClick(product)}>
      <div className="product-img-wrap">
        <img src={img} alt={product.prodname} className="product-img" loading="lazy"
          onError={e => { e.target.src = FALLBACK_IMG; }} />
      </div>
      <div className="product-info">
        <span className="product-cat-badge" style={{ color: col.text, background: col.bg }}>{toTitle(product.category)}</span>
        <h3 className="product-title">{product.prodname}</h3>
        {product.price && <p className="product-price">{product.price}</p>}
        <button className="btn btn-primary product-btn">View Details</button>
      </div>
    </div>
  );
};

const Products = ({ data }) => {
  const [activeSlug, setActiveSlug] = useState('all');
  const [selected, setSelected] = useState(null);

  const categories = data?.categories || [];
  const allProducts = categories.flatMap(c => c.products || []);

  // Build slug→colorIdx map
  const slugColorMap = {};
  categories.forEach((c, i) => { slugColorMap[c.slug] = i; });

  const currentProducts = activeSlug === 'all'
    ? allProducts
    : (categories.find(c => c.slug === activeSlug)?.products || []);

  // Get color for a product
  const productColorIdx = (p) => slugColorMap[p.category_slug] ?? 0;

  return (
    <section id="products" className="section products-section">
      <div className="container">
        <h2 className="section-title">Our Products</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '2.5rem', marginTop: '-2rem' }}>
          {allProducts.length} products across {categories.length} categories
        </p>

        {/* Category Grid — 4-5 per row, swipeable on mobile */}
        <div className="cat-grid-wrap">
          {/* All tab */}
          <button
            className={`cat-grid-btn${activeSlug === 'all' ? ' active' : ''}`}
            onClick={() => setActiveSlug('all')}>
            <span className="cat-grid-icon">🧪</span>
            <span className="cat-grid-name">All Products</span>
            <span className="cat-grid-count">{allProducts.length}</span>
          </button>
          {categories.filter(c => (c.products||[]).length > 0).map((cat, i) => {
            const col = CAT_COLORS[i % CAT_COLORS.length];
            const isActive = activeSlug === cat.slug;
            return (
              <button key={cat.slug}
                className={`cat-grid-btn${isActive ? ' active' : ''}`}
                style={isActive ? { background: col.active, borderColor: col.active, color: 'white' }
                               : { background: col.bg, borderColor: col.border, color: col.text }}
                onClick={() => setActiveSlug(cat.slug)}>
                <span className="cat-grid-name">{toTitle(cat.name)}</span>
                <span className="cat-grid-count">{(cat.products||[]).length}</span>
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        {currentProducts.length > 0 ? (
          <div className="products-grid">
            {currentProducts.map((product, i) => (
              <ProductCard key={product.proddispid || i} product={product}
                colorIdx={productColorIdx(product)} onClick={setSelected} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-light)' }}>
            No products found.
          </div>
        )}
      </div>
      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </section>
  );
};

export default Products;
