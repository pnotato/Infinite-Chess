import React, { useEffect, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import ChessboardComponent from './chessboardComponent';

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
        <Container maxWidth="lg">
            {roomCode && username && (
                <Box mt={4}>
                    <Typography variant="h4" align="center">Chess Game</Typography>
                    <ChessboardComponent roomCode={roomCode} username={username} />
                </Box>
            )}
        </Container>
    );
}

export default PlayPage;
