import React, { useRef } from 'react';
import axios from 'axios';

const RecordingControls = ({ isRecording, setIsRecording, setMessages, handleNextQuestion, interview, questionId, token }) => {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = () => {
    setIsRecording(true);
    const audioConstraints = { audio: true, video: false };

    navigator.mediaDevices.getUserMedia(audioConstraints)
      .then(stream => {
        const options = { mimeType: 'audio/webm' }; // Ensure a correct MIME type
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = event => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Ensure the type matches
          audioChunksRef.current = []; // Clear chunks for next recording
          const audioUrl = URL.createObjectURL(audioBlob);
          setMessages(prevMessages => [...prevMessages, { text: audioUrl, sender: 'user', type: 'audio' }]);
          uploadAudio(audioBlob);
        };

        mediaRecorder.start();
        console.log("Recording started");
      })
      .catch(error => {
        console.error('Error accessing microphone: ', error);
        setIsRecording(false);
      });
  };

  const stopRecording = () => {
    console.log("Stopping recording");
    if (!mediaRecorderRef.current) {
      console.error("No media recorder found");
      return;
    }

    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const uploadAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append('recording', audioBlob);
    formData.append('interview', interview);
    formData.append('question_instance', questionId);

    try {
      const response = await axios.post('http://localhost:8000/api/audio/upload_audio/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        }
      });
      console.log('Upload response:', response.data);
      handleNextQuestion(); // Handle the next question only after receiving the backend response
    } catch (error) {
      console.error('There was an error uploading the file!', error);
    }
  };

  return (
    <>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </>
  );
};

export default RecordingControls;