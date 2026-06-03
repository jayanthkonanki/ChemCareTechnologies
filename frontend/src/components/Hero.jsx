import { ArrowRight, CheckCircle2 } from 'lucide-react';

const Hero = ({ data }) => {
  const company = data?.company || {};
  const name = company.name || 'Chem Care Technologies';
  const desc = company.description || 'Wholesaler & Distributor of Industrial Chemicals — Vijayawada, Andhra Pradesh';

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          {company.logo && (
            <img src={company.logo} alt={name}
              style={{ width: 80, height: 80, borderRadius: 16, marginBottom: '1.5rem', objectFit: 'cover', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
          )}
          <h1>{name}</h1>
          <p>{desc}</p>

          {/* IndiaMart Trust Badges */}
          <div className="trust-badges">
            <span className="trust-badge trust-seal">✦ TrustSEAL Verified</span>
            <span className="trust-badge trust-gst">✔ GST Verified</span>
            <span className="trust-badge trust-rate">📞 85% Response Rate</span>
            <span className="trust-badge trust-years">🕐 13+ Years in Business</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <a href="#products" className="btn btn-primary">
              View Products <ArrowRight size={18} />
            </a>
            <a href="#contact" className="btn glass" style={{ color: 'var(--primary)' }}>
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
