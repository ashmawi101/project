import React from 'react';
import './FeatureBox.css';

const FeatureBox = ({ title, description, icon }) => {
  return (
    <div className="feature-box">
      <div className="feature-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
};

export default FeatureBox;
