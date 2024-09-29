import React, { useState } from 'react';
import './PieceDisplay.css';
import './chessboardComponent.css';
import { Typography, Divider, Collapse, IconButton, Chip, Box } from '@mui/material';
import chesspiece from '../classes/chesspiece.js';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';

function PieceDisplay({ piece, rename, handlePieceNameChange }) {
  const [expanded, setExpanded] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(piece?.name || '');

  if (!piece) {
    return <div className="piece-display">No piece selected</div>;
  }

  const rehydratedPiece = Object.assign(new chesspiece(), piece);

  const handleEditClick = () => {
    setIsEditingName(true);
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
    rename(e.target.value);
  };

  const handleNameSubmit = () => {
    rename(newName);
    setIsEditingName(false);
    handlePieceNameChange();
  };

  const renderRelativeGrid = (pattern, type) => {
    const grid = [];
    const centerX = 7;
    const centerY = 7;

    for (let y = 14; y >= 0; y--) {
      for (let x = 0; x < 15; x++) {
        const isInPattern = pattern.some(pos =>
          // flip if piece is black
          (rehydratedPiece.color === 'BLACK' ? -pos.x : pos.x) + centerX === x &&
          (rehydratedPiece.color === 'BLACK' ? -pos.y : pos.y) + centerY === y
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

  const strToTrait = (str) => {
    switch (str) {
      case 'IGNORE_BLOCKED_ATTACK':
        return 'Ignores Blocked Attacks';
      case 'IGNORE_BLOCKED_MOVE':
        return 'Ignores Blocked Moves';
      case 'STATIONARY_ATTACK':
        return 'Attacks in place';
      case 'SELF_DESTRUCT':
        return 'Self Destructs';
      case 'REFLECT':
        return 'Reflects Attacks';
      case 'RADIUS':
        return 'Attacks in Radius';
      case 'MULTIATTACK':
        return 'Multiattacks';
      case 'STATUS_EFFECT':
        return 'Gives Status Effects';
      case 'TARGET_ALLY':
        return 'Targets Allies';
      case 'SUMMONER':
        return 'Summoner';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="piece-display">
      <Typography fontSize={"1.5vw"} variant="h6" align="center" sx={{ color: 'white' }}>Information</Typography>
      <Divider variant='middle' sx={{ borderRadius: '5px', borderBottomWidth: 5 }} />
      <div className="display">
        <Typography fontSize={"5vw"} align="center">
          {rehydratedPiece.emoji}
        </Typography>

        <div className="grid-title">
          {isEditingName ? (
            <>
              <input
                type="text"
                value={newName}
                onChange={handleNameChange}
                autoFocus
              />
              <IconButton onClick={handleNameSubmit} sx={{ color: 'white', padding: 0 }}>
                <CheckIcon />
              </IconButton>
            </>
          ) : (
            <>
              {rehydratedPiece.name}
              <IconButton onClick={handleEditClick} sx={{ color: 'white', padding: 0 }}>
                <EditIcon />
              </IconButton>
            </>
          )}
        </div>

        <Divider variant='middle' sx={{ borderRadius: '5px', borderBottomWidth: 5 }}>
          <IconButton onClick={() => setExpanded(!expanded)} align='center' sx={{ color: 'white', opacity: 0.25, width: '2vw', height: '2vw' }}>
            <ExpandMoreIcon />
          </IconButton>
        </Divider>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <div className="traits-container">
            <div className="traits">
              <Typography fontSize={"1vw"} align="center" sx={{ color: 'white' }}>Traits</Typography>
              {rehydratedPiece.traits.length > 0 ?
                (rehydratedPiece.traits.map((trait, index) => (
                  <Chip label={strToTrait(trait)} key={index} color='primary' sx={{ fontSize: '.75vw' }} size='small' />
                ))) : <Typography fontSize={".75vw"} align="center" sx={{ color: 'white' }}>None</Typography>}
            </div>
            <div className='status-effect-display'>
              {rehydratedPiece.statusEffects && rehydratedPiece.statusEffects.length > 0 && <Typography fontSize={"1vw"} align="center" sx={{ color: 'white' }}>Status Effects</Typography>}
              {rehydratedPiece.statusEffects && rehydratedPiece.statusEffects.length > 0 && rehydratedPiece.statusEffects.map((effect, index) => (
                <div key={index}>
                  <div className='status-effect-name'>
                    <Typography key={index} fontSize={"1vw"} align="center" sx={{ color: 'white' }}>{effect.emoji}</Typography>
                    <Typography key={index} fontSize={".75vw"} align="center" sx={{ color: 'white' }}>{effect.name}</Typography>
                  </div>
                  {effect.status.map((status, index) => (
                    <Chip label={status} key={index} color='primary' sx={{ fontSize: '.75vw' }} size='small' />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <Divider variant='middle' sx={{ borderRadius: '5px', borderBottomWidth: 5, marginY: '1vw' }} />
        </Collapse>

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
