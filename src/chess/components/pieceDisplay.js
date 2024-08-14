import React from 'react';
import './PieceDisplay.css';
import { Typography } from '@mui/material';

function PieceDisplay({ piece }) {
  if (!piece) {
    return <div className="piece-display">No piece selected</div>;
  }

  const renderRelativeGrid = (pattern, type) => {
    const grid = [];
    const centerX = 7;
    const centerY = 7;

    for (let y = 14; y >= 0; y--) {
      for (let x = 0; x < 15; x++) {
        const isInPattern = pattern.some(pos =>
          piece.color === "BLACK"
            ? pos.x === -(x - centerX) && pos.y === -(y - centerY)
            : pos.x === x - centerX && pos.y === y - centerY
        );

        grid.push(
          <div
            key={`${x}-${y}`}
            className={`grid-cell ${x === centerX && y === centerY ? 'center' : ''} ${isInPattern ? type : ''}`}
          />
        );
      }
    }
    return grid;
  };

  return (
    <div className="piece-display">
      <Typography variant="h6" align="center">Information</Typography>
      <div className="piece-info">
        <div><strong>Name:</strong> {piece.name}</div>
        <div><strong>Emoji:</strong> {piece.emoji}</div>

      </div>

      <div className={`grid-container ${piece.color === 'BLACK' ? 'flipped' : ''}`}>
        <div className="grid-title">Movement Pattern</div>
        <div className="grid">
          {renderRelativeGrid(piece.movementPattern, 'move')}
        </div>
        <div className="grid-title">Attack Pattern</div>
        <div className="grid">
          {renderRelativeGrid(piece.attackPattern, 'attack')}
        </div>
      </div>
      <div className="piece-info">
        <div><strong>Description:</strong> {piece.description}</div>
      </div>
    </div>
  );
}

export default PieceDisplay;