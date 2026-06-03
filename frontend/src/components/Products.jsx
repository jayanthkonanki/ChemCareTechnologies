import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const FALLBACK_IMG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTRhM2I4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

const toTitle = s => (s || '').replace(/\b\w/g, c => c.toUpperCase());

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

const ProductCard = ({ product, onClick }) => {
  const img = product.thumbnail || product.images?.[0] || FALLBACK_IMG;
  
  // Extract a short description snippet
  let shortDesc = product.description || '';
  if (shortDesc.length > 120) shortDesc = shortDesc.substring(0, 117) + '...';
  
  // Create some pills based on available data, fallback to generic
  const pills = [];
  if (product.category) pills.push({ text: toTitle(product.category).split(' ')[0], bg: '#eff6ff', color: '#1d4ed8' });
  if (product.price) pills.push({ text: 'In Stock', bg: '#fdf4ff', color: '#7e22ce' });
  pills.push({ text: 'Premium', bg: '#f0fdf4', color: '#15803d' });

  return (
    <div className="modern-product-card" onClick={() => onClick(product)}>
      <div className="modern-product-top">
        <div className="modern-product-circle">
          <img src={img} alt={product.prodname} onError={e => { e.target.src = FALLBACK_IMG; }} />
        </div>
      </div>
      <div className="modern-product-bottom">
        <h3 className="modern-product-title">{product.prodname}</h3>
        {product.price && <p className="modern-product-price">{product.price}{product.unit ? ` / ${product.unit}` : ''}</p>}
        {shortDesc && <p className="modern-product-desc">{shortDesc}</p>}
        
        <div className="modern-product-tags">
          {pills.map((pill, i) => (
            <span key={i} className="modern-pill" style={{ background: pill.bg, color: pill.color }}>
              {pill.text}
            </span>
          ))}
        </div>

        <div className="modern-product-link">
          View Specifications <ArrowRight size={16} />
        </div>
      </div>
    </div>
  );
};

const Products = ({ data }) => {
  const [activeSlug, setActiveSlug] = useState('all');
  const [selected, setSelected] = useState(null);

  const categories = data?.categories || [];
  const allProducts = categories.flatMap(c => c.products || []);

  const currentProducts = activeSlug === 'all'
    ? allProducts
    : (categories.find(c => c.slug === activeSlug)?.products || []);

  const handleCategoryClick = (slug) => {
    setActiveSlug(slug);
    const productsEl = document.getElementById('products');
    if (productsEl) {
      const topOffset = productsEl.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  return (
    <section id="products" className="section products-section">
      <div className="container">
        
        <div className="products-layout">
          {/* Sidebar */}
          <aside className="products-sidebar">
            <h2 className="sidebar-title">Categories</h2>
            <div className="sidebar-menu">
              <button
                className={`sidebar-link${activeSlug === 'all' ? ' active' : ''}`}
                onClick={() => handleCategoryClick('all')}>
                <span>All Products</span>
                <span className="sidebar-count">{allProducts.length}</span>
              </button>
              {categories.filter(c => (c.products||[]).length > 0).map((cat) => {
                return (
                  <button key={cat.slug}
                    className={`sidebar-link${activeSlug === cat.slug ? ' active' : ''}`}
                    onClick={() => handleCategoryClick(cat.slug)}>
                    <span>{toTitle(cat.name)}</span>
                    <span className="sidebar-count">{(cat.products||[]).length}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Grid */}
          <div className="products-main">
            <div className="products-header">
              <h2>{activeSlug === 'all' ? 'All Products' : toTitle(categories.find(c => c.slug === activeSlug)?.name)}</h2>
              <span className="products-count-badge">{currentProducts.length} items</span>
            </div>

            {currentProducts.length > 0 ? (
              <div className="products-modern-grid">
                {currentProducts.map((product, i) => (
                  <ProductCard key={product.proddispid || i} product={product} onClick={setSelected} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-light)' }}>
                No products found.
              </div>
            )}
          </div>
        </div>

      </div>
      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </section>
  );
};

export default Products;
