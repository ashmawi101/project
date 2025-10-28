import React from 'react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero">
      <h1>Your AI Job Acquisition Assistant</h1>
      <div className="hero-buttons">
        <button className="get-started">Get Started</button>
        <button className="learn-more">Learn More</button>
      </div>
    </section>
  );
};

export default HeroSection;
