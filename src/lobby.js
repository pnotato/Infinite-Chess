import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import RoomPopup from './RoomPopup'; // Import the new RoomPopup component
import './lobby.css';
import socket from './chess/socket';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Button } from '@mui/material';

//const socket = io('http://localhost:3000');

function Lobby() {
    const [rooms, setRooms] = useState([]);  // List of open rooms
    const [username, setUsername] = useState('');
    const [currentRoom, setCurrentRoom] = useState(null); // Track the current room popup state

    useEffect(() => {
        // Fetch initial list of open rooms
        socket.emit('getRooms');

        // Update the list of open rooms
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
                setCurrentRoom({ roomCode, isHost: false }); // Show the room popup as a participant
            } else {
                alert('Room is full');
            }
        }
    };

    const createRoom = () => {
        if (username) {
            socket.emit('createRoom', { username });
            socket.on('roomCreated', ({ roomCode }) => {
                setCurrentRoom({ roomCode, isHost: true }); // Show the room popup as the host
            });
        }
    };

    const startGame = (roomCode) => {
        socket.emit('redirect', { roomCode });
    };

    const refreshRooms = () => {
        socket.emit('getRooms');
    }

    return (
        <div className="lobby-container">
            {!currentRoom &&
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
                                <button onClick={() => joinRoom(roomCode)} className="join-button">Join</button>
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
            {currentRoom && (
                <RoomPopup 
                    roomCode={currentRoom.roomCode} 
                    isHost={currentRoom.isHost} 
                    username={username}
                    startGame={startGame}
                />
            )}
        </div>
    );
}

export default Lobby;
