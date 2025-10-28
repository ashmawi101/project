import axios from 'axios';

export const handleNextQuestion = async (job, interview, currentOrder, setMessages, navigate, token) => {
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
    console.log('Next question data:', data);  // Debugging log
    if (data.question_text) {
      setMessages(prevMessages => [
        ...prevMessages,
        { text: data.question_text, sender: 'system' }
      ]);
    } else {
      setMessages(prevMessages => [
        ...prevMessages,
        { text: 'Interview done', sender: 'system' }
      ]);
      speak('Interview done');
      setTimeout(() => navigate(`/interview-summary/${interview}`), 3000);
    }
  } catch (error) {
    console.error('Error fetching next interview question:', error);
  }
};

export const speak = (text, selectedVoice) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    window.speechSynthesis.speak(utterance);
  }
};
