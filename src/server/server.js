const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3001', // Client origin
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
    }
});

let rooms = {}; // Store game states per room

app.use(cors({
    origin: 'http://localhost:3001', // Replace with the origin of your front-end
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

// Add a new listener for fetching rooms and creating rooms
io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    socket.on('getRooms', () => {
        const availableRooms = Object.keys(rooms);
        socket.emit('roomsList', availableRooms);
    });

    socket.on('createRoom', ({ username }) => {
        const roomCode = `room-${Math.floor(Math.random() * 10000)}`;
        rooms[roomCode] = {
            players: [],
            board: null,
        };
        socket.join(roomCode);
        rooms[roomCode].players.push({ id: socket.id, username });
        io.to(roomCode).emit('joinedRoom', { roomCode, players: rooms[roomCode].players });
        io.emit('roomsList', Object.keys(rooms)); // Update the list of rooms for everyone
        console.log(`${username} created and joined room ${roomCode}`);
    });

    socket.on('joinRoom', ({ roomCode, username }) => {
        if (rooms[roomCode] && rooms[roomCode].players.length < 4) {
            socket.join(roomCode);
            io.to(roomCode).emit('newGame', { roomCode });
            rooms[roomCode].players.push({ id: socket.id, username });
            io.to(roomCode).emit('joinedRoom', { roomCode, players: rooms[roomCode].players });
            console.log(`${username} joined room ${roomCode}`);
        }
    });

    socket.on('updateBoard', ({ roomCode, newBoard }) => {
        console.log('received board:', newBoard);
        const room = rooms[roomCode];
        if (room) {
            room.board = newBoard;
            io.to(roomCode).emit('updateBoard', { newBoard });
        }
    });

    socket.on('disconnect', () => {
        console.log('a user disconnected:', socket.id);
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            const playerIndex = room.players.findIndex(player => player.id === socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                io.to(roomCode).emit('playerLeft', { players: room.players });
                if (room.players.length === 0) {
                    delete rooms[roomCode];
                    io.emit('roomsList', Object.keys(rooms)); // Update the list of rooms for everyone
                }
            }
        }
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});