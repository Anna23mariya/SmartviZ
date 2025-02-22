import React from 'react';
import './UserOptionsPage.css';
import backgroundImage from '../../assets/background.jpeg';
import { useNavigate } from "react-router-dom";
import Navbar from '../../Components/Navbar/Navbar';

const UserOptionsPage = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };
  return (
    <div className="body" style={{ backgroundImage: `url(${backgroundImage})` }}>
      
      <div className="main-container">
        
        <div className="branding">SmartviZ</div>
        <div className="options-container">
          <h2 className="options-heading">User Options</h2>
          <div className="options-list">
            <div className="option" onClick={() => handleNavigate("/user-dashboard")}>AS A USER</div>
            <div className="option" onClick={() => handleNavigate("/community-head")}>AS A COMMUNITY HEAD</div>
            <div className="option" onClick={() => handleNavigate("/join-community")}>JOIN TO A COMMUNITY</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOptionsPage;
