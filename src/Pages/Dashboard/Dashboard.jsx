import React, { useState } from "react";
import "./Dashboard.css";
import Navbar from '../../Components/Navbar/Navbar';
import img1 from '../../assets/img1.png';
import img2 from '../../assets/img2.png';
import img3 from '../../assets/img3.png';
import img4 from '../../assets/img4.png';

const DashboardPage = () => {
  const [hoveredBox, setHoveredBox] = useState(null);

  const boxData = [
    { 
      type: 'top', 
      img: img1, 
      title: "Record & Summarize", 
      description: "Record and generate summaries.",
      popupText: "Start Recording"
    },
    { 
      type: 'bottom', 
      img: img2, 
      title: "Transcribe", 
      description: "Transcribe speech to text.",
      popupText: "Begin Transcription"
    },
    { 
      type: 'bottom', 
      img: img3, 
      title: "Upload Audio", 
      description: "Audio transcription.",
      popupText: "Upload Audio File"
    },
    { 
      type: 'bottom', 
      img: img4, 
      title: "Summarize", 
      description: "Automatic summarization.",
      popupText: "Generate Summary"
    }
  ];

  const renderBox = (box, index) => {
    const isHovered = hoveredBox === index;
    const boxClass = box.type === 'top' ? 'dash-top-box' : 'dash-box';

    return (
      <div 
        key={index}
        className={`${boxClass}`}
        onMouseEnter={() => setHoveredBox(index)}
        onMouseLeave={() => setHoveredBox(null)}
      >
        <div 
          className={`dash-box-image-container ${isHovered ? 'hovered' : ''}`}
          style={{ cursor: 'pointer' }} // Pointer cursor only on image container
        >
          <img 
            src={box.img} 
            alt={`AI Image ${box.title}`} 
            className="dash-box-image"
          />
        </div>
        <div className="dash-box-text">
          <h3>{box.title}</h3>
          <p>{box.description}</p>
        </div>
        {isHovered && (
          <div className="dash-popup">
            {box.popupText}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div className="dash-container">
        <h1 className="dash-header">Create with SmartviZ!</h1>
        
        <div className="dash-box-container">
          {/* Top Box */}
          {renderBox(boxData[0], 0)}

          {/* Bottom Boxes */}
          <div className="dash-bottom-boxes">
            {boxData.slice(1).map((box, index) => renderBox(box, index + 1))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
