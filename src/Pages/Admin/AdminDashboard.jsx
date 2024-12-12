import React from 'react';
import Admin_navbar from '../../Components/Navbar/Admin_navbar';
// import UserManagement from './UserManagement';
// import Feedback from './Feedback';
// import Complaints from './Complaints';
import './AdminDashboard.css';  

function AdminDashboard() {
  return (
    <div>
      <Admin_navbar />
      <div className="main-container">
        {/* <UserManagement />
        <Feedback />
        <Complaints /> */}
      </div>
    </div>
  );
}

export default AdminDashboard;
