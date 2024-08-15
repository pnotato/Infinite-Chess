import React, { useState, useEffect } from 'react';
import chessboard from '../classes/chessboard.tsx';
import chesspiece from '../classes/chesspiece.tsx';
import cell from '../classes/cell.tsx';
import './chessboardComponent.css';
import colors from '../enums/colors.tsx';
import PieceComponent from './pieceComponent';
import getResponse from '../helper-funcs/getResponse.tsx';
import { io } from 'socket.io-client';
import PieceDisplay from './pieceDisplay.js';
import PieceGrid from './pieceGrid.js';

import socket from '../socket.js';

import { Grid, Paper, Typography, Button, Drawer, Box, CircularProgress } from '@mui/material';

//create an 8x8 array of random animation delays
const animationDelays = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => Math.random() * 5));

const ChessboardComponent = ({ roomCode, username }) => {
    const [board, setBoard] = useState(null);
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [selectedCell, setSelectedCell] = useState(null);
    const [validMoves, setValidMoves] = useState([]);
    const [validAttacks, setValidAttacks] = useState([]);
    const [hoveredCell, setHoveredCell] = useState(null);
    const [pieceNameInput, setPieceNameInput] = useState("");
    const [roomInfo, setRoomInfo] = useState(null);
    const [color, setColor] = useState(null);
    const [currentTurn, setCurrentTurn] = useState(colors.WHITE);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [votedRematch, setVotedRematch] = useState(false);
    const [numVotes, setNumVotes] = useState(0);
    const [previewedPiece, setPreviewedPiece] = useState(null);
    const [refreshGrid, setRefreshGrid] = useState(false);
    const [loadingCell, setLoadingCell] = useState(null);
    const [opponentName, setOpponentName] = useState(null);

    let id = null;

    useEffect(() => {
        if (roomInfo && opponentName === null) {
            const opponent = roomInfo.players.find(player => player.username !== username);
            setOpponentName(opponent.username);
        }
    }, [roomInfo]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            socket.emit('playerLeft', { roomCode });
            socket.disconnect();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        socket.on('newGame', ({ turn }) => {
            setVotedRematch(false);
            setGameOver(false);
            setWinner(null);
            setCurrentTurn(colors.WHITE);
            setNumVotes(0);
            setSelectedCell(null);
            setSelectedPiece(null);
            setValidMoves([]);
            setValidAttacks([]);

            setPieceNameInput("");

            if (turn === id) {
                setColor(prevColor => {
                    return colors.WHITE;
                })
                console.log("You are white");
            } else {
                setColor(prevColor => {
                    return colors.BLACK;
                })
                console.log("You are black");
            }

            const newBoard = new chessboard();
            newBoard.standardSetup();
            setBoard(newBoard);

            setPreviewedPiece(newBoard.cells[0][0].piece);

            socket.emit('updateBoard', { roomCode, newBoard });
        });

        socket.on('getID', ({ playerID }) => {
            id = playerID;
        });

        socket.on('updateBoard', ({ newBoard }) => {
            const hydratedBoard = rehydrateBoard(newBoard);
            setBoard(hydratedBoard);
        });

        socket.on('changeTurn', () => {
            setCurrentTurn(prevTurn => {
                const newTurn = prevTurn === colors.WHITE ? colors.BLACK : colors.WHITE;
                return newTurn;
            });
        });

        socket.on('updateVotes', ({ votes }) => {
            setNumVotes(votes);
        });

        socket.on('joinedRoom', ({ room }) => {
            setRoomInfo(room);
        });

        socket.on('updateRoom', ({ room }) => {
            setRoomInfo(room);
        });

        socket.on('gameOver', ({ winner }) => {
            setGameOver(true);
            setWinner(winner);
        });

        socket.emit('getID', {});
        socket.emit('joinRoom', { roomCode, username });
        socket.emit('loadedRoom', { roomCode });

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            socket.off('newGame');
            socket.off('getID');
            socket.off('updateBoard');
            socket.off('changeTurn');
            socket.off('updateVotes');
            socket.off('joinedRoom');
            socket.off('updateRoom');
            socket.off('gameOver');
        };
    }, [roomCode, id, username]);

    const rehydrateBoard = (boardData) => {
        const hydratedBoard = Object.assign(new chessboard(), boardData);

        hydratedBoard.cells = hydratedBoard.cells.map(row => {
            return row.map(cellData => {
                const hydratedCell = Object.assign(new cell(), cellData);
                if (hydratedCell.piece) {
                    hydratedCell.piece = Object.assign(new chesspiece(), hydratedCell.piece);
                }
                return hydratedCell;
            });
        });

        return hydratedBoard;
    };

    const isYourTurn = () => {
        return color === currentTurn;
    };

    const handleCellClick = (cell) => {
        let newBoard = board;
        setSelectedCell(cell);

        if (cell.piece) {
            setPreviewedPiece(cell.piece);
            console.log(cell.piece);
        }

        if (selectedPiece && cell) {
            if (cell.piece && cell.piece.color === selectedPiece.color) {
                selectPiece(cell);
            } else if (cell.piece && cell.piece.color !== selectedPiece.color && isYourTurn()) {
                let attacked = selectedPiece.attack(cell.piece, newBoard);
                socket.emit('updateBoard', { roomCode, newBoard });
                if (attacked) {
                    setGameOver(newBoard.isGameOver);
                    if (newBoard.isGameOver === true) {
                        socket.emit('gameOver', { roomCode, winner: color });
                        console.log("Game Over");
                    }

                    socket.emit('changeTurn', { roomCode });
                }

                deselectPiece();
            } else if (isYourTurn()) {
                let moved = selectedPiece.move(cell.x, cell.y, newBoard);
                socket.emit('updateBoard', { roomCode, newBoard });
                if (moved) {
                    socket.emit('changeTurn', { roomCode });
                }
                deselectPiece();
            } else {
                deselectPiece();
            }
            setBoard(newBoard);
        } else {
            if (cell.piece && cell.piece.color === color) {
                selectPiece(cell);
            }
        }
    };

    const handleMouseEnter = (cell) => {
        setHoveredCell(cell);
    };

    const handleMouseLeave = () => {
        setHoveredCell(null);
    };

    const selectPiece = (cell) => {
        const piece = Object.assign(new chesspiece(), cell.piece);
        piece.getValidMoves(board);
        piece.getValidAttacks(board);
        setSelectedPiece(piece);
        setValidMoves(piece.validMoves || []);
        setValidAttacks(piece.validAttacks || []);

        setPieceNameInput(piece.name);
    };

    const deselectPiece = () => {
        setSelectedPiece(null);
        setValidMoves([]);
        setValidAttacks([]);

        setPieceNameInput("");
    };

    const handlePieceNameChange = async () => {
        if (selectedPiece && pieceNameInput && isYourTurn()) {
            setLoadingCell(selectedCell);

            const response = await getResponse(pieceNameInput);
            const data = JSON.parse(response);

            selectedPiece.updateInfo({
                name: pieceNameInput,
                emoji: data.emoji,
                movement: data.movement,
                attack: data.attack,
                traits: data.traits,
                description: data.description
            }, board);

            const storedPieces = JSON.parse(localStorage.getItem('createdPieces')) || [];
            storedPieces.push(selectedPiece);
            localStorage.setItem('createdPieces', JSON.stringify(storedPieces));

            setLoadingCell(null);
            setPreviewedPiece(selectedPiece);

            const newBoard = board;
            socket.emit('updateBoard', { roomCode, newBoard });
            socket.emit('changeTurn', { roomCode });

            setValidAttacks(selectedPiece.validAttacks || []);
            setValidMoves(selectedPiece.validMoves || []);

            // Trigger refresh for PieceGrid
            setRefreshGrid(prev => !prev);
        }
    };

    const handleBarracksPieceClick = (piece) => {
        setPreviewedPiece(piece);
    };

    const rematch = () => {
        socket.emit('voteRematch', { roomCode });
        setVotedRematch(true);
    };

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const transposedBoard = board?.cells.length > 0
        ? board.cells[0].map((_, colIndex) => board.cells.map(row => row[colIndex]))
        : [];

    return (
        <div>
            {board ? (
                <Box display="flex">
                    {/* Piece Grid (1/4 of the screen on the left) */}
                    <div className="barracks-component">
                        <Box flex={1} display="flex" justifyContent="center" alignItems="center" sx={{ backgroundColor: 'transparent', zIndex: 5 }}>
                            <PieceGrid onPieceClick={handleBarracksPieceClick} refreshGrid={refreshGrid} setRefreshGrid={setRefreshGrid} />
                        </Box>
                    </div>

                    {/* Chessboard (1/2 of the screen in the center) */}
                    <Box flex={2} display="flex" justifyContent="center" alignItems="center">
                        <Grid container>
                            <Grid item xs={12}>
                                <Typography variant="h6" color={'white'}>
                                    {gameOver ? "Game Over! You " + (winner ? "Win!" : "Lose") : "Current Turn: " + (color === currentTurn ? "Your Turn" : "Opponent's Turn")}
                                </Typography>

                                {gameOver && (
                                    <Button variant="contained" color="primary" onClick={rematch} disabled={votedRematch}>
                                        {votedRematch ? "Waiting for other player..." : "Rematch"}
                                        {numVotes > 0 && ` (${numVotes}/2)`}
                                    </Button>
                                )}

                                <Box p={2}>
                                    <div className="chessboard-container">
                                        <div className="opponent-info">
                                            <Typography variant="h6">{opponentName} (Opponent)</Typography>
                                        </div>
                                        <div className="chessboard">
                                            {(color === colors.WHITE ? transposedBoard.slice().reverse() : transposedBoard).map((row, rowIndex) => (
                                                <div key={rowIndex} className="row">
                                                    <div className="rank-label">{color === colors.WHITE ? 8 - rowIndex : rowIndex + 1}</div>
                                                    {(color === colors.WHITE ? row : row.slice().reverse()).map((cell, colIndex) => (
                                                        <>
                                                            <div className="cell-3d" style={{ animationDelay: `${animationDelays[rowIndex][colIndex]}s` }}>
                                                                <div
                                                                    key={`${colIndex}-${rowIndex}-copy`}
                                                                    className={`cell cell-${cell.x}-${cell.y} ${cell.color === colors.BLACK ? 'black-copy' : 'white-copy'}`}
                                                                    style={{ position: 'absolute', marginTop: '20px', zIndex: -1 }}
                                                                >
                                                                </div>
                                                                <div
                                                                    key={`${colIndex}-${rowIndex}`}
                                                                    className={`cell cell-${cell.x}-${cell.y} ${cell.color === colors.BLACK ? 'black' : 'white'}`}
                                                                    onClick={() => handleCellClick(cell)}
                                                                    onMouseEnter={() => handleMouseEnter(cell)}
                                                                    onMouseLeave={handleMouseLeave}
                                                                    style={{ position: 'relative' }}
                                                                >
                                                                    {cell.piece &&
                                                                    (<div className={`color-indicator-${cell.piece.color === colors.BLACK ? 'black' : 'white'}`}></div>)
                                                                    }
                                                                    {loadingCell === cell && (
                                                                        <CircularProgress style={{ position: 'absolute', transform: 'translate(-50%, -50%)' }} />
                                                                    )}
                                                                    <PieceComponent piece={cell.piece} />
                                                                    {validMoves.some(move => move.x === cell.x && move.y === cell.y) && (
                                                                        <div className="highlight-circle move"></div>
                                                                    )}
                                                                    {validAttacks.some(attack => attack.x === cell.x && attack.y === cell.y) && (
                                                                        <div className="highlight-circle attack"></div>
                                                                    )}
                                                                    {hoveredCell === cell && cell.piece && (
                                                                        <div className="cell-popup">
                                                                            {`${cell.piece.color === colors.BLACK ? "Black" : "White"} ${cell.piece.name} (${cell.x}, ${cell.y})`}

                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </>
                                                    ))}
                                                </div>
                                            ))}
                                            <div className="file-labels">
                                                {color === colors.WHITE ? files.map((file, index) => (
                                                    <div key={index} className="file-label">{file}</div>
                                                )) : files.slice().reverse().map((file, index) => (
                                                    <div key={index} className="file-label">{file}</div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="opponent-info">
                                            <Typography variant="h6" style={{marginTop: '20px'}}>{username} (You)</Typography>
                                        </div>
                                    </div>
                                </Box>
                                {selectedPiece && isYourTurn() && (
                                    <Box>
                                        <input
                                            type="text"
                                            value={pieceNameInput}
                                            onChange={(e) => setPieceNameInput(e.target.value)}
                                            placeholder="Rename selected piece"
                                        />
                                        <Button variant="contained" color="primary" onClick={handlePieceNameChange}>
                                            Transform Piece
                                        </Button>
                                    </Box>
                                )}

                            </Grid>
                        </Grid>
                    </Box>

                    {/* Piece Display (1/4 of the screen on the right) */}
                    <div className="information-component">
                        <Box flex={1} display="flex" justifyContent="center" alignItems="center">
                            {previewedPiece && <PieceDisplay piece={previewedPiece} />}
                        </Box>
                    </div>
                </Box>
            ) : <CircularProgress />}
        </div>
    );
};

export default ChessboardComponent;