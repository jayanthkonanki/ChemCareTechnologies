import { MapPin, Star, Building2, Users, TrendingUp, Calendar, Award, Phone } from 'lucide-react';

const About = ({ data }) => {
  const company = data?.company || {};

  const factSheet = [
    { label: 'Nature of Business', value: 'Trader - Wholesaler/Distributor' },
    { label: 'Additional Business', value: 'Wholesale Business, Retail Business, Factory / Manufacturing' },
    { label: 'Company CEO', value: 'K Ramanjaneyulu' },
    { label: 'Registered Address', value: 'Kanuru, Vijayawada, Krishna, Andhra Pradesh' },
    { label: 'Total Number of Employees', value: 'Upto 10 People' },
    { label: 'GST Registration Date', value: 'Jul\'17' },
    { label: 'Legal Status of Firm', value: 'Partnership' },
    { label: 'Annual Turnover', value: '5 - 25 Cr' },
  ];

  const statutory = [
    { label: 'Banker', value: 'HDFC Bank' },
    { label: 'GST No.', value: '37**********1Z6' },
  ];

  const paymentShipment = [
    { label: 'Payment Mode', value: 'Credit Card, Cash, Cheque, DD, Online' },
    { label: 'Shipment Mode', value: 'By Road' },
  ];

  return (
    <section id="about" className="section about-section">
      <div className="container">
        
        <div className="about-content">
          <div className="about-text-blocks">
            <h2>Chem Care Technologies</h2>
            <p>Established in the year <strong>2012</strong> we "<strong>Chem Care Technologies.</strong>" is a Manufacturer of the wide spectrum Non Ferric Alum, View More, Cooling Tower Chemicals etc. We are manufacturing these products using premium grade raw material that is procured from the authentic vendors of the market. We offer these products at reasonable rates and deliver these within the promised time-frame.</p>
            
            <p>We have hired an adroit team of employees, which keeps themselves abreast with advanced manufacturing techniques and designs. Further, we also have a quality control unit, wherein, we check our entire range on defined parameters like design, quality and finish. All units and equipped with all the essential tools, machine, and technology in order to manufacture a high-quality range of products.</p>
            
            <p>Under the valuable guidance of our mentor, <strong>Mr.Konanki</strong>, we are growing with a notable rate in the market. He has spent long years in the industry to have rich industrial experience enabling us to understand the varied requirements of our clients.</p>

            <h3>Our Team</h3>
            <p>Our teams of highly skilled and experienced professionals help us in the attainment of a number of the firm's targets, predefined. The team, for reasons of better and highly effective management of operations, has been parted into several highly operational units. These units, in the most effective and efficient manner, boosts the firm's production capacity. The division of these professionals is done as per their area of expertise. Further, regular training sessions are provided, for maximum employee satisfaction.</p>

            <h3>Why Us?</h3>
            <p>Since our development in this industry, we have directed all our hard work in accomplishing a top-notch stature by delivering a supreme variety of products to our customers. Our company is widely acclaimed due to the following reasons:</p>
            <ul className="why-us-list">
              <li>Client-centric approach</li>
              <li>Moral business ethics</li>
              <li>International quality standards</li>
              <li>Economical prices</li>
            </ul>
          </div>

          <div className="about-factsheet">
            <h3>Factsheet</h3>
            <div className="factsheet-card">
              <h4>Basic Information</h4>
              <div className="factsheet-grid">
                {factSheet.map((item, i) => (
                  <div key={i} className="factsheet-row">
                    <span className="fact-label">{item.label}</span>
                    <span className="fact-value">{item.value}</span>
                  </div>
                ))}
              </div>

              <h4>Statutory Profile</h4>
              <div className="factsheet-grid">
                {statutory.map((item, i) => (
                  <div key={i} className="factsheet-row">
                    <span className="fact-label">{item.label}</span>
                    <span className="fact-value">{item.value}</span>
                  </div>
                ))}
              </div>

              <h4>Packaging/Payment and Shipment Details</h4>
              <div className="factsheet-grid">
                {paymentShipment.map((item, i) => (
                  <div key={i} className="factsheet-row">
                    <span className="fact-label">{item.label}</span>
                    <span className="fact-value">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default About;
