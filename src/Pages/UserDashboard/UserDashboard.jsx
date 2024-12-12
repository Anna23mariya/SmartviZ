import React, { useState, useRef } from 'react';
import Notes from '../../Components/Notes/Notes'; // Import Notes component
import './UserDashboard.css'; // Import the CSS file for dashboard styling
import Navbar from '../../Components/Navbar/Navbar';

const Dashboard = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState("");
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Start recording function
    const startRecording = async () => {
        try {
            console.log("Requesting microphone access...");

            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("Microphone access granted");

            // Initialize MediaRecorder
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            // Clear previous audio chunks
            audioChunksRef.current = [];

            // Collect audio data
            mediaRecorder.ondataavailable = (event) => {
                console.log("Audio data available...");
                audioChunksRef.current.push(event.data);
            };

            // When recording stops
            mediaRecorder.onstop = async () => {
                console.log("Recording stopped");

                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });

                // Stop all tracks to release microphone
                stream.getTracks().forEach((track) => track.stop());
                console.log("Audio recording stopped and microphone released.");

                // Send audio to backend
                await sendAudioToBackend(audioBlob);
            };

            // Start recording
            mediaRecorder.start();
            console.log("Recording started");

            setIsRecording(true);  // Set isRecording to true when recording starts
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    };

    // Stop recording function
    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            console.log("Stopping recording...");
            mediaRecorderRef.current.stop();  // Stop the recording
            setIsRecording(false);  // Set isRecording to false when recording stops
        }
    };

    // Send audio to backend
    const sendAudioToBackend = async (audioBlob) => {
        const formData = new FormData();
        formData.append("audio", audioBlob, "recorded_audio.wav");

        try {
            console.log("Sending audio to backend...");
            const response = await fetch("http://127.0.0.1:5000/transcribe", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to fetch transcription from backend");
            }

            const data = await response.json();
            setTranscription(data.transcription);  // Set the transcription to display it
            console.log("Transcription:", data.transcription);
        } catch (error) {
            console.error("Error sending audio to backend:", error);
        }
    };

    return (
        <div className="dashboard-container">
            {/* Dashboard Header */}
            <div className="dashboard-header">
                <Navbar />
            </div>

            {/* Record Button */}
            <div className="record-button-container">
                <button
                    className="record-button"
                    onClick={startRecording}
                    disabled={isRecording}  // Disable if already recording
                >
                    {isRecording ? "Recording..." : "Record Audio"}  {/* Change button text based on isRecording state */}
                </button>
                <button
                    className="stop-button"
                    onClick={stopRecording}
                    disabled={!isRecording}  // Disable if not recording
                >
                    Stop Recording
                </button>
            </div>

            {/* Display Transcription */}
            {transcription && (
                <div className="transcription-container">
                    <h3>Transcription:</h3>
                    <p>{transcription}</p>
                </div>
            )}

            {/* Notes Section */}
            <Notes /> {/* Render the Notes component here */}
        </div>
    );
};

export default Dashboard;
