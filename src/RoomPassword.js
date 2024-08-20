import React, { useState } from 'react';
import './roomPassword.css';

function RoomPassword({ onSubmit, onCancel }) {
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(password);
    };

    return (
        <div className="room-password">
            <h2>Enter Room Password</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Room Password"
                />
                <button type="submit">Submit</button>
            </form>
            <button onClick={onCancel}>Cancel</button>
        </div>
    );
}

export default RoomPassword;