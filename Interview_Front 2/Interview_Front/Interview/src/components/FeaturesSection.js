import React from 'react';
import './FeaturesSection.css';
import FeatureBox from './FeatureBox';

const FeaturesSection = () => {
  return (
    <div className="features-section">
      <h2>Features</h2>
      <h3>Find Your Dream Job</h3>
      <div className="features">
        <FeatureBox 
          title="AI-Powered Job Matching" 
          description="Find the best job matches using advanced AI algorithms." 
          icon="🤖"
        />
        <FeatureBox 
          title="Job Application" 
          description="Apply for Jobs directly from our website." 
          icon="📄"
        />
        <FeatureBox 
          title="Interview Preparation" 
          description="Practice common and specific interview questions." 
          icon="🎤"
        />
        <FeatureBox 
          title="Interview Advice" 
          description="Recieve Tips to perform better in your next interviews." 
          icon="💼"
        />
      </div>
    </div>
  );
};

export default FeaturesSection;
