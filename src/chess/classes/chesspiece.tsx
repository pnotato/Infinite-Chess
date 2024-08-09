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

            if (x >= 0 && x < 8 && y >= 0 && y < 8 && !chessboard.getPiece(x, y)) {
                this.validMoves.push({ x: x, y: y });
            }
        });
    }

    getValidAttacks() {
        this.validAttacks = [];

        this.attackPattern.forEach((attack) => {
            let x = this.position.x + attack.x;
            let y = this.position.y + attack.y;

            if (x >= 0 && x < 8 && y >= 0 && y < 8 && chessboard.getPiece(x, y) && chessboard.getPiece(x, y)!.color !== this.color) {
                this.validAttacks.push({ x: x, y: y });
            }
        });
    }

    setPosition(x: number, y: number) {
        this.position = { x: x, y: y };
    }

    destroy() {
        this.setPosition(-1, -1);
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
            if (!this.traits.includes(traits.STATIONARY_ATTACK)) {
                this.setPosition(target.position.x, target.position.y);
            }
            target.destroy();
            return true;
        } else {
            return false;
        }
    }
}

export default chesspiece;