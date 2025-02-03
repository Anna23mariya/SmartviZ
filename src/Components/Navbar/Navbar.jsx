// src/components/Navbar.js
import React from 'react';
import './Navbar.css';  // Import the CSS file

const Navbar = () => {
    return (
        <nav className="navbar">
            <h1>SmartviZ</h1>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#profile">Profile</a></li>
                <li><a href="#logout">Logout</a></li>
            </ul>
        </nav>
    );
};

export default Navbar;
