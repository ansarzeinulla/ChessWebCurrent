function createGamefromFEN(fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", playerNicks) {
    const parts = fen.split(" ");
    const board = Array.from({ length: 62 }, () => Array(62).fill(0));
    const rows = parts[0].split("/");
    
    // Correct piece mapping
    const pieceMap = {
        'p': 206, 'r': 203, 'n': 205, 'b': 204, 'q': 202, 'k': 201, // Black pieces
        'P': 106, 'R': 103, 'N': 105, 'B': 104, 'Q': 102, 'K': 101  // White pieces
    };
    
    // Fill the board
    for (let i = 34; i < 34 + 8; i++) {
        let col = 20; // Start from column 20
        for (let char of rows[i - 34]) {
            if (!isNaN(char)) {
                col += parseInt(char);
            } else {
                board[i][col] = pieceMap[char];
                col++;
            }
        }
    }
    
    const whoseMove = parts[1] === 'w' ? 0 : 1;
    const castlingRights = parts[2];
    
    // Initialize en passant array with proper structure
    const enPassantArray = Array.from({ length: playerNicks.length }, () => []);
    if (parts[3] !== "-") {
        const targetSquare = parts[3];
        const direction = whoseMove === 0 ? 'up' : 'down';
        const pawnRow = direction === 'up' ? 
            parseInt(targetSquare[1]) - 1 : // One row below for white
            parseInt(targetSquare[1]) + 1;  // One row above for black
        
        const pawnSquare = targetSquare[0] + pawnRow;
        enPassantArray[1 - whoseMove] = [pawnSquare, targetSquare]; // Store both pawn location and target square
    }
    
    // Initialize pawn positions
    const startingPositionsOfPawns = Array.from({ length: playerNicks.length }, () => []);
    const endingPositionsOfPawns = Array.from({ length: playerNicks.length }, () => []);
    
    startingPositionsOfPawns[0] = ["a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"];
    startingPositionsOfPawns[1] = ["a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"];
    
    endingPositionsOfPawns[0] = ["a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8"];
    endingPositionsOfPawns[1] = ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"];
    
    // Initialize castling abilities
    const rightCastleAbilities = Array.from({ length: playerNicks.length }, () => []);
    const leftCastleAbilities = Array.from({ length: playerNicks.length }, () => []);
    
    rightCastleAbilities[0] = [castlingRights.includes('K'), "e1", "g1", "h1", "f1", ["e1", "f1", "g1"]];
    leftCastleAbilities[0] = [castlingRights.includes('Q'), "e1", "c1", "a1", "d1", ["e1", "d1", "c1"]];
    
    rightCastleAbilities[1] = [castlingRights.includes('k'), "e8", "g8", "h8", "f8", ["e8", "f8", "g8"]];
    leftCastleAbilities[1] = [castlingRights.includes('q'), "e8", "c8", "a8", "d8", ["e8", "d8", "c8"]];
    
    // Set pawn directions
    const pawnDirections = ['up', 'down'];
    
    return new ChessGame(
        8, playerNicks, board, false, whoseMove, enPassantArray, 
        Array(playerNicks.length).fill(true), startingPositionsOfPawns, 
        endingPositionsOfPawns, rightCastleAbilities, leftCastleAbilities, pawnDirections
    );
}




// Make the function globally available
window.createGamefromFEN = createGamefromFEN;
