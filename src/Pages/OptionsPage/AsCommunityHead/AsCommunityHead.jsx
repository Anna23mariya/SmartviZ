//AsCommunityHead.jsx
import React, { useState, useEffect, useRef } from "react";
import Navbar from '../../../Components/Navbar/Navbar';
import './AsCommunityHead.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';

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
  const [isTranscribing, setIsTranscribing] = useState(false); // New state for transcribing status
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      message: "Hello, Ask me anything!",
      sentTime: "just now",
      sender: "Llama"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    if (userEmail) {
      fetchCommunities();
    }
  }, [userEmail]);

  const handleStartRecording = async () => {
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

        setIsTranscribing(true); // Set transcribing status to true

        try {
          const response = await fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: formData,
            timeout: 10000, // 10-second timeout
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
        } finally {
          setIsTranscribing(false); // Reset transcribing status
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
      // Stop all audio tracks
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
    }
  };


  const fetchCommunities = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/communities?creatorEmail=${userEmail}`);
      console.log("API Response:", response.data);      
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
        members: [], // Initialize with empty members array
        creatorEmail: userEmail
      });
     
      if (response.data.status === 'success') {
        const newCommunityObj = {
          id: response.data.community_id,
          name: trimmedName,
          members: [] // Initialize with empty members array
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
    console.log("Selected community:", community);
    setSelectedCommunity(community);
    setUsers(community.members || []);
    setShowMembers(true);
  };

  const toggleMembersList = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMembers(prev => !prev);
    console.log("Toggling members list:", !showMembers);
  };

  const handleRemoveUser = async (memberEmail) => {
    if (!selectedCommunity) return;
    
    try {
      const response = await axios.post('http://localhost:5000/api/communities/remove-member', {
        communityId: selectedCommunity.id,
        userEmail: memberEmail,
        creatorEmail: userEmail  // Changed from selectedCommunity.creator_email
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

  const handleSend = async (message) => {
    const newMessage = {
      message: message.trim(),
      direction: 'outgoing',
      sender: "user",
      position: "normal"
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  const processMessageToChatGPT = async (chatMessages) => {
    const lastMessage = chatMessages[chatMessages.length - 1];
    const prompt = `${lastMessage.message}\n\nPlease format your response appropriately. If showing code, use proper formatting with language specification.`;

    const apiRequestBody = {
      "model": "llama3.2",
      "prompt": prompt,
      "stream": false
    }

    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      let formattedMessage = formatResponse(data.response);
      
      setMessages([...chatMessages, {
        message: formattedMessage,
        sender: "Llama",
        direction: 'incoming'
      }]);
      setIsTyping(false);
      
    } catch (error) {
      console.error('Error:', error);
      setIsTyping(false);
    }
  };

  const formatResponse = (response) => {
    if (!response) return '';

    if (response.includes('```')) {
      return response.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang || 'text';
        const highlighted = Prism.highlight(
          code.trim(),
          Prism.languages[language] || Prism.languages.text,
          language
        );
        return `<div class="code-block ${language}">
                  <div class="code-header">${language}</div>
                  <pre><code class="language-${language}">${highlighted}</code></pre>
                </div>`;
      });
    }

    if (response.trim().startsWith('{') || response.trim().startsWith('[')) {
      try {
        const jsonObj = JSON.parse(response);
        const formatted = JSON.stringify(jsonObj, null, 2);
        const highlighted = Prism.highlight(
          formatted,
          Prism.languages.json,
          'json'
        );
        return `<div class="code-block json">
                  <div class="code-header">json</div>
                  <pre><code class="language-json">${highlighted}</code></pre>
                </div>`;
      } catch {
        return `<div class="text-block">${response}</div>`;
      }
    }

    return `<div class="text-block">${response}</div>`;
  };
  
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
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
              <div className="comm-recording-controls">
                <button 
                  className={`comm-recording-button comm-start-recording ${isRecording ? 'disabled' : ''}`}
                  onClick={handleStartRecording}
                  disabled={isRecording || isTranscribing}
                >
                  {isRecording ? 'Recording...' : 'Record Audio'}
                </button>
                <button 
                  className={`comm-recording-button comm-stop-recording ${!isRecording ? 'disabled' : ''}`}
                  onClick={handleStopRecording}
                  disabled={!isRecording}
                >
                  Stop Recording
                </button>
                {isRecording && (
                <p className="mt-4 text-center text-red-500">Recording in progress...</p>
              )}

              {isTranscribing && (
                <p className="mt-4 text-center text-blue-500">Transcribing...</p>
              )}
              </div>
              

              <div className="notes-section">
                <h4>Notes</h4>
                <textarea
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Add notes about the community here..."
                  className="notes-input"
                />
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

        <div className={`floating-chat-container ${isChatOpen ? 'open' : ''}`}>
          {!isChatOpen && (
            <button 
              className="chat-toggle-button"
              onClick={toggleChat}
              aria-label="Open chat"
            >
              <span className="chat-icon">💬</span>
              Chat with Assistant
            </button>
          )}
          
          {isChatOpen && (
            <div className="chat-window">
              <div className="chat-header">
                <h3>Community Assistant</h3>
                <button 
                  className="close-chat-button"
                  onClick={toggleChat}
                  aria-label="Close chat"
                >
                  ×
                </button>
              </div>
              <div className="chat-content">
                <MainContainer>
                  <ChatContainer>       
                    <MessageList 
                      scrollBehavior="smooth" 
                      typingIndicator={isTyping ? <TypingIndicator content="Typing" /> : null}
                    >
                      {messages.map((message, i) => (
                        <Message 
                          key={i} 
                          model={message}
                          html={true}
                        />
                      ))}
                    </MessageList>
                    <MessageInput placeholder="Ask your community assistant..." onSend={handleSend} />        
                  </ChatContainer>
                </MainContainer>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AsCommunityHead;


// import React, { useState, useEffect } from "react";
// import Navbar from '../../../Components/Navbar/Navbar';
// import './AsCommunityHead.css';
// import axios from 'axios';

// const AsCommunityHead = () => {
//   const [communities, setCommunities] = useState([]);
//   const [newCommunity, setNewCommunity] = useState("");
//   const [selectedCommunity, setSelectedCommunity] = useState(null);
//   const [users, setUsers] = useState([]);
//   const [announcement, setAnnouncement] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showMembers, setShowMembers] = useState(false);
//   const [notes, setNotes] = useState("");
  
//   const userEmail = localStorage.getItem('userEmail');

//   useEffect(() => {
//     if (userEmail) {
//       fetchCommunities();
//     }
//   }, [userEmail]);

//   const fetchCommunities = async () => {
//     try {
//       const response = await axios.get(`http://localhost:5000/api/communities?creatorEmail=${userEmail}`);
//       console.log("API Response:", response.data);      
//       if (response.data.status === 'success') {
//         setCommunities(response.data.communities);
//         if (selectedCommunity) {
//           const updatedCommunity = response.data.communities.find(c => c.id === selectedCommunity.id);
//           if (updatedCommunity) {
//             setSelectedCommunity(updatedCommunity);
//             setUsers(updatedCommunity.members || []);
//           }
//         }
//       }
//     } catch (err) {
//       console.error("Error fetching communities:", err);
//       setError("Failed to load communities");
//     }
//   };

//   const handleInputChange = (e) => {
//     setNewCommunity(e.target.value);
//     setError("");
//   };

//   const handleCreateCommunity = async (e) => {
//     e.preventDefault();
//     const trimmedName = newCommunity.trim();
//     if (!trimmedName) {
//       setError("Community name cannot be empty");
//       return;
//     }
//     setLoading(true);
   
//     try {
//       const response = await axios.post('http://localhost:5000/api/communities', {
//         name: trimmedName,
//         members: [], // Initialize with empty members array
//         creatorEmail: userEmail
//       });
     
//       if (response.data.status === 'success') {
//         const newCommunityObj = {
//           id: response.data.community_id,
//           name: trimmedName,
//           members: [] // Initialize with empty members array
//         };
       
//         setCommunities(prevCommunities => [...prevCommunities, newCommunityObj]);
//         setNewCommunity("");
//         setError("");
//       }
//     } catch (err) {
//       console.error("Error creating community:", err);
//       if (err.response && err.response.status === 409) {
//         setError("A community with this name already exists");
//       } else {
//         setError("Failed to create community");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSelectCommunity = (community) => {
//     console.log("Selected community:", community);
//     setSelectedCommunity(community);
//     setUsers(community.members || []);
//     setShowMembers(true);
//   };

//   const toggleMembersList = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setShowMembers(prev => !prev);
//     console.log("Toggling members list:", !showMembers);
//   };

//   const handleRemoveUser = async (memberEmail) => {
//     if (!selectedCommunity) return;
    
//     try {
//       const response = await axios.post('http://localhost:5000/api/communities/remove-member', {
//         communityId: selectedCommunity.id,
//         userEmail: memberEmail,
//         creatorEmail: userEmail  // Changed from selectedCommunity.creator_email
//       });
  
//       if (response.data.status === 'success') {
//         setUsers(prevUsers => prevUsers.filter(email => email !== memberEmail));
//         setCommunities(prevCommunities =>
//           prevCommunities.map(c =>
//             c.id === selectedCommunity.id 
//               ? { ...c, members: c.members.filter(email => email !== memberEmail) }
//               : c
//           )
//         );
//       }
//     } catch (err) {
//       console.error("Error removing member:", err);
//       const errorMessage = err.response?.data?.message || err.message || "Failed to remove member";
//       alert(errorMessage);
//     }
//   };

//   const handleAnnouncementChange = (e) => {
//     setAnnouncement(e.target.value);
//   };

//   const handleSendAnnouncement = (e) => {
//     e.preventDefault();
//     if (announcement.trim()) {
//       alert(`Announcement sent: ${announcement}`);
//       setAnnouncement("");
//     }
//   };
  
//   const handleNotesChange = (e) => {
//     setNotes(e.target.value);
//   };

//   return (
//     <div className="dashboard-wrapper">
//       <Navbar />
//       <div className="community-dashboard-container">
//         <div className="community-sidebar">
//           <h2 className="community-dashboard-title">Community Head</h2>
//           <div className="create-community-box">
//             <h3>Create New Community</h3>
//             <form onSubmit={handleCreateCommunity}>
//               <div className="input-container">
//                 <input
//                   type="text"
//                   value={newCommunity}
//                   onChange={handleInputChange}
//                   placeholder="Enter Community Name"
//                   className={error ? 'error-input' : ''}
//                   disabled={loading}
//                 />
//                 {error && <div className="error-message">{error}</div>}
//               </div>
//               <button
//                 type="submit"
//                 className="create-button"
//                 disabled={loading}
//               >
//                 {loading ? 'Creating...' : 'Create'}
//               </button>
//             </form>
//           </div>
          
//           <h3 className="communities-heading">Communities</h3>
          
//           <div className="community-list">
//             {communities.length > 0 ? (
//               communities.map((community) => (
//                 <div
//                   key={community.id}
//                   className={`community-box ${selectedCommunity?.id === community.id ? 'selected' : ''}`}
//                   onClick={() => handleSelectCommunity(community)}
//                 >
//                   {community.name}
//                 </div>
//               ))
//             ) : (
//               <p className="no-community-text">No communities created yet.</p>
//             )}
//           </div>
//         </div>

//         <div className="community-main-content">
//           {!selectedCommunity ? (
//             <div className="select-community-message">
//               <h3>Select or Create a Community</h3>
//             </div>
//           ) : (
//             <div className="community-details">
//               <h3 className="community-name">{selectedCommunity.name}</h3>
//               <div className="notes-section">
//                 <h4>Notes</h4>
//                 <textarea
//                   value={notes}
//                   onChange={handleNotesChange}
//                   placeholder="Add notes about the community here..."
//                   className="notes-input"
//                 />
//               </div>
//               <div className="members-section">
//                 <div 
//                     className="members-header" 
//                     onClick={(e) => toggleMembersList(e)}
//                     role="button"
//                     tabIndex={0}
//                   >
//                   <h4>Members ({users.length})</h4>
//                   <span className={`dropdown-arrow ${showMembers ? 'open' : ''}`}>▼</span>
//                 </div>
//                 {showMembers && (
//                   <ul className="members-list">
//                     {users.length > 0 ? (
//                       users.map((memberEmail, index) => (
//                         <li key={index} className="member-item">
//                           <span className="member-name">{memberEmail}</span>
//                           {userEmail !== selectedCommunity.creator_email && (
//                             <div className="member-actions">
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handleRemoveUser(memberEmail);
//                                 }}
//                                 className="action-button remove-button"
//                               >
//                                 Remove
//                               </button>
//                             </div>
//                           )}
//                         </li>
//                       ))
//                     ) : (
//                       <p className="no-members-text">No members yet.</p>
//                     )}
//                   </ul>
//                 )}
//               </div>
//               <div className="announcement-section">
//                 <h4>Send Announcement</h4>
//                 <form onSubmit={handleSendAnnouncement}>
//                   <textarea
//                     value={announcement}
//                     onChange={handleAnnouncementChange}
//                     placeholder="Write your announcement here"
//                     className="announcement-input"
//                   />
//                   <button type="submit" className="send-button">
//                     Send
//                   </button>
//                 </form>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AsCommunityHead;
