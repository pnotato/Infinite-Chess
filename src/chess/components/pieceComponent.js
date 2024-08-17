import React from 'react';
import { useDrag } from 'react-dnd';
import './pieceComponent.css';

const PieceComponent = ({ piece, canDrag }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'PIECE',
        item: { piece },
        canDrag: canDrag,
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
                cursor: 'normal',
            }}
        >
            {piece ? piece.emoji : ''}
        </div>
    );
};

export default PieceComponent;
