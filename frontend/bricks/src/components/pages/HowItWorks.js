import React from 'react';
import NavBar from '../component/NavBar';
import '../Css/HowItWorks.css';

const HowItWorks = () => {
  return (
    <div className="how-it-works-page">
      <NavBar />
      <div className="background-image"></div>
      <div className='content-wrapper'>
        <main className="how-it-works-content">
          <section className="intro-section">
            <div className="intro">
              <h1 className="how-it-works-title">What is "Bricks" ?</h1>
              <p className="how-it-works-subtitle">You own slices of companies with stocks—why not do the same with real estate?</p>
            </div>
          </section>
        </main>
      </div>
      <section className="features-section">
        <div className="features-container">
          <div className="feature">
            <h2>Explore Cool Properties</h2>
            <p>From luxury condo to agricultural land, browse our handpicked selection of properties. Find the one you love, backed by expert insights and future projections.</p>
          </div>
          <div className="feature">
            <h2>Invest Your Way</h2>
            <p>Don't want to drop a fortune? No problem. Buy fractional shares of any property—just like stock investing—starting at an amount that fits your budget.</p>
          </div>
          <div className="feature">
            <h2>Flex Your Investments</h2>
            <p>Want out? You can sell your shares anytime on our marketplace, giving you the flexibility to cash out when it suits you.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;