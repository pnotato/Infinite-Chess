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
            <Paper align='center' elevation={0} style={{ width: '75px', height: '75px', borderRadius: '15px', display: 'flex', flexDirection: 'column' }}>
                <Typography fontSize={"50px"} style={{ position: 'absolute', alignContent: 'center'}}>{piece.emoji}</Typography>
                <Button onClick={addToFavorites} style={{ top: '-5px', right: '-25px' }}>
                    {isFavorite ? <StarIcon /> : <StarBorderIcon />}
                </Button>
                {/* <Typography align='center'>
                    {piece.name.length > 10 ? piece.name.slice(0, 7) + '...' : piece.name}
                </Typography> */}
            </Paper>
        </div>
    );
}

export default PieceGridItem;

