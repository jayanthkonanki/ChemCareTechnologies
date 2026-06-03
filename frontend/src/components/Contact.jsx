import { Mail, Phone, MapPin } from 'lucide-react';
import data from '../data.json';

const Contact = () => {
  const { company } = data;

  return (
    <section id="contact" className="section" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)' }}>
      <div className="container">
        <h2 className="section-title">Get in Touch</h2>
        <div className="contact-wrap glass" style={{ padding: '4rem', borderRadius: '24px' }}>
          <div>
            <h3 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Ready to work with us?</h3>
            <p style={{ color: 'var(--text-light)', marginBottom: '2rem', fontSize: '1.125rem' }}>
              We provide world-class chemical solutions for your industry needs. Reach out for quotes or inquiries.
            </p>
            <div className="contact-info">
              <p><MapPin className="contact-icon" /> {company.location}</p>
              <p><Phone className="contact-icon" /> +91-XXXXXXXXXX (Placeholder)</p>
              <p><Mail className="contact-icon" /> contact@chemcare.com (Placeholder)</p>
            </div>
          </div>
          <div>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Your Name" style={inputStyle} />
              <input type="email" placeholder="Your Email" style={inputStyle} />
              <textarea placeholder="Your Message" rows={4} style={{...inputStyle, resize: 'vertical'}}></textarea>
              <button className="btn btn-primary" style={{ justifyContent: 'center', padding: '1rem' }}>Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

const inputStyle = {
  width: '100%',
  padding: '1rem',
  borderRadius: '12px',
  border: '1px solid var(--border)',
  background: 'rgba(255, 255, 255, 0.8)',
  fontSize: '1rem',
  outline: 'none'
};

export default Contact;
