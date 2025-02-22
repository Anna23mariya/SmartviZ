//JoinCommunity.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './JoinCommunity.css';

function JoinCommunity() {
  const [communityCode, setCommunityCode] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const userEmail = localStorage.getItem('userEmail');
      
      const response = await axios.post('http://localhost:5000/api/communities/join', {
        communityName: communityCode.trim(),
        userEmail: userEmail
      });

      if (response.data.status === 'success') {
        setMessage('Successfully joined the community!');
        // Store community information if needed
        localStorage.setItem('currentCommunity', communityCode.trim());
        // Redirect to userOfCommunity page after a brief delay
        setTimeout(() => {
          navigate('/userOfCommunity', { 
            state: { 
              communityCode: communityCode.trim(),
              userEmail: userEmail
            } 
          });
        }, 1000); // 1 second delay to show success message
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to join community. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            className="community-code-input"
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
  );
}

export default JoinCommunity;


// //JoinCommunity.jsx
// import React, { useState } from 'react';
// import './JoinCommunity.css'; // You'll need to create this CSS file

// function JoinCommunity() {
//   const [communityCode, setCommunityCode] = useState('');
  
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Handle the community code submission logic here
//     console.log('Joining community with code:', communityCode);
//     // You would typically make an API call here
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
//             disabled={!communityCode.trim()}
//           >
//             Join
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default JoinCommunity;