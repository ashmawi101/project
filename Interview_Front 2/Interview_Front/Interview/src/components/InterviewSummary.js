import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import './InterviewSummary.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip);

const emotionOrder = {
  'disgust': 0,
  'fearful': 1,
  'angry': 2,
  'sad': 3,
  'neutral': 4,
  'calm': 5,
  'happy': 6,
  'surprised': 7
};

const emotionColors = {
  'audio': 'green',
  'text': 'blue',
  'none': 'black'
};

const InterviewSummary = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [competenceScore, setCompetenceScore] = useState(null);
  const token = localStorage.getItem('token');
  const [surveyExists, setSurveyExists] = useState(false);
  const [emotionalData, setEmotionalData] = useState([]);

  useEffect(() => {
    const fetchInterviewSummary = async () => {
      try {
        const summaryResponse = await axios.get(`http://localhost:8000/api/interview_summary/${interviewId}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setSummary(summaryResponse.data);
        console.log(summaryResponse.data);
        
        setSurveyExists(false);
      } catch (error) {
        console.error('Error fetching interview summary:', error);
      }
    };

    const fetchEmotionalData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/emotional_development/${interviewId}/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        setEmotionalData(response.data);
      } catch (error) {
        console.error('Error fetching emotional development data:', error);
      }
    };

    const fetchCompetenceScore = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/competence_score/${interviewId}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCompetenceScore(response.data.competence_score);
      } catch (error) {
        console.error('Error fetching competence score:', error);
      }
    };

    if (interviewId && token) {
      fetchInterviewSummary();
      fetchEmotionalData();
      fetchCompetenceScore();
    } else {
      console.error('No interviewId or token available');
    }
  }, [interviewId, token]);

  const handleSurveyClick = () => {
    navigate(`/survey/${interviewId}`);
  };

  if (!summary) {
    return <div>Loading...</div>;
  }

  const filteredEmotionalData = emotionalData.filter(data =>
    summary.responses?.some(response => response.question === data.question_id)
  );

  const chartData = {
    labels: summary.questions.map((_, index) => `Q${index}`),
    datasets: [{
      label: 'Emotional Development',
      data: summary.questions.map((question, index) => {
        const emotion = filteredEmotionalData.find(e => e.question_id === question.id);
        return {
          x: index,
          y: emotion ? emotionOrder[emotion.emotion] : null
        };
      }).map(point => ({ ...point, y: point.y !== null ? point.y : 4 })), // Default to 'neutral' (index 4) if no emotion
      backgroundColor: summary.questions.map(question => {
        const emotion = filteredEmotionalData.find(e => e.question_id === question.id);
        return emotion ? emotionColors[emotion.prediction_type] : emotionColors['none'];
      }),
      borderColor: summary.questions.map(question => {
        const emotion = filteredEmotionalData.find(e => e.question_id === question.id);
        return emotion ? emotionColors[emotion.prediction_type] : emotionColors['none'];
      }),
      borderWidth: 1,
      pointRadius: 5
    }]
  };

  const chartOptions = {
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Questions'
        },
        ticks: {
          stepSize: 1,
          callback: function (value) {
            return Math.floor(value) === value ? `Q${value + 1}` : '';
          }
        }
      },
      y: {
        type: 'linear',
        min: 0,
        max: 7,
        ticks: {
          stepSize: 1,
          callback: function (value) {
            return Object.keys(emotionOrder).find(key => emotionOrder[key] === value);
          }
        },
        title: {
          display: true,
          text: 'Emotions'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  const surveyButtonText = surveyExists ? "Review Survey" : "Take Survey";

  return (
    <div className="interview-summary">
      <div className="job-details">
        <h2>{summary.job?.job_title}</h2>
        <h3>Company: {summary.company?.company_name}</h3>
        <p><a href={`http://${summary.company?.website}`}>{summary.company?.website}</a></p>
      </div>
      {competenceScore !== null && (
      <div className="competence-score-chart">
        <CircularProgressbar
          value={competenceScore.toFixed(2)}
          text={`${competenceScore.toFixed(2)}%`}
          styles={buildStyles({
            pathColor: `rgba(62, 152, 199, ${competenceScore})`,
            textColor: '#3e98c7',
            trailColor: '#d6d6d6',
          })}
        />
      </div>
      )}
      <div className="emotional-development-chart">
        <h3>Emotional Development Chart</h3>
        <Line data={chartData} options={chartOptions} />
      </div>
      <div className="questions-responses">
        <h3>Questions & Responses</h3>
        {summary.questions.map((question, index) => {
          const response = summary.responses?.find(resp => resp.question === question.id);
          const score = summary.scores?.find(score => score.interview_response === response?.id);
          const tip = summary.tips?.find(tip => tip.interview_response === response?.id);
          const emotion = summary.emotions?.find(emotion => emotion.question_id === question.id);
          return (
            <div key={question.id} className="question-response">
              <h4>Q{index + 1}: {question.text}</h4>
              {response?.response_text ? (
                <p>A: {response.response_text}</p>
              ) : (
                response?.audio_url && <audio controls src={response.audio_url}>Your browser does not support the audio element.</audio>
              )}
              {score && (
                <div className="score-details">
                  <p>Score: {score.score}</p>
                </div>
              )}
              {emotion && emotion.prediction_type !== 'text' && (
                <div className="filler-word-count">
                  <p>Filler Word Count: {response?.filler_word_count}</p>
                </div>
              )}
              {tip && (
                <div className="tip-details">
                  <p>{tip.tips}</p>
                </div>
              )}
              {emotion && (
                <div className="emotion-details">
                  <p>Emotion: {emotion.emotion}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button onClick={handleSurveyClick} className="survey-button">
        {surveyButtonText}
      </button>
    </div>
  );
};

export default InterviewSummary;