import React from 'react';

const Testimonials = ({ data }) => {
  const testimonials = data?.testimonials || [];

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="section" style={{ background: 'var(--background)' }}>
      <div className="container">
        <h2 className="section-title">What Our Clients Say</h2>
        <div className="testimonials-grid">
          {testimonials.map((t, idx) => (
            <div key={idx} className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  {t.name ? t.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <h4 className="testimonial-name">{t.name}</h4>
                  <p className="testimonial-loc">{t.location}</p>
                </div>
              </div>
              <div className="testimonial-stars">
                {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
