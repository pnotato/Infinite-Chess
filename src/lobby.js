import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ChessboardComponent from './chess/components/chessboardComponent';
import './lobby.css';  // Assuming you have a CSS file for styling

const socket = io('http://localhost:3000');

function Lobby() {
    const [rooms, setRooms] = useState([]);  // List of open rooms
    const [username, setUsername] = useState('');
    const [currentRoom, setCurrentRoom] = useState(null);
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        // Fetch initial list of open rooms
        socket.emit('getRooms');
        
        // Update the list of open rooms
        socket.on('roomsList', (availableRooms) => {
            console.log('roomsList:', availableRooms);
            setRooms(availableRooms);
        });

        // this player joined a room
        socket.on('joinedRoom', ({ roomCode, players }) => {
            setCurrentRoom(roomCode);
            setPlayers(players);
        });

        // new player joined the room
        socket.on('playerJoined', ({ players }) => {
            setPlayers(players);
        });

        // a player left the room
        socket.on('playerLeft', ({ players }) => {
            setPlayers(players);
        });

        return () => {
            socket.off('roomsList');
            socket.off('joinedRoom');
            socket.off('playerJoined');
            socket.off('playerLeft');
        };
    }, []);

    const joinRoom = (roomCode) => {
        if (username) {
            socket.emit('joinRoom', { roomCode, username });
        }
    };

    const createRoom = () => {
        if (username) {
            socket.emit('createRoom', { username });
        }
    };

    return (
        <div className="lobby-container">
            {currentRoom ? (
                <div className="room-container">
                    <h2>Room: {currentRoom}</h2>
                    <div className="players-list">
                        <h3>Players ({players.length})</h3>
                        <ul>
                            {players.map((player, index) => (
                                <li key={index}>{player.username}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="chessboard-container">
                        <ChessboardComponent roomCode={currentRoom} />
                    </div>
                </div>
            ) : (
                <div className="lobby">
                    <h1>Join a Chess Room</h1>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter Username"
                        className="input-field"
                    />
                    <div className="rooms-list">
                        <h2>Available Rooms</h2>
                        {rooms.length > 0 ? (
                            rooms.map((room, index) => (
                                <div key={index} className="room-item">
                                    <span>{room}</span>
                                    <button onClick={() => joinRoom(room)} className="join-button">Join</button>
                                </div>
                            ))
                        ) : (
                            <p>No rooms available. Create a new one!</p>
                        )}
                    </div>
                    <button onClick={createRoom} className="create-button">Create New Room</button>
                </div>
            )}
        </div>
    );
}

export default Lobby;