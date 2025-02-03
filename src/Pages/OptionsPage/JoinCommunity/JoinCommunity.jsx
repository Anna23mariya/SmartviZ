


import React, { useState } from "react";
import "./JoinCommunity.css";

const JoinCommunity = () => {
  const [communityCode, setCommunityCode] = useState("");

  const handleJoin = () => {
    if (communityCode.trim() === "") {
      alert("Please enter a community code!");
      return;
    }
    // Handle the join community logic here (API call, validation, etc.)
    console.log(`Joining community with code: ${communityCode}`);
  };

  return (
    <div className="join-community-container">
      <h2 className="join-community-h2">Join a Community</h2>
      <p className="join-community-p">Enter a community code to join.</p>

      <input
      className="join-community-input"
        type="text"
        placeholder="Enter Community Code"
        value={communityCode}
        onChange={(e) => setCommunityCode(e.target.value)}
      />
      <button className="join-community-button" onClick={handleJoin}>Join</button>
    </div>
  );
};

export default JoinCommunity;