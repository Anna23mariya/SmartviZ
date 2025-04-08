import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Routes, Route ,useLocation } from 'react-router-dom';
import Navbar from '../../../Components/Navbar/Navbar';
import './AsCommunityHead.css';
import '../../PythonClass/pygments-monokai.css';
import axios from 'axios';
import Chatbot from '../../../Components/Chatbot/Chatbot';
import TranscriptionPage from '../../TranscriptionPage/TranscriptionPage';

const AsCommunityHead = () => {
  const [communities, setCommunities] = useState([]);
  const [newCommunity, setNewCommunity] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [users, setUsers] = useState([]);
  const [announcement, setAnnouncement] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [notes, setNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState([]);
  const [outputs, setOutputs] = useState({});
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [newHeadings, setNewHeadings] = useState([]);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const navigate = useNavigate();
  const location = useLocation(); 

  const userEmail = localStorage.getItem('userEmail');

  // State for notes with chapters and headings
  const [notesChapters, setNotesChapters] = useState([
    { id: 1, title: "Chapter 1", expanded: true, headings: ["heading 1", "heading 2"] },
    { id: 2, title: "Chapter 2", expanded: true, headings: ["heading 1", "heading 2"] },
  ]);

  useEffect(() => {
    if (userEmail) {
      fetchCommunities();
    }
  }, [userEmail]);

  // Add near the top of your component
  const removeDuplicates = (arr, key) => {
    return arr.filter((item, index, self) =>
      index === self.findIndex(t => t[key] === item[key])
    );
  };

  const startTranscription = async () => {
    if (!selectedChapter) {
      alert("Please select a chapter first");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
        console.log("Audio chunk added:", event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio_data', audioBlob);

        setIsTranscribing(true);

        try {
          const response = await fetch('http://localhost:5000/programming/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log("Transcription response:", JSON.stringify(data, null, 2));
          data.transcription.forEach(segment => console.log("New segment:", segment.type, segment.content));
          setTranscription(prev => {
            const newTranscription = [...prev, ...data.transcription];
            console.log("Updated transcription:", newTranscription);
            return newTranscription;
          });
        } catch (error) {
          console.error('Error uploading audio:', error);
          console.error('Error details:', error.message, error.stack);
          alert(`Failed to process audio: ${error.message}. Please check the console for details.`);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      console.log("Recording started");
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopTranscription = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const executeCode = async (index, plainCode) => {
    try {
      const response = await fetch('http://localhost:5000/programming/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: plainCode }),
      });
      const result = await response.json();
      setOutputs(prev => ({
        ...prev,
        [index]: result.output
      }));
      return result.output;
    } catch (error) {
      console.error('Error executing code:', error);
      const errorMessage = `Execution failed: ${error.message}`;
      setOutputs(prev => ({
        ...prev,
        [index]: errorMessage
      }));
      return errorMessage;
    }
  };

  useEffect(() => {
    if (isRecording || isTranscribing) {
      const interval = setInterval(() => {
        fetch("http://localhost:5000/programming/transcription")
          .then(response => response.json())
          .then(data => {
            console.log("Polling data:", data);
            if (data.transcription && data.transcription.length > 0) {
              setTranscription(data.transcription);
            }
            if (data.status === "completed") {
              setIsTranscribing(false);
            }
          })
          .catch(error => console.error("Error fetching transcription:", error));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRecording, isTranscribing]);

  const fetchCommunities = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/communities?creatorEmail=${userEmail}`);
      if (response.data.status === 'success') {
        setCommunities(response.data.communities);
        if (selectedCommunity) {
          const updatedCommunity = response.data.communities.find(c => c.id === selectedCommunity.id);
          if (updatedCommunity) {
            setSelectedCommunity(updatedCommunity);
            setUsers(updatedCommunity.members || []);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching communities:", err);
      setError("Failed to load communities");
    }
  };

  const handleInputChange = (e) => {
    setNewCommunity(e.target.value);
    setError("");
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    const trimmedName = newCommunity.trim();
    if (!trimmedName) {
      setError("Community name cannot be empty");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/communities', {
        name: trimmedName,
        members: [],
        creatorEmail: userEmail
      });
      if (response.data.status === 'success') {
        const newCommunityObj = {
          id: response.data.community_id,
          name: trimmedName,
          members: []
        };
        setCommunities(prevCommunities => [...prevCommunities, newCommunityObj]);
        setNewCommunity("");
        setError("");
      }
    } catch (err) {
      console.error("Error creating community:", err);
      if (err.response && err.response.status === 409) {
        setError("A community with this name already exists");
      } else {
        setError("Failed to create community");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCommunity = (community) => {
    setSelectedCommunity(community);
    setUsers(community.members || []);
    setShowMembers(true);
  };

  const toggleMembersList = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMembers(prev => !prev);
  };

  const handleRemoveUser = async (memberEmail) => {
    if (!selectedCommunity) return;
    try {
      const response = await axios.post('http://localhost:5000/api/communities/remove-member', {
        communityId: selectedCommunity.id,
        userEmail: memberEmail,
        creatorEmail: userEmail
      });
      if (response.data.status === 'success') {
        setUsers(prevUsers => prevUsers.filter(email => email !== memberEmail));
        setCommunities(prevCommunities =>
          prevCommunities.map(c =>
            c.id === selectedCommunity.id 
              ? { ...c, members: c.members.filter(email => email !== memberEmail) }
              : c
          )
        );
      }
    } catch (err) {
      console.error("Error removing member:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to remove member";
      alert(errorMessage);
    }
  };

  const handleAnnouncementChange = (e) => {
    setAnnouncement(e.target.value);
  };

  const handleSendAnnouncement = (e) => {
    e.preventDefault();
    if (announcement.trim()) {
      alert(`Announcement sent: ${announcement}`);
      setAnnouncement("");
    }
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };
// In your useEffect that handles incoming notes
useEffect(() => {
  if (location.state?.mainHeading && location.state?.selectedChapter) {
    const { mainHeading, generatedNotes } = location.state;
    const chapterId = location.state.selectedChapter.id;

    setNotesChapters(prevChapters =>
      prevChapters.map(chapter => {
        if (chapter.id === chapterId) {
          // Check if heading already exists
          const headingExists = chapter.headings.includes(mainHeading);
          return {
            ...chapter,
            headings: headingExists 
              ? chapter.headings 
              : [...chapter.headings, mainHeading]
          };
        }
        return chapter;
      })
    );

    setNewHeadings(prev => {
      // Check if this note already exists
      const noteExists = prev.some(
        note => note.chapterId === chapterId && note.heading === mainHeading
      );
      return noteExists 
        ? prev 
        : [
            ...prev,
            {
              chapterId,
              heading: mainHeading,
              content: generatedNotes
            }
          ];
    });
  }
}, [location.state]);

  const handleViewTranscription = () => {
    navigate('/transcription', { 
      state: { 
        transcription,
        outputs,
        selectedChapter
      }
    });
  };

  // Notes section functions
  const addNewChapter = () => {
    const newChapter = {
      id: Date.now(), // Unique ID based on timestamp
      title: `Chapter ${notesChapters.length + 1}`,
      expanded: true,
      headings: [],
    };
    setNotesChapters([...notesChapters, newChapter]);
  };

  const toggleChapter = (id) => {
    setNotesChapters(notesChapters.map(chapter =>
      chapter.id === id ? { ...chapter, expanded: !chapter.expanded } : chapter
    ));
  };

  const addHeading = (chapterId) => {
    const newHeading = prompt("Enter new heading title:");
    if (newHeading) {
      setNotesChapters(notesChapters.map(chapter =>
        chapter.id === chapterId
          ? { ...chapter, headings: [...chapter.headings, newHeading] }
          : chapter
      ));
    }
  };

  const removeHeading = (chapterId, headingIndex) => {
    setNotesChapters(notesChapters.map(chapter =>
      chapter.id === chapterId
        ? { ...chapter, headings: chapter.headings.filter((_, index) => index !== headingIndex) }
        : chapter
    ));
  };

  const deleteChapter = (chapterId) => {
    if (window.confirm("Are you sure you want to delete this chapter?")) {
      setNotesChapters(notesChapters.filter(chapter => chapter.id !== chapterId));
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <Routes>
        <Route path="/" element={
          <div className="community-dashboard-container">
            <div className="community-sidebar">
              <h2 className="community-dashboard-title">Community Head</h2>
              <div className="create-community-box">
                <h3>Create New Community</h3>
                <form onSubmit={handleCreateCommunity}>
                  <div className="input-container">
                    <input
                      type="text"
                      value={newCommunity}
                      onChange={handleInputChange}
                      placeholder="Enter Community Name"
                      className={error ? 'error-input' : ''}
                      disabled={loading}
                    />
                    {error && <div className="error-message">{error}</div>}
                  </div>
                  <button
                    type="submit"
                    className="create-button"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create'}
                  </button>
                </form>
              </div>
              
              <h3 className="communities-heading">Communities</h3>
              
              <div className="community-list">
                {communities.length > 0 ? (
                  communities.map((community) => (
                    <div
                      key={community.id}
                      className={`community-box ${selectedCommunity?.id === community.id ? 'selected' : ''}`}
                      onClick={() => handleSelectCommunity(community)}
                    >
                      {community.name}
                    </div>
                  ))
                ) : (
                  <p className="no-community-text">No communities created yet.</p>
                )}
              </div>
            </div>

            <div className="community-main-content">
              {!selectedCommunity ? (
                <div className="select-community-message">
                  <h3>Select or Create a Community</h3>
                </div>
              ) : (
                <div className="community-details">
                  <h3 className="community-name">{selectedCommunity.name}</h3>
                  
                  <div className="control-panel">
                    <div className="recording-controls">
                      <button 
                        className="python-class-start-btn" 
                        onClick={startTranscription} 
                        disabled={isRecording || isTranscribing || !selectedChapter}
                        title={!selectedChapter ? "Please select a chapter first" : ""}
                      >
                        {isRecording ? 'Recording...' : 'Start Transcription'}
                      </button>
                      <button 
                        className="python-class-stop-btn" 
                        onClick={stopTranscription} 
                        disabled={!isRecording}
                      >
                        Stop Transcription
                      </button>
                      {!selectedChapter && (
                        <div className="select-chapter-prompt">Please select a chapter to start recording</div>
                      )}
                    </div>
                    {isRecording && (
                      <p className="recording-indicator">Recording in progress...</p>
                    )}
                    {isTranscribing && (
                      <div className="python-class-status">
                        Transcribing...
                      </div>
                    )}
                  </div>
                  {selectedCommunity && (
                    <button
                      className="view-transcription-btn"
                      onClick={handleViewTranscription}
                      disabled={transcription.length === 0}
                    >
                      View Transcription
                    </button>
                  )}
                  
                  <div className="notes-section">
                    <div className="notes-header">
                      <h4>Notes</h4>
                      <button className="new-chapter-btn" onClick={addNewChapter}>
                        + New chapter
                      </button>
                    </div>
                    {notesChapters.map(chapter => (
                      <div 
                        key={chapter.id} 
                        className={`chapter-container ${selectedChapter?.id === chapter.id ? 'selected-chapter' : ''}`}>
                        <div
                          className="chapter-title"
                          onClick={() => {
                            toggleChapter(chapter.id);
                            setSelectedChapter(chapter);
                          }}
                        >
                          {chapter.title} {chapter.expanded ? <span>▼</span> : <span>▶</span>}
                          <button
                            className="delete-chapter-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selectedChapter?.id === chapter.id) {
                                setSelectedChapter(null);
                              }
                              deleteChapter(chapter.id);
                            }}
                          >
                            ×
                          </button>
                        </div>
                        {chapter.expanded && (
  <div className="chapter-content">
  {chapter.headings.map((heading, index) => {
    const noteContent = newHeadings.find(
      nh => nh.chapterId === chapter.id && nh.heading === heading
    )?.content;

    // Only show if we have content
    return noteContent ? (
      <div key={`${chapter.id}-${heading}`} className="heading-item">
        <div className="heading-title">
          <span>• {heading}</span>
          <button
            className="remove-heading-btn"
            onClick={() => {
              removeHeading(chapter.id, index);
              // Also remove from newHeadings
              setNewHeadings(prev => 
                prev.filter(nh => !(nh.chapterId === chapter.id && nh.heading === heading))
              );
            }}
          >
            ×
          </button>
        </div>
        <div className="generated-notes">
          <pre>{noteContent}</pre>
        </div>
      </div>
    ) : null;
  })}
  {/* <button className="add-heading-btn" onClick={() => addHeading(chapter.id)}>
    + Add heading
  </button> */}
</div>
)}
                      </div>
                    ))}
                  </div>
                  <div className="members-section">
                    <div 
                      className="members-header" 
                      onClick={(e) => toggleMembersList(e)}
                      role="button"
                      tabIndex={0}
                    >
                      <h4>Members ({users.length})</h4>
                      <span className={`dropdown-arrow ${showMembers ? 'open' : ''}`}>▼</span>
                    </div>
                    {showMembers && (
                      <ul className="members-list">
                        {users.length > 0 ? (
                          users.map((memberEmail, index) => (
                            <li key={index} className="member-item">
                              <span className="member-name">{memberEmail}</span>
                              {userEmail !== selectedCommunity.creator_email && (
                                <div className="member-actions">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveUser(memberEmail);
                                    }}
                                    className="action-button remove-button"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </li>
                          ))
                        ) : (
                          <p className="no-members-text">No members yet.</p>
                        )}
                      </ul>
                    )}
                  </div>
                  <div className="announcement-section">
                    <h4>Send Announcement</h4>
                    <form onSubmit={handleSendAnnouncement}>
                      <textarea
                        value={announcement}
                        onChange={handleAnnouncementChange}
                        placeholder="Write your announcement here"
                        className="announcement-input"
                      />
                      <button type="submit" className="send-button">
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>

            <Chatbot />
          </div>
        } />
        // In AsCommunityHead.jsx, update the Route for TranscriptionPage
        <Route 
          path="/community-head/transcription"
          element={<TranscriptionPage 
            transcription={transcription}
            outputs={outputs}
            onExecuteCode={executeCode}
            selectedChapter={selectedChapter}
          />} 
        />
      </Routes>
    </div>
  );
};

export default AsCommunityHead; 