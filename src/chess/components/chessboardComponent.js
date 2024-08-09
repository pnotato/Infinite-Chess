import React, { useState, useEffect } from 'react';
import chessboard from '../classes/chessboard.tsx';
import './chessboardComponent.css';
import colors from '../enums/colors.tsx';

const ChessboardComponent = () => {
  const [board, setBoard] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [validAttacks, setValidAttacks] = useState([]);

  useEffect(() => {
    chessboard.standardSetup();
    setBoard([...chessboard.cells]);
  }, []);

  const handleCellClick = (cell) => {
    if (cell.piece) {
      const piece = cell.piece;
      piece.getValidMoves();
      piece.getValidAttacks();
      setSelectedPiece(piece);
      setValidMoves(piece.validMoves);
      setValidAttacks(piece.validAttacks);
    } else if (selectedPiece) {
      const isMove = validMoves.some(move => move.x === cell.x && move.y === cell.y);
      const isAttack = validAttacks.some(attack => attack.x === cell.x && attack.y === cell.y);

      if (isMove || isAttack) {
        const origin = { x: selectedPiece.position.x, y: selectedPiece.position.y };
        const destination = { x: cell.x, y: cell.y };

        if (isAttack) {
          const targetPiece = chessboard.getPiece(cell.x, cell.y);
          selectedPiece.attack(targetPiece);
        } else {
          selectedPiece.move(cell.x, cell.y);
        }

        chessboard.setPiece(selectedPiece, destination.x, destination.y);
        chessboard.getCell(origin.x, origin.y).setPiece(null);

        setSelectedPiece(null);
        setValidMoves([]);
        setValidAttacks([]);

        animatePieceMovement(origin, destination);
      }
    }
  };

  const animatePieceMovement = (origin, destination) => {
    const originCell = document.querySelector(`.cell-${origin.x}-${origin.y}`);
    const destinationCell = document.querySelector(`.cell-${destination.x}-${destination.y}`);
    const pieceElement = destinationCell.querySelector('.piece');

    if (pieceElement && originCell) {
      const originRect = originCell.getBoundingClientRect();
      const destinationRect = destinationCell.getBoundingClientRect();

      pieceElement.style.transition = 'transform 0.5s ease';
      pieceElement.style.transform = `translate(${originRect.left - destinationRect.left}px, ${originRect.top - destinationRect.top}px)`;

      setTimeout(() => {
        pieceElement.style.transform = 'translate(0, 0)';
        setBoard([...chessboard.cells]);  // Rerender the board after animation
      }, 50);
    }
  };

  const renderPiece = (piece) => {
    return (
      <div className="piece">
        {piece ? piece.emoji : ''}
      </div>
    );
  };

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  const transposedBoard = board.length > 0 ? board[0].map((_, colIndex) => board.map(row => row[colIndex])) : [];

  return (
    <div className="chessboard">
      {transposedBoard.slice().reverse().map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          <div className="rank-label">{8 - rowIndex}</div>
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className={`cell cell-${cell.x}-${cell.y} ${cell.color === colors.BLACK ? 'black' : 'white'}`}
              onClick={() => handleCellClick(cell)}
            >
              {renderPiece(cell.piece)}
              {validMoves.some(move => move.x === cell.x && move.y === cell.y) && <div className="highlight-circle move"></div>}
              {validAttacks.some(attack => attack.x === cell.x && attack.y === cell.y) && <div className="highlight-circle attack"></div>}
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
  );
};

export default ChessboardComponent;
