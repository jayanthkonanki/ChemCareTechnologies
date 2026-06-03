import { MapPin, Star, Building2, Users, TrendingUp, Calendar, Award, Phone } from 'lucide-react';

const About = ({ data }) => {
  const company = data?.company || {};

  // Rating breakdown from profile page
  const ratings = company.rating_breakdown || { 5: 23, 4: 6, 3: 2, 2: 3, 1: 4 };
  const totalRatings = parseInt(company.rating_count || 38);
  const overallRating = parseFloat(company.rating || 4.2);

  const stars = [5, 4, 3, 2, 1];

  const companyDetails = [
    { icon: <Calendar size={20} />, label: 'IndiaMart Member Since', value: 'Dec 2012' },
    { icon: <Building2 size={20} />, label: 'Legal Status', value: 'Partnership' },
    { icon: <TrendingUp size={20} />, label: 'Annual Turnover', value: '₹5 – 25 Crore' },
    { icon: <Users size={20} />, label: 'Number of Employees', value: 'Upto 10 People' },
    { icon: <Award size={20} />, label: 'Nature of Business', value: 'Trader – Wholesaler / Distributor' },
    { icon: <Calendar size={20} />, label: 'GST Registration Date', value: 'Jul 2017' },
    { icon: <MapPin size={20} />, label: 'Location', value: company.location || 'Kanuru, Vijayawada, A.P.' },
    { icon: <Phone size={20} />, label: 'Response Rate', value: company.response_rate || '85%' },
  ];

  const verifications = [
    { icon: '✦', label: 'TrustSEAL Verified', color: '#f1c82e', bg: '#fffbeb' },
    { icon: '✔', label: 'GST Verified', color: '#007a6e', bg: '#f0fdf9' },
    { icon: '✔', label: 'Mobile Verified', color: '#007a6e', bg: '#f0fdf9' },
    { icon: '✔', label: 'Email Verified', color: '#007a6e', bg: '#f0fdf9' },
    { icon: '🏅', label: 'Rank - A Seller', color: '#0070f3', bg: '#eff6ff' },
  ];

  return (
    <section id="about" className="section about-section">
      <div className="container">
        <h2 className="section-title">About Us</h2>
        {company.description && (
          <p className="about-desc">{company.description}</p>
        )}

        {/* Verified Badges Row */}
        <div className="verified-row">
          {verifications.map(v => (
            <div key={v.label} className="verified-pill" style={{ background: v.bg, color: v.color }}>
              <span>{v.icon}</span> {v.label}
            </div>
          ))}
        </div>

        <div className="about-layout">
          {/* Company Details Grid */}
          <div className="about-details-grid">
            {companyDetails.map(({ icon, label, value }) => (
              <div key={label} className="about-detail-row">
                <span className="detail-icon">{icon}</span>
                <div>
                  <p className="detail-label">{label}</p>
                  <p className="detail-value">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Rating Panel */}
          <div className="about-rating-panel glass">
            <h3>Customer Ratings</h3>
            <div className="big-rating">
              <span className="big-rating-num">{overallRating}</span>
              <div>
                <div className="stars-row">{'★'.repeat(Math.round(overallRating))}{'☆'.repeat(5 - Math.round(overallRating))}</div>
                <p className="rating-sub">{totalRatings} reviews on IndiaMart</p>
              </div>
            </div>
            <div className="rating-bars">
              {stars.map(s => {
                const count = ratings[s] || 0;
                const pct = totalRatings ? Math.round((count / totalRatings) * 100) : 0;
                return (
                  <div key={s} className="rating-bar-row">
                    <span className="rating-star-label">{s}★</span>
                    <div className="rating-bar-track">
                      <div className="rating-bar-fill" style={{ width: `${pct}%`, background: s >= 4 ? '#22c55e' : s === 3 ? '#f59e0b' : '#ef4444' }} />
                    </div>
                    <span className="rating-count">{count}</span>
                  </div>
                );
              })}
            </div>
            <a href="https://www.indiamart.com/chemcaretechnologies/testimonial.html"
               target="_blank" rel="noopener noreferrer"
               className="btn btn-primary" style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'center' }}>
              View All Reviews →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
