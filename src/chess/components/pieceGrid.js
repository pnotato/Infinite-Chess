import React, { useState, useEffect } from 'react';
import PieceGridItem from './pieceGridItem';
import { Grid, Typography, Button } from '@mui/material';
import chesspiece from '../classes/chesspiece.tsx';

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
        <div className="piece-grid">
            <Typography variant="h6" align="center">Barracks</Typography>
            <Button onClick={() => setIsFiltered(!isFiltered)}>
                {isFiltered ? 'Show All' : 'Show Favorites'}
            </Button>
            <Grid container spacing={2}>
                {(isFiltered ? filteredPieces : pieces).map((piece, index) => (
                    <Grid item key={index}>
                        <PieceGridItem piece={piece} onClick={() => onPieceClick(piece)} onRefresh={refresh} />
                    </Grid>
                ))}
            </Grid>
        </div>
    );
}

export default PieceGrid;

