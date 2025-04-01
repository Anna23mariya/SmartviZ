//JoinCommunity.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './JoinCommunity.css';
import Navbar from '../../../Components/Navbar/Navbar';
import Chatbot from '../../../Components/Chatbot/Chatbot';


function JoinCommunity() {
  const [communityCode, setCommunityCode] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    fetchJoinedCommunities();
  }, []);

  const fetchJoinedCommunities = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/user-communities?userEmail=${userEmail}`);
      if (response.data.status === 'success') {
        setJoinedCommunities(response.data.communities);
      }
    } catch (error) {
      console.error('Error fetching joined communities:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      const response = await axios.post('http://localhost:5000/api/communities/join', {
        communityName: communityCode.trim(),
        userEmail: userEmail
      });
      
      if (response.data.status === 'success') {
        setMessage('Successfully joined the community!');
        localStorage.setItem('currentCommunity', communityCode.trim());
        await fetchJoinedCommunities(); // Refresh the communities list
        
        setTimeout(() => {
          navigate('/user-Of-community', {
            state: {
              communityCode: communityCode.trim(),
              userEmail: userEmail
            }
          });
        }, 1000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to join community. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommunityClick = (community) => {
    navigate('/user-Of-community', {
      state: {
        communityCode: community.name,
        userEmail: userEmail
      }
    });
  };

  return (
    <div className="join-page-container">
      <Navbar />
      {/* Sidebar */}
      <div className="join-communities-sidebar">
        <div className="join-sidebar-header">
          <h2>My Communities</h2>
        </div>
        <div className="join-communities-list">
          {joinedCommunities.map((community) => (
            <div
              key={community.id}
              onClick={() => handleCommunityClick(community)}
              className="join-community-item"
            >
              <h3 className="join-community-name">{community.name}</h3>
              <p className="join-community-role">
                {community.creator_email === userEmail ? 'Creator' : 'Member'}
              </p>
            </div>
          ))}
          {joinedCommunities.length === 0 && (
            <p className="join-no-communities">No communities joined yet</p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="join-community-container">
        <div className="join-community-card">
          <h1 className="join-community-title">Join a Community</h1>
          <p className="join-community-subtitle">Enter a community code to join.</p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter Community Code"
              value={communityCode}
              onChange={(e) => setCommunityCode(e.target.value)}
              className="join-community-code-input"
            />

            <button
              type="submit"
              className="join-button"
              disabled={!communityCode.trim() || isLoading}
            >
              {isLoading ? 'Joining...' : 'Join'}
            </button>
          </form>

          {message && (
            <p className={`join-community-message ${
              message.includes('Success') ? 'success' : 'error'
            }`}>
              {message}
            </p>
          )}
        </div>
      </div>
   
    </div>
  );
}

export default JoinCommunity;
// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import './JoinCommunity.css';

// function JoinCommunity() {
//   const [communityCode, setCommunityCode] = useState('');
//   const [message, setMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setMessage('');

//     try {
//       const userEmail = localStorage.getItem('userEmail');
      
//       const response = await axios.post('http://localhost:5000/api/communities/join', {
//         communityName: communityCode.trim(),
//         userEmail: userEmail
//       });

//       if (response.data.status === 'success') {
//         setMessage('Successfully joined the community!');
//         // Store community information if needed
//         localStorage.setItem('currentCommunity', communityCode.trim());
//         // Redirect to userOfCommunity page after a brief delay
//         setTimeout(() => {
//           navigate('/user-Of-community', { 
//             state: { 
//               communityCode: communityCode.trim(),
//               userEmail: userEmail
//             } 
//           });
//         }, 1000); // 1 second delay to show success message
//       }
//     } catch (error) {
//       setMessage(error.response?.data?.message || 'Failed to join community. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="join-community-container">
//       <div className="join-community-card">
//         <h1 className="join-community-title">Join a Community</h1>
//         <p className="join-community-subtitle">Enter a community code to join.</p>
        
//         <form onSubmit={handleSubmit}>
//           <input
//             type="text"
//             placeholder="Enter Community Code"
//             value={communityCode}
//             onChange={(e) => setCommunityCode(e.target.value)}
//             className="community-code-input"
//           />
          
//           <button
//             type="submit"
//             className="join-button"
//             disabled={!communityCode.trim() || isLoading}
//           >
//             {isLoading ? 'Joining...' : 'Join'}
//           </button>
//         </form>
        
//         {message && (
//           <p className={`join-community-message ${
//             message.includes('Success') ? 'success' : 'error'
//           }`}>
//             {message}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }

// export default JoinCommunity;

