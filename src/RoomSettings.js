import React, { useState } from 'react';
import './roomSettings.css';

function RoomSettings({ username, onCreateRoom, onCancel }) {
    const [roomName, setRoomName] = useState(`${username}'s Room`);
    const [password, setPassword] = useState('');
    const [allowSpectators, setAllowSpectators] = useState(false);

    const handleCreateRoom = () => {
        const settings = {
            roomName,
            password: password || null,
            allowSpectators,
        };
        onCreateRoom(settings);
    };

    return (
        <div className="room-settings">
            <h2>Create a New Room</h2>
            <div className="settings-form">
                <label>
                    Room Name:
                    <input
                        type="text"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="Enter Room Name"
                    />
                </label>
                <label>
                    Room Password (Optional):
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Password"
                    />
                </label>
                <label>
                    Allow Spectators:
                    <input
                        type="checkbox"
                        checked={allowSpectators}
                        onChange={(e) => setAllowSpectators(e.target.checked)}
                    />
                </label>
                <div className="settings-buttons">
                    <button onClick={handleCreateRoom} className="create-button">Create Room</button>
                    <button onClick={onCancel} className="cancel-button">Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default RoomSettings;
