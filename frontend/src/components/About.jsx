import { Shield, Clock, MapPin, Star } from 'lucide-react';
import data from '../data.json';

const About = () => {
  const { company } = data;
  
  return (
    <section id="about" className="section">
      <div className="container">
        <h2 className="section-title">About Us</h2>
        <div className="about-grid">
          <div className="about-card glass">
            <div className="about-icon">
              <MapPin size={24} />
            </div>
            <h3>Location</h3>
            <p>{company.location}</p>
          </div>
          
          <div className="about-card glass">
            <div className="about-icon">
              <Star size={24} />
            </div>
            <h3>Rating</h3>
            <p>{company.rating} / 5.0</p>
          </div>
          
          <div className="about-card glass">
            <div className="about-icon">
              <Clock size={24} />
            </div>
            <h3>Experience</h3>
            <p>{company.years} in business</p>
          </div>
          
          {company.trust_seal && (
            <div className="about-card glass">
              <div className="about-icon">
                <Shield size={24} />
              </div>
              <h3>TrustSEAL</h3>
              <p>Verified Supplier</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default About;
