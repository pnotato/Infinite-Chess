import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import RoomSettings from './RoomSettings.js'; // Import the new RoomSettings component
import RoomPassword from './RoomPassword.js';
import RoomPopup from './RoomPopup.js';
import './lobby.css';
import socket from './chess/socket';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Button } from '@mui/material';

// const socket = io('http://localhost:3000');

function Lobby() {
    const [rooms, setRooms] = useState([]);
    const [username, setUsername] = useState('');
    const [currentRoom, setCurrentRoom] = useState(null);
    const [showSettings, setShowSettings] = useState(false); // Track whether to show the settings page
    const [showPassword, setShowPassword] = useState(false); // Track whether to show the password input
    const [roomCode, setRoomCode] = useState('');

    useEffect(() => {
        socket.emit('getRooms');
        socket.on('roomsList', (rooms) => {
            setRooms(rooms);
        });

        return () => {
            socket.off('roomsList');
        };
    }, []);

    const joinRoom = (roomCode) => {
        if (username) {
            if (rooms[roomCode].players.length < 2) {
                setCurrentRoom({ roomCode, isHost: false });
            } else {
                alert('Room is full');
            }
        }
    };

    const attemptToJoinRoom = (roomCode) => {
        if (rooms[roomCode].password) {
            // If the room has a password, show the password input
            setRoomCode(roomCode);
            setShowPassword(true);
        } else {
            // If the room does not have a password, join the room
            joinRoom(roomCode);
        }
    };

    const createRoom = () => {
        if (username) {
            setShowSettings(true); // Show the settings page
        }
    };

    const handleRoomCreation = (settings) => {
        setShowSettings(false);
        socket.emit('createRoom', { username, settings });
        socket.on('roomCreated', ({ roomCode }) => {
            setCurrentRoom({ roomCode, isHost: true });
        });
    };

    const startGame = (roomCode) => {
        socket.emit('redirect', { roomCode });
    };

    const refreshRooms = () => {
        socket.emit('getRooms');
    };

    return (
        <div className="lobby-container">
            {!currentRoom && !showSettings && !showPassword &&
            <div className="lobby">
                <h1>Join a Chess Room</h1>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                        sessionStorage.setItem('username', e.target.value);
                    }}
                    placeholder="Enter Username"
                    className="input-field"
                />
                <div className="rooms-list">
                    <h2>Available Rooms</h2>
                    {Object.keys(rooms).length > 0 ? (
                        Object.keys(rooms).map((roomCode, index) => (
                            <div key={index} className="room-item">
                                <span>{rooms[roomCode].name}</span>
                                <span>Players: {rooms[roomCode].players.length}</span>
                                <button onClick={() => attemptToJoinRoom(roomCode)} className="join-button">Join</button>
                            </div>
                        ))
                    ) : (
                        <p>No rooms available. Create a new one!</p>
                    )}
                </div>
                <Button onClick={createRoom} variant="contained" color="primary">
                    <p>Create New Room</p>
                </Button>
                <Button onClick={refreshRooms} variant="contained" color="primary">
                    <RefreshIcon />
                </Button>
            </div>}
            {showSettings && (
                <RoomSettings
                    username={username}
                    onCreateRoom={handleRoomCreation}
                    onCancel={() => setShowSettings(false)}
                />
            )}
            {currentRoom && (
                <RoomPopup 
                    roomCode={currentRoom.roomCode} 
                    isHost={currentRoom.isHost} 
                    username={username}
                    startGame={startGame}
                />
            )}
            {showPassword && (
                <RoomPassword
                    onSubmit={(password) => {
                        if (rooms[roomCode].password === password) {
                            joinRoom(roomCode);
                            setShowPassword(false);
                        } else {
                            alert('Incorrect password');
                        }
                    }}
                    onCancel={() => setShowPassword(false)}
                />
            )}
        </div>
    );
}

export default Lobby;
