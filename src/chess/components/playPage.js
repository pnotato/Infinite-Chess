import ChessboardComponent from "./chessboardComponent";
import { useEffect, useState } from "react";

function PlayPage() {
    let roomCode = sessionStorage.getItem('roomCode');
    let username = sessionStorage.getItem('username');

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