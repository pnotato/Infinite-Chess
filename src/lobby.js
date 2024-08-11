import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ChessboardComponent from './chess/components/chessboardComponent';
import './lobby.css';

const socket = io('http://3.149.237.145:3000');

function Lobby() {
    const [rooms, setRooms] = useState([]);  // List of open rooms
    const [username, setUsername] = useState('');

    useEffect(() => {
        // Fetch initial list of open rooms
        socket.emit('getRooms');

        // Update the list of open rooms
        socket.on('roomsList', (rooms) => {
            setRooms(rooms);
        });

        // room is created and ready to join
        socket.on('roomCreated', ({ roomCode }) => {
            goToRoom(roomCode);
        });

        return () => {
            socket.off('roomsList');
            socket.off('roomCreated');
        };
    }, []);

    const joinRoom = (roomCode) => {
        if (username) {
            if (rooms[roomCode].players.length < 2) {
                goToRoom(roomCode);
            }
            else {
                alert('Room is full');
            }
        }
    };

    const createRoom = () => {
        if (username) {
            socket.emit('createRoom', { username });
        }
    };

    function goToRoom(roomCode) {
        sessionStorage.setItem('roomCode', roomCode);
        window.location.href = '/play';
    }

    return (
        <div className="lobby-container">
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
                                <span>{roomCode}</span>
                                <span>Players: {rooms[roomCode].players.length}</span>
                                <button onClick={() => joinRoom(roomCode)} className="join-button">Join</button>
                            </div>
                        ))
                    ) : (
                        <p>No rooms available. Create a new one!</p>
                    )}
                </div>
                <button onClick={createRoom} className="create-button">Create New Room</button>
            </div>
        </div>
    );
}

export default Lobby;