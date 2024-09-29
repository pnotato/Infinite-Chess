import { Grid, Typography, Button, Box, Divider, TextField, InputAdornment } from '@mui/material';
import PieceGridItem from './pieceGridItem';
import { useState, useEffect } from 'react';
import chesspiece from '../classes/chesspiece.js';
import './chessboardComponent.css';
import SearchIcon from '@mui/icons-material/Search';

function PieceGrid({ onPieceClick, refreshGrid, setRefreshGrid }) {
    const [allPieces, setAllPieces] = useState([]); // Stores all pieces
    const [displayedPieces, setDisplayedPieces] = useState([]); // Pieces currently shown on the grid
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false); // Toggle for showing only favorite pieces
    const [searchTerm, setSearchTerm] = useState(''); // Stores the current search term

    const refresh = () => {
        const storedPieces = JSON.parse(localStorage.getItem('createdPieces')) || [];
        const hydratedPieces = storedPieces.map(piece => Object.assign(new chesspiece(), piece));
        setAllPieces(hydratedPieces);
        filterAndSetDisplayedPieces(hydratedPieces, showFavoritesOnly, searchTerm);
    };

    const filterAndSetDisplayedPieces = (pieces, showFavoritesOnly, searchTerm) => {
        let filtered = pieces;
        if (showFavoritesOnly) {
            filtered = filtered.filter(piece => piece.favourite);
        }
        if (searchTerm) {
            filtered = filtered.filter(piece => piece.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        setDisplayedPieces(filtered);
    };

    useEffect(() => {
        refresh();
    }, [refreshGrid]);

    useEffect(() => {
        refresh();
    }, []);

    const handleSearchChange = (e) => {
        const newSearchTerm = e.target.value.toLowerCase();
        setSearchTerm(newSearchTerm);
        filterAndSetDisplayedPieces(allPieces, showFavoritesOnly, newSearchTerm);
    };

    const toggleFavoriteFilter = () => {
        const newShowFavoritesOnly = !showFavoritesOnly;
        setShowFavoritesOnly(newShowFavoritesOnly);
        filterAndSetDisplayedPieces(allPieces, newShowFavoritesOnly, searchTerm);
    };

    return (
        <div className='piece-grid'>
            <Typography fontSize={"1.5vw"} variant="h6" align="center" sx={{ color: 'white' }}>Barracks</Typography>
            <Button onClick={toggleFavoriteFilter}>
                <Typography fontSize={".75vw"} align="center" sx={{ color: 'white' }}>
                    {showFavoritesOnly ? 'Show All' : 'Show Favorites'}
                </Typography>
            </Button>
            <Divider variant='middle' sx={{ borderRadius: '5px', borderBottomWidth: 5, marginBottom: '10px' }} />

            <div className="piece-list">
                {displayedPieces.map((piece, index) => (
                    <PieceGridItem key={index} piece={piece} onClick={() => onPieceClick(piece)} onRefresh={refresh} />
                ))}
            </div>

            <Divider variant='middle' sx={{ borderRadius: '5px', borderBottomWidth: 5, marginTop: '10px' }} />

            <TextField variant="filled" onChange={handleSearchChange} sx={{}}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    )
                }}
            />
        </div>
    );
}

export default PieceGrid;
