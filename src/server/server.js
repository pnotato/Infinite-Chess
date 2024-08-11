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
    socket.on('getRooms', () => {
        socket.emit('roomsList', rooms);
    });

    socket.on('createRoom', ({ username }) => {
        const roomCode = `room-${Math.floor(Math.random() * 10000)}`;
        rooms[roomCode] = {
            players: [],
            board: null,
        };

        io.to(socket.id).emit('roomCreated', { roomCode });
        io.emit('roomsList', rooms);
    });

    socket.on('joinRoom', ({ roomCode, username }) => {
        if (rooms[roomCode] && rooms[roomCode].players.length <= 2) {
            socket.join(roomCode);
            rooms[roomCode].players.push({ id: socket.id, username });
 
            io.emit('roomsList', rooms);
            io.to(roomCode).emit('joinedRoom', { room: rooms[roomCode] });
        }
    });

    socket.on('loadedRoom', ({ roomCode }) => {
        if (rooms[roomCode] && rooms[roomCode].players.length >= 2) {
            io.to(roomCode).emit('newGame');
        }
    });

    socket.on('updateBoard', ({ roomCode, newBoard }) => {
        const room = rooms[roomCode];
        if (room) {
            room.board = newBoard;
            io.to(roomCode).emit('updateBoard', { newBoard });
        }
    });

    socket.on('playerLeft', ({ roomCode }) => {
        console.log('player left:', roomCode);
        const room = rooms[roomCode];
        if (room) {
            room.players = room.players.filter(player => player.id !== socket.id);
            io.to(roomCode).emit('updateRoom', { room });
        }
    });

    socket.on('disconnect', () => {
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            const playerIndex = room.players.findIndex(player => player.id === socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                io.to(roomCode).emit('updateRoom', { room });
                if (room.players.length === 0) {
                    delete rooms[roomCode];
                    io.emit('roomsList', Object.keys(rooms));
                }
            }
        }
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
