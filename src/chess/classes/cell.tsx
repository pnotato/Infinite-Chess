import colors from "../enums/colors.tsx";
import traits from "../enums/traits.tsx";
import chesspiece from "./chesspiece.tsx";

class cell {
    x: number;
    y: number;
    color: colors;
    piece: chesspiece | null = null;
    traits: traits[] = [];

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;

        this.color = (x + y) % 2 === 0 ? colors.WHITE : colors.BLACK;
    }

    setPiece(piece : chesspiece | null) {
        this.piece = piece;
    }

    getPiece() {
        return this.piece;
    }
}

export default cell;