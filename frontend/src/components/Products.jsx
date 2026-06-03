import { useState } from 'react';

const FALLBACK_IMG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTRhM2I4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

const toTitle = s => s.replace(/\b\w/g, c => c.toUpperCase());

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
            <img
              src={allImgs[activeImg] || FALLBACK_IMG}
              alt={prodname}
              className="modal-main-img"
              onError={e => { e.target.src = FALLBACK_IMG; }}
            />
            {allImgs.length > 1 && (
              <div className="modal-thumbs">
                {allImgs.map((img, i) => (
                  <img key={i} src={img} alt=""
                    className={`modal-thumb${activeImg === i ? ' active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    onError={e => { e.target.src = FALLBACK_IMG; }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="modal-info">
            <span className="product-cat-badge">{toTitle(category || '')}</span>
            <h2>{prodname}</h2>
            {price && <p className="modal-price">{price}{unit ? ` / ${unit}` : ''}</p>}
            {min_order && <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Min Order: {min_order}</p>}
            {description && (
              <div className="modal-desc">
                <h4>Description</h4>
                <p>{description}</p>
              </div>
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

const ProductCard = ({ product, onClick }) => {
  const img = product.thumbnail || product.images?.[0] || FALLBACK_IMG;
  return (
    <div className="product-card glass" onClick={() => onClick(product)}>
      <div className="product-img-wrap">
        <img src={img} alt={product.prodname} className="product-img" loading="lazy"
          onError={e => { e.target.src = FALLBACK_IMG; }} />
      </div>
      <div className="product-info">
        <span className="product-cat-badge">{toTitle(product.category || '')}</span>
        <h3 className="product-title">{product.prodname}</h3>
        {product.price && <p className="product-price">{product.price}</p>}
        <button className="btn btn-primary product-btn">View Details</button>
      </div>
    </div>
  );
};

const Products = ({ data }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const categories = data?.categories || [];

  // Flatten all products for "All" tab and search
  const allProducts = categories.flatMap(c => c.products || []);

  // Build tab list: "All" + categories with >0 products
  const tabs = [
    { slug: 'all', name: 'All Products', count: allProducts.length },
    ...categories
      .filter(c => (c.products || []).length > 0)
      .map(c => ({ slug: c.slug, name: toTitle(c.name), count: (c.products || []).length }))
  ];

  // Current products
  let currentProducts = activeTab === 'all'
    ? allProducts
    : (categories.find(c => c.slug === activeTab)?.products || []);

  // Search filter
  if (search.trim()) {
    const q = search.toLowerCase();
    currentProducts = currentProducts.filter(p =>
      (p.prodname || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  }

  return (
    <section id="products" className="section products-section">
      <div className="container">
        <h2 className="section-title">Our Products</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '2rem', marginTop: '-2rem' }}>
          {allProducts.length} products across {categories.length} categories
        </p>

        {/* Search */}
        <div className="product-search-wrap">
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="product-search"
          />
        </div>

        {/* Category tabs — scrollable */}
        <div className="category-tabs-wrap">
          <div className="category-tabs">
            {tabs.map(t => (
              <button key={t.slug}
                className={`cat-tab${activeTab === t.slug ? ' active' : ''}`}
                onClick={() => { setActiveTab(t.slug); setSearch(''); }}>
                {t.name}
                <span className="cat-count">{t.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {currentProducts.length > 0 ? (
          <div className="products-grid">
            {currentProducts.map((product, i) => (
              <ProductCard key={product.proddispid || i} product={product} onClick={setSelected} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-light)' }}>
            No products found{search ? ` for "${search}"` : ''}.
          </div>
        )}
      </div>
      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </section>
  );
};

export default Products;
