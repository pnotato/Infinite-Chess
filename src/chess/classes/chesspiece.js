class chesspiece {
    constructor(basic, custom, statusEffects, givenStatusEffect) {

        if (!basic || !custom) {
            return;
        }

        this.color = basic.color;
        this.position = basic.position;

        this.name = custom.name;
        this.emoji = custom.emoji;
        this.description = custom.description;

        this.statusEffects = statusEffects || [];
        this.givenStatusEffect = givenStatusEffect || null;

        this.favourite = false;

        // flip movement and attack patterns if black
        if (this.color === 'BLACK') {
            this.movementPattern = custom.movement.map((move) => { return { x: move.x * -1, y: move.y * -1 } });
            this.attackPattern = custom.attack.map((attack) => { return { x: attack.x * -1, y: attack.y * -1 } });
        } else {
            this.movementPattern = custom.movement;
            this.attackPattern = custom.attack;
        }

        this.traits = custom.traits;
    }

    // ------------------- Methods -------------------
    updateInfo(custom, board) {
        this.name = custom.name;
        this.emoji = custom.emoji;
        this.description = custom.description;

        // flip movement and attack patterns if black
        if (this.color === 'BLACK') {
            this.movementPattern = custom.movement.map((move) => { return { x: move.x * -1, y: move.y * -1 } });
            this.attackPattern = custom.attack.map((attack) => { return { x: attack.x * -1, y: attack.y * -1 } });
        } else {
            this.movementPattern = custom.movement;
            this.attackPattern = custom.attack;
        }

        this.traits = custom.traits;

        this.givenStatusEffect = custom.statusEffect;
        this.summonedPiece = custom.summonedPiece;

        board.setPiece(null, this.position.x, this.position.y);
        board.setPiece(this, this.position.x, this.position.y);

        this.getValidMoves(board);
        this.getValidAttacks(board);
    }

    favouritePiece() {
        this.favourite = !this.favourite;
    }

    getValidMoves(board) {
        this.validMoves = [];

        this.movementPattern.forEach((move) => {
            let x = this.position.x + move.x;
            let y = this.position.y + move.y;

            if (x >= 0 && x < 8 && y >= 0 && y < 8 && !board.getPiece(x, y) && (this.traits.includes('IGNORE_BLOCKED_MOVE') || !this.isBeingBlocked(x, y, board)) && !this.traits.includes('SUMMONER')) {
                this.validMoves.push({ x: x, y: y });
            }
        });
    }

    getValidAttacks(board) {
        this.validAttacks = [];
    
        this.attackPattern.forEach((attack) => {
            let x = this.position.x + attack.x;
            let y = this.position.y + attack.y;
    
            if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                const targetCell = board.getCell(x, y);
                const targetPiece = targetCell?.getPiece();
    
                if (this.traits.includes('SUMMONER') && this.summonedPiece) {
                    // Allow summoning on empty cells
                    if (!targetPiece && (this.traits.includes('IGNORE_BLOCKED_ATTACK') || !this.isBeingBlocked(x, y, board))) {
                        this.validAttacks.push({ x: x, y: y });
                    }
                } else {
                    if (!this.traits.includes('TARGET_ALLY')) {
                        if (targetPiece && targetPiece.color !== this.color && (this.traits.includes('IGNORE_BLOCKED_ATTACK') || !this.isBeingBlocked(x, y, board))) {
                            this.validAttacks.push({ x: x, y: y });
                        }
                    } else {
                        if (targetPiece && targetPiece.color === this.color && (this.traits.includes('IGNORE_BLOCKED_ATTACK') || !this.isBeingBlocked(x, y, board))) {
                            this.validAttacks.push({ x: x, y: y });
                        }
                    }
                }
            }
        });
    }
    

    isBeingBlocked(x, y, board) {
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

    setPosition(x, y, board) {
        board.setPiece(null, this.position.x, this.position.y);
        board.setPiece(this, x, y);

        this.position = { x: x, y: y };
        this.getValidMoves(board);
        this.getValidAttacks(board);
    }

    destroy(board) {
        //board.setPiece(null, this.position.x, this.position.y);
        let targets = [this];

        if (this.traits.includes('RADIUS') && !this.traits.includes('STATUS_EFFECT')) {
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

    move(x, y, board) {
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

    attack(targetCell, board) {
        const x = targetCell.x;
        const y = targetCell.y;
    
        if (this.validAttacks.some((attack) => attack.x === x && attack.y === y) &&
            !this.statusEffects.some((statusEffect) => statusEffect.status.includes("IMMOBILE")) &&
            !this.statusEffects.some((statusEffect) => statusEffect.status.includes("WEAKENED"))) {
    
            let targets = [targetCell.getPiece()].filter(Boolean);
    
            if (this.traits.includes('MULTIATTACK')) {
                // Add all pieces in valid attack positions to targets
                this.validAttacks.forEach((attack) => {
                    let piece = board.getPiece(attack.x, attack.y);
                    if (piece && piece.color !== this.color && !targets.includes(piece)) {
                        targets.push(piece);
                    }
                });
            }
    
            if (this.traits.includes('RADIUS')) {
                // Add all pieces in a 3x3 radius for all targets
                targets.forEach((currentTarget) => {
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            let piece = board.getPiece(currentTarget.position.x + i, currentTarget.position.y + j);
                            if (piece && piece !== this && !targets.includes(piece)) {
                                targets.push(piece);
                            }
                        }
                    }
                });
            }
    
            if (this.traits.includes('SUMMONER') && this.summonedPiece && !targetCell.getPiece()) {
                let newPiece = new chesspiece({ color: this.color, position: { x: x, y: y } }, {name: this.summonedPiece.name, emoji: this.summonedPiece.emoji, description: "", movement: this.summonedPiece.movement, attack: this.summonedPiece.attack, traits: this.summonedPiece.traits}, [], this.summonedPiece.statusEffect);
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
                                currentTarget.statusEffects = currentTarget.statusEffects.filter((statusEffect) => statusEffect.status.includes("KING"));
                            });
                        } else {
                            targets.forEach((currentTarget) => {
                                currentTarget.statusEffects.push(this.givenStatusEffect);
                            });
                        }
                    } else {
                        targets.forEach((currentTarget) => {
                            currentTarget.destroy(board);
                        });
                    }
                }
    
                if (this.traits.includes('STATIONARY_ATTACK') || this.traits.includes('STATUS_EFFECT')) {
                    shouldMove = false;
                }
    
                if (shouldMove) {
                    this.setPosition(x, y, board);
                }
            }
    
            if (this.traits.includes('SELF_DESTRUCT') || targets.some(target => target?.traits.includes('REFLECT'))) {
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