import React, { useState, useEffect } from 'react';
import chessboard from '../classes/chessboard.tsx';
import './chessboardComponent.css';
import colors from '../enums/colors.tsx';
import PieceComponent from './pieceComponent';
import getResponse from '../helper-funcs/getResponse.tsx';

const ChessboardComponent = () => {
    const [board, setBoard] = useState([]);
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [validMoves, setValidMoves] = useState([]);
    const [validAttacks, setValidAttacks] = useState([]);
    const [hoveredCell, setHoveredCell] = useState(null);

    const [pieceNameInput, setPieceNameInput] = useState("");

    useEffect(() => {
        chessboard.standardSetup();
        if (chessboard.cells && chessboard.cells.length > 0) {
            setBoard([...chessboard.cells]);
        } else {
            console.error("Chessboard cells not initialized correctly.");
        }
    }, []);

    const handleCellClick = (cell) => {
        if (selectedPiece) {
            if (cell.piece && cell.piece.color === selectedPiece.color) {
                selectPiece(cell);
            } else if (cell.piece && cell.piece.color !== selectedPiece.color) {
                let target = chessboard.getPiece(cell.x, cell.y);
                selectedPiece.attack(target);
                deselectPiece();
            } else {
                selectedPiece.move(cell.x, cell.y);
                deselectPiece();
            }
        } else {
            if (cell.piece) {
                selectPiece(cell);
            }
        }
        chessboard.cells = chessboard.cells.map(row => [...row]);
        setBoard([...chessboard.cells.map(row => [...row])]);
    };

    const handleMouseEnter = (cell) => {
        setHoveredCell(cell);
    };
    
    const handleMouseLeave = () => {
        setHoveredCell(null);
    };

    const selectPiece = (cell) => {
        cell.piece.getValidMoves();
        cell.piece.getValidAttacks();
        setSelectedPiece(cell.piece);
        setValidMoves(cell.piece.validMoves || []);
        setValidAttacks(cell.piece.validAttacks || []);

        setPieceNameInput(cell.piece.name);
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

            console.log("AI Response:", response);

            // Update the selected piece's name
            selectedPiece.name = pieceNameInput;
            selectedPiece.emoji = response;
            setBoard([...board]);
        }
    };

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const transposedBoard = board && board.length > 0 
        ? board[0].map((_, colIndex) => board.map(row => row[colIndex])) 
        : [];

        return (
            <div className="chessboard-container">
                <div className="chessboard">
                    {transposedBoard.slice().reverse().map((row, rowIndex) => (
                        <div key={rowIndex} className="row">
                            <div className="rank-label">{8 - rowIndex}</div>
                            {row.map((cell, colIndex) => (
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
                                    {hoveredCell === cell && (
                                        <div className="cell-popup">
                                            {cell.piece ? `${cell.piece.color == colors.BLACK ? "Black" : "White"} ${cell.piece.name} (${cell.x}, ${cell.y})` : `Empty (${cell.x}, ${cell.y})`}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
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
        );
    };

export default ChessboardComponent;
