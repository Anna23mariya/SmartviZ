// PythonClass.jsx
import React, { useState, useEffect, useRef } from "react";
import './PythonClass.css';
import './pygments-monokai.css';

const PythonClass = () => {
    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [transcription, setTranscription] = useState([]); // Stores the ordered transcription
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
                        throw new Error('Failed to upload audio');
                    }
    
                    const data = await response.json();
                    console.log("Transcription response:", data);
                    
                    // Add the new transcription with the correct type
                    setTranscription(prev => [...prev, { 
                        type: data.mode,  // Use the mode returned by the backend
                        content: data.transcription 
                    }]);
                    
                } catch (error) {
                    console.error('Error uploading audio:', error);
                    alert('Failed to process audio. Please try again.');
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
            // Stop all audio tracks
            mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
        }
    };

    // const toggleMode = () => {
    //     setCurrentMode(prevMode => prevMode === "code" ? "theory" : "code");
    // };

    useEffect(() => {
        if (recording || processing) {
            const interval = setInterval(() => {
                fetch("http://localhost:5000/programming/transcription")
                    .then(response => response.json())
                    .then(data => {
                        console.log("Received transcription data:", data);
                        if (data.transcription) {
                            setTranscription(data.transcription);
                        }
                        if (processing && data.status === "completed") {
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

    return (
        <div className="python-class-container">
            <h1>Live Python Code Transcription</h1>
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
                
                {/* <div className="mode-toggle">
                    <label className="mode-label">Current Mode: </label>
                    <button 
                        onClick={toggleMode} 
                        className={`mode-toggle-btn ${currentMode === "code" ? "code-mode" : "theory-mode"}`}
                        disabled={recording}
                    >
                        {currentMode === "code" ? "Code Mode" : "Theory Mode"}
                    </button>
                    <span className="mode-description">
                        {currentMode === "code" 
                            ? "(Recording will be processed as code)" 
                            : "(Recording will be processed as theory text)"}
                    </span>
                </div>
                 */}
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
                    <div key={index} className={`transcription-item ${item.type}`}>
                        {item.type === "code" ? (
                            <div dangerouslySetInnerHTML={{ __html: item.content }} />
                        ) : (
                            <div className="theory-content">
                                {item.content}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PythonClass;
// //PythonClass.jsx
// import React, { useState, useEffect, useRef } from "react";
// import './PythonClass.css';
// import './pygments-monokai.css';

// const PythonClass = () => {
//     const [recording, setRecording] = useState(false);
//     const [processing, setProcessing] = useState(false);
//     const [finalTranscript, setFinalTranscript] = useState(""); // Stores the highlighted HTML transcription
//     const mediaRecorder = useRef(null);
//     const audioChunks = useRef([]);

//     const startTranscription = async () => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//             mediaRecorder.current = new MediaRecorder(stream);
//             audioChunks.current = [];
    
//             mediaRecorder.current.ondataavailable = (event) => {
//                 audioChunks.current.push(event.data);
//                 console.log("Audio chunk added:", event.data);
//             };
    
//             mediaRecorder.current.onstop = async () => {
//                 const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
//                 const formData = new FormData();
//                 formData.append('audio_data', audioBlob);
    
//                 setProcessing(true);
    
//                 try {
//                     const response = await fetch('http://localhost:5000/programming/transcribe', {
//                         method: 'POST',
//                         body: formData,
//                     });
    
//                     if (!response.ok) {
//                         throw new Error('Failed to upload audio');
//                     }
    
//                     const data = await response.json();
//                     console.log("Transcription response:", data);
//                     setFinalTranscript(data.transcription);
//                 } catch (error) {
//                     console.error('Error uploading audio:', error);
//                     alert('Failed to process audio. Please try again.');
//                 } finally {
//                     setProcessing(false);
//                 }
//             };
    
//             mediaRecorder.current.start();
//             setRecording(true);
//             console.log("Recording started");
//         } catch (error) {
//             console.error('Error accessing microphone:', error);
//             alert('Failed to access microphone. Please check permissions.');
//         }
//     };

//     const stopTranscription = () => {
//         if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
//             mediaRecorder.current.stop();
//             setRecording(false);
//             // Stop all audio tracks
//             mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
//         }
//     };

//     useEffect(() => {
//         if (recording || processing) {
//             const interval = setInterval(() => {
//                 fetch("http://localhost:5000/programming/transcription")
//                     .then(response => response.json())
//                     .then(data => {
//                         console.log("Received transcription data:", data);
//                         if (data.transcription) {
//                             setFinalTranscript(data.transcription);
//                         }
//                         if (processing && data.status === "completed") {
//                             setProcessing(false);
//                         }
//                     })
//                     .catch(error => console.error("Error fetching transcription:", error));
//             }, 1000);
//             return () => clearInterval(interval);
//         }
//     }, [recording, processing]);
//     return (
//         <div className="python-class-container">
//             <h1>Live Python Code Transcription</h1>
//             <div>
//                 <button 
//                     className="python-class-start-btn" 
//                     onClick={startTranscription} 
//                     disabled={recording || processing}
//                 >
//                     {recording ? 'Recording...' : 'Start Transcription'}
//                 </button>
//                 <button 
//                     className="python-class-stop-btn" 
//                     onClick={stopTranscription} 
//                     disabled={!recording}
//                 >
//                     Stop Transcription
//                 </button>
//                 {recording && (
//                     <p className="mt-4 text-center text-red-500">Recording in progress...</p>
//                 )}
//                 {processing && (
//                     <div className="python-class-status">
//                         Transcribing...
//                     </div>
//                 )}
//             </div>
//             <h2>Transcribed Code:</h2>
//             {/* // In PythonClass.jsx, make sure dangerouslySetInnerHTML is used correctly */}
//             <div
//                 className="python-class-transcription-box"
//                 dangerouslySetInnerHTML={{ __html: finalTranscript || "Waiting for transcription..." }}
//             ></div>
//         </div>
//     );
// };

// export default PythonClass;
