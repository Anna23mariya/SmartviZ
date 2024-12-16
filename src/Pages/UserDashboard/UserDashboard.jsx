import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Notes from '../../Components/Notes/Notes'; // Import Notes component
import './UserDashboard.css'; // Import the CSS file for dashboard styling
import Navbar from '../../Components/Navbar/Navbar';

const UserDashboard = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const navigate = useNavigate();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio_data', audioBlob);

        try {
          const response = await fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: formData,
            timeout: 10000  // 10-second timeout
          });

          if (!response.ok) {
            throw new Error('Failed to upload audio');
          }

          const data = await response.json();
          // Navigate to transcript page with the transcription data
          navigate('/transcript', { state: { transcription: data.transcription } });
        } catch (error) {
          console.error('Error uploading audio:', error);
          alert('Failed to process audio. Please try again.');
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
      // Stop all audio tracks
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="dashboard-container">
            {/* Dashboard Header */}
            <div className="dashboard-header">
                <Navbar />
            </div>

            {/* Record Button */}
            <div className="record-button-container">
                <button
                    className="record-button"
                    onClick={startRecording}
                    disabled={isRecording}  // Disable if already recording
                >
                    {isRecording ? "Recording..." : "Record Audio"}  {/* Change button text based on isRecording state */}
                </button>
                <button
                    className="stop-button"
                    onClick={stopRecording}
                    disabled={!isRecording}  // Disable if not recording
                >
                    Stop Recording
                </button>
            </div>
        {isRecording && (
          <p className="mt-4 text-center text-red-500">Recording in progress...</p>
        )}

        

            {/* Notes Section */}
            <Notes /> {/* Render the Notes component here */}
        </div>
      
  );
};

export default UserDashboard;











