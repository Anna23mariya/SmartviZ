import React, { useState, useEffect, useRef } from 'react';
import './NotesGenerator.css';
import Navbar from "../../Components/Navbar/Navbar";

const NotesGenerator = () => {
  const [inputText, setInputText] = useState('');
  const [generatedNotes, setGeneratedNotes] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const outputRef = useRef(null);

  // Automatically adjust the textarea height
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.style.height = 'auto';
      outputRef.current.style.height = `${outputRef.current.scrollHeight}px`;
    }
  }, [generatedNotes]);

  const cleanMarkdownFormatting = (text) => {
    return text
      .replace(/[*_#]{1,3}/g, '') // Remove *, _, # 
      .replace(/^\s*[-+]\s/gm, '• ') // Convert list markers to bullets
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
      .trim();
  };

  const handleGenerateNotes = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text first');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/generate-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();
      if (response.ok) {
        setGeneratedNotes(cleanMarkdownFormatting(data.notes));
      } else {
        setError(data.error || 'Failed to generate notes');
      }
    } catch {
      setError('Failed to connect to server. Please ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadNotes = () => {
    if (!generatedNotes) return;
    
    const blob = new Blob([generatedNotes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    
    link.href = url;
    link.download = `notes_${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div><Navbar />
    <div className="notes-container">
      
      <header className="notes-header">
        <h1>Classroom Notes Generator</h1>
        <p>Convert classroom discussions into structured academic notes</p>
      </header>

      <main className="notes-main">
        <section className="input-section">
          <h2>Input Text</h2>
          <textarea
            className="input-textarea"
            placeholder="Paste your classroom conversation here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={10}
          />
        </section>

        <div className="controls">
          <button
            className="generate-button"
            onClick={handleGenerateNotes}
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? 'Generating...' : 'Generate Notes'}
          </button>

          <button
            className="download-buttons"
            onClick={handleDownloadNotes}
            disabled={!generatedNotes}
          >
            Download Notes
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <section className="output-section">
          <h2>Generated Notes</h2>
          <textarea
            ref={outputRef}
            className="output-textarea"
            value={generatedNotes}
            readOnly
            placeholder="Generated notes will appear here..."
            rows={1} // Minimum height, will expand dynamically
          />
        </section>
      </main>
    </div>
    </div>
  );
};

export default NotesGenerator;


// import React, { useState, useEffect, useRef } from 'react';
// import './NotesGenerator.css';
// import Navbar from "../../Components/Navbar/Navbar";

// const NotesGenerator = () => {
//   const [inputText, setInputText] = useState('');
//   const [generatedNotes, setGeneratedNotes] = useState('');
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const outputRef = useRef(null);

//   // Automatically adjust the textarea height
//   useEffect(() => {
//     if (outputRef.current) {
//       outputRef.current.style.height = 'auto';
//       outputRef.current.style.height = `${outputRef.current.scrollHeight}px`;
//     }
//   }, [generatedNotes]);

//   const cleanMarkdownFormatting = (text) => {
//     return text
//       .replace(/[*_#]{1,3}/g, '') // Remove *, _, # 
//       .replace(/^\s*[-+]\s/gm, '• ') // Convert list markers to bullets
//       .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
//       .trim();
//   };

//   const handleGenerateNotes = async () => {
//     if (!inputText.trim()) {
//       setError('Please enter some text first');
//       return;
//     }

//     setError('');
//     setIsLoading(true);

//     try {
//       const response = await fetch('http://localhost:5000/generate-notes', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ text: inputText }),
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setGeneratedNotes(cleanMarkdownFormatting(data.notes));
//       } else {
//         setError(data.error || 'Failed to generate notes');
//       }
//     } catch {
//       setError('Failed to connect to server. Please ensure the backend is running.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDownloadNotes = () => {
//     if (!generatedNotes) return;
    
//     const blob = new Blob([generatedNotes], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     const timestamp = new Date().toISOString().split('T')[0];
    
//     link.href = url;
//     link.download = `notes_${timestamp}.txt`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="notes-container">
//       <Navbar />
//       <header className="notes-header">
//         <h1>Classroom Notes Generator</h1>
//         <p>Convert classroom discussions into structured academic notes</p>
//       </header>

//       <main className="notes-main">
//         <section className="input-section">
//           <h2>Input Text</h2>
//           <textarea
//             className="input-textarea"
//             placeholder="Paste your classroom conversation here..."
//             value={inputText}
//             onChange={(e) => setInputText(e.target.value)}
//             rows={10}
//           />
//         </section>

//         <div className="controls">
//           <button
//             className="generate-button"
//             onClick={handleGenerateNotes}
//             disabled={isLoading || !inputText.trim()}
//           >
//             {isLoading ? 'Generating...' : 'Generate Notes'}
//           </button>

//           <button
//             className="download-button"
//             onClick={handleDownloadNotes}
//             disabled={!generatedNotes}
//           >
//             Download Notes
//           </button>
//         </div>

//         {error && <div className="error-message">{error}</div>}

//         <section className="output-section">
//           <h2>Generated Notes</h2>
//           <textarea
//             ref={outputRef}
//             className="output-textarea"
//             value={generatedNotes}
//             readOnly
//             placeholder="Generated notes will appear here..."
//             rows={1} // Minimum height, will expand dynamically
//           />
//         </section>
//       </main>
//     </div>
//   );
// };

// export default NotesGenerator;
