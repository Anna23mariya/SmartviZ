import React, { useState } from "react";
import Navbar from '../../../Components/Navbar/Navbar';
import './AsCommunityHead.css';

const AsCommunityHead = () => {
  const [communities, setCommunities] = useState([]);
  const [newCommunity, setNewCommunity] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [users, setUsers] = useState([]);
  const [announcement, setAnnouncement] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setNewCommunity(e.target.value);
    setError("");
  };

  const handleCreateCommunity = (e) => {
    e.preventDefault();
    const trimmedName = newCommunity.trim();

    if (!trimmedName) {
      setError("Community name cannot be empty");
      return;
    }

    const isDuplicate = communities.some(
      community => community.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setError("A community with this name already exists");
      return;
    }

    const community = {
      name: trimmedName,
      members: ['User1', 'User2'],
      id: Date.now()
    };
    
    setCommunities(prevCommunities => [...prevCommunities, community]);
    setNewCommunity("");
    setError("");
  };

  const handleSelectCommunity = (community) => {
    setSelectedCommunity(community);
    setUsers(community.members || []);
  };

  const handleApproveUser = (user) => {
    alert(`User ${user} approved!`);
  };

  const handleRemoveUser = (user) => {
    setUsers(prevUsers => prevUsers.filter(u => u !== user));
    if (selectedCommunity) {
      const updatedCommunity = {
        ...selectedCommunity,
        members: selectedCommunity.members.filter(u => u !== user)
      };
      setCommunities(prevCommunities =>
        prevCommunities.map(c =>
          c.id === selectedCommunity.id ? updatedCommunity : c
        )
      );
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
                />
                {error && <div className="error-message">{error}</div>}
              </div>
              <button type="submit" className="create-button">
                Create
              </button>
            </form>
          </div>
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
              <div className="members-section">
                <h4>Members</h4>
                <ul className="members-list">
                  {users.length > 0 ? (
                    users.map((user, index) => (
                      <li key={index} className="member-item">
                        <span className="member-name">{user}</span>
                        <div className="member-actions">
                          <button 
                            onClick={() => handleApproveUser(user)} 
                            className="action-button approve-button"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRemoveUser(user)} 
                            className="action-button remove-button"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="no-members-text">No members yet.</p>
                  )}
                </ul>
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
      </div>
    </div>
  );
};

export default AsCommunityHead;
