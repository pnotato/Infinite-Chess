import { Grid, Typography, Button, Box } from '@mui/material';
import PieceGridItem from './pieceGridItem';
import { useState, useEffect } from 'react';
import chesspiece from '../classes/chesspiece.tsx';
import './chessboardComponent.css';

function PieceGrid({ onPieceClick, refreshGrid, setRefreshGrid }) {
    const [pieces, setPieces] = useState([]);
    const [filteredPieces, setFilteredPieces] = useState([]);
    const [isFiltered, setIsFiltered] = useState(false);

    const refresh = () => {
        const storedPieces = JSON.parse(localStorage.getItem('createdPieces')) || [];
        const hydratedPieces = storedPieces.map(piece => Object.assign(new chesspiece(), piece));
        setPieces(hydratedPieces);
        setFilteredPieces(hydratedPieces.filter(piece => piece.favourite));
    };

    useEffect(() => {
        refresh();
    }, [refreshGrid]);

    useEffect(() => {
        refresh();
    }, []);

    return (
        <div className='piece-grid'>
            <Typography variant="h6" align="center">Barracks</Typography>
            <Button onClick={() => setIsFiltered(!isFiltered)}>
                {isFiltered ? 'Show All' : 'Show Favorites'}
            </Button>

            <div className="piece-list">
                {(isFiltered ? filteredPieces : pieces).map((piece, index) => (
                    <PieceGridItem piece={piece} onClick={() => onPieceClick(piece)} onRefresh={refresh} />
                ))}

            </div>
        </div>
    );
}

export default PieceGrid;
