import React, { useEffect, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import ChessboardComponent from './chessboardComponent';
import Header from './header';

function PlayPage() {
    const [roomCode, setRoomCode] = useState(sessionStorage.getItem('roomCode'));
    const [username, setUsername] = useState(sessionStorage.getItem('username'));

    useEffect(() => {
        sessionStorage.removeItem('roomCode');
        sessionStorage.removeItem('username');

        if (!roomCode || !username) {
            window.location.href = '/';
        }
    }, [roomCode, username]);

    return (
        <>
            {roomCode && username && (
                <Box width='100%'>
                    <Header />
                    <ChessboardComponent roomCode={roomCode} username={username} />
                </Box>
            )}
        </>
    );
}

export default PlayPage;
