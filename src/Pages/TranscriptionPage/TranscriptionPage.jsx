import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TranscriptionPage.css';
import Navbar from "../../Components/Navbar/Navbar";

const TranscriptionPage = ({ transcription }) => {
  const [outputs, setOutputs] = useState({});
  const transcriptionBoxRef = useRef(null);
  const notesBoxRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [generatedNotes, setGeneratedNotes] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState(null);
  const [originalCodeItems, setOriginalCodeItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [availableCommunities, setAvailableCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState('');

  const transData = location.state?.transcription || transcription;
  const userEmail = location.state?.userEmail || 'user@example.com'; // Replace with actual auth
  const communityName = location.state?.communityName || 'Default Community'; // Replace with actual community

  const deduplicatedTransData = useMemo(() => {
    if (!transData || !Array.isArray(transData)) return [];
    const seen = new Set();
    return transData.filter(item => {
      if (item.type === "code") return true;
      if (item.type === "theory" && item.content) {
        const duplicate = seen.has(item.content);
        seen.add(item.content);
        return !duplicate;
      }
      return true;
    });
  }, [transData]);

  useEffect(() => {
    if (transcriptionBoxRef.current) {
      transcriptionBoxRef.current.scrollTop = transcriptionBoxRef.current.scrollHeight;
    }
  }, [deduplicatedTransData]);

  useEffect(() => {
    if (notesBoxRef.current && generatedNotes) {
      notesBoxRef.current.scrollTop = notesBoxRef.current.scrollHeight;
    }
  }, [generatedNotes]);

  // Fetch user communities on mount
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/user-communities?userEmail=${userEmail}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log('Fetched communities data:', data);
        if (data.status === 'success' && data.communities) {
          setAvailableCommunities(data.communities.map(c => c.name));
          // Set default community if available
          const defaultCommunity = data.communities.find(c => c.name === communityName) || data.communities[0];
          setSelectedCommunity(defaultCommunity?.name || '');
        } else {
          setAvailableCommunities([]);
          console.warn('No communities found or invalid response:', data);
        }
      } catch (err) {
        console.error('Error fetching communities:', err);
        setError('Failed to load available communities. Ensure the backend is running.');
        setAvailableCommunities([]);
      }
    };
    fetchCommunities();
  }, [userEmail, communityName]);

  const cleanMarkdownFormatting = (text) => {
    const codeBlockRegex = /```python[\s\S]*?```/g;
    const codeBlocks = [];
    let protectedText = text.replace(codeBlockRegex, (match) => {
      codeBlocks.push(match);
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });
    protectedText = protectedText
      .replace(/[*_#]{1,3}(?![\w\s]*```)/g, '')
      .replace(/^\s*[-+]\s/gm, '• ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return protectedText.replace(/__CODE_BLOCK_(\d+)__/g, (_, index) => {
      return codeBlocks[parseInt(index)];
    });
  };

  const handleBack = () => {
    if (generatedNotes) {
      const firstLine = generatedNotes.split('\n').find(line => line.trim().length > 0);
      const mainHeading = firstLine
        ? firstLine.replace(/^#+\s*/, '').trim()
        : 'New Note';
      navigate('/community-head', {
        state: {
          generatedNotes,
          mainHeading,
          selectedChapter: location.state?.selectedChapter
        }
      });
    } else {
      navigate('/community-head');
    }
  };

  const getCombinedTranscription = () => {
    if (!deduplicatedTransData || deduplicatedTransData.length === 0) return '';
    return deduplicatedTransData
      .map(item => item.type === "code" ? item.plain_code : item.content)
      .join('\n\n');
  };

  const handleGenerateNotes = async () => {
    const transcriptionText = getCombinedTranscription();
    if (!transcriptionText.trim()) {
      setError('No transcription content available');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const codeItems = deduplicatedTransData
        .filter(item => item.type === "code" && item.plain_code)
        .map(item => ({
          plain_code: item.plain_code,
          html_content: item.content
        }));
      const codeBlocks = codeItems.map(item => item.plain_code).filter(code => typeof code === 'string' && code.trim().length > 0);
      const payload = {
        text: transcriptionText,
        chapter: location.state?.selectedChapter?.title || "General Notes",
        codeBlocks: codeBlocks.length > 0 ? codeBlocks : []
      };
      const response = await fetch('http://localhost:5000/generate-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate notes');
      }
      const data = await response.json();
      setOriginalCodeItems(codeItems);
      setGeneratedNotes(data.notes);
      setEditedNotes(data.notes);
    } catch (err) {
      console.error("Error in handleGenerateNotes:", err);
      setError(err.message || 'Failed to connect to server. Please ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadNotes = () => {
    if (!editedNotes) return;
    const blob = new Blob([editedNotes], { type: 'text/plain' });
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

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleNotesChange = (e) => {
    setEditedNotes(e.target.value);
  };

  const handleSaveEdit = () => {
    setGeneratedNotes(editedNotes);
    setIsEditing(false);
  };

  const handleSaveNote = async () => {
    console.log('handleSaveNote called');
    if (!generatedNotes) {
      console.log('No generated notes to save');
      setError('No generated notes to save');
      return;
    }
    console.log('Available communities:', availableCommunities);
    console.log('Selected community:', selectedCommunity);
    if (!availableCommunities.includes(selectedCommunity)) {
      console.log('Community not found in available communities');
      setError(`Community "${selectedCommunity}" not found. Please join or create a community.`);
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      console.log('Preparing payload');
      const firstLine = generatedNotes.split('\n').find(line => line.trim().length > 0);
      const noteTitle = firstLine
        ? firstLine.replace(/^#+\s*/, '').trim()
        : 'Untitled Note';
      const codeBlocks = deduplicatedTransData
        .filter(item => item.type === "code" && item.plain_code)
        .map(item => item.plain_code);
      const payload = {
        user_email: userEmail,
        community_name: selectedCommunity,
        note_title: noteTitle,
        note_body: generatedNotes,
        code_blocks: codeBlocks,
        chapter: location.state?.selectedChapter?.title || 'General Notes'
      };
      console.log('Sending payload:', payload);
      const response = await fetch('http://localhost:5000/save-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error data:', errorData);
        throw new Error(errorData.error || 'Failed to save note');
      }
      const data = await response.json();
      console.log('Note saved successfully:', data);
      setError(''); // Clear any previous errors
      alert('Note saved successfully!');
    } catch (err) {
      console.error('Error saving note:', err);
      setError(err.message || 'Failed to save note to database.');
    } finally {
      setIsSaving(false);
    }
  };

  const onExecuteCode = async (index, plainCode) => {
    console.log("Executing code at index", index, "with plainCode:", plainCode);
    let codeToExecute = plainCode;
    if (!codeToExecute || typeof codeToExecute !== 'string') {
      const item = deduplicatedTransData[index];
      if (item && item.type === "code" && item.content) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = item.content;
        codeToExecute = tempDiv.textContent.trim() || '';
      }
    }
    if (!codeToExecute || typeof codeToExecute !== 'string') {
      setOutputs(prev => ({
        ...prev,
        [index]: `Error: No code provided for execution (received: ${codeToExecute})`
      }));
      return;
    }
    codeToExecute = codeToExecute.trim();
    if (!codeToExecute) {
      setOutputs(prev => ({
        ...prev,
        [index]: "Error: Empty code cannot be executed"
      }));
      return;
    }
    try {
      setIsExecuting(true);
      const response = await fetch('http://localhost:5000/programming/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          code: codeToExecute,
          language: 'python'
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Execution failed');
      }
      const result = await response.json();
      setOutputs(prev => ({
        ...prev,
        [index]: result.output || "No output produced"
      }));
    } catch (error) {
      console.error('Execution error:', error);
      setOutputs(prev => ({
        ...prev,
        [index]: `Error: ${error.message || 'Failed to execute code'}`
      }));
    } finally {
      setIsExecuting(false);
    }
  };

  const renderGeneratedNotes = () => {
    if (!generatedNotes) return null;
    const elements = [];
    let currentPos = 0;
    const codeBlockRegex = /CODE_BLOCK_(\d+)/g;
    let match;
    while ((match = codeBlockRegex.exec(generatedNotes)) !== null) {
      const index = parseInt(match[1]);
      if (match.index > currentPos) {
        const textBlock = generatedNotes.substring(currentPos, match.index).replace(/\n/g, '<br/>');
        elements.push(
          <div key={`text-${currentPos}`} className="notes-text" dangerouslySetInnerHTML={{ __html: textBlock }} />
        );
      }
      const originalItem = deduplicatedTransData.find(
        (item, idx) => item.type === "code" && idx === index
      );
      if (originalItem) {
        elements.push(
          <div key={`code-${index}`} className="code-box-container">
            <div className="code-header">
              <button
                className="execute-bt"
                onClick={() => onExecuteCode(index, originalItem.plain_code || '')}
                disabled={!originalItem.plain_code || isExecuting}
              >
                {isExecuting ? 'Executing...' : 'Execute'}
              </button>
            </div>
            <pre className="code-box">
              <code dangerouslySetInnerHTML={{ __html: originalItem.content }} />
            </pre>
            {outputs[index] && (
              <div className="output-box">
                <strong>Output:</strong>
                <pre>{outputs[index]}</pre>
              </div>
            )}
          </div>
        );
      } else {
        elements.push(
          <p key={`missing-${index}`} className="notes-text">Code block {index} not found.</p>
        );
      }
      currentPos = match.index + match[0].length;
    }
    if (currentPos < generatedNotes.length) {
      const textBlock = generatedNotes.substring(currentPos).replace(/\n/g, '<br/>');
      elements.push(
        <div key={`text-end`} className="notes-text" dangerouslySetInnerHTML={{ __html: textBlock }} />
      );
    }
    return elements;
  };

  return (
    <div>
      <Navbar />
      <div className="transcription-page-container">
        <div className="transcription-header">
          <h2>Transcribed Content</h2>
          <div className="button-group">
            <button
              className="transcription_gen_note"
              onClick={handleGenerateNotes}
              disabled={isLoading || !deduplicatedTransData?.length}
            >
              {isLoading ? 'Generating...' : 'Generate Notes'}
            </button>
            <button
              className="download-button"
              onClick={handleDownloadNotes}
              disabled={!generatedNotes}
            >
              Download Notes
            </button>
            <button className="back-btn" onClick={handleBack}>
              Back
            </button>
          </div>
        </div>
        <div className="transcription-content-box" ref={transcriptionBoxRef}>
          {deduplicatedTransData.length === 0 ? (
            <p className="empty-state">No transcriptions yet.</p>
          ) : (
            deduplicatedTransData.map((item, index) => (
              <div key={index} className="transcription-flow">
                {item.type === "code" ? (
                  <div className="code-box-container">
                    <div className="code-header">
                      <button
                        className="execute-bt"
                        onClick={() => onExecuteCode(index, item.plain_code || '')}
                        disabled={isExecuting}
                      >
                        {isExecuting ? 'Executing...' : 'Execute'}
                      </button>
                    </div>
                    <pre className="code-box">
                      <code dangerouslySetInnerHTML={{ __html: item.content }} />
                    </pre>
                    {outputs[index] && (
                      <div className="output-box">
                        <strong>Output:</strong>
                        <pre>{outputs[index]}</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="theory-text">{item.content}</p>
                )}
              </div>
            ))
          )}
        </div>
        {generatedNotes && (
          <div className="notes-section">
            <div className="notes-header">
              <h3>{selectedChapter ? `Notes for ${selectedChapter.title}` : 'Generated Notes'}</h3>
              <div className="notes-button-group">
                <select
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                  className="community-select"
                  disabled={isSaving || !availableCommunities.length}
                >
                  <option value="" disabled>Select Community</option>
                  {availableCommunities.map((community) => (
                    <option key={community} value={community}>
                      {community}
                    </option>
                  ))}
                </select>
                <button className="edit-button" onClick={handleEditToggle}>
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
                <button
                  className="save-note-button"
                  onClick={handleSaveNote}
                  disabled={isSaving || !generatedNotes || !selectedCommunity}
                >
                  {isSaving ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </div>
            <div className="notes-content-box" ref={notesBoxRef}>
              {isEditing ? (
                <>
                  <textarea
                    className="notes-textarea"
                    value={editedNotes}
                    onChange={handleNotesChange}
                  />
                  <button className="save-button" onClick={handleSaveEdit}>
                    Save
                  </button>
                </>
              ) : (
                renderGeneratedNotes()
              )}
            </div>
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
        {executionError && <div className="error-message">Execution Error: {executionError}</div>}
      </div>
    </div>
  );
};

export default TranscriptionPage;

// import React, { useState, useRef, useEffect, useMemo } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import './TranscriptionPage.css';
// import Navbar from "../../Components/Navbar/Navbar";

// const TranscriptionPage = ({ transcription }) => {
//   const [outputs, setOutputs] = useState({});
//   const transcriptionBoxRef = useRef(null);
//   const notesBoxRef = useRef(null);
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [generatedNotes, setGeneratedNotes] = useState('');
//   const [editedNotes, setEditedNotes] = useState('');
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [selectedChapter, setSelectedChapter] = useState(null);
//   const [isExecuting, setIsExecuting] = useState(false);
//   const [executionError, setExecutionError] = useState(null);
//   const [originalCodeItems, setOriginalCodeItems] = useState([]);

//   const transData = location.state?.transcription || transcription;

//   const deduplicatedTransData = useMemo(() => {
//     if (!transData || !Array.isArray(transData)) return [];
//     const seen = new Set();
//     return transData.filter(item => {
//       if (item.type === "code") return true; // Keep all code items
//       if (item.type === "theory" && item.content) {
//         const duplicate = seen.has(item.content);
//         seen.add(item.content);
//         return !duplicate;
//       }
//       return true; // Keep unknown types or items without content
//     });
//   }, [transData]);

//   useEffect(() => {
//     if (transcriptionBoxRef.current) {
//       transcriptionBoxRef.current.scrollTop = transcriptionBoxRef.current.scrollHeight;
//     }
//   }, [deduplicatedTransData]);

//   useEffect(() => {
//     if (notesBoxRef.current && generatedNotes) {
//       notesBoxRef.current.scrollTop = notesBoxRef.current.scrollHeight;
//     }
//   }, [generatedNotes]);

//   const cleanMarkdownFormatting = (text) => {
//     // First, protect all code blocks
//     const codeBlockRegex = /```python[\s\S]*?```/g;
//     const codeBlocks = [];
//     let protectedText = text.replace(codeBlockRegex, (match) => {
//       codeBlocks.push(match);
//       return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
//     });
  
//     // Process the non-code text
//     protectedText = protectedText
//       .replace(/[*_#]{1,3}(?![\w\s]*```)/g, '') // Remove markdown formatting that's not in code blocks
//       .replace(/^\s*[-+]\s/gm, '• ') // Convert list items to bullet points
//       .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
//       .trim();
  
//     // Restore the code blocks
//     return protectedText.replace(/__CODE_BLOCK_(\d+)__/g, (_, index) => {
//       return codeBlocks[parseInt(index)];
//     });
//   };

//   const handleBack = () => {
//     if (generatedNotes) {
//       const firstLine = generatedNotes.split('\n').find(line => line.trim().length > 0);
//       const mainHeading = firstLine 
//         ? firstLine.replace(/^#+\s*/, '').trim() 
//         : 'New Note';
        
//       navigate('/community-head', { 
//         state: { 
//           generatedNotes,
//           mainHeading,
//           selectedChapter: location.state?.selectedChapter 
//         }
//       });
//     } else {
//       navigate('/community-head');
//     }
//   };

//   const getCombinedTranscription = () => {
//     if (!deduplicatedTransData || deduplicatedTransData.length === 0) return '';
//     return deduplicatedTransData
//       .map(item => item.type === "code" ? item.plain_code : item.content)
//       .join('\n\n');
//   };

//   const handleGenerateNotes = async () => {
//     const transcriptionText = getCombinedTranscription();
    
//     if (!transcriptionText.trim()) {
//       setError('No transcription content available');
//       return;
//     }
  
//     setError('');
//     setIsLoading(true);
  
//     try {
//       // Extract all code blocks with their full context
//       const codeItems = deduplicatedTransData
//         .filter(item => item.type === "code" && item.plain_code)
//         .map(item => ({
//           plain_code: item.plain_code,
//           html_content: item.content
//         }));
  
//       // Only include valid code blocks as strings
//       const codeBlocks = codeItems.map(item => item.plain_code).filter(code => typeof code === 'string' && code.trim().length > 0);
  
//       console.log("deduplicatedTransData:", deduplicatedTransData);
//       console.log("codeItems:", codeItems);
//       console.log("codeBlocks:", codeBlocks);
//       console.log("transcriptionText:", transcriptionText);
  
//       const payload = { 
//         text: transcriptionText,
//         chapter: location.state?.selectedChapter?.title || "General Notes",
//         codeBlocks: codeBlocks.length > 0 ? codeBlocks : []
//       };
  
//       console.log("Sending payload:", payload);
  
//       const response = await fetch('http://localhost:5000/generate-notes', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json();
//         console.error("Server error response:", errorData);
//         throw new Error(errorData.error || 'Failed to generate notes');
//       }
  
//       const data = await response.json();
//       console.log("Received response:", data);
      
//       setOriginalCodeItems(codeItems);
//       setGeneratedNotes(data.notes);
//       setEditedNotes(data.notes);
//     } catch (err) {
//       console.error("Error in handleGenerateNotes:", err);
//       setError(err.message || 'Failed to connect to server. Please ensure the backend is running.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDownloadNotes = () => {
//     if (!editedNotes) return;
    
//     const blob = new Blob([editedNotes], { type: 'text/plain' });
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

//   const handleEditToggle = () => {
//     setIsEditing(!isEditing);
//   };

//   const handleNotesChange = (e) => {
//     setEditedNotes(e.target.value);
//   };

//   const handleSaveEdit = () => {
//     setGeneratedNotes(editedNotes);
//     setIsEditing(false);
//   };

//   const onExecuteCode = async (index, plainCode) => {
//     console.log("Executing code at index", index, "with plainCode:", plainCode);
//     let codeToExecute = plainCode;

//     if (!codeToExecute || typeof codeToExecute !== 'string') {
//       const item = deduplicatedTransData[index];
//       if (item && item.type === "code" && item.content) {
//         const tempDiv = document.createElement('div');
//         tempDiv.innerHTML = item.content;
//         codeToExecute = tempDiv.textContent.trim() || '';
//       }
//     }

//     if (!codeToExecute || typeof codeToExecute !== 'string') {
//       setOutputs(prev => ({
//         ...prev,
//         [index]: `Error: No code provided for execution (received: ${codeToExecute})`
//       }));
//       return;
//     }

//     codeToExecute = codeToExecute.trim();
//     if (!codeToExecute) {
//       setOutputs(prev => ({
//         ...prev,
//         [index]: "Error: Empty code cannot be executed"
//       }));
//       return;
//     }

//     try {
//       setIsExecuting(true);
//       const response = await fetch('http://localhost:5000/programming/execute', {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         },
//         body: JSON.stringify({ 
//           code: codeToExecute,
//           language: 'python'
//         }),
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Execution failed');
//       }
//       const result = await response.json();
//       setOutputs(prev => ({
//         ...prev,
//         [index]: result.output || "No output produced"
//       }));
//     } catch (error) {
//       console.error('Execution error:', error);
//       setOutputs(prev => ({
//         ...prev,
//         [index]: `Error: ${error.message || 'Failed to execute code'}`
//       }));
//     } finally {
//       setIsExecuting(false);
//     }
//   };

//   const renderGeneratedNotes = () => {
//     if (!generatedNotes) return null;
  
//     const elements = [];
//     let currentPos = 0;
//     const codeBlockRegex = /CODE_BLOCK_(\d+)/g;
//     let match;
  
//     while ((match = codeBlockRegex.exec(generatedNotes)) !== null) {
//       const index = parseInt(match[1]);
//       // Add text before the code block
//       if (match.index > currentPos) {
//         const textBlock = generatedNotes.substring(currentPos, match.index).replace(/\n/g, '<br/>');
//         elements.push(
//           <div key={`text-${currentPos}`} className="notes-text" dangerouslySetInnerHTML={{ __html: textBlock }} />
//         );
//       }
  
//       // Find the corresponding code item from deduplicatedTransData
//       const originalItem = deduplicatedTransData.find(
//         (item, idx) => item.type === "code" && idx === index
//       );
  
//       if (originalItem) {
//         elements.push(
//           <div key={`code-${index}`} className="code-box-container">
//             <div className="code-header">
//               <button
//                 className="execute-bt"
//                 onClick={() => onExecuteCode(index, originalItem.plain_code || '')}
//                 disabled={!originalItem.plain_code || isExecuting}
//               >
//                 {isExecuting ? 'Executing...' : 'Execute'}
//               </button>
//             </div>
//             <pre className="code-box">
//               <code dangerouslySetInnerHTML={{ __html: originalItem.content }} />
//             </pre>
//             {outputs[index] && (
//               <div className="output-box">
//                 <strong>Output:</strong>
//                 <pre>{outputs[index]}</pre>
//               </div>
//             )}
//           </div>
//         );
//       } else {
//         elements.push(
//           <p key={`missing-${index}`} className="notes-text">Code block {index} not found.</p>
//         );
//       }
  
//       currentPos = match.index + match[0].length;
//     }
  
//     // Add remaining text after last code block
//     if (currentPos < generatedNotes.length) {
//       const textBlock = generatedNotes.substring(currentPos).replace(/\n/g, '<br/>');
//       elements.push(
//         <div key={`text-end`} className="notes-text" dangerouslySetInnerHTML={{ __html: textBlock }} />
//       );
//     }
  
//     return elements;
//   };

//   const handleCopyCode = (code) => {
//     navigator.clipboard.writeText(code);
//   };
//   const codeBlocks = deduplicatedTransData
//   .filter(item => item.type === "code" && item.plain_code)
//   .map(item => item.plain_code);
//   return (
//     <div>
//       <Navbar />
//       <div className="transcription-page-container">
//         <div className="transcription-header">
//           <h2>Transcribed Content</h2>
//           <div className="button-group">
//             <button className="transcription_gen_note" onClick={handleGenerateNotes} disabled={isLoading || !deduplicatedTransData?.length}>
//               {isLoading ? 'Generating...' : 'Generate Notes'}
//             </button>
//             <button className="download-button" onClick={handleDownloadNotes} disabled={!generatedNotes}>
//               Download Notes
//             </button>
//             <button className="back-btn" onClick={handleBack}>
//               Back
//             </button>
//           </div>
//         </div>
        
//         <div className="transcription-content-box" ref={transcriptionBoxRef}>
//           {deduplicatedTransData.length === 0 ? (
//             <p className="empty-state">No transcriptions yet.</p>
//           ) : (
//             deduplicatedTransData.map((item, index) => (
//               <div key={index} className="transcription-flow">
//                 {item.type === "code" ? (
//                   <div className="code-box-container">
//                     <div className="code-header">
//                       <button 
//                         className="execute-bt"
//                         onClick={() => onExecuteCode(index, item.plain_code || '')}
//                         disabled={isExecuting}
//                       >
//                         {isExecuting ? 'Executing...' : 'Execute'}
//                       </button>
//                     </div>
//                     <pre className="code-box">
//                       <code dangerouslySetInnerHTML={{ __html: item.content }} />
//                     </pre>
//                     {outputs[index] && (
//                       <div className="output-box">
//                         <strong>Output:</strong>
//                         <pre>{outputs[index]}</pre>
//                       </div>
//                     )}
//                   </div>
//                 ) : (
//                   <p className="theory-text">{item.content}</p>
//                 )}
//               </div>
//             ))
//           )}
//         </div>

//         {generatedNotes && (
//           <div className="notes-section">
//             <div className="notes-header">
//               <h3>{selectedChapter ? `Notes for ${selectedChapter.title}` : 'Generated Notes'}</h3>
//               <button className="edit-button" onClick={handleEditToggle}>
//                 {isEditing ? 'Cancel' : 'Edit'}
//               </button>
//             </div>
//             <div className="notes-content-box" ref={notesBoxRef}>
//               {isEditing ? (
//                 <>
//                   <textarea className="notes-textarea" value={editedNotes} onChange={handleNotesChange} />
//                   <button className="save-button" onClick={handleSaveEdit}>Save</button>
//                 </>
//               ) : (
//                 renderGeneratedNotes()
//               )}
//             </div>
//           </div>
//         )}
//         {error && <div className="error-message">{error}</div>}
//         {executionError && <div className="error-message">Execution Error: {executionError}</div>}
//       </div>
//     </div>
//   );
// };

// export default TranscriptionPage;