import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import './Transcript.css'; // Import the CSS file for dashboard styling
import Navbar from '../../Components/Navbar/Navbar';

const Transcript = () => {
  const location = useLocation();
  const transcription = location.state?.transcription || 'No transcription available';

  // State to store the generated summary
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to handle Summarize Button Click
  const handleSummarize = async () => {
    setLoading(true);
    setError('');
    setSummary(''); // Clear previous summary

    try {
      const response = await fetch('http://localhost:5000/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcription }),
      });
      

      const data = await response.json();

      if (response.ok) {
        setSummary(data.summary.join('\n'));
      } else {
        setError(data.error || 'Failed to generate summary');
      }
    } catch (err) {
      setError('Error: Unable to connect to the backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transcript-container">
      <div className="transcript-header">
        <Navbar />
      </div>

      {/* Transcription Display */}
      <div className="transcription-content">
        <h3>Transcription:</h3>
        <p>{transcription}</p>

        {/* Summarize Button */}
        <button
          className="summarize-button"
          onClick={handleSummarize}
          disabled={loading} // Disable button when loading
        >
          {loading ? 'Summarizing...' : 'Summarize'}
        </button>

        {/* Display Generated Summary */}
        {summary && (
          <div className="summary-content">
            <h3>Summary:</h3>
            <p>{summary}</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transcript;