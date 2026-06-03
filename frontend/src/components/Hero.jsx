import { ArrowRight } from 'lucide-react';
import data from '../data.json';

const Hero = () => {
  const { company } = data;
  
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h1>{company.name}</h1>
          <p>{company.description}</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
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
