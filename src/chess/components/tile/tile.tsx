import React from 'react';
import './tile.css';

interface Props {
    image?: string;
    number: number
}

export default function Tile({ number, image }: Props) {
    let tileCol = 'white-tile'
    if (number % 2 === 0) {
        tileCol = 'black-tile'
    }
    return <div className={`${tileCol} tile`}>
            {image && <div style={{backgroundImage: `url(${image})`}} className="chess-piece"></div>}
            {/* IF IMAGE IS NOT NULL! or image !== null */}
        </div>
}