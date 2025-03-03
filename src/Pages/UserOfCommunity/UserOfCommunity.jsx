// //UserOfCommunity.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import axios from 'axios';
import './UserOfCommunity.css';

const UserOfCommunity = () => {
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    if (userEmail) {
      fetchUserCommunities();
    }
  }, [userEmail]);

  const fetchUserCommunities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/user-communities?userEmail=${userEmail}`);
      
      if (response.data.status === 'success') {
        setCommunities(response.data.communities);
      }
    } catch (err) {
      console.error("Error fetching communities:", err);
      setError("Failed to load communities");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCommunity = async (community) => {
    setSelectedCommunity(community);
    try {
      // Fetch community details including notes and announcements
      const response = await axios.get(`http://localhost:5000/api/community-details/${community.id}`);
      
      if (response.data.status === 'success') {
        setNotes(response.data.notes || "");
        setAnnouncements(response.data.announcements || []);
      }
    } catch (err) {
      console.error("Error fetching community details:", err);
      setError("Failed to load community details");
    }
  };

  return (
    <div className="user-dashboard-wrapper">
      <Navbar />
      <div className="user-community-container">
        <div className="user-community-sidebar">
          <h2 className="user-dashboard-title">My Communities</h2>
          
          <div className="user-community-list">
            {loading ? (
              <p className="user-loading-text">Loading communities...</p>
            ) : communities.length > 0 ? (
              communities.map((community) => (
                <div
                  key={community.id}
                  className={`user-community-box ${selectedCommunity?.id === community.id ? 'selected' : ''}`}
                  onClick={() => handleSelectCommunity(community)}
                >
                  {community.name}
                </div>
              ))
            ) : (
              <p className="user-no-community-text">You haven't joined any communities yet.</p>
            )}
          </div>
        </div>

        <div className="user-community-main">
          {!selectedCommunity ? (
            <div className="user-select-community-message">
              <h3>Select a Community to View Details</h3>
            </div>
          ) : (
            <div className="user-community-content">
              <h2 className="user-community-header">{selectedCommunity.name}</h2>
              
              <div className="content-section notes-section">
                <h3>Community Notes</h3>
                <div className="user-notes-content">
                  {notes ? (
                    <p>{notes}</p>
                  ) : (
                    <p className="user-no-content">No notes available</p>
                  )}
                </div>
              </div>

              <div className="user-content-section user-announcements-section">
                <h3>Announcements</h3>
                <div className="user-announcements-list">
                  {announcements.length > 0 ? (
                    announcements.map((announcement, index) => (
                      <div key={index} className="user-announcement-card">
                        <p className="user-announcement-text">{announcement.text}</p>
                        <span className="user-announcement-date">
                          {new Date(announcement.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="user-no-content">No announcements yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOfCommunity;