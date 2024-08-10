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

    constructor(basic: { color: colors, position: { x: number, y: number }},
        custom: { name: string, emoji: string, movement: { x: number, y: number }[], attack: { x: number, y: number }[], traits: traits[] }) {

        if(!basic || !custom) {
            return;
        }

        this.color = basic.color;
        this.position = basic.position;

        this.name = custom.name;
        this.emoji = custom.emoji;

        this.movementPattern = custom.movement;
        this.attackPattern = custom.attack;
        this.traits = custom.traits;
    }

    // ------------------- Methods -------------------
    updateInfo(custom: { name: string, emoji: string, movement: { x: number, y: number }[], attack: { x: number, y: number }[], traits: string[] }, board: chessboard) {
        this.name = custom.name;
        this.emoji = custom.emoji;

        this.movementPattern = custom.movement;
        this.attackPattern = custom.attack;

        // foreach trait in custom.traits, add a switch statement to add the trait to this.traits
        custom.traits.forEach((trait) => {
            switch (trait) {
                case "IGNORE_BLOCKED_ATTACK":
                    this.traits.push(traits.IGNORE_BLOCKED_ATTACK);
                    break;
                case "IGNORE_BLOCKED_MOVE":
                    this.traits.push(traits.IGNORE_BLOCKED_MOVE);
                    break;
                case "STATIONARY_ATTACK":
                    this.traits.push(traits.STATIONARY_ATTACK);
                    break;
                case "SELF_DESTRUCT":
                    this.traits.push(traits.SELF_DESTRUCT);
                    break;
                case "REFLECT":
                    this.traits.push(traits.REFLECT);
                    break;
                case "RADIUS":
                    this.traits.push(traits.RADIUS);
                    break;
                case "MULTIATTACK":
                    this.traits.push(traits.MULTIATTACK);
                    break;
            }
        });

        board.setPiece(null, this.position.x, this.position.y);
        board.setPiece(this, this.position.x, this.position.y);

        this.getValidMoves(board);
        this.getValidAttacks(board);
    }

    getValidMoves(board: chessboard) {
        this.validMoves = [];

        this.movementPattern.forEach((move) => {
            let x = this.position.x + move.x;
            let y = this.position.y + move.y;

            if (x >= 0 && x < 8 && y >= 0 && y < 8 && !board.getPiece(x, y) && (this.traits.includes(traits.IGNORE_BLOCKED_MOVE) || !this.isBeingBlocked(x, y, board))) {
                this.validMoves.push({ x: x, y: y });
            }
        });
    }

    getValidAttacks(board: chessboard) {
        this.validAttacks = [];

        this.attackPattern.forEach((attack) => {
            let x = this.position.x + attack.x;
            let y = this.position.y + attack.y;

            if (x >= 0 && x < 8 && y >= 0 && y < 8 && board.getPiece(x, y) && board.getPiece(x, y)!.color !== this.color && (this.traits.includes(traits.IGNORE_BLOCKED_ATTACK) || !this.isBeingBlocked(x, y, board))) {
                this.validAttacks.push({ x: x, y: y });
            }
        });
    }

    isBeingBlocked(x: number, y: number, board: chessboard) {
        let xDiff = x - this.position.x;
        let yDiff = y - this.position.y;

        let xDir = xDiff === 0 ? 0 : xDiff / Math.abs(xDiff);
        let yDir = yDiff === 0 ? 0 : yDiff / Math.abs(yDiff);

        let xCurrent = this.position.x + xDir;
        let yCurrent = this.position.y + yDir;

        while (xCurrent !== x || yCurrent !== y) {
            if (board.getPiece(xCurrent, yCurrent)) {
                return true;
            }

            xCurrent += xDir;
            yCurrent += yDir;
        }

        return false;
    }

    setPosition(x: number, y: number, board: chessboard) {
        board.setPiece(null, this.position.x, this.position.y);
        board.setPiece(this, x, y);

        this.position = { x: x, y: y };
        this.getValidMoves(board);
        this.getValidAttacks(board);
    }

    destroy(board: chessboard) {
        board.setPiece(null, this.position.x, this.position.y);
    }

    move(x: number, y: number, board: chessboard) {
        if (this.validMoves.some((move) => move.x === x && move.y === y)) {
            this.setPosition(x, y, board);
            return true;
        } else {
            return false;
        }
    }

    attack(target: chesspiece, board: chessboard) {
        if (this.validAttacks.some((attack) => attack.x === target.position.x && attack.y === target.position.y)) {
            let targets = [target];

            if (this.traits.includes(traits.MULTIATTACK)) {
                // add all pieces in valid attack positions to targets
                this.validAttacks.forEach((attack) => {
                    let piece = board.getPiece(attack.x, attack.y);
                    if (piece && piece !== this && piece.color !== this.color && !targets.includes(piece)) {
                        targets.push(piece);
                    }
                });
            }

            if (this.traits.includes(traits.RADIUS)) {
                // destroy all pieces in a 3x3 radius for all targets
                targets.forEach((currentTarget) => {
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            let piece = board.getPiece(currentTarget.position.x + i, currentTarget.position.y + j);
                            if (piece && piece !== this) {
                                piece.destroy(board);
                            }
                        }
                    }
                });
            }
 
            targets.forEach((currentTarget) => {
                currentTarget.destroy(board);
            });

            if (!this.traits.includes(traits.STATIONARY_ATTACK)) {
                this.setPosition(target.position.x, target.position.y, board);
            }

            if (this.traits.includes(traits.SELF_DESTRUCT) || target.traits.includes(traits.REFLECT)) {
                console.log("self destruct");
                this.destroy(board);
            }
            this.getValidAttacks(board);
            return true;
        } else {
            return false;
        }
    }
}

export default chesspiece;