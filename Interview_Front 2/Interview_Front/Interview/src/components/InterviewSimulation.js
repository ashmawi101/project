import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RecordingControls from './RecordingControls';
import ChatArea from './ChatArea';
import axios from 'axios';
import './InterviewSimulation.css';
import Swal from 'sweetalert2';

const InterviewSimulation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { job, interview } = location.state;
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const chatAreaRef = useRef(null);
  const token = localStorage.getItem('token');

  function showCustomAlert() {
    Swal.fire({
      title: 'HireMe Alert!',
      text: 'Please stay in this tab until you finish the interview!',
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: 'red',
      iconColor: 'red'
    });
  }

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        showCustomAlert();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const startInterview = () => {
    const welcomeMessage = "Welcome to the interview! Please tell us about yourself.";
    setMessages([{ text: welcomeMessage, sender: 'system' }]);
    speak(welcomeMessage);
  };

  const handleAnswerSubmit = async () => {
    if (!currentQuestion) {
      console.error('Current question is not set');
      return;
    }

    if (currentAnswer.trim() === '') {
      Swal.fire({
        title: 'Empty Response',
        text: 'Please provide an answer before submitting.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: 'red',
        iconColor: 'red'
      });
      return;
    }

    const newMessages = [...messages, { text: currentAnswer, sender: 'user' }];
    setMessages(newMessages);
    setCurrentAnswer('');
    await uploadText(currentAnswer);
    await fetchNextQuestion(currentQuestion.order + 1);
  };

  const uploadText = async (text) => {
    if (!currentQuestion) {
      console.error('Current question is not set');
      return;
    }

    const formData = new FormData();
    formData.append('text', text);
    formData.append('interview', interview);
    formData.append('question_instance', currentQuestion.question_instance_id);

    try {
      const response = await axios.post('http://localhost:8000/api/upload-text-response/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        }
      });
      console.log('Text upload response:', response.data);
    } catch (error) {
      console.error('There was an error uploading the text!', error);
    }
  };

  const fetchNextQuestion = async (currentOrder) => {
    try {
      const response = await axios.post(`http://localhost:8000/api/jobs/${job.id}/next-question/`, {
        interview_id: interview,
        current_order: currentOrder
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = response.data;

      if (data.message === "No more questions available") {
        speak('Interview done');
        setTimeout(() => navigate(`/interview-summary/${interview}`), 3000);
      } else {
        setCurrentQuestion({ ...data, order: currentOrder });
        setMessages(prevMessages => [...prevMessages, { text: data.question_text, sender: 'system' }]);
        speak(data.question_text); // Speak the fetched question
      }
    } catch (error) {
      console.error('Error fetching next interview question:', error);
    }
  };

  const speak = (text, selectedVoice) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (currentAnswer.trim() !== '') {
        handleAnswerSubmit();
      }
    }
  };

  return (
    <div className="interview-simulation">
      <div className="header">
        <h2>{job.title}</h2>
        <h3>Interview Simulation</h3>
        <p>{job.company.company_name}</p>
      </div>
      <ChatArea messages={messages} chatAreaRef={chatAreaRef} />
      <div className="input-area">
        {!messages.length ? (
          <button onClick={startInterview}>
            Start Interview
          </button>
        ) : (
          <>
            {currentQuestion === null ? (
              <button onClick={() => fetchNextQuestion(1)}>
                Continue
              </button>
            ) : (
              <>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer here..."
                />
                <button onClick={handleAnswerSubmit}>
                  Submit Answer
                </button>
                <RecordingControls
                  isRecording={isRecording}
                  setIsRecording={setIsRecording}
                  setMessages={setMessages}
                  handleNextQuestion={() => fetchNextQuestion(currentQuestion.order + 1)}
                  interview={interview}
                  questionId={currentQuestion?.question_instance_id}
                  token={token}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InterviewSimulation;