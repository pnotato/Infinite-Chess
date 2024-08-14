import React from 'react';
import './pieceComponent.css';

const PieceComponent = ({ piece }) => {
    return (
        <div className="piece">
            {piece ? piece.emoji : ''}
        </div>
    );
};

export default PieceComponent;