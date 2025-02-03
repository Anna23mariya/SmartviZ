import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Programming.css'; // Import the CSS file for styling
import Navbar from '../../Components/Navbar/Navbar';

const Programming = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const navigate = useNavigate();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = async (event) => {
        const audioBlob = new Blob([event.data], { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio_data', audioBlob);

        // Send audio chunk to server for transcription
        try {
          const response = await fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            setSpokenText((prev) => prev + ' ' + data.transcription); // Append live transcription
          } else {
            console.error('Error uploading audio chunk:', response.statusText);
          }
        } catch (error) {
          console.error('Error transcribing audio chunk:', error);
        }
      };

      mediaRecorder.current.start(1000); // Trigger `ondataavailable` every second
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);

      // Optional: Navigate to another page with the full transcription
      navigate('/transcript', { state: { transcription: spokenText } });
    }
  };

  return (
    <div className="programming-container">
      <Navbar /> {/* Navbar component */}

      <div className="programming-recording-section">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className="programming-record-button"
        >
          {isRecording ? 'Recording...' : 'Start Recording'}
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className="programming-stop-button"
        >
          Stop Recording
        </button>

        {isRecording && <p className="programming-status-text red">Recording...</p>}
        <p className="programming-status-text green">
          Live Transcription: {spokenText}
        </p>
      </div>
    </div>
  );
};

export default Programming;
