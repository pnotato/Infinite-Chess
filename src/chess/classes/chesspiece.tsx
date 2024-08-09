import colors from "../enums/colors.tsx";
import traits from "../enums/traits.tsx";
import chessboard from "./chessboard.tsx";

class chesspiece {
    // ------------------- Properties -------------------
    name: string;
    emoji: string;

    color: colors;
    position: { x: number, y: number };

    movementPattern: { x: number, y: number }[];
    attackPattern: { x: number, y: number }[];
    traits: traits[];

    // ------------------- State -------------------
    validMoves: { x: number, y: number }[];
    validAttacks: { x: number, y: number }[];

    constructor(basic: { color: colors, position: { x: number, y: number } },
                custom: { name: string, emoji: string, movement: { x: number, y: number }[], attack: { x: number, y: number }[], traits: traits[] }) {

        this.color = basic.color;
        this.position = basic.position;

        this.name = custom.name;
        this.emoji = custom.emoji;

        this.movementPattern = custom.movement;
        this.attackPattern = custom.attack;
        this.traits = custom.traits;
    }

    // ------------------- Methods -------------------
    getValidMoves() {
        this.validMoves = [];

        this.movementPattern.forEach((move) => {
            let x = this.position.x + move.x;
            let y = this.position.y + move.y;

            if (x >= 0 && x < 8 && y >= 0 && y < 8 && !chessboard.getPiece(x, y) && (this.traits.includes(traits.IGNORE_BLOCKED_MOVE) || !this.isBeingBlocked(x, y))) {
                this.validMoves.push({ x: x, y: y });
            }
        });
    }

    getValidAttacks() {
        this.validAttacks = [];

        this.attackPattern.forEach((attack) => {
            let x = this.position.x + attack.x;
            let y = this.position.y + attack.y;

            if (x >= 0 && x < 8 && y >= 0 && y < 8 && chessboard.getPiece(x, y) && chessboard.getPiece(x, y)!.color !== this.color && (this.traits.includes(traits.IGNORE_BLOCKED_ATTACK) || !this.isBeingBlocked(x, y))) {
                this.validAttacks.push({ x: x, y: y });
            }
        });
    }

    isBeingBlocked(x: number, y: number) {
        let xDiff = x - this.position.x;
        let yDiff = y - this.position.y;

        let xDir = xDiff === 0 ? 0 : xDiff / Math.abs(xDiff);
        let yDir = yDiff === 0 ? 0 : yDiff / Math.abs(yDiff);

        let xCurrent = this.position.x + xDir;
        let yCurrent = this.position.y + yDir;

        while (xCurrent !== x || yCurrent !== y) {
            if (chessboard.getPiece(xCurrent, yCurrent)) {
                return true;
            }

            xCurrent += xDir;
            yCurrent += yDir;
        }

        return false;
    }

    setPosition(x: number, y: number) {
        chessboard.setPiece(null, this.position.x, this.position.y);
        chessboard.setPiece(this, x, y);

        this.position = { x: x, y: y };
        this.getValidMoves();
        this.getValidAttacks();
    }

    destroy() {
        chessboard.setPiece(null, this.position.x, this.position.y);
    }

    move(x: number, y: number) {
        if (this.validMoves.some((move) => move.x === x && move.y === y)) {
            this.setPosition(x, y);
            return true;
        } else {
            return false;
        }
    }

    attack(target: chesspiece) {
        if (this.validAttacks.some((attack) => attack.x === target.position.x && attack.y === target.position.y)) {
            target.destroy();
            if (!this.traits.includes(traits.STATIONARY_ATTACK)) {
                this.setPosition(target.position.x, target.position.y);
            }
            this.getValidAttacks();
            return true;
        } else {
            return false;
        }
    }
}

export default chesspiece;