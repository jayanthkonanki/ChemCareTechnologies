import { useState } from 'react';

const FALLBACK_IMG = 'https://via.placeholder.com/400x300?text=No+Image';

const ProductModal = ({ product, onClose }) => {
  if (!product) return null;
  const { prodname, description, specifications, images, thumbnail, price, category } = product;
  const allImgs = images?.length ? images : (thumbnail ? [thumbnail] : []);
  const [activeImg, setActiveImg] = useState(0);

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
                  <img
                    key={i}
                    src={img}
                    alt=""
                    className={`modal-thumb${activeImg === i ? ' active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    onError={e => { e.target.src = FALLBACK_IMG; }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="modal-info">
            <span className="product-cat-badge">{category}</span>
            <h2>{prodname}</h2>
            {price && <p className="modal-price">{price}</p>}
            {description && (
              <div className="modal-desc">
                <h4>Description</h4>
                <p>{description}</p>
              </div>
            )}
            {specifications && Object.keys(specifications).length > 0 && (
              <div className="modal-specs">
                <h4>Specifications</h4>
                <div className="specs-grid">
                  {Object.entries(specifications).map(([k, v]) => (
                    <div key={k} className="spec-row">
                      <span className="spec-key">{k}</span>
                      <span className="spec-val">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <a
              href="https://www.indiamart.com/chemcaretechnologies/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary modal-cta"
            >
              Send Enquiry
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const Products = ({ data }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = data?.categories || [];
  if (!categories.length) return null;

  const activeCategory = categories[activeTab];
  const products = activeCategory?.products || [];

  return (
    <section id="products" className="section products-section">
      <div className="container">
        <h2 className="section-title">Our Products</h2>
        <div className="category-tabs">
          {categories.map((cat, i) => (
            <button
              key={i}
              className={`cat-tab${activeTab === i ? ' active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {cat.name}
              <span className="cat-count">{cat.products?.length || 0}</span>
            </button>
          ))}
        </div>
        <div className="products-grid">
          {products.map((product, i) => (
            <div
              key={product.proddispid || i}
              className="product-card glass"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="product-img-wrap">
                <img
                  src={product.thumbnail || product.image || FALLBACK_IMG}
                  alt={product.prodname}
                  className="product-img"
                  loading="lazy"
                  onError={e => { e.target.src = FALLBACK_IMG; }}
                />
              </div>
              <div className="product-info">
                <span className="product-cat-badge">{product.category}</span>
                <h3 className="product-title">{product.prodname}</h3>
                {product.price && <p className="product-price">{product.price}</p>}
                <button className="btn btn-primary product-btn">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  );
};

export default Products;
