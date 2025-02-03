import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import jsPDF from 'jspdf';
import './Transcript.css'; // Import the CSS file for dashboard styling
import Navbar from '../../Components/Navbar/Navbar';

const Transcript = () => {
  const location = useLocation();
  const transcription = location.state?.transcription || 'No transcription available';

  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to handle Summarize Button Click
  const handleSummarize = async () => {
    setLoading(true);
    setError('');
    setSummary('');

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

  // Function to generate, download, and upload PDF to the database
  const handleGeneratePDF = async () => {
    try {
      const doc = new jsPDF();
      doc.text('Summary:', 10, 10);
      doc.text(summary, 10, 20);

      // Automatically download the PDF
      const pdfFilename = 'summary.pdf';
      doc.save(pdfFilename);

      // Save the PDF to a Blob
      const pdfBlob = doc.output('blob');
      const formData = new FormData();

      // Append the PDF and metadata to the FormData
      formData.append('file', pdfBlob, pdfFilename);
      formData.append('transcription_id', '12345'); // Replace with actual transcription ID if available

      // Upload the PDF to the backend
      const response = await fetch('http://localhost:5000/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`PDF uploaded successfully! PDF ID: ${data.pdf_id}`);
      } else {
        console.error(`Failed to upload PDF: ${data.message}`);
      }
    } catch (error) {
      console.error('Error generating or uploading the PDF:', error.message);
    }
  };

  return (
    <div className="transcript-container">
      <div className="transcript-header">
        <Navbar />
      </div>

      <div className="transcription-content">
        <h3>Transcription:</h3>
        <p>{transcription}</p>

        <button
          className="summarize-button"
          onClick={handleSummarize}
          disabled={loading}
        >
          {loading ? 'Summarizing...' : 'Summarize'}
        </button>

        {summary && (
          <div className="summary-content">
            <h3>Summary:</h3>
            <p>{summary}</p>

            {/* Buttons for Generate PDF and Generate Image */}
            <div className="action-buttons">
              <button
                className="generate-pdf-button"
                onClick={handleGeneratePDF}
              >
                Generate PDF
              </button>
              <button
                className="generate-image-button"
                onClick={() => console.log('Generate Image functionality not implemented yet.')}
              >
                Generate Image
              </button>
            </div>
          </div>
        )}

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
