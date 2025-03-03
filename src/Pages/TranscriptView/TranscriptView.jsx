// TranscriptView,jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Navbar from '../../Components/Navbar/Navbar';
import './TranscriptView.css';

const TranscriptView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { transcriptionSegments } = location.state || { transcriptionSegments: [] };

  if (!transcriptionSegments || transcriptionSegments.length === 0) {
    return (
      <div className="transcript-view-container">
        <Navbar />
        <div className="transcript-view-error">
          <h2>No transcript data available</h2>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  const renderSegment = (segment, index) => {
    if (segment.type === 'code') {
      // Extract code content if it's wrapped in HTML
      const codeContent = segment.content.includes('<pre>') 
        ? segment.content.replace(/<[^>]*>/g, '') 
        : segment.content;
        
      return (
        <div key={index} className="code-block">
          <div className="code-header">
            <span className="code-title">Python Code</span>
            <button 
              className="copy-button"
              onClick={() => {
                navigator.clipboard.writeText(codeContent);
                alert('Code copied to clipboard!');
              }}
            >
              Copy
            </button>
          </div>
          <SyntaxHighlighter language="python" style={darcula}>
            {codeContent}
          </SyntaxHighlighter>
        </div>
      );
    } else {
      // Theory content
      return (
        <div key={index} className="theory-block">
          <p>{segment.content}</p>
        </div>
      );
    }
  };

  return (
    <div className="transcript-view-container">
      <Navbar />
      <div className="transcript-view-header">
        <h1>Lecture Transcript</h1>
        <div className="transcript-view-actions">
          <button onClick={() => navigate(-1)}>Go Back</button>
          <button 
            onClick={() => {
              const fullText = transcriptionSegments
                .map(segment => segment.content)
                .join('\n\n');
              navigator.clipboard.writeText(fullText);
              alert('Full transcript copied to clipboard!');
            }}
          >
            Copy All
          </button>
          <button
            onClick={() => {
              const element = document.createElement("a");
              const file = new Blob(
                [transcriptionSegments.map(s => s.content).join('\n\n')], 
                { type: 'text/plain' }
              );
              element.href = URL.createObjectURL(file);
              element.download = "transcript.txt";
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
          >
            Download
          </button>
        </div>
      </div>
      
      <div className="transcript-view-content">
        {transcriptionSegments.map((segment, index) => renderSegment(segment, index))}
      </div>
    </div>
  );
};

export default TranscriptView;