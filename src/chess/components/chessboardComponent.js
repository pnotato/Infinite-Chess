import React, { useState, useEffect } from 'react';
import chessboard from '../classes/chessboard.tsx';
import chesspiece from '../classes/chesspiece.tsx';
import cell from '../classes/cell.tsx';
import './chessboardComponent.css';
import colors from '../enums/colors.tsx';
import PieceComponent from './pieceComponent';
import getResponse from '../helper-funcs/getResponse.tsx';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

const ChessboardComponent = ({ roomCode, username }) => {
    const [board, setBoard] = useState(null);
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [validMoves, setValidMoves] = useState([]);
    const [validAttacks, setValidAttacks] = useState([]);
    const [hoveredCell, setHoveredCell] = useState(null);
    const [pieceNameInput, setPieceNameInput] = useState("");
    const [roomInfo, setRoomInfo] = useState(null);
    const [color, setColor] = useState(null);
    const [currentTurn, setCurrentTurn] = useState(colors.WHITE);

    let id = null;

    useEffect(() => {
        socket.emit('getID', {});
        socket.emit('joinRoom', { roomCode, username });
        socket.emit('loadedRoom', { roomCode });

        socket.on('newGame', ({ turn }) => {
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


        socket.on('joinedRoom', ({ room }) => {
            setRoomInfo(room);
        });

        socket.on('updateRoom', ({ room }) => {
            setRoomInfo(room);
        });

        return () => {
            socket.emit('playerLeft', { roomCode });
            socket.off('updateBoard');
        };
    }, [roomCode]);

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
        if (selectedPiece && cell) {
            if (cell.piece && cell.piece.color === selectedPiece.color) {
                selectPiece(cell);
            } else if (cell.piece && cell.piece.color !== selectedPiece.color && isYourTurn()) {
                let attacked = selectedPiece.attack(cell.piece, newBoard);
                socket.emit('updateBoard', { roomCode, newBoard });
                if (attacked) {
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
        console.log(piece);
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
        if (selectedPiece && pieceNameInput) {
            const response = await getResponse(pieceNameInput);

            const data = JSON.parse(response);

            console.log("AI Response:", response);
            console.log("AI parsed data:", data);

            selectedPiece.updateInfo({
                name: pieceNameInput,
                emoji: data.emoji,
                movement: data.movement,
                attack: data.attack,
                traits: data.traits
            },
                board
            );

            const newBoard = board;
            socket.emit('updateBoard', { roomCode, newBoard });

            setValidAttacks(selectedPiece.validAttacks || []);
            setValidMoves(selectedPiece.validMoves || []);
        }
    };

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const transposedBoard = board?.cells.length > 0
        ? board.cells[0].map((_, colIndex) => board.cells.map(row => row[colIndex]))
        : [];

    return (
        <div>
            <div>
                {roomInfo &&
                    <div>
                        <h1>Players:</h1>
                        <ul>{roomInfo.players.map((user, index) => {
                            return <li key={`${user.username} ${index}`}>{user.username}</li>;
                        })}
                        </ul>
                        {color !== null && currentTurn !== null &&
                            <h1>{color === currentTurn ? "Your Turn" : "Opponent's Turn"}</h1>}
                    </div>}
            </div>
            <div className="chessboard-container">
                <div className="chessboard">
                    {color === colors.WHITE ?
                        transposedBoard.slice().reverse().map((row, rowIndex) => (
                            <div key={rowIndex} className="row">
                                <div className="rank-label">{color === colors.WHITE ? 8 - rowIndex : rowIndex + 1}</div>
                                {color === colors.WHITE ?
                                    row.map((cell, colIndex) => (
                                        <div
                                            key={`${colIndex}-${rowIndex}`}
                                            className={`cell cell-${cell.x}-${cell.y} ${cell.color === colors.BLACK ? 'black' : 'white'}`}
                                            onClick={() => handleCellClick(cell)}
                                            onMouseEnter={() => handleMouseEnter(cell)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <PieceComponent piece={cell.piece} />
                                            {validMoves.some(move => move.x === cell.x && move.y === cell.y) && <div className="highlight-circle move"></div>}
                                            {validAttacks.some(attack => attack.x === cell.x && attack.y === cell.y) && <div className="highlight-circle attack"></div>}
                                            {hoveredCell === cell && cell.piece && (
                                                <div className="cell-popup">
                                                    {cell.piece ? `${cell.piece.color == colors.BLACK ? "Black" : "White"} ${cell.piece.name} (${cell.x}, ${cell.y})` : `Empty (${cell.x}, ${cell.y})`}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                    :
                                    row.slice().reverse().map((cell, colIndex) => (
                                        <div
                                            key={`${colIndex}-${rowIndex}`}
                                            className={`cell cell-${cell.x}-${cell.y} ${cell.color === colors.BLACK ? 'black' : 'white'}`}
                                            onClick={() => handleCellClick(cell)}
                                            onMouseEnter={() => handleMouseEnter(cell)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <PieceComponent piece={cell.piece} />
                                            {validMoves.some(move => move.x === cell.x && move.y === cell.y) && <div className="highlight-circle move"></div>}
                                            {validAttacks.some(attack => attack.x === cell.x && attack.y === cell.y) && <div className="highlight-circle attack"></div>}
                                            {hoveredCell === cell && cell.piece && (
                                                <div className="cell-popup">
                                                    {cell.piece ? `${cell.piece.color == colors.BLACK ? "Black" : "White"} ${cell.piece.name} (${cell.x}, ${cell.y})` : `Empty (${cell.x}, ${cell.y})`}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        ))
                        :
                        transposedBoard.map((row, rowIndex) => (
                            <div key={rowIndex} className="row">
                                <div className="rank-label">{color === colors.WHITE ? 8 - rowIndex : rowIndex + 1}</div>
                                {color === colors.WHITE ?
                                    row.map((cell, colIndex) => (
                                        <div
                                            key={`${colIndex}-${rowIndex}`}
                                            className={`cell cell-${cell.x}-${cell.y} ${cell.color === colors.BLACK ? 'black' : 'white'}`}
                                            onClick={() => handleCellClick(cell)}
                                            onMouseEnter={() => handleMouseEnter(cell)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <PieceComponent piece={cell.piece} />
                                            {validMoves.some(move => move.x === cell.x && move.y === cell.y) && <div className="highlight-circle move"></div>}
                                            {validAttacks.some(attack => attack.x === cell.x && attack.y === cell.y) && <div className="highlight-circle attack"></div>}
                                            {hoveredCell === cell && cell.piece && (
                                                <div className="cell-popup">
                                                    {cell.piece ? `${cell.piece.color == colors.BLACK ? "Black" : "White"} ${cell.piece.name} (${cell.x}, ${cell.y})` : `Empty (${cell.x}, ${cell.y})`}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                    :
                                    row.slice().reverse().map((cell, colIndex) => (
                                        <div
                                            key={`${colIndex}-${rowIndex}`}
                                            className={`cell cell-${cell.x}-${cell.y} ${cell.color === colors.BLACK ? 'black' : 'white'}`}
                                            onClick={() => handleCellClick(cell)}
                                            onMouseEnter={() => handleMouseEnter(cell)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <PieceComponent piece={cell.piece} />
                                            {validMoves.some(move => move.x === cell.x && move.y === cell.y) && <div className="highlight-circle move"></div>}
                                            {validAttacks.some(attack => attack.x === cell.x && attack.y === cell.y) && <div className="highlight-circle attack"></div>}
                                            {hoveredCell === cell && cell.piece && (
                                                <div className="cell-popup">
                                                    {cell.piece ? `${cell.piece.color == colors.BLACK ? "Black" : "White"} ${cell.piece.name} (${cell.x}, ${cell.y})` : `Empty (${cell.x}, ${cell.y})`}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        ))
                    }
                    <div className="file-labels">
                        {files.map((file, index) => (
                            <div key={index} className="file-label">{file}</div>
                        ))}
                    </div>
                </div>

                {selectedPiece && (
                    <div className="piece-rename-container">
                        <input
                            type="text"
                            value={pieceNameInput}
                            onChange={(e) => setPieceNameInput(e.target.value)}
                            placeholder="Rename selected piece"
                        />
                        <button onClick={handlePieceNameChange}>Rename Piece</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChessboardComponent;