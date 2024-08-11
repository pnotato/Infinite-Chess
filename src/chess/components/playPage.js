import ChessboardComponent from "./chessboardComponent";
import { useEffect, useState } from "react";

import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

function PlayPage() {
    const [roomCode, setRoomCode] = useState(sessionStorage.getItem('roomCode'));
    const [username, setUsername] = useState(sessionStorage.getItem('username'));

    useEffect(() => {
        sessionStorage.removeItem('roomCode');
        sessionStorage.removeItem('username');

        if (!roomCode || !username) {
            window.location.href = '/';
        }
    });

    return (
        <div>
            {(roomCode && username) && 
            <ChessboardComponent roomCode={roomCode} username={username} />}
        </div>
    );
}

export default PlayPage;