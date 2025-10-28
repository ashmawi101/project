import React, { useState, useEffect, useRef } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 3,
    partialVisibilityGutter: 60,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
    partialVisibilityGutter: 60,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
    partialVisibilityGutter: 50,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    partialVisibilityGutter: 30,
  },
};

const CustomLeftArrow = ({ onClick }) => (
  <button className="arrow left-arrow" onClick={onClick}>
    {'<'}
  </button>
);

const CustomRightArrow = ({ onClick }) => (
  <button className="arrow right-arrow" onClick={onClick}>
    {'>'}
  </button>
);

const Dashboard = () => {
  const [interviewCount, setInterviewCount] = useState(0);
  const [highScoreJobCount, setHighScoreJobCount] = useState(0);
  const [mostRegisteredEmotion, setMostRegisteredEmotion] = useState('');
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const token = localStorage.getItem('token'); // Retrieve the token from local storage or any other storage
  const username = localStorage.getItem('username');
  const navigate = useNavigate();
  const interviewSectionRef = useRef(null);

  useEffect(() => {
    const fetchInterviewCount = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/user/interview_count/', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });
        console.log(response);
        setInterviewCount(response.data.interview_count);
      } catch (error) {
        console.error('Error fetching interview count:', error);
      }
    };

    const fetchHighScoreJobCount = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/high_score_job_recommendations_count/', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });
        setHighScoreJobCount(response.data.high_score_job_recommendations_count);
      } catch (error) {
        console.error('Error fetching high score job recommendations count:', error);
      }
    };

    const fetchMostRegisteredEmotion = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/most_registered_emotion/', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });
        setMostRegisteredEmotion(response.data.most_registered_emotion);
      } catch (error) {
        console.error('Error fetching most registered emotion:', error);
      }
    };

    const fetchJobs = async () => {
      try {
        console.log('Attempting to fetch jobs...');
        const response = await fetch('http://localhost:8000/api/job_recommendations/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        console.log(data)
        const top10Jobs = data.slice(0, 10);
        setRecommendedJobs(top10Jobs);
              } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    const fetchInterviews = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/interviews/', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });
        setInterviews(response.data.reverse());
      } catch (error) {
        console.error('Error fetching interviews:', error);
      }
    };

    fetchInterviewCount();
    fetchHighScoreJobCount();
    fetchMostRegisteredEmotion();
    fetchJobs();
    fetchInterviews();
  }, [token]);

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleInterviewClick = (interviewId) => {
    navigate(`/interview-summary/${interviewId}`);
  };

  const scrollToInterviewSection = () => {
    interviewSectionRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="dashboard">
      <h2>Hello {username}!</h2>
      <div className="carousel-container">
        <Carousel
          responsive={responsive}
          infinite={true}
          partialVisible={true}
          showDots={false}
          customLeftArrow={<CustomLeftArrow />}
          customRightArrow={<CustomRightArrow />}
        >
          <div className="carousel-item" onClick={scrollToInterviewSection}>
            <div className="value">{interviewCount}</div>
            <div className="text">Interviews Made</div>
          </div>
          <div className="carousel-item">
            <div className="value">{highScoreJobCount}</div>
            <div className="text">High Score Job Recommendations</div>
          </div>
          <div className="carousel-item">
            <div className="value">{mostRegisteredEmotion}</div>
            <div className="text">Most Registered Emotion</div>
          </div>
        </Carousel>
      </div>

      <div className="recommended-jobs">
        <h2>Recommended Jobs</h2>
        <div className="job-list">
          {recommendedJobs.map((job) => (
            <div
              key={job.id}
              className="job-item"
              onClick={() => handleJobClick(job.id)}
            >
              {job.job_title} at {job.company.company_name}: {job.description}
            </div>
          ))}
        </div>
      </div>

      <div className="interviews-made" ref={interviewSectionRef}>
        <h2>Interviews Made</h2>
        <div className="interview-list">
          {interviews.length > 0 ? (
            interviews.map((interview) => (
              <div
                key={interview.id}
                className="interview-item"
                onClick={() => handleInterviewClick(interview.id)}
              >
                Interview for {interview.job.job_title} at {interview.job.company.company_name}, done on {formatDate(interview.started_at)}.
              </div>
            ))
          ) : (
            <p>Do interviews to have them listed here for future reviews.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
