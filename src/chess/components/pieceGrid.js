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
            <Typography fontSize={"2vw"} variant="h6" align="center" sx={{ color: 'white' }}>Barracks</Typography>
            <Button onClick={() => setIsFiltered(!isFiltered)}>
                <Typography fontSize={"1vw"} align="center" sx={{ color: 'white' }}>
                    {isFiltered ? 'Show All' : 'Show Favorites'}
                </Typography>
            </Button>

            <div className="piece-list">
                {(isFiltered ? filteredPieces : pieces).map((piece, index) => (
                    <PieceGridItem key={index} piece={piece} onClick={() => onPieceClick(piece)} onRefresh={refresh} />
                ))}
            </div>
        </div>
    );
}

export default PieceGrid;
