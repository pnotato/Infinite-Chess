import React, { useState, useEffect } from 'react';
import chessboard from '../classes/chessboard.tsx';
import chesspiece from '../classes/chesspiece.tsx';
import cell from '../classes/cell.tsx';
import './chessboardComponent.css';
import colors from '../enums/colors.tsx';
import status from '../enums/status.tsx';
import PieceComponent from './pieceComponent';
import getResponse from '../helper-funcs/getResponse.tsx';
import { io } from 'socket.io-client';
import PieceDisplay from './pieceDisplay.js';
import PieceGrid from './pieceGrid.js';
import socket from '../socket.js';
import { Grid, Paper, Typography, Button, Drawer, Box, CircularProgress } from '@mui/material';

import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import zIndex from '@mui/material/styles/zIndex';

//random delays
const animationDelays = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => Math.random() * 5));

//wave delays
//const animationDelays = Array.from({ length: 8 }, (_, i) => Array.from({ length: 8 }, (_, j) => (i + j) * 1));

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
    const [isSpectator, setIsSpectator] = useState(false);

    let id = null;

    useEffect(() => {
        if (roomInfo && opponentName === null) {
            const opponent = roomInfo.players.find(player => player.username !== username);
            setOpponentName(opponent.username);
        }

        if (roomInfo && roomInfo.spectators.some(spectator => spectator.username === username)) {
            setIsSpectator(true);
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

            if (!isSpectator) {
                if (turn === id) {
                    setColor(prevColor => {
                        console.log("White");
                        return colors.WHITE;
                    })
                } else {
                    setColor(prevColor => {
                        console.log("Black");
                        return colors.BLACK;
                    })
                }
            }
            else {
                setColor(prevColor => {
                    console.log("Spectator");
                    return colors.SPECTATOR;
                })
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
        //socket.emit('joinRoom', { roomCode, username });
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

        if (loadingCell || gameOver) {
            return;
        }

        if (cell.piece) {
            setPreviewedPiece(cell.piece);
            console.log(cell.piece);
        }

        if (selectedPiece && cell) {
            // Ensure that selectedPiece and its statusEffects are defined before accessing them
            if (cell.piece && cell.piece.color === selectedPiece.color && !selectedPiece.traits.some(trait => trait === 8)) {
                selectPiece(cell);
            } else if ((cell.piece || selectedPiece.traits.some(trait => trait === 9)) && isYourTurn()) {
                let attacked = selectedPiece.attack(cell, newBoard);
                socket.emit('updateBoard', { roomCode, newBoard });
                if (attacked) {
                    setSelectedCell(cell);
                    setGameOver(newBoard.isGameOver);
                    if (newBoard.isGameOver === true) {
                        setWinner(newBoard.winner);
                        socket.emit('gameOver', { roomCode, winner: newBoard.winner });
                        console.log("Game Over: " + newBoard.winner);
                    }

                    socket.emit('changeTurn', { roomCode });
                }

                deselectPiece();
            } else if (isYourTurn()) {
                let moved = selectedPiece.move(cell.x, cell.y, newBoard);
                socket.emit('updateBoard', { roomCode, newBoard });
                if (moved) {
                    setSelectedCell(cell);
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

        if (selectedCell !== cell) {
            setSelectedCell(cell);
        }
        else {
            setSelectedCell(null);
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
        setSelectedCell(null);
        setValidMoves([]);
        setValidAttacks([]);

        setPieceNameInput("");
    };

    const handlePieceNameChange = async () => {
        if (selectedPiece && pieceNameInput && isYourTurn()) {
            setLoadingCell(selectedCell);

            const response = await getResponse(pieceNameInput);
            const data = JSON.parse(response);

            let statusEffect = null;
            if (data.statusEffect) {
                statusEffect = data.statusEffect;
            }

            let summonedPiece = null;
            if(data.summonedPiece) {
                const response2 = await getResponse(data.summonedPiece);
                const data2 = JSON.parse(response2);
                summonedPiece = data2;
                summonedPiece.name = data.summonedPiece;
            }

            selectedPiece.updateInfo({
                name: pieceNameInput,
                emoji: data.emoji,
                movement: data.movement,
                attack: data.attack,
                traits: data.traits,
                description: "",
                statusEffect: statusEffect,
                summonedPiece: summonedPiece
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

    function RenderCell({ cell }) {
        const [{ isDragging }, drag] = useDrag(() => ({
            type: 'PIECE',
            item: { piece: cell.piece },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }), [cell]);

        const [{ isOver }, drop] = useDrop(() => ({
            accept: 'PIECE',
            drop: (item) => handleCellClick(cell),
            collect: (monitor) => ({
                isOver: monitor.isOver(),
            }),
        }), [cell]);

        const canDrag = cell.piece && cell.piece.color === color && isYourTurn() && !loadingCell && !gameOver;

        const statusEffectEmojis = [];
        if (cell.piece) {
            cell.piece.statusEffects.forEach(status => {
                statusEffectEmojis.push(status.emoji);
            })
        }

        return (
            <div
                ref={drop}
                className={`cell cell-${cell.x}-${cell.y} ${cell.color === colors.BLACK ? 'black' : 'white'}`}
                onMouseDown={() => handleCellClick(cell)}
                onMouseEnter={() => handleMouseEnter(cell)}
                onMouseLeave={handleMouseLeave}
                style={{ position: 'relative', color: `${cell.piece ? (cell.piece.color === colors.BLACK ? 'black' : 'white') : 'white'}` }}
            >
                {cell.piece &&
                    (<div className={`color-indicator-${cell.piece.color === colors.BLACK ? 'black' : 'white'}`}></div>)
                }
                <PieceComponent piece={cell.piece} canDrag={canDrag} />
                {validMoves.some(move => move.x === cell.x && move.y === cell.y) && (
                    <div className="highlight-circle move"></div>
                )}
                {validAttacks.some(attack => attack.x === cell.x && attack.y === cell.y) && (
                    <div className="highlight-circle attack"></div>
                )}
                {(hoveredCell === cell && cell.piece) && (
                    <div className="cell-popup">
                        {`${cell.piece.color === colors.BLACK ? "Black" : "White"} ${cell.piece.name} (${cell.x}, ${cell.y})`}
                    </div>
                )}
                <div className="status-effects">
                    {statusEffectEmojis.map(emoji => (
                        <div className="status-effect">{emoji}</div>
                    ))}
                </div>
            </div>
        );
    }

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const transposedBoard = board?.cells.length > 0
        ? board.cells[0].map((_, colIndex) => board.cells.map(row => row[colIndex]))
        : [];

    return (
        <DndProvider backend={HTML5Backend}>
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
                                        {isSpectator ? "Spectating" :
                                            (gameOver ? "Game Over! You " + (winner === color ? "Win!" : "Lose") : "Current Turn: " + (color === currentTurn ? "Your Turn" : "Opponent's Turn"))
                                        }
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
                                                        {/* <div className="rank-label">{color === colors.WHITE ? 8 - rowIndex : rowIndex + 1}</div> */}
                                                        {(color === colors.WHITE ? row : row.slice().reverse()).map((cell, colIndex) => (
                                                            <>
                                                                <div className="cell-3d" style={{ animationDelay: `${animationDelays[rowIndex][colIndex]}s` }}>
                                                                    <div
                                                                        key={`${colIndex}-${rowIndex}-copy`}
                                                                        className={`cell cell-${cell.x}-${cell.y} ${cell.color === colors.BLACK ? 'black-copy' : 'white-copy'}`}
                                                                        style={{ position: 'absolute', marginTop: '1vw', zIndex: -1 }}
                                                                    >
                                                                    </div>
                                                                    <RenderCell cell={cell} />
                                                                    {loadingCell === cell && (
                                                                        <CircularProgress style={{ position: 'absolute', top: '25%', left: '25%', zIndex: 6 }} />
                                                                    )}
                                                                </div>
                                                            </>
                                                        ))}
                                                    </div>
                                                ))}
                                                {/* <div className="file-labels">
                                                    {color === colors.WHITE ? files.map((file, index) => (
                                                        <div key={index} className="file-label">{file}</div>
                                                    )) : files.slice().reverse().map((file, index) => (
                                                        <div key={index} className="file-label">{file}</div>
                                                    ))}
                                                </div> */}
                                            </div>
                                            <div className="opponent-info">
                                                <Typography variant="h6" style={{ marginTop: '20px' }}>{username} (You)</Typography>
                                            </div>
                                        </div>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Piece Display (1/4 of the screen on the right) */}
                        <div className="information-component">
                            <Box flex={1} display="flex" flexDirection='column' justifyContent="center" alignItems="center">
                                {previewedPiece && <PieceDisplay piece={previewedPiece} rename={setPieceNameInput} handlePieceNameChange={handlePieceNameChange} />}
                                {/* {selectedPiece && isYourTurn() && (
                                    <Box display='flex' position='absolute' flexDirection='column' style={{ zIndex: '5', top: '35vh'}}>
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
                                )} */}
                            </Box>
                        </div>
                    </Box>
                ) : <CircularProgress />}
            </div>
        </DndProvider>
    );
};

export default ChessboardComponent;