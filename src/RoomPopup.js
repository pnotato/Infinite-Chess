import React, { useEffect, useState } from 'react';
import './roomPopup.css';
import socket from './chess/socket';
import { useNavigate } from 'react-router-dom';

function RoomPopup({ roomCode, isHost, username, startGame }) {
    const [roomInfo, setRoomInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        socket.emit('joinRoom', { roomCode, username });

        socket.on('joinedRoom', ({ room }) => {
            setRoomInfo(room);
        });

        socket.on('updateRoom', ({ room }) => {
            setRoomInfo(room);
        });

        socket.on('redirect', ({ roomCode }) => {
            sessionStorage.setItem('roomCode', roomCode);
            navigate('/play');
        });

        return () => {
            socket.off('joinedRoom');
            socket.off('updateRoom');
        };
    }, [roomCode, username]);

    return (
        <div className="room-popup">
            <h2>Room: {roomCode}</h2>
            {roomInfo && (
                <>
                    <h3>Players:</h3>
                    <ul>
                        {roomInfo.players.map((player, index) => (
                            <li key={index}>{player.username}</li>
                        ))}
                    </ul>
                    <h3>Spectators:</h3>
                    <ul>
                        {roomInfo.spectators ? roomInfo.spectators.map((spectator, index) => (
                            <li key={index}>{spectator.username}</li>
                        )) : ""}
                    </ul>
                    {isHost && roomInfo.players.length > 1 && (
                        <button onClick={() => startGame(roomCode)}>Start Game</button>
                    )}
                </>
            )}
            {!roomInfo && <p>Loading room info...</p>}
        </div>
    );
}

export default RoomPopup;
