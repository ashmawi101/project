import React, { useState, useEffect } from 'react';
import './RecommendedJobs.css';

const RecommendedJobs = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    // Fetch recommended jobs from backend
  }, []);

  return (
    <div className="recommended-jobs-page">
      <div className="header">
        <h2>Recommended Jobs</h2>
      </div>
      <div className="job-results">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div className="job-card" key={job.id}>
              <h3>{job.title}</h3>
              <p>{job.company}</p>
              <p>{job.location}</p>
            </div>
          ))
        ) : (
          <p>No jobs found</p>
        )}
      </div>
    </div>
  );
};

export default RecommendedJobs;

