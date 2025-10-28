import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './JobDescription.css';

const JobDescription = () => {
  const { id } = useParams(); // Get the job ID from the URL
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token'); // Retrieve the token from local storage or any other storage
  const navigate = useNavigate();
  
  const requestInterviewId = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/start_interview/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ job_id: job.id })
      });
      const data = await response.json();
      if (response.ok) {
        return data.interview_id;
      } else {
        console.error('Failed to request interview ID');
        return null;
      }
    } catch (error) {
      console.error('Error requesting interview ID:', error);
      return null;
    }
  };

  const startInterview = async () => {
    const interview = await requestInterviewId();
    if (interview) {
      console.log('Navigating to interview simulation'); // Debug: Log navigation action
      navigate('/interview-simulation', { state: { job, interview } });
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      console.log('Fetching job details...');
      const response = await fetch(`http://localhost:8000/api/jobs/${id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Add the bearer token here
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Job details:', data);
      setJob(data);
    } catch (error) {
      console.error('Error fetching job details:', error);
      setError(error.toString());
    }
  };

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!job) {
    return <p>Loading...</p>;
  }

  return (
    <div className="job-description-page">
      <header className="header">
        <div className="header-content">
          <h1>{job.job_title}</h1>
          <p>{job.company.company_name}</p>
          <p>{job.location}, {job.country}</p>
          <p>{job.work_type}</p>
          <p>{job.salary_range}</p>
          <button className="start-interview-button" onClick={startInterview}>Start Interview</button>
        </div>
      </header>
      <section className="job-details">
        <h2>Job Description</h2>
        <p>{job.description}</p>
      </section>
      <section className="responsibilities">
        <h2>Responsibilities</h2>
        <ul>
          {job.responsibilities.length > 0 ? (
            job.responsibilities.map((responsibility) => (
              <li key={responsibility.id}>{responsibility.responsibility}</li>
            ))
          ) : (
            <p>No responsibilities listed.</p>
          )}
        </ul>
      </section>
      <section className="requirements">
        <h2>Requirements</h2>
        <ul>
          {job.qualifications.length > 0 ? (
            job.qualifications.map((qualification) => (
              <li key={qualification.id}>{qualification.qualification}</li>
            ))
          ) : (
            <p>No qualifications listed.</p>
          )}
        </ul>
      </section>
      <section className="skills">
        <h2>Skills</h2>
        <ul>
          {job.skills.length > 0 ? (
            job.skills.map((skill) => (
              <li key={skill.id}>{skill.skill}</li>
            ))
          ) : (
            <p>No skills listed.</p>
          )}
        </ul>
      </section>
      <section className="benefits">
        <h2>Benefits</h2>
        <ul>
          {job.benefits.length > 0 ? (
            job.benefits.map((benefit) => (
              <li key={benefit.id}>{benefit.benefit}</li>
            ))
          ) : (
            <p>No benefits listed.</p>
          )}
        </ul>
      </section>
    </div>
  );
};

export default JobDescription;
