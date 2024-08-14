import { Typography, Paper, Button } from "@mui/material";
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import { useEffect, useState } from "react";
import chesspiece from "../classes/chesspiece.tsx";

function PieceGridItem({ piece, onClick, onRefresh }) {
    const [isFavorite, setIsFavorite] = useState(piece.favourite);

    useEffect(() => {
        setIsFavorite(piece.favourite);
    }, [piece.favourite]);

    const addToFavorites = () => {
        const hydratedPiece = Object.assign(new chesspiece(), piece);

        hydratedPiece.favouritePiece(); // Toggles the 'favourite' property
        setIsFavorite(!isFavorite);

        // Update the local storage
        const storedPieces = JSON.parse(localStorage.getItem('createdPieces')) || [];
        const index = storedPieces.findIndex(p => p.name === hydratedPiece.name);

        if (index !== -1) {
            storedPieces[index] = hydratedPiece;
        } else {
            storedPieces.push(hydratedPiece);
        }

        localStorage.setItem('createdPieces', JSON.stringify(storedPieces));

        onRefresh();
    };

    return (
        <div className="piece-grid-item" onClick={onClick}>
            <Paper elevation={3} style={{ padding: 10, width: '75px' }}>
                <Button onClick={addToFavorites}>
                    {isFavorite ? <StarIcon /> : <StarBorderIcon />}
                </Button>
                <Typography fontSize={30} align="center">{piece.emoji}</Typography>
                <Typography align='center'>
                    {piece.name.length > 10 ? piece.name.slice(0, 7) + '...' : piece.name}
                </Typography>
            </Paper>
        </div>
    );
}

export default PieceGridItem;

