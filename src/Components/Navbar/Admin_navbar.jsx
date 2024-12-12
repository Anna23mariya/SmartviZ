import React from 'react';
import { Link } from 'react-router-dom';
import './Admin_navbar.css';  

function Navbar() {
  return (
    <div className="navbar">
      <h1>SmartviZ Admin</h1>
      <ul>
        <li><Link to="#user-management">User Management</Link></li>
        <li><Link to="#feedback">Feedback</Link></li>
        <li><Link to="#complaints">Complaints</Link></li>
        <li><Link to="/">Logout</Link></li>
      </ul>
    </div>
  );
}

export default Navbar;
