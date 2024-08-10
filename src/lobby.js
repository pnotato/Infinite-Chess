import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ChessboardComponent from './chess/components/chessboardComponent';

const socket = io('http://localhost:3000');

function Lobby() {
    const [roomCode, setRoomCode] = useState('');
    const [username, setUsername] = useState('');
    const [currentRoom, setCurrentRoom] = useState(null);
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        // Listen for messages from the server

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
            socket.off('joinedRoom');
            socket.off('playerJoined');
            socket.off('playerLeft');
        };
    }, []);

    const joinRoom = () => {
        if (roomCode && username) {
            socket.emit('joinRoom', { roomCode, username });
        }
    };

    return (
        <div>
            <h1>Join a Chess Room</h1>
            {currentRoom ? (
                <div>
                    <ChessboardComponent roomCode={currentRoom} />
                </div>
            ) : (
                <div>
                    <input
                        type="text"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                        placeholder="Enter Room Code"
                    />
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter Username"
                    />
                    <button onClick={joinRoom}>Join Room</button>
                </div>
            )}
        </div>
    );
}

export default Lobby;
