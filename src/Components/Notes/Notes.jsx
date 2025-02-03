// src/components/Notes.js
import React, { useState } from 'react';
import './Notes.css';  // Import the CSS file

const Notes = () => {
    // Example notes data
    const [notes, setNotes] = useState([
        { title: 'Note Title 1', content: 'This is an excerpt from the note...' },
        { title: 'Note Title 2', content: 'This is another excerpt from the note...' },
        { title: 'Note Title 3', content: 'Further note content goes here...' },
    ]);

    const [searchQuery, setSearchQuery] = useState('');

    // Filter notes based on the search query
    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="notes-container">
            <section id="notes-section">
                <h2>Previously Generated Notes</h2>
                <input 
                    type="text" 
                    id="search-bar" 
                    placeholder="Search notes..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
                <div className="notes-list">
                    {filteredNotes.length > 0 ? (
                        filteredNotes.map((note, index) => (
                            <div className="note-card" key={index}>
                                <h3>{note.title}</h3>
                                <p>{note.content}</p>
                            </div>
                        ))
                    ) : (
                        <p>No notes found.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Notes;
