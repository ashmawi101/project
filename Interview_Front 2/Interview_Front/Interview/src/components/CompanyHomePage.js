import React from 'react';
import './CompanyHomePage.css';

const CompanyHomePage = () => {
  return (
    <div className="company-home-page">
      <header className="header">
        <h1>Welcome to [Company Name]</h1>
        <p>Your trusted partner in job recruitment</p>
      </header>
      <section className="company-info">
        <h2>About Us</h2>
        <p>Information about the company...</p>
      </section>
      <section className="featured-jobs">
        <h2>Featured Jobs</h2>
        <div className="jobs">
          <div className="job-card">Job 1</div>
          <div className="job-card">Job 2</div>
          <div className="job-card">Job 3</div>
        </div>
      </section>
    </div>
  );
};

export default CompanyHomePage;
