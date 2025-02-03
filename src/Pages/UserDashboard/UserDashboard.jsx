import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';
import Navbar from '../../Components/Navbar/Navbar';

const UserDashboard = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const navigate = useNavigate();
  const eventSource = useRef(null);

  // Function to send audio chunk to server
  const sendAudioChunk = async (chunk) => {
    const formData = new FormData();
    formData.append('audio_chunk', chunk);
    
    try {
      await fetch('http://localhost:5000/stream', {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('Error sending audio chunk:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      // Handle incoming audio chunks
      mediaRecorder.current.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          await sendAudioChunk(event.data);
        }
      };

      // Set up SSE connection for receiving transcriptions
      eventSource.current = new EventSource('http://localhost:5000/stream-transcription');
      eventSource.current.onmessage = (event) => {
        setTranscription(prev => prev + ' ' + event.data);
      };

      // Start recording
      mediaRecorder.current.start(1000);
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
      
      // Close SSE connection
      if (eventSource.current) {
        eventSource.current.close();
      }
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (eventSource.current) {
        eventSource.current.close();
      }
      if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
        mediaRecorder.current.stop();
        mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="user_dashboard-container">
      <div className="user_dashboard-header">
        <Navbar />
      </div>

      <div className="user_record-button-container">
        <button
          className={`user_record-button ${isRecording ? 'recording' : ''}`}
          onClick={startRecording}
          disabled={isRecording}
        >
          {isRecording ? 'Recording...' : 'Start Recording'}
        </button>
        <button
          className="user_stop-button"
          onClick={stopRecording}
          disabled={!isRecording}
        >
          Stop Recording
        </button>
      </div>

      <div className="user_transcription-container">
        <h3>Real-time Transcription:</h3>
        <p>{transcription}</p>
      </div>
    </div>
  );
};

export default UserDashboard;


// import { useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Notes from '../../Components/Notes/Notes'; // Import Notes component
// import './UserDashboard.css'; // Import the CSS file for dashboard styling
// import Navbar from '../../Components/Navbar/Navbar';

// const UserDashboard = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [isTranscribing, setIsTranscribing] = useState(false); // New state for transcribing status
//   const mediaRecorder = useRef(null);
//   const audioChunks = useRef([]);
//   const navigate = useNavigate();

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       mediaRecorder.current = new MediaRecorder(stream);
//       audioChunks.current = [];

//       mediaRecorder.current.ondataavailable = (event) => {
//         audioChunks.current.push(event.data);
//       };

//       mediaRecorder.current.onstop = async () => {
//         const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
//         const formData = new FormData();
//         formData.append('audio_data', audioBlob);

//         setIsTranscribing(true); // Set transcribing status to true

//         try {
//           const response = await fetch('http://localhost:5000/upload', {
//             method: 'POST',
//             body: formData,
//             timeout: 10000, // 10-second timeout
//           });

//           if (!response.ok) {
//             throw new Error('Failed to upload audio');
//           }

//           const data = await response.json();
//           // Navigate to transcript page with the transcription data
//           navigate('/transcript', { state: { transcription: data.transcription } });
//         } catch (error) {
//           console.error('Error uploading audio:', error);
//           alert('Failed to process audio. Please try again.');
//         } finally {
//           setIsTranscribing(false); // Reset transcribing status
//         }
//       };

//       mediaRecorder.current.start();
//       setIsRecording(true);
//     } catch (error) {
//       console.error('Error accessing microphone:', error);
//       alert('Failed to access microphone. Please check permissions.');
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
//       mediaRecorder.current.stop();
//       setIsRecording(false);
//       // Stop all audio tracks
//       mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       {/* Dashboard Header */}
//       <div className="dashboard-header">
//         <Navbar />
//       </div>

//       {/* Record Button */}
//       <div className="record-button-container">
//         <button
//           className="record-button"
//           onClick={startRecording}
//           disabled={isRecording || isTranscribing} // Disable while recording or transcribing
//         >
//           {isRecording ? 'Recording...' : 'Record Audio'}
//         </button>
//         <button
//           className="stop-button"
//           onClick={stopRecording}
//           disabled={!isRecording} // Disable if not recording
//         >
//           Stop Recording
//         </button>
//       </div>

//       {isRecording && (
//         <p className="mt-4 text-center text-red-500">Recording in progress...</p>
//       )}

//       {isTranscribing && (
//         <p className="mt-4 text-center text-blue-500">Transcribing...</p>
//       )}

//       {/* Notes Section */}
//       <Notes /> {/* Render the Notes component here */}
//     </div>
//   );
// };

// export default UserDashboard;

