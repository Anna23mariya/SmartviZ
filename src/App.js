import { useState, useEffect } from "react";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './Pages/Login/Login';
import UserDashboard from './Pages/UserDashboard/UserDashboard';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import Signup from './Pages/Signup/Signup';
import Transcript from './Pages/Transcript/Transcript';
import './App.css';  // Import the CSS file

function App() {
    return (
        <Router>
            <Routes>
                {/* Default Route */}
                <Route path="/" element={<Login />} />

                <Route path="/register" element={<Signup />} />
                
                {/* Route for User Dashboard */}
                <Route path="/user-dashboard" element={<UserDashboard />} />
                
                {/* Route for Admin Dashboard */}
                <Route path="/admin-dashboard" element={<AdminDashboard />} />

                <Route path="/transcript" element={<Transcript />} />
            </Routes>
        </Router>
    );
}

export default App;
