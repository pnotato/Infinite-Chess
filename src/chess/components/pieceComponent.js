import React from 'react';
import { useDrag } from 'react-dnd';
import './pieceComponent.css';

const PieceComponent = ({ piece, setSelected }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'PIECE',
        item: { piece },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [piece]);

    return (
        <div
            ref={drag}
            className="piece"
            style={{
                opacity: isDragging ? 0 : 1,
                cursor: 'grab',
            }}
        >
            {piece ? piece.emoji : ''}
        </div>
    );
};

export default PieceComponent;
