import cell from "./cell.js";
import chesspiece from "./chesspiece.js";
import info from "./constants/pieces.js";

class chessboard {
    constructor() {
        this.cells = Array.from({ length: 8 }, (_, i) =>
            Array.from({ length: 8 }, (_, j) => new cell(i, j))
        );
        this.isGameOver = false;
        this.winner = null;
    }

    getCell(x, y) {
        if (x < 0 || x >= 8 || y < 0 || y >= 8) {
            return null;
        }
        return this.cells[x][y];
    }

    setPiece(piece, x, y) {
        this.getCell(x, y)?.setPiece(piece);
    }

    getPiece(x, y) {
        const cell = this.getCell(x, y);
        return cell ? cell.getPiece() : null;
    }

    gameOver(color) {
        console.log(`Game over! ${color} loses!`);
        this.isGameOver = true;
        this.winner = color === "WHITE" ? "BLACK" : "WHITE";
    }

    standardSetup() {
        // White pieces
        this.setPiece(new chesspiece({ color: "WHITE", position: { x: 0, y: 0 } }, info['rook']), 0, 0);
        this.setPiece(new chesspiece({ color: "WHITE", position: { x: 1, y: 0 } }, info['knight']), 1, 0);
        this.setPiece(new chesspiece({ color: "WHITE", position: { x: 2, y: 0 } }, info['bishop']), 2, 0);
        this.setPiece(new chesspiece({ color: "WHITE", position: { x: 3, y: 0 } }, info['queen']), 3, 0);
        this.setPiece(
            new chesspiece(
                { color: "WHITE", position: { x: 4, y: 0 } },
                info['king'],
                [{ status: ["KING"], name: "King", emoji: "👑", duration: 0 }]
            ),
            4, 0
        );
        this.setPiece(new chesspiece({ color: "WHITE", position: { x: 5, y: 0 } }, info['bishop']), 5, 0);
        this.setPiece(new chesspiece({ color: "WHITE", position: { x: 6, y: 0 } }, info['knight']), 6, 0);
        this.setPiece(new chesspiece({ color: "WHITE", position: { x: 7, y: 0 } }, info['rook']), 7, 0);

        for (let i = 0; i < 8; i++) {
            this.setPiece(new chesspiece({ color: "WHITE", position: { x: i, y: 1 } }, info['pawn']), i, 1);
        }

        // Black pieces
        this.setPiece(new chesspiece({ color: "BLACK", position: { x: 0, y: 7 } }, info['rook']), 0, 7);
        this.setPiece(new chesspiece({ color: "BLACK", position: { x: 1, y: 7 } }, info['knight']), 1, 7);
        this.setPiece(new chesspiece({ color: "BLACK", position: { x: 2, y: 7 } }, info['bishop']), 2, 7);
        this.setPiece(new chesspiece({ color: "BLACK", position: { x: 3, y: 7 } }, info['queen']), 3, 7);
        this.setPiece(
            new chesspiece(
                { color: "BLACK", position: { x: 4, y: 7 } },
                info['king'],
                [{ status: ["KING"], name: "King", emoji: "👑", duration: 0 }]
            ),
            4, 7
        );
        this.setPiece(new chesspiece({ color: "BLACK", position: { x: 5, y: 7 } }, info['bishop']), 5, 7);
        this.setPiece(new chesspiece({ color: "BLACK", position: { x: 6, y: 7 } }, info['knight']), 6, 7);
        this.setPiece(new chesspiece({ color: "BLACK", position: { x: 7, y: 7 } }, info['rook']), 7, 7);

        for (let i = 0; i < 8; i++) {
            this.setPiece(new chesspiece({ color: "BLACK", position: { x: i, y: 6 } }, info['pawn']), i, 6);
        }
    }
}

export default chessboard;
