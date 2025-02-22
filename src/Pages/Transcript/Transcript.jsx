import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import './Transcript.css';
import Navbar from '../../Components/Navbar/Navbar';

const Transcript = () => {
  const location = useLocation();
  const transcription = location.state?.transcription || 'No transcription available';
  const transcriptionId = location.state?.transcriptionId;
  const userId = location.state?.userId;
  
  const [summary, setSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storeTranscription = async () => {
      if (transcription && transcription !== 'No transcription available') {
        try {
          const userEmail = localStorage.getItem('userEmail');

          const response = await fetch('http://localhost:5000/store-transcription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              transcription: transcription,
              filename: `transcript_${new Date().toISOString()}`,
              email: userEmail
            }),
          });

          if (!response.ok) {
            console.error('Failed to store transcription');
          }
        } catch (error) {
          console.error('Error storing transcription:', error);
        }
      }
    };

    if (!transcriptionId) {
      storeTranscription();
    }
  }, [transcription, transcriptionId, userId]);

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

  const handleGenerateNotes = async () => {
    setNotesLoading(true);
    setError('');
    setNotes('');
    try {
      const response = await fetch('http://localhost:5000/generate-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcription }),
      });
      const data = await response.json();
      if (response.ok) {
        setNotes(data.notes);
      } else {
        setError(data.error || 'Failed to generate notes');
      }
    } catch (err) {
      setError('Error: Unable to connect to the backend.');
    } finally {
      setNotesLoading(false);
    }
  };

  const handleGeneratePDF = async (content, type = 'summary') => {
    try {
      const doc = new jsPDF();
      doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)}:`, 10, 10);
      doc.text(content, 10, 20);
      
      const pdfFilename = `${type}.pdf`;
      doc.save(pdfFilename);
      
      const pdfBlob = doc.output('blob');
      const formData = new FormData();
      formData.append('file', pdfBlob, pdfFilename);
      formData.append('transcription_id', transcriptionId || '');
      formData.append('type', type);

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
        <div className="action-buttons">
          <button
            className="summarize-button"
            onClick={handleSummarize}
            disabled={loading}
          >
            {loading ? 'Summarizing...' : 'Summarize'}
          </button>
          <button
            className="generate-notes-button"
            onClick={handleGenerateNotes}
            disabled={notesLoading}
          >
            {notesLoading ? 'Generating Notes...' : 'Generate Notes'}
          </button>
        </div>
        {summary && (
          <div className="summary-content">
            <h3>Summary:</h3>
            <p>{summary}</p>
            <div className="action-buttons">
              <button
                className="generate-pdf-button"
                onClick={() => handleGeneratePDF(summary, 'summary')}
              >
                Generate Summary PDF
              </button>
            </div>
          </div>
        )}
        {notes && (
          <div className="notes-content">
            <h3>Notes:</h3>
            <p>{notes}</p>
            <div className="action-buttons">
              <button
                className="generate-pdf-button"
                onClick={() => handleGeneratePDF(notes, 'notes')}
              >
                Generate Notes PDF
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

// import { useLocation } from 'react-router-dom';
// import { useState, useEffect } from 'react';
// import jsPDF from 'jspdf';
// import './Transcript.css';
// import Navbar from '../../Components/Navbar/Navbar';

// const Transcript = () => {
//   const location = useLocation();
//   const transcription = location.state?.transcription || 'No transcription available';
//   const transcriptionId = location.state?.transcriptionId; // Get transcriptionId from state
//   const userId = location.state?.userId; // Get userId from state
  
//   const [summary, setSummary] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // Store transcription when component mounts
//   useEffect(() => {
//     const storeTranscription = async () => {
//       if (transcription && transcription !== 'No transcription available') {
//         try {

//           const userEmail = localStorage.getItem('userEmail');

//           const response = await fetch('http://localhost:5000/store-transcription', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//               transcription: transcription,
//               filename: `transcript_${new Date().toISOString()}`,
//               email: userEmail // Include user ID
//             }),
//           });

//           if (!response.ok) {
//             console.error('Failed to store transcription');
//           }
//         } catch (error) {
//           console.error('Error storing transcription:', error);
//         }
//       }
//     };

//     // Only store if we don't have a transcriptionId (prevents duplicate storage)
//     if (!transcriptionId) {
//       storeTranscription();
//     }
//   }, [transcription, transcriptionId, userId]);

//   const handleSummarize = async () => {
//     setLoading(true);
//     setError('');
//     setSummary('');
//     try {
//       const response = await fetch('http://localhost:5000/summarize', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ text: transcription }),
//       });
//       const data = await response.json();
//       if (response.ok) {
//         setSummary(data.summary.join('\n'));
//       } else {
//         setError(data.error || 'Failed to generate summary');
//       }
//     } catch (err) {
//       setError('Error: Unable to connect to the backend.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGeneratePDF = async () => {
//     try {
//       const doc = new jsPDF();
//       doc.text('Summary:', 10, 10);
//       doc.text(summary, 10, 20);
      
//       const pdfFilename = 'summary.pdf';
//       doc.save(pdfFilename);
      
//       const pdfBlob = doc.output('blob');
//       const formData = new FormData();
//       formData.append('file', pdfBlob, pdfFilename);
//       formData.append('transcription_id', transcriptionId || ''); // Use stored transcriptionId

//       const response = await fetch('http://localhost:5000/upload-pdf', {
//         method: 'POST',
//         body: formData,
//       });
      
//       const data = await response.json();
//       if (response.ok) {
//         console.log(`PDF uploaded successfully! PDF ID: ${data.pdf_id}`);
//       } else {
//         console.error(`Failed to upload PDF: ${data.message}`);
//       }
//     } catch (error) {
//       console.error('Error generating or uploading the PDF:', error.message);
//     }
//   };

//   // Rest of the component remains the same...
//   return (
//     <div className="transcript-container">
//       <div className="transcript-header">
//         <Navbar />
//       </div>
//       <div className="transcription-content">
//         <h3>Transcription:</h3>
//         <p>{transcription}</p>
//         <button
//           className="summarize-button"
//           onClick={handleSummarize}
//           disabled={loading}
//         >
//           {loading ? 'Summarizing...' : 'Summarize'}
//         </button>
//         {summary && (
//           <div className="summary-content">
//             <h3>Summary:</h3>
//             <p>{summary}</p>
//             <div className="action-buttons">
//               <button
//                 className="generate-pdf-button"
//                 onClick={handleGeneratePDF}
//               >
//                 Generate PDF
//               </button>
//               <button
//                 className="generate-image-button"
//                 onClick={() => console.log('Generate Image functionality not implemented yet.')}
//               >
//                 Generate Image
//               </button>
//             </div>
//           </div>
//         )}
//         {error && (
//           <div className="error-message">
//             <p>{error}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Transcript;
