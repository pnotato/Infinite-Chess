import { Piece } from "./chessboard";
import { DefaultPieceType } from "../../enums/PieceType.tsx";

export function defaultPieceDef(initialBoardState: Piece[]) {
    // ----- PIECE DEFINITIONS ----- //

    // PAWN

    for (let i = 0; i < 8; i++) {
        initialBoardState.push({
            image: "constantpieces/pawn_w.png",
            x: i,
            y: 1,
            type: DefaultPieceType.PAWN,
        })
        initialBoardState.push({
            image: "constantpieces/pawn_b.png",
            x: i,
            y: 6,
            type: DefaultPieceType.PAWN,
        })
    }

    // ROOK
    initialBoardState.push({
        image: "constantpieces/rook_b.png",
        x: 0,
        y: 7,
        type: DefaultPieceType.ROOK
    })
    initialBoardState.push({
        image: "constantpieces/rook_b.png",
        x: 7,
        y: 7,
        type: DefaultPieceType.ROOK
    })
    initialBoardState.push({
        image: "constantpieces/rook_w.png",
        x: 7,
        y: 0,
        type: DefaultPieceType.ROOK
    })
    initialBoardState.push({
        image: "constantpieces/rook_w.png",
        x: 0,
        y: 0,
        type: DefaultPieceType.ROOK
    })


    // KNIGHT

    initialBoardState.push({
        image: "constantpieces/knight_b.png",
        x: 1,
        y: 7,
        type: DefaultPieceType.KNIGHT
    })
    initialBoardState.push({
        image: "constantpieces/knight_b.png",
        x: 6,
        y: 7,
        type: DefaultPieceType.KNIGHT
    })
    initialBoardState.push({
        image: "constantpieces/knight_w.png",
        x: 1,
        y: 0,
        type: DefaultPieceType.KNIGHT
    })
    initialBoardState.push({
        image: "constantpieces/knight_w.png",
        x: 6,
        y: 0,
        type: DefaultPieceType.KNIGHT
    })

    // BISHOP

    initialBoardState.push({
        image: "constantpieces/bishop_b.png",
        x: 2,
        y: 7,
        type: DefaultPieceType.BISHOP
    })
    initialBoardState.push({
        image: "constantpieces/bishop_b.png",
        x: 5,
        y: 7,
        type: DefaultPieceType.BISHOP
    })
    initialBoardState.push({
        image: "constantpieces/bishop_w.png",
        x: 2,
        y: 0,
        type: DefaultPieceType.BISHOP
    })
    initialBoardState.push({
        image: "constantpieces/bishop_w.png",
        x: 5,
        y: 0,
        type: DefaultPieceType.BISHOP
    })

    // KING & QUEEN

    initialBoardState.push({
        image: "constantpieces/queen_b.png",
        x: 3,
        y: 7,
        type: DefaultPieceType.QUEEN
    })
    initialBoardState.push({
        image: "constantpieces/king_b.png",
        x: 4,
        y: 7,
        type: DefaultPieceType.KING
    })
    initialBoardState.push({
        image: "constantpieces/queen_w.png",
        x: 3,
        y: 0,
        type: DefaultPieceType.QUEEN
    })
    initialBoardState.push({
        image: "constantpieces/king_w.png",
        x: 4,
        y: 0,
        type: DefaultPieceType.KING
    })

    return initialBoardState

    // ----- END PIECE DEFINITIONS ----- //
}

export function defaultPieceDefBlack(initialBoardState: Piece[]) {
    // ----- PIECE DEFINITIONS ----- //

    // PAWN

    for (let i = 0; i < 8; i++) {
        initialBoardState.push({
            image: "constantpieces/pawn_b.png",
            x: i,
            y: 1,
            type: DefaultPieceType.PAWN,
        })
        initialBoardState.push({
            image: "constantpieces/pawn_w.png",
            x: i,
            y: 6,
            type: DefaultPieceType.PAWN,
        })
    }

    // ROOK
    initialBoardState.push({
        image: "constantpieces/rook_w.png",
        x: 0,
        y: 7,
        type: DefaultPieceType.ROOK
    })
    initialBoardState.push({
        image: "constantpieces/rook_w.png",
        x: 7,
        y: 7,
        type: DefaultPieceType.ROOK
    })
    initialBoardState.push({
        image: "constantpieces/rook_b.png",
        x: 7,
        y: 0,
        type: DefaultPieceType.ROOK
    })
    initialBoardState.push({
        image: "constantpieces/rook_b.png",
        x: 0,
        y: 0,
        type: DefaultPieceType.ROOK
    })


    // KNIGHT

    initialBoardState.push({
        image: "constantpieces/knight_w.png",
        x: 1,
        y: 7,
        type: DefaultPieceType.KNIGHT
    })
    initialBoardState.push({
        image: "constantpieces/knight_w.png",
        x: 6,
        y: 7,
        type: DefaultPieceType.KNIGHT
    })
    initialBoardState.push({
        image: "constantpieces/knight_b.png",
        x: 1,
        y: 0,
        type: DefaultPieceType.KNIGHT
    })
    initialBoardState.push({
        image: "constantpieces/knight_b.png",
        x: 6,
        y: 0,
        type: DefaultPieceType.KNIGHT
    })

    // BISHOP

    initialBoardState.push({
        image: "constantpieces/bishop_w.png",
        x: 2,
        y: 7,
        type: DefaultPieceType.BISHOP
    })
    initialBoardState.push({
        image: "constantpieces/bishop_w.png",
        x: 5,
        y: 7,
        type: DefaultPieceType.BISHOP
    })
    initialBoardState.push({
        image: "constantpieces/bishop_b.png",
        x: 2,
        y: 0,
        type: DefaultPieceType.BISHOP
    })
    initialBoardState.push({
        image: "constantpieces/bishop_b.png",
        x: 5,
        y: 0,
        type: DefaultPieceType.BISHOP
    })

    // KING & QUEEN

    initialBoardState.push({
        image: "constantpieces/queen_w.png",
        x: 3,
        y: 7,
        type: DefaultPieceType.QUEEN
    })
    initialBoardState.push({
        image: "constantpieces/king_w.png",
        x: 4,
        y: 7,
        type: DefaultPieceType.KING
    })
    initialBoardState.push({
        image: "constantpieces/queen_b.png",
        x: 3,
        y: 0,
        type: DefaultPieceType.QUEEN
    })
    initialBoardState.push({
        image: "constantpieces/king_b.png",
        x: 4,
        y: 0,
        type: DefaultPieceType.KING
    })

    return initialBoardState

    // ----- END PIECE DEFINITIONS ----- //
}