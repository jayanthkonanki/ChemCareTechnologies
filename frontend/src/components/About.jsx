import { Shield, Clock, MapPin, Star, Phone, TrendingUp } from 'lucide-react';

const About = ({ data }) => {
  const company = data?.company || {};

  const cards = [
    { icon: <MapPin size={22} />, label: 'Location', value: company.location || 'Kanuru, Vijayawada' },
    { icon: <Star size={22} />, label: 'Rating', value: `${company.rating || '4.2'} / 5.0 (${company.rating_count || '38'} reviews)` },
    { icon: <Clock size={22} />, label: 'Experience', value: company.years || '13 yrs' },
    { icon: <Shield size={22} />, label: 'Verification', value: company.trust_seal ? 'TrustSEAL + GST Verified' : 'GST Verified' },
    { icon: <Phone size={22} />, label: 'Response Rate', value: company.response_rate || '85%' },
    { icon: <TrendingUp size={22} />, label: 'Business Type', value: company.business_type || 'Trader / Wholesaler / Distributor' },
  ];

  return (
    <section id="about" className="section">
      <div className="container">
        <h2 className="section-title">About Us</h2>
        {company.description && (
          <p style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 3rem', color: 'var(--text-light)', fontSize: '1.125rem', lineHeight: 1.7 }}>
            {company.description}
          </p>
        )}
        <div className="about-grid">
          {cards.map(({ icon, label, value }) => (
            <div key={label} className="about-card glass">
              <div className="about-icon">{icon}</div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{label}</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
