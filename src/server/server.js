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

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    socket.on('joinRoom', ({ roomCode, username }) => {
        socket.join(roomCode);
    
        if (!rooms[roomCode]) {
            rooms[roomCode] = {
                players: [],
                board: null,
            };

            
        }
        io.to(roomCode).emit('newGame', { roomCode });
        rooms[roomCode].players.push({ id: socket.id, username });
        io.to(roomCode).emit('joinedRoom', { roomCode, players: rooms[roomCode].players });
    
        console.log(`${username} joined room ${roomCode}`);
    });

    socket.on('updateBoard', ({ roomCode, newBoard }) => {
        console.log('received board:', newBoard);
        // Update the game state
        const room = rooms[roomCode];
        if (room) {
            room.board = newBoard;

            // Broadcast the updated board state to all players in the room
            //console.log('updating board:', board);
            io.to(roomCode).emit('updateBoard', { newBoard });
        }
    });

    socket.on('makeMove', ({ roomCode, move }) => {
        // Update the game state
        const room = rooms[roomCode];
        if (room) {
            // Apply the move to the board state
            // Assuming `move` contains from and to positions and handles the update
            const { from, to } = move;

            const piece = room.board.getPiece(from.x, from.y);
            if (piece) {
                piece.move(to.x, to.y);
            }

            // Broadcast the updated board state to all players in the room
            io.to(roomCode).emit('updateBoard', { board: room.board });
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
        // Handle player disconnection, update room state accordingly
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
