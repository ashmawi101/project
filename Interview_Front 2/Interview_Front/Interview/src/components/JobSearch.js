import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './JobSearch.css';

const JobSearch = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [company, setCompany] = useState('');
  const [jobs, setJobs] = useState([]);
  const token = localStorage.getItem('token'); // Retrieve the token from local storage or any other storage
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('keywords', query);
    formData.append('location', location);
    formData.append('company', company);

    try {
      const response = await axios.get('http://localhost:8000/api/job_search/', {
          params: {
              keywords: query,
              location: location,
              company: company,
          },
          headers: {
              'Authorization': `Bearer ${token}`,
          }
      });
    setJobs(response.data);
      console.log(response.data)
    } catch (error) {
      console.error('Error searching for jobs:', error);
    }
  };

  const handleJobClick = (id) => {
    navigate(`/jobs/${id}`);
  };

  return (
    <div className="job-search">
      <h2>Search for Jobs</h2>
      <form onSubmit={handleSearch} className="job-search-form">
        <input
          type="text"
          placeholder="Job title, keywords, or company"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="text"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      <div className="job-results">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job.id} className="job-card" onClick={() => handleJobClick(job.id)}>
              <h3>{job.job_title}</h3>
              <p>Company ID: {job.company.company_name}</p>
              <p>Role: {job.role}</p>
              <p>Location: {job.location}, {job.country}</p>
              <p>Type: {job.work_type}</p>
              <p>Experience: {job.experience_years} years</p>
              <p>Salary: {job.salary_range}</p>
              <p>{job.description}</p>
            </div>
          ))
        ) : (
          <p>No jobs found</p>
        )}
      </div>
    </div>
  );
};

export default JobSearch;
