import React from 'react';
import './Home.css';
import FeaturesSection from './FeaturesSection';

const Home = () => {
  return (
    <div className="home">
      <div id="top" className="hero-section">
        <div className="hero-content">
          <h1>Your AI Job Acquisition Assistant</h1>
          <p>Discover your dream job with advanced AI matching and personalized recommendations.</p>
          <div className="hero-buttons">
            <button className="get-started">Get Started</button>
            <button className="learn-more">Learn More</button>
          </div>
        </div>
      </div>
      <div id="features">
        <FeaturesSection />
      </div>
    </div>
  );
};

export default Home;
