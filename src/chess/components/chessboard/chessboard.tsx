import { act, useRef, useEffect, useState } from 'react';
import Tile from '../tile/tile.tsx';
import './chessboard.css'
import socket from '../../socket.js';
import React from 'react';
import { defaultPieceDef, defaultPieceDefBlack } from './defaultPieces.tsx';
import { DefaultPieceType } from "../../enums/PieceType.tsx";

const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];

export interface Piece {
    image: string
    x: number
    y: number
    type: string | DefaultPieceType
}

const initialBoardState: Piece[] = []
defaultPieceDef(initialBoardState)

export default function Chessboard(roomCode, username, player) {

     const [roomInfo, setRoomInfo] = useState(null);
     const [CurrentTurn, setCurrentTurn] = useState('WHITE');

     const toggleTurn = () => {
        setCurrentTurn(prevTurn => prevTurn === 'WHITE' ? 'BLACK' : 'WHITE');
        console.log(CurrentTurn)
      };

    // Piece Positioning

    const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
    const [gridX, setGridX] = useState(0);
    const [gridY, setGridY] = useState(0);

    const [pieces, setPieces] = useState<Piece[]>(initialBoardState);
    const chessboardRef = useRef<HTMLElement>(null);

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
                        p.x = x;
                        p.y = y;
                    }
                    return p;
                });
                console.log(pieces)
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