import colors from "../enums/colors.tsx";
import traits from "../enums/traits.tsx";
import status from "../enums/status.tsx";
import chessboard from "./chessboard.tsx";
import cell from "./cell.tsx";

function strToTrait(str: string): traits | undefined {
    switch (str) {
        case "IGNORE_BLOCKED_ATTACK":
            return traits.IGNORE_BLOCKED_ATTACK;
        case "IGNORE_BLOCKED_MOVE":
            return traits.IGNORE_BLOCKED_MOVE;
        case "STATIONARY_ATTACK":
            return traits.STATIONARY_ATTACK;
        case "SELF_DESTRUCT":
            return traits.SELF_DESTRUCT;
        case "REFLECT":
            return traits.REFLECT;
        case "RADIUS":
            return traits.RADIUS;
        case "MULTIATTACK":
            return traits.MULTIATTACK;
        case "STATUS_EFFECT":
            return traits.STATUS_EFFECT;
        case "TARGET_ALLY":
            return traits.TARGET_ALLY;
        case "SUMMONER":
            return traits.SUMMONER;
        default:
            return undefined;
    }
}

class chesspiece {
    // ------------------- Properties -------------------
    name: string;
    emoji: string;
    description: string;

    favourite: boolean;

    color: colors;
    position: { x: number, y: number };

    movementPattern: { x: number, y: number }[];
    attackPattern: { x: number, y: number }[];
    traits: traits[];

    // ------------------- State -------------------
    validMoves: { x: number, y: number }[];
    validAttacks: { x: number, y: number }[];

    statusEffects: { status: string[], name: string, emoji: string, duration: number }[];

    givenStatusEffect: { status: string[], name: string, emoji: string, duration: number } | null;
    summonedPiece: { name: string, emoji: string, description: string, movement: { x: number, y: number }[], attack: { x: number, y: number }[], traits: traits[] } | null;

    constructor(basic: { color: colors, position: { x: number, y: number } },
        custom: { name: string, emoji: string, description: string, movement: { x: number, y: number }[], attack: { x: number, y: number }[], traits: traits[] }, statusEffects: { status: string[], name: string, emoji: string, duration: number }[] = [], givenStatusEffect: { status: string[], name: string, emoji: string, duration: number } | null = null) {

        if (!basic || !custom) {
            return;
        }

        this.color = basic.color;
        this.position = basic.position;

        this.name = custom.name;
        this.emoji = custom.emoji;
        this.description = custom.description;

        this.statusEffects = statusEffects;
        this.givenStatusEffect = givenStatusEffect;

        this.favourite = false;

        // flip movement and attack patterns if black
        if (this.color === colors.BLACK) {
            this.movementPattern = custom.movement.map((move) => { return { x: move.x * -1, y: move.y * -1 } });
            this.attackPattern = custom.attack.map((attack) => { return { x: attack.x * -1, y: attack.y * -1 } });
        } else {
            this.movementPattern = custom.movement;
            this.attackPattern = custom.attack;
        }

        this.traits = custom.traits;
    }

    // ------------------- Methods -------------------
    updateInfo(custom: { name: string, emoji: string, description: string, movement: { x: number, y: number }[], attack: { x: number, y: number }[], traits: string[], statusEffect: { status: string[], name: string, emoji: string, duration: number } | null, summonedPiece: { name: string, emoji: string, description: string, movement: { x: number, y: number }[], attack: { x: number, y: number }[], traits: traits[] } | null }, board: chessboard) {
        this.name = custom.name;
        this.emoji = custom.emoji;
        this.description = custom.description;

        // flip movement and attack patterns if black
        if (this.color === colors.BLACK) {
            this.movementPattern = custom.movement.map((move) => { return { x: move.x * -1, y: move.y * -1 } });
            this.attackPattern = custom.attack.map((attack) => { return { x: attack.x * -1, y: attack.y * -1 } });
        } else {
            this.movementPattern = custom.movement;
            this.attackPattern = custom.attack;
        }

        // foreach trait in custom.traits, add a switch statement to add the trait to this.traits
        custom.traits.forEach((trait) => {
            this.traits.push(strToTrait(trait)!);
        });

        this.givenStatusEffect = custom.statusEffect;
        this.summonedPiece = custom.summonedPiece;

        if(!custom.summonedPiece) {
            // remove summoner trait
            this.traits = this.traits.filter(trait => trait !== traits.SUMMONER);
        }

        board.setPiece(null, this.position.x, this.position.y);
        board.setPiece(this, this.position.x, this.position.y);

        this.getValidMoves(board);
        this.getValidAttacks(board);
    }

    favouritePiece() {
        this.favourite = !this.favourite;
    }

    getValidMoves(board: chessboard) {
        this.validMoves = [];

        this.movementPattern.forEach((move) => {
            let x = this.position.x + move.x;
            let y = this.position.y + move.y;

            if (x >= 0 && x < 8 && y >= 0 && y < 8 && !board.getPiece(x, y) && (this.traits.includes(traits.IGNORE_BLOCKED_MOVE) || !this.isBeingBlocked(x, y, board)) && !this.traits.includes(traits.SUMMONER)) {
                this.validMoves.push({ x: x, y: y });
            }
        });
    }

    getValidAttacks(board: chessboard) {
        this.validAttacks = [];
    
        this.attackPattern.forEach((attack) => {
            let x = this.position.x + attack.x;
            let y = this.position.y + attack.y;
    
            if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                const targetCell = board.getCell(x, y);
                const targetPiece = targetCell?.getPiece();
    
                if (this.traits.includes(traits.SUMMONER) && this.summonedPiece) {
                    // Allow summoning on empty cells
                    if (!targetPiece && (this.traits.includes(traits.IGNORE_BLOCKED_ATTACK) || !this.isBeingBlocked(x, y, board))) {
                        this.validAttacks.push({ x: x, y: y });
                    }
                } else {
                    if (!this.traits.includes(traits.TARGET_ALLY)) {
                        if (targetPiece && targetPiece.color !== this.color && (this.traits.includes(traits.IGNORE_BLOCKED_ATTACK) || !this.isBeingBlocked(x, y, board))) {
                            this.validAttacks.push({ x: x, y: y });
                        }
                    } else {
                        if (targetPiece && targetPiece.color === this.color && (this.traits.includes(traits.IGNORE_BLOCKED_ATTACK) || !this.isBeingBlocked(x, y, board))) {
                            this.validAttacks.push({ x: x, y: y });
                        }
                    }
                }
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
        //board.setPiece(null, this.position.x, this.position.y);
        let targets: chesspiece[];
        targets = [this];

        if (this.traits.includes(traits.RADIUS) && !this.traits.includes(traits.STATUS_EFFECT)) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    let piece = board.getPiece(this.position.x + i, this.position.y + j);
                    if (piece && piece !== this) {
                        targets.push(piece);
                    }
                }
            }
        }

        targets.forEach((target) => {
            if (target.statusEffects.some((statusEffect) => statusEffect.status.includes("SHIELDED"))) {
                target.statusEffects = target.statusEffects.filter((statusEffect) => !statusEffect.status.includes("SHIELDED"));
            }
            else {
                board.setPiece(null, target.position.x, target.position.y);
                if (target.statusEffects.some((statusEffect) => statusEffect.status.includes("KING"))) {
                    board.gameOver(target.color);
                }
            }
        });
    }

    move(x: number, y: number, board: chessboard) {
        if (this.validMoves.some((move) => move.x === x && move.y === y) && !this.statusEffects.some((statusEffect) => statusEffect.status.includes("IMMOBILE")) && !this.statusEffects.some((statusEffect) => statusEffect.status.includes("GOADED"))) {
            this.setPosition(x, y, board);
            if (this.statusEffects.some((statusEffect) => statusEffect.status.includes("HASTED"))) {
                this.statusEffects = this.statusEffects.filter((statusEffect) => !statusEffect.status.includes("HASTED"));
                return false;
            }
            return true;
        } else {
            return false;
        }
    }

    attack(targetCell: cell, board: chessboard) {
        const x = targetCell.x;
        const y = targetCell.y;
    
        if (this.validAttacks.some((attack) => attack.x === x && attack.y === y) &&
            !this.statusEffects.some((statusEffect) => statusEffect.status.includes("IMMOBILE")) &&
            !this.statusEffects.some((statusEffect) => statusEffect.status.includes("WEAKENED"))) {
    
            let targets = [targetCell.getPiece()].filter(Boolean) as chesspiece[];
    
            if (this.traits.includes(traits.MULTIATTACK)) {
                // Add all pieces in valid attack positions to targets
                this.validAttacks.forEach((attack) => {
                    let piece = board.getPiece(attack.x, attack.y);
                    if (piece && piece.color !== this.color && !targets.includes(piece)) {
                        targets.push(piece);
                    }
                });
            }
    
            if (this.traits.includes(traits.RADIUS)) {
                // Add all pieces in a 3x3 radius for all targets
                targets.forEach((currentTarget) => {
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            let piece = board.getPiece(currentTarget!.position.x + i, currentTarget!.position.y + j);
                            if (piece && piece !== this && !targets.includes(piece)) {
                                targets.push(piece);
                            }
                        }
                    }
                });
            }
    
            if (this.traits.includes(traits.SUMMONER) && this.summonedPiece && !targetCell.getPiece()) {
                let traitsGood: traits[] = [];
                for (let i = 0; i < this.summonedPiece.traits.length; i++) {
                    if (strToTrait(this.summonedPiece.traits[i].toString())) {
                        traitsGood.push(strToTrait(this.summonedPiece.traits[i].toString())!);
                    }
                }

                let newPiece = new chesspiece({ color: this.color, position: { x: x, y: y } }, {name: this.summonedPiece.name, emoji: this.summonedPiece.emoji, description: "", movement: this.summonedPiece.movement, attack: this.summonedPiece.attack, traits: traitsGood});
                
                board.setPiece(newPiece, x, y);
            } else {
                let shouldMove = true;
    
                if (targets.length > 0) {
                    const target = targets[0];
                    if (target.statusEffects.some((statusEffect) => statusEffect.status.includes("SHIELDED"))) {
                        shouldMove = false;
                    }
    
                    if (this.givenStatusEffect) {
                        // Clear status effects or apply status effect to all targets
                        if (this.givenStatusEffect.status.includes("CLEAR")) {
                            targets.forEach((currentTarget) => {
                                currentTarget!.statusEffects = currentTarget!.statusEffects.filter((statusEffect) => statusEffect.status.includes("KING"));
                            });
                        } else {
                            targets.forEach((currentTarget) => {
                                currentTarget!.statusEffects.push(this.givenStatusEffect!);
                            });
                        }
                    } else {
                        targets.forEach((currentTarget) => {
                            currentTarget!.destroy(board);
                        });
                    }
                }
    
                if (this.traits.includes(traits.STATIONARY_ATTACK) || this.traits.includes(traits.STATUS_EFFECT)) {
                    shouldMove = false;
                }
    
                if (shouldMove) {
                    this.setPosition(x, y, board);
                }
            }
    
            if (this.traits.includes(traits.SELF_DESTRUCT) || targets.some(target => target?.traits.includes(traits.REFLECT))) {
                this.destroy(board);
            }
    
            this.getValidAttacks(board);
    
            if (this.statusEffects.some((statusEffect) => statusEffect.status.includes("HASTED"))) {
                this.statusEffects = this.statusEffects.filter((statusEffect) => !statusEffect.status.includes("HASTED"));
                return false;
            }
    
            return true;
        } else {
            return false;
        }
    }
    
}

export default chesspiece;