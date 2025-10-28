import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SurveyPage.css';
import { useParams, useNavigate } from 'react-router-dom';

const SurveyPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState({
    responses: [
      { question_number: 1, answer: '' },
      { question_number: 2, answer: '' },
      { question_number: 3, answer: '' },
      { question_number: 4, answer: '' },
      { question_number: 5, answer: '' },
      { question_number: 6, answer: '' },
      { question_number: 7, answer: '' },
      { question_number: 8, answer: '' },
      { question_number: 9, answer: '' }
    ]
  });
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/surveys/${interviewId}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data) {
          setSurvey(response.data);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // No existing survey found, continue with empty survey state
        } else {
          console.error('Error fetching survey:', error);
          setError('An error occurred while fetching the survey.');
        }
      }
    };

    fetchSurvey();
  }, [interviewId, token]);

  const handleChange = (index, value) => {
    const newResponses = [...survey.responses];
    newResponses[index] = { ...newResponses[index], answer: value.toString() }; // Ensure answer is stored as a string
    setSurvey({ ...survey, responses: newResponses });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const apiUrl = survey.id ? `http://localhost:8000/api/surveys/${interviewId}/update/` : `http://localhost:8000/api/surveys/`;
    const method = survey.id ? 'put' : 'post';
    const data = {
      interview: interviewId,
      responses: survey.responses.map(response => ({
        question_number: response.question_number,
        answer: response.answer
      }))
    };

    try {
      const response = await axios({
        method: method,
        url: apiUrl,
        data: data,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      alert('Survey submitted successfully!');
      navigate(`/interview-summary/${interviewId}`);
    } catch (error) {
      console.error('Error submitting survey:', error.response ? error.response.data : error);
    }
  };

  const renderRatingQuestion = (label, value, onChange) => (
    <div className="survey-question">
      <label>{label}</label>
      <div className="rating-options">
        {[...Array(10)].map((_, i) => (
          <label key={i + 1}>
            <input
              type="radio"
              name={label}
              value={i + 1}
              checked={parseInt(value) === (i + 1)} // Ensure comparison is done with numbers
              onChange={() => onChange(i + 1)}
              required
            />
            {i + 1}
          </label>
        ))}
      </div>
    </div>
  );

  const renderYesNoQuestion = (label, value, onChange) => (
    <div className="survey-question">
      <label>{label}</label>
      <div className="yes-no-options">
        <label>
          <input
            type="radio"
            name={label}
            value="yes"
            checked={value === 'yes'}
            onChange={() => onChange('yes')}
            required
          />
          Yes
        </label>
        <label>
          <input
            type="radio"
            name={label}
            value="no"
            checked={value === 'no'}
            onChange={() => onChange('no')}
            required
          />
          No
        </label>
      </div>
    </div>
  );

  const renderFeatureSelectionQuestion = (label, value, onChange) => (
    <div className="survey-question">
      <label>{label}</label>
      <div className="feature-options">
        {['Emotion Analysis', 'Tips', 'Answer Scoring'].map((feature) => (
          <label key={feature}>
            <input
              type="radio"
              name={label}
              value={feature}
              checked={value === feature}
              onChange={() => onChange(feature)}
              required
            />
            {feature}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="survey-page">
      <h2>Interview Simulation Survey</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        {renderRatingQuestion('How accurate do you feel the emotion detection was for your text responses?', survey.responses[0].answer, (value) => handleChange(0, value))}
        {renderRatingQuestion('How accurate do you feel the emotion detection was for your audio responses?', survey.responses[1].answer, (value) => handleChange(1, value))}
        {renderYesNoQuestion('Did the emotional feedback help you understand your performance better?', survey.responses[2].answer, (value) => handleChange(2, value))}
        {renderRatingQuestion('How relevant were the tips provided to your responses?', survey.responses[3].answer, (value) => handleChange(3, value))}
        {renderYesNoQuestion('Did you find the tips useful for improving your answers?', survey.responses[4].answer, (value) => handleChange(4, value))}
        {renderRatingQuestion('How accurate do you feel the answer scoring was?', survey.responses[5].answer, (value) => handleChange(5, value))}
        {renderFeatureSelectionQuestion('Which feature (emotion analysis, tips, answer scoring) did you find most useful?', survey.responses[6].answer, (value) => handleChange(6, value))}
        {renderFeatureSelectionQuestion('Which feature did you find least useful?', survey.responses[7].answer, (value) => handleChange(7, value))}
        {renderRatingQuestion('How satisfied are you with the overall experience of using the interview simulation?', survey.responses[8].answer, (value) => handleChange(8, value))}
        <button type="submit" className="submit-button">
          {survey.id ? "Update Survey" : "Submit Survey"}
        </button>
      </form>
    </div>
  );
};

export default SurveyPage;
