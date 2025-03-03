import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Navbar from '../../Components/Navbar/Navbar';
import img1 from '../../assets/img1.png';
import img2 from '../../assets/img2.png';
import img3 from '../../assets/img3.png';
import img4 from '../../assets/img4.png';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="dash-container">
      <Navbar />
      <main>
        <h1 className="dash-title">Create with SmartviZ!</h1>
        <div className="dash-card-container">
          {/* First Row */}
          <div className="dash-card-row">
            <div className="dash-card">
              <img src={img1} alt="Record & Summarize" />
              <h2>Record & Summarize</h2>
              <p>Record and generate summaries.</p>
              <button
                className="dash-btn"
                onClick={() => handleNavigate("/user-dashboard")}
              >
                Go
              </button>
            </div>
          </div>

          {/* Second Row */}
          <div className="dash-card-row">
            <div className="dash-card">
              <img src={img2} alt="Create Community" />
              <h2>Community</h2>
              <p>Transcribe speech to text.</p>
              <button
                className="dash-btn"
                onClick={() => handleNavigate("/community-head")}
              >
                Go
              </button>
            </div>
            <div className="dash-card">
              <img src={img3} alt="Join Community" />
              <h2>Join communities</h2>
              <p>Audio transcription.</p>
              <button
                className="dash-btn"
                onClick={() => handleNavigate("/join-community")}
              >
                Go
              </button>
            </div>
            <div className="dash-card">
              <img src={img4} alt="Python" />
              <h2>Python</h2>
              <p>Automatic summarization.</p>
              <button
                className="dash-btn"
                onClick={() => handleNavigate("/python-class")}
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
