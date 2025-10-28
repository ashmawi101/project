import React, { useState } from 'react';
import './SubmitJob.css';

const SubmitJob = () => {
  const [jobDetails, setJobDetails] = useState({
    title: '',
    description: '',
    location: '',
    // add other fields as necessary
  });

  const handleChange = (e) => {
    setJobDetails({
      ...jobDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle job submission logic
  };

  return (
    <div className="submit-job-page">
      <div className="header">
        <h2>Submit New Job</h2>
      </div>
      <form className="submit-job-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Job Title"
          value={jobDetails.title}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Job Description"
          value={jobDetails.description}
          onChange={handleChange}
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={jobDetails.location}
          onChange={handleChange}
        />
        {/* Add more fields as necessary */}
        <button type="submit" className="submit-button">Submit</button>
      </form>
    </div>
  );
};

export default SubmitJob;
