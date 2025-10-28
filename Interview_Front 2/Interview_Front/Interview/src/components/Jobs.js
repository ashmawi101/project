import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Jobs.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token'); // Retrieve the token from local storage or any other storage
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs('http://localhost:8000/api/jobs/'); // Assuming the endpoint for all jobs is '/api/jobs/all'
  }, []);

  const fetchJobs = async (url) => {
    try {
      setLoading(true);
      console.log('Attempting to fetch jobs...');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Jobs data:', data);

      // Check if data is an array
      if (Array.isArray(data)) {
        setJobs(data);
      } else {
        throw new Error('Invalid data structure');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError(error.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (id) => {
    navigate(`/jobs/${id}`);
  };

  return (
    <div className="jobs-page">
      <h1>Job Listings</h1>
      {error && <p className="error">Error: {error}</p>}
      <div className="jobs-list">
        {jobs.map(job => (
          <div key={job.id} className="job-card" onClick={() => handleJobClick(job.id)}>
            <h2>{job.job_title}</h2>
            <p><strong>Company:</strong> {job.company.company_name}</p>
            <p><strong>Location:</strong> {job.location}</p>
            <p><strong>Description:</strong> {job.description}</p>
            <p><strong>Experience Required:</strong> {job.experience_years} years</p>
            <p><strong>Role:</strong> {job.role}</p>
          </div>
        ))}
      </div>
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default Jobs;