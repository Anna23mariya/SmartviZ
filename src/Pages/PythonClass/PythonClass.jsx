// // PythonClass.jsx
import React, { useState, useEffect, useRef } from "react";
import './PythonClass.css';
import './pygments-monokai.css';
import Navbar from "../../Components/Navbar/Navbar";

const PythonClass = () => {
    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [transcription, setTranscription] = useState([]);
    const [outputs, setOutputs] = useState({}); // Add state for execution outputs
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const transcriptionBoxRef = useRef(null);

    const startTranscription = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks.current = [];
    
            mediaRecorder.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data);
                console.log("Audio chunk added:", event.data);
            };
    
            mediaRecorder.current.onstop = async () => {
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
                const formData = new FormData();
                formData.append('audio_data', audioBlob);
    
                setProcessing(true);
    
                try {
                    const response = await fetch('http://localhost:5000/programming/transcribe', {
                        method: 'POST',
                        body: formData,
                    });
    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
    
                    const data = await response.json();
                    console.log("Transcription response:", JSON.stringify(data, null, 2));
                    
                    // Debug each segment
                    data.transcription.forEach(segment => console.log("New segment:", segment.type, segment.content));
                    setTranscription(prev => [...prev, ...data.transcription]);
                    
                } catch (error) {
                    console.error('Error uploading audio:', error);
                    console.error('Error details:', error.message, error.stack);
                    alert(`Failed to process audio: ${error.message}. Please check the console for details.`);
                } finally {
                    setProcessing(false);
                }
            };
    
            mediaRecorder.current.start();
            setRecording(true);
            console.log("Recording started");
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Failed to access microphone. Please check permissions.');
        }
    };

    const stopTranscription = () => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            mediaRecorder.current.stop();
            setRecording(false);
            mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
        }
    };

    useEffect(() => {
        if (recording || processing) {
            const interval = setInterval(() => {
                fetch("http://localhost:5000/programming/transcription")
                    .then(response => response.json())
                    .then(data => {
                        console.log("Polling data:", data);
                        if (data.transcription && data.transcription.length > 0) {
                            setTranscription(data.transcription); // Replace with full server state
                        }
                        if (data.status === "completed") {
                            setProcessing(false);
                        }
                    })
                    .catch(error => console.error("Error fetching transcription:", error));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [recording, processing]);

    // Scroll to bottom when new content is added
    useEffect(() => {
        if (transcriptionBoxRef.current) {
            transcriptionBoxRef.current.scrollTop = transcriptionBoxRef.current.scrollHeight;
        }
    }, [transcription]);

    useEffect(() => {
        console.log("Transcription:", transcription);
    }, [transcription]);

    // Add function to execute code
    const executeCode = async (index, plainCode) => {
        try {
            const response = await fetch('http://localhost:5000/programming/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: plainCode }),
            });
            const result = await response.json();
            setOutputs(prev => ({
                ...prev,
                [index]: result.output
            }));
        } catch (error) {
            console.error('Error executing code:', error);
            setOutputs(prev => ({
                ...prev,
                [index]: `Execution failed: ${error.message}`
            }));
        }
    };

    return (
        <div>
            <Navbar/>
            <div className="python-class-container">
                <h1>Live Transcription</h1>
                <div className="control-panel">
                    <div className="recording-controls">
                        <button 
                            className="python-class-start-btn" 
                            onClick={startTranscription} 
                            disabled={recording || processing}
                        >
                            {recording ? 'Recording...' : 'Start Transcription'}
                        </button>
                        <button 
                            className="python-class-stop-btn" 
                            onClick={stopTranscription} 
                            disabled={!recording}
                        >
                            Stop Transcription
                        </button>
                    </div>
                    {recording && (
                        <p className="recording-indicator">Recording in progress...</p>
                    )}
                    {processing && (
                        <div className="python-class-status">
                            Transcribing...
                        </div>
                    )}
                </div>
                
                <h2>Transcribed Content:</h2>
                <div className="python-class-transcription-box" ref={transcriptionBoxRef}>
                    {transcription.length === 0 && (
                        <p className="empty-state">No transcriptions yet. Start recording to see content here.</p>
                    )}
                    
                    {transcription.map((item, index) => (
                        <div key={index} className="transcription-flow">
                            {item.type === "theory" ? (
                                <p className="theory-text">{item.content}</p>
                            ) : item.type === "code" ? (
                                <div className="code-box-container">
                                    <div className="code-header">
                                        <button 
                                            className="execute-btn"
                                            onClick={() => executeCode(index, item.plain_code)}
                                        >
                                            Execute
                                        </button>
                                    </div>
                                    <pre className="code-box">
                                        <code dangerouslySetInnerHTML={{ __html: item.content }} />
                                    </pre>
                                    {outputs[index] && (
                                        <div className="output-box">
                                            <strong>Output:</strong>
                                            <pre>{outputs[index]}</pre>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="theory-text">Unknown type: {item.content}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PythonClass;
