import { act, useRef, useEffect, useState } from 'react';
import Tile from '../tile/tile.tsx';
import './chessboard.css'
import Referee from '../referee/referee.ts';
import React from 'react';

const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];

interface Piece {
    image: string
    x: number
    y: number
    type: PieceType
    team: TeamType
}

export enum PieceType {
    PAWN,
    BISHOP,
    KNIGHT,
    ROOK,
    QUEEN,
    KING
}

export enum TeamType {
    OPPONENT,
    OUR
}

const initialBoardState: Piece[] = []

// ----- PIECE DEFINITIONS ----- //

// PAWN

for (let i = 0; i < 8; i++) {
    initialBoardState.push({
        image: "constantpieces/pawn_w.png",
        x: i,
        y: 1,
        type: PieceType.PAWN,
        team: TeamType.OUR
    })
    initialBoardState.push({
        image: "constantpieces/pawn_b.png",
        x: i,
        y: 6,
        type: PieceType.PAWN,
        team: TeamType.OPPONENT
    })
}

// ROOK
initialBoardState.push({
    image: "constantpieces/rook_b.png",
    x: 0,
    y: 7,
    type: PieceType.ROOK,
    team: TeamType.OPPONENT
})
initialBoardState.push({
    image: "constantpieces/rook_b.png",
    x: 7,
    y: 7,
    type: PieceType.ROOK,
    team: TeamType.OPPONENT
})
initialBoardState.push({
    image: "constantpieces/rook_w.png",
    x: 7,
    y: 0,
    type: PieceType.ROOK,
    team: TeamType.OUR
})
initialBoardState.push({
    image: "constantpieces/rook_w.png",
    x: 0,
    y: 0,
    type: PieceType.ROOK,
    team: TeamType.OUR
})


// KNIGHT

initialBoardState.push({
    image: "constantpieces/knight_b.png",
    x: 1,
    y: 7,
    type: PieceType.KNIGHT,
    team: TeamType.OPPONENT
})
initialBoardState.push({
    image: "constantpieces/knight_b.png",
    x: 6,
    y: 7,
    type: PieceType.KNIGHT,
    team: TeamType.OPPONENT
})
initialBoardState.push({
    image: "constantpieces/knight_w.png",
    x: 1,
    y: 0,
    type: PieceType.KNIGHT,
    team: TeamType.OUR
})
initialBoardState.push({
    image: "constantpieces/knight_w.png",
    x: 6,
    y: 0,
    type: PieceType.KNIGHT,
    team: TeamType.OUR
})

// BISHOP

initialBoardState.push({
    image: "constantpieces/bishop_b.png",
    x: 2,
    y: 7,
    type: PieceType.BISHOP,
    team: TeamType.OPPONENT
})
initialBoardState.push({
    image: "constantpieces/bishop_b.png",
    x: 5,
    y: 7,
    type: PieceType.BISHOP,
    team: TeamType.OPPONENT
})
initialBoardState.push({
    image: "constantpieces/bishop_w.png",
    x: 2,
    y: 0,
    type: PieceType.BISHOP,
    team: TeamType.OUR
})
initialBoardState.push({
    image: "constantpieces/bishop_w.png",
    x: 5,
    y: 0,
    type: PieceType.BISHOP,
    team: TeamType.OUR
})

// KING & QUEEN

initialBoardState.push({
    image: "constantpieces/queen_b.png",
    x: 3,
    y: 7,
    type: PieceType.QUEEN,
    team: TeamType.OPPONENT
})
initialBoardState.push({
    image: "constantpieces/king_b.png",
    x: 4,
    y: 7,
    type: PieceType.KING,
    team: TeamType.OPPONENT
})
initialBoardState.push({
    image: "constantpieces/queen_w.png",
    x: 3,
    y: 0,
    type: PieceType.QUEEN,
    team: TeamType.OUR
})
initialBoardState.push({
    image: "constantpieces/king_w.png",
    x: 4,
    y: 0,
    type: PieceType.KING,
    team: TeamType.OUR
})

// ----- END PIECE DEFINITIONS ----- //


export default function Chessboard() {
    const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
    const [gridX, setGridX] = useState(0);
    const [gridY, setGridY] = useState(0);

    const [pieces, setPieces] = useState<Piece[]>(initialBoardState);
    const chessboardRef = useRef<HTMLElement>(null);
    const referee = new Referee();

    // let activePiece: HTMLElement | null = null;

    function grabPiece(e: React.MouseEvent) {
        // console.log(e.target);
        const element = e.target as HTMLElement
        const chessboard = chessboardRef.current
        if (element.classList.contains("chess-piece") && chessboard) {

            
            setGridX(Math.floor((e.clientX - chessboard.offsetLeft) / 100)); // divide by 100px
            setGridY(Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800) / 100)));

            const x = e.clientX - 50;
            const y = e.clientY - 50;
            element.style.position = "absolute";
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;

            setActivePiece(element)
        }
    }

    function movePiece(e: React.MouseEvent) {
        const chessboard = chessboardRef.current;
        if (activePiece && chessboard) { // && activePiece.classList.contains("chess-piece") redundant as activePiece must already contain a chess piece
            const minX = chessboard.offsetLeft - 25;
            const minY = chessboard.offsetTop - 25; // -25 offset since technically the image starts at the side
            const maxX = chessboard.offsetLeft + chessboard.clientWidth - 75;
            const maxY = chessboard.offsetTop + chessboard.clientHeight - 75;

            const x = e.clientX - 50;
            const y = e.clientY - 50;
            activePiece.style.position = "absolute";
            // activePiece.style.left = `${x}px`;
            // activePiece.style.top = `${y}px`;
            

            if (x < minX) {
                activePiece.style.left = `${minX}px`
            }
            else if (x > maxX) {
                activePiece.style.left = `${maxX}px`
            }
            else {
                activePiece.style.left = `${x}px`
            }


            if (y < minY) {
                activePiece.style.top = `${minY}px`
            }
            else if (y > maxY) {
                activePiece.style.top = `${maxY}px`
            }
            else {
                activePiece.style.top = `${y}px`
            }

        }
    }

    function dropPiece(e: React.MouseEvent) {
        const chessboard = chessboardRef.current;
        // e.stopPropagation()
        if (activePiece && chessboard) {
            const x = Math.floor((e.clientX - chessboard.offsetLeft) / 100) // divide by 100px
            const y = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800) / 100)) // inverts the y axis
            
            setPieces((value) => {
                const pieces = value.map(p => {
                    if (p.x === gridX && p.y === gridY) {
                        // referee.isValidMove(gridX, gridY, x, y, p.type, p.team);
                        p.x = x;
                        p.y = y;
                    }
                    return p;
                });
                return pieces;
            });
            setActivePiece(null); // set back to null to refresh the pieces
            activePiece.style.position = "";
            activePiece.style.left = "";
            activePiece.style.top = "";
            // Resetting this ensures that the piece snaps correctly into place, as before
            // it was forcing its inline styles.
        }
    }

    let board: JSX.Element[] = [];
    
    for (let j = verticalAxis.length - 1; j >= 0; j--) {
        for (let i = 0; i < horizontalAxis.length; i++) {
            let image: string | undefined = undefined
            pieces.forEach(p => {
                if (p.x === i && p.y === j) {
                    image = p.image;
                }
            })

            board.push(<Tile key={`${j},${i}`} image={image} number={j + i} />)
        }
    }

    return (
        <div 
            onMouseUp={e => dropPiece(e)}
            onMouseDown={e => grabPiece(e)} 
            onMouseMove={(e) => movePiece(e)} 
            
            id="chessboard"
            ref={chessboardRef}>
            {board}
        </div>
    );
}