class cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.color = (x + y) % 2 === 0 ? 'WHITE' : 'BLACK';
    }

    setPiece(piece) {
        this.piece = piece;
    }

    getPiece() {
        return this.piece;
    }
}

export default cell;