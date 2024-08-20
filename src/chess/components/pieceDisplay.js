import React from 'react';
import './PieceDisplay.css';
import './chessboardComponent.css';
import { Typography } from '@mui/material';
import chesspiece from '../classes/chesspiece.tsx';
import colors from '../enums/colors.tsx';

function PieceDisplay({ piece }) {
  if (!piece) {
    return <div className="piece-display">No piece selected</div>;
  }

  const rehydratedPiece = Object.assign(new chesspiece(), piece);

  const renderRelativeGrid = (pattern, type) => {
    const grid = [];
    const centerX = 7;
    const centerY = 7;

    for (let y = 14; y >= 0; y--) {
      for (let x = 0; x < 15; x++) {
        const isInPattern = pattern.some(pos =>
          // flip if piece is black
          (rehydratedPiece.color === colors.BLACK ? -pos.x : pos.x) + centerX === x &&
          (rehydratedPiece.color === colors.BLACK ? -pos.y : pos.y) + centerY === y
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
      <Typography fontSize={"2vw"} variant="h6" align="center" sx={{color: 'white'}}>Information</Typography>
      <div className="display">
        <Typography fontSize={"5vw"} align="center">
          {rehydratedPiece.emoji}
        </Typography>
        <div className="grid-title">{rehydratedPiece.name}</div>
        <div className={`grid-container`}>
          <div className="grid-title">Movement Pattern</div>
          <div className="grid">
            {renderRelativeGrid(rehydratedPiece.movementPattern, 'move')}
          </div>
          <div className="grid-title">Attack Pattern</div>
          <div className="grid">
            {renderRelativeGrid(rehydratedPiece.attackPattern, 'attack')}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PieceDisplay;