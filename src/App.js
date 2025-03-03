import { useState, useEffect } from "react";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './Pages/Login/Login';

import RecordPage from './Pages/RecordPage/RecordPage';
import TranscribePage from './Pages/RecordPage/TranscribePage';
import UploadPage from './Pages/RecordPage/UploadPage';
import SummarizePage from './Pages/RecordPage/SummarizePage';


import Dashboard from './Pages/Dashboard/Dashboard';
import UserDashboard from './Pages/UserDashboard/UserDashboard';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import Signup from './Pages/Signup/Signup';
import Transcript from './Pages/Transcript/Transcript';
import Programming from './Pages/Programming/Programming';

import UserOptions from './Pages/OptionsPage/UserOptionPage';
import AsCommunityHead from './Pages/OptionsPage/AsCommunityHead/AsCommunityHead';
import JoinCommunity from './Pages/OptionsPage/JoinCommunity/JoinCommunity';

import UserOfCommunity from './Pages/UserOfCommunity/UserOfCommunity';
import TranscriptView from './Pages/TranscriptView/TranscriptView';

import './App.css';  // Import the CSS file
import PythonClass from "./Pages/PythonClass/PythonClass";

function App() {
    return (
        <Router>
            <Routes>
                {/* Default Route */}
                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Signup />} />
                
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Route for User Dashboard */}
                <Route path="/user-dashboard" element={<UserDashboard />} />
                
                {/* Route for Admin Dashboard */}
                <Route path="/admin-dashboard" element={<AdminDashboard />} />

                <Route path="/transcript" element={<Transcript />} />

                <Route path="/recordpage" element={<RecordPage />} />
                <Route path="/transcribepage" element={<TranscribePage />} />
                <Route path="/uploadimgpage" element={<UploadPage />} />
                <Route path="/summarizepage" element={<SummarizePage />} />


                <Route path="/programming" element={<Programming />} />

                <Route path="/user-options" element={<UserOptions />} />

                <Route path="/community-head" element={<AsCommunityHead />} />
                <Route path="/join-community" element={<JoinCommunity />} />

                <Route path="/user-of-community" element={<UserOfCommunity />} />

                <Route path="/python-class" element={<PythonClass />} />
                <Route path="/transcript-view" element={<TranscriptView />} />
            </Routes>
        </Router>
    );
}

export default App;
