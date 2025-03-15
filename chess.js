class ChessGame {
    constructor(boardsize = 8, playerNicks, board = Array.from({ length: 62 }, () => Array(62).fill(1)), 
    isFinished = false, whoseMove = 0, enPassantArray = null, 
    isAlivePlayers = null, startingPositionsOfPawns = null, 
    endingPositionsOfPawns = null, rightCastleAbilities = null, leftCastleAbilities = null, 
    pawnDirections = null, history = "") {

        enPassantArray = enPassantArray || Array.from({ length: playerNicks.length }, () => []);
        isAlivePlayers = isAlivePlayers || Array(playerNicks.length).fill(true);
        startingPositionsOfPawns = startingPositionsOfPawns || Array.from({ length: playerNicks.length }, () => []);
        endingPositionsOfPawns = endingPositionsOfPawns || Array.from({ length: playerNicks.length }, () => []);
        rightCastleAbilities = rightCastleAbilities || Array(playerNicks.length).fill([true]);
        leftCastleAbilities = leftCastleAbilities || Array(playerNicks.length).fill([true]);
        pawnDirections = pawnDirections || Array(playerNicks.length).fill("up");
        
    // Rest of the constructor...

        if(boardsize > 20 || boardsize < 4){
            throw new Error("Board size are [5;20]")
        }
        if (board.length !== 62 || board.some(row => row.length !== 62)) {
            throw new Error("Board must be a 62x62 array");
        }        
        if( playerNicks.length < 2 || playerNicks.length > 8 ) {
            throw new Error("Only [2;8] players are allowed");
        }
        if (!playerNicks.every(nick => nick.length >= 3 && nick.length <= 10)) {
            throw new Error("Each player's nickname must be between 3 and 10 characters.");
        }
        if (rightCastleAbilities.length != playerNicks.length) {
            throw new Error("rightCastleAbilities array must have playerNumber size");
        }
        if (leftCastleAbilities.length != playerNicks.length) {
            throw new Error("leftCastleAbilities array must have playerNumber size");
        }
        if (whoseMove >= playerNicks.length) {
            throw new Error("whooseMove must be [0; playerNumber) ");
        }
        if (enPassantArray.length != playerNicks.length) {
            throw new Error("Enpassant array must have playerNumber size");
        }
        if (isAlivePlayers.length != playerNicks.length) {
            throw new Error("isAlivePlayer array must have playerNumber size");
        }
        if (startingPositionsOfPawns.length != playerNicks.length) {
            throw new Error("startingPositionsOfPawns array must have playerNumber size");
        }
        if (endingPositionsOfPawns.length != playerNicks.length) {
            throw new Error("endingPositionsOfPawns array must have playerNumber size");
        }
        if (pawnDirections.length != playerNicks.length) {
            throw new Error("pawnDirections array must have playerNumber size");
        }
        if (!pawnDirections.every(dir => ['up', 'down', 'left', 'right'].includes(dir))) {
            throw new Error("Pawn directions must be 'up', 'down', 'left', or 'right'");
        }

        this.board=board;
        this.boardsize = boardsize;
        this.players = playerNicks;
        this.isFinished = isFinished;
        this.whoseMove = whoseMove;
        this.enPassantArray = enPassantArray;
        this.isAlivePlayers = isAlivePlayers;
        this.startingPositionsOfPawns = startingPositionsOfPawns;
        this.endingPositionsOfPawns = endingPositionsOfPawns;
        this.rightCastleAbilities = rightCastleAbilities;
        this.leftCastleAbilities = leftCastleAbilities;
        this.pawnDirections = pawnDirections;
        this.kingCoords = Array(playerNicks.length).fill().map(() => ({ row: 0, col: 0 }));
        // After all the assignments in constructor, add this code to find kings:
        for (let i = 41-this.boardsize; i <= 41; i++) {
            for (let j = 20; j < 20 + this.boardsize; j++) {
                const piece = this.board[i][j];
                if (piece > 100 && piece % 100 === 1) { // If it's a king
                    const playerIndex = Math.floor(piece / 100) - 1;
                    if (this.isAlivePlayers[playerIndex]) {
                        this.kingCoords[playerIndex] = { row: i, col: j };
                    }
                }
            }
        }
    }

    displayBoard(standing = 'normal') {
        // Validate standing parameter
        const validStandings = ['normal', 'upside', 'right', 'left'];
        if (!validStandings.includes(standing)) {
            throw new Error("Standing must be 'normal', 'upside', 'right', or 'left'");
        }

        const boardContainer = document.getElementById('board');
        boardContainer.innerHTML = ''; // Clear existing board content

        // Calculate button size based on board size
        const buttonSize = this.boardsize <= 8 ? 60 : 
                        this.boardsize <= 12 ? 50 :
                        this.boardsize <= 16 ? 40 : 30; // px

        // Set container styles based on orientation
        if (standing === 'right' || standing === 'left') {
            boardContainer.style.gridTemplateRows = `repeat(${this.boardsize}, ${buttonSize}px)`;
            boardContainer.style.gridTemplateColumns = `repeat(${this.boardsize}, ${buttonSize}px)`;
            boardContainer.style.transform = standing === 'right' ? 'rotate(90deg)' : 'rotate(-90deg)';
        } else {
            boardContainer.style.gridTemplateColumns = `repeat(${this.boardsize}, ${buttonSize}px)`;
            boardContainer.style.gridTemplateRows = `repeat(${this.boardsize}, ${buttonSize}px)`;
            boardContainer.style.transform = standing === 'upside' ? 'rotate(180deg)' : 'none';
        }

        // First, create a miniboard dictionary with chess notation as keys and piece values as values
        const miniboardDict = {};
        
        for (let i = 0; i < this.boardsize; i++) {
            for (let j = 0; j < this.boardsize; j++) {
                // Calculate the actual board coordinates
                const actualRow = 42 - this.boardsize + i;
                const actualCol = 20 + j;
                
                // Calculate the chess notation for this position
                const file = String.fromCharCode('a'.charCodeAt(0) + j);
                const rank = this.boardsize - i;
                const position = `${file}${rank}`;
                
                // Store the piece value in the dictionary
                miniboardDict[position] = this.board[actualRow][actualCol];
            }
        }
        
        // Now iterate through the board positions to generate buttons
        for (let row = 0; row < this.boardsize; row++) {
            for (let col = 0; col < this.boardsize; col++) {
                const button = document.createElement('button');
                
                // Apply styles directly to button
                Object.assign(button.style, {
                    width: `${buttonSize}px`,
                    height: `${buttonSize}px`,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0',
                    margin: '0',
                    transition: 'opacity 0.2s'
                });

                // Calculate the chess notation for this position
                const file = String.fromCharCode('a'.charCodeAt(0) + col);
                const rank = this.boardsize - row;
                const position = `${file}${rank}`;
                
                // Store the position as a data attribute for move handling
                button.dataset.position = position;
                
                // Set background color (alternating pattern)
                button.style.backgroundColor = ((row + col) % 2 === 0) ? '#f0d9b5' : '#b58863';
                
                // Get the piece value from the dictionary
                const cellValue = miniboardDict[position];
                
                // Add piece image if present
                if (cellValue > 100) {
                    const figureImage = this.getFigureImage(cellValue);
                    const img = document.createElement('img');
                    img.src = `pieces/${figureImage}`;
                    img.alt = `figure${figureImage}`;
                    img.style.width = '100%';
                    img.style.height = '100%';
                    
                    // Rotate image based on standing
                    switch (standing) {
                        case 'upside':
                            img.style.transform = 'rotate(180deg)';
                            break;
                        case 'right':
                            img.style.transform = 'rotate(-90deg)';
                            break;
                        case 'left':
                            img.style.transform = 'rotate(90deg)';
                            break;
                    }
                    
                    button.appendChild(img);
                }

                // Add hover effect
                button.addEventListener('mouseover', () => {
                    button.style.opacity = '0.8';
                });
                button.addEventListener('mouseout', () => {
                    button.style.opacity = '1';
                });

                boardContainer.appendChild(button);
            }
        }
    }

    getFigureImage(cellValue) {
        const figureImages = {
            101: '101.png', 102: '102.png', 103: '103.png', 104: '104.png', 105: '105.png', 106: '106.png', // White pieces
            201: '201.png', 202: '202.png', 203: '203.png', 204: '204.png', 205: '205.png', 206: '206.png', // Black pieces
            301: '301.png', 302: '302.png', 303: '303.png', 304: '304.png', 305: '305.png', 306: '306.png', // 3rd player
            401: '401.png', 402: '402.png', 403: '403.png', 404: '404.png', 405: '405.png', 406: '406.png', // 4th player
            501: '501.png', 502: '502.png', 503: '503.png', 504: '504.png', 505: '505.png', 506: '506.png', // 5th player
            601: '601.png', 602: '602.png', 603: '603.png', 604: '604.png', 605: '605.png', 606: '606.png', // 6th player
            701: '701.png', 702: '702.png', 703: '703.png', 704: '704.png', 705: '705.png', 706: '706.png', // 7th player
            801: '801.png', 802: '802.png', 803: '803.png', 804: '804.png', 805: '805.png', 806: '806.png',  // 8th player
            901: '901.png', 902: '902.png', 903: '903.png', 904: '904.png', 905: '905.png', 906: '906.png' // dead player
        };
        return figureImages[cellValue] || ''; // If no match, return an empty string
    }

    isValidMove(from, to, promotion, mycolor) {
        if (promotion && !['q', 'r', 'b', 'n'].includes(promotion.toLowerCase())) {
            throw new Error("Invalid promotion piece. Must be 'q', 'r', 'b', or 'n'");
        }
        console.log("Received king corrds in isValidMove", this.kingCoords)
        // Convert chess notation to board coordinates
        const fromCoords = this.convertChessNotationToCoords(from);
        const toCoords = this.convertChessNotationToCoords(to);
        if (!fromCoords || !toCoords) return false; // Invalid chess notation
        // Get the values from the board
        const fromValue = this.board[fromCoords.row][fromCoords.col];
        const toValue = this.board[toCoords.row][toCoords.col];

        // Calculate the valid range for the current player's pieces
        const playerMinValue = (mycolor + 1) * 100;
        const playerMaxValue = playerMinValue + 99;

        // Check if the FROM cell contains current player's piece
        if (fromValue < playerMinValue || fromValue > playerMaxValue) return false;

        // Check if the TO cell is not a barrier (value 1)
        if (toValue === 1) return false;

        // Check if the TO cell doesn't contain current player's piece
        if (toValue >= playerMinValue && toValue <= playerMaxValue) return false;

        // Determine which piece is moving and call the appropriate validation function
        const pieceType = fromValue % 100; // Get the last two digits to identify the piece type
        
        switch (pieceType) {
            case 1:
                if (!this.isValidKingMove(fromCoords, toCoords, mycolor)) return false;
                break;
            case 2:
                if (!this.isValidQueenMove(fromCoords, toCoords)) return false;
                break;
            case 3:
                if (!this.isValidRookMove(fromCoords, toCoords)) return false;
                break;
            case 4:
                if (!this.isValidBishopMove(fromCoords, toCoords)) return false;
                break;
            case 5:
                if (!this.isValidKnightMove(fromCoords, toCoords)) return false;
                break;
            case 6:
                if (!this.isValidPawnComplexMove(fromCoords, toCoords, promotion, mycolor)) return false;
                break;
            default:
                return false;
        }
        
        // Check if the move would put or leave the king in check
        // Create a buffer game to simulate the move
        // Create a buffer board to simulate the move
        const bufferBoard = JSON.parse(JSON.stringify(this.board));

        // Delete the king from its current position in the buffer board
        const kingPosition = this.kingCoords[mycolor];
        if (kingPosition) {
            bufferBoard[kingPosition.row][kingPosition.col] = 0;
        }
        const bufferGame = new ChessGame(
            this.boardsize, 
            this.players, 
            bufferBoard,
            this.isFinished,
            this.whoseMove,
            JSON.parse(JSON.stringify(this.enPassantArray)),
            [...this.isAlivePlayers],
            JSON.parse(JSON.stringify(this.startingPositionsOfPawns)),
            JSON.parse(JSON.stringify(this.endingPositionsOfPawns)),
            JSON.parse(JSON.stringify(this.rightCastleAbilities)),
            JSON.parse(JSON.stringify(this.leftCastleAbilities)),
            [...this.pawnDirections]
        );
        // Execute the move in the buffer game
        bufferGame.doMove(from, to, promotion, mycolor);
    
        // Check if the king is in check after the move
        const kingCoords = pieceType === 1 ? toCoords : this.kingCoords[mycolor];
        if (bufferGame.isCheckForMe(mycolor, kingCoords, bufferBoard)) {
            return false; // Move would leave king in check
        }
        return true;
    }

    isValidKingMove(fromCoords, toCoords, mycolor) {
        // Calculate the absolute differences in row and column
        const rowDiff = Math.abs(toCoords.row - fromCoords.row);
        const colDiff = Math.abs(toCoords.col - fromCoords.col);
        
        // King can move one square in any direction
        let isValid = false;
        
        if (rowDiff <= 1 && colDiff <= 1 && (rowDiff > 0 || colDiff > 0)) {
            isValid = true;
        } else {
            // Check for castling
            const playerIndex = mycolor; // Player index (0-based)
            
            // Get castling abilities for the current player
            const rightCastling = this.rightCastleAbilities[playerIndex];
            const leftCastling = this.leftCastleAbilities[playerIndex];
            
            if (this.isValidCastling(fromCoords, toCoords, rightCastling, mycolor)) {
                isValid = true;
            } else if (this.isValidCastling(fromCoords, toCoords, leftCastling, mycolor)) {
                isValid = true;
            }
        }
        
        // If the move is valid so far, check if it would put the king in check
        if (isValid) {
            // Create a buffer board to simulate the move
            const bufferBoard = JSON.parse(JSON.stringify(this.board));
            
            // Move the king on the buffer board
            bufferBoard[toCoords.row][toCoords.col] = bufferBoard[fromCoords.row][fromCoords.col];
            bufferBoard[fromCoords.row][fromCoords.col] = 0;
            
            // Check if the king would be in check at the new position
            if (this.isCheckForMe(mycolor, toCoords, bufferBoard)) {
                return false; // Move would put king in check
            }
        }
        
        return isValid;
    }

    isValidCastling(fromCoords, toCoords, castlingAbility, mycolor) {//CORRECT
        if (!castlingAbility[0]) {
            return false;
        }
        // Convert king's starting position from chess notation to coordinates
        const kingStartCoords = this.convertChessNotationToCoords(castlingAbility[1]);
        
        // Check if king is in the starting position
        if (fromCoords.row !== kingStartCoords.row || fromCoords.col !== kingStartCoords.col) return false;
        
        
        // Convert king's final position from chess notation to coordinates
        const kingFinalCoords = this.convertChessNotationToCoords(castlingAbility[2]);
        
        // Check if king's final position is empty
        if (this.board[kingFinalCoords.row][kingFinalCoords.col] !== 0) return false;
        
        // Convert rook's starting position from chess notation to coordinates
        const rookStartCoords = this.convertChessNotationToCoords(castlingAbility[3]);
        
        // Check if rook is in the starting position
        const rookValue = (mycolor + 1) * 100 + 3; // Rook value (103 for white, 203 for black, etc.)
        if (this.board[rookStartCoords.row][rookStartCoords.col] !== rookValue) return false;
        
        // Convert rook's final position from chess notation to coordinates
        const rookFinalCoords = this.convertChessNotationToCoords(castlingAbility[4]);
        
        // Check if rook's final position is empty
        if (this.board[rookFinalCoords.row][rookFinalCoords.col] !== 0) return false;
        
        // Check if the destination matches the king's final position for castling
        if (toCoords.row !== kingFinalCoords.row || toCoords.col !== kingFinalCoords.col) return false;
        
        // Create a buffer board to check if the rook can move to its final position
        const bufferBoard = JSON.parse(JSON.stringify(this.board));
        bufferBoard[fromCoords.row][fromCoords.col] = 0; // Remove king from original position
        
        // Check if rook can move to its final position
        const tempGame = new ChessGame(this.boardsize, this.players, bufferBoard);
        if (!tempGame.isValidRookMove(rookStartCoords, rookFinalCoords)) return false;
        
        // Check for checks in the path (commented for now)
        for (const position of castlingAbility[5]) {
            const posCoords = this.convertChessNotationToCoords(position);
            if (this.isCheckForMe(mycolor,posCoords,bufferBoard)) return false;
        }
        
        return true; 
    }

    isValidQueenMove(fromCoords, toCoords) {//CORRECT
        return this.isValidRookMove(fromCoords, toCoords) || 
               this.isValidBishopMove(fromCoords, toCoords);
    }

    isValidRookMove(fromCoords, toCoords) {//CORRECT
        const rowDiff = toCoords.row - fromCoords.row;
        const colDiff = toCoords.col - fromCoords.col;
        
        // Check if the move is horizontal or vertical
        if (rowDiff !== 0 && colDiff !== 0) {
            return false;
        }
        
        // Determine the direction of movement
        const rowStep = rowDiff === 0 ? 0 : (rowDiff > 0 ? 1 : -1);
        const colStep = colDiff === 0 ? 0 : (colDiff > 0 ? 1 : -1);
        
        // Check each square in the path
        let currentRow = fromCoords.row + rowStep;
        let currentCol = fromCoords.col + colStep;
        
        while (currentRow !== toCoords.row || currentCol !== toCoords.col) {
            if (this.board[currentRow][currentCol] !== 0) {
                return false;
            }
            currentRow += rowStep;
            currentCol += colStep;
        }
        
        return true;
    }
    
    isValidBishopMove(fromCoords, toCoords) {//CORRECT
        const rowDiff = Math.abs(toCoords.row - fromCoords.row);
        const colDiff = Math.abs(toCoords.col - fromCoords.col);
        
        if (rowDiff !== colDiff) {
            return false;
        }
        
        const rowStep = toCoords.row > fromCoords.row ? 1 : -1;
        const colStep = toCoords.col > fromCoords.col ? 1 : -1;
        
        let currentRow = fromCoords.row + rowStep;
        let currentCol = fromCoords.col + colStep;
        
        while (currentRow !== toCoords.row && currentCol !== toCoords.col) {
            if (this.board[currentRow][currentCol] !== 0) {
                return false;
            }
            currentRow += rowStep;
            currentCol += colStep;
        }
        
        return true;
    }

    isValidKnightMove(fromCoords, toCoords) {//CORRECT
        // Knight moves in an L-shape: 2 squares in one direction and 1 square perpendicular
        const rowDiff = Math.abs(toCoords.row - fromCoords.row);
        const colDiff = Math.abs(toCoords.col - fromCoords.col);
        
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    isValidPawnComplexMove(fromCoords, toCoords, promotion, mycolor) {//CORRECT
    // First check if it's a regular pawn move
    if (this.isValidPawnSimpleMove(fromCoords, toCoords, mycolor)) {
        return true;
    }
    
    // If not a regular move, check for en passant
    const rowDiff = Math.abs(toCoords.row - fromCoords.row);
    const colDiff = Math.abs(toCoords.col - fromCoords.col);
    
    // En passant is a diagonal move (1,1) to an empty square
    if ((rowDiff === 1 && colDiff === 1) && this.board[toCoords.row][toCoords.col] === 0) {
        // Check if the destination matches any en passant target square
        for (let playerIndex = 0; playerIndex < this.players.length; playerIndex++) {
            // Skip current player and check only other players' en passant data
            if (playerIndex === mycolor || !this.enPassantArray[playerIndex] || this.enPassantArray[playerIndex].length < 2) {
                continue;
            }
            
            // Get the en passant target square coordinates
            const enPassantTargetCoords = this.convertChessNotationToCoords(this.enPassantArray[playerIndex][1]);
            
            // If the target coordinates match our destination, en passant is valid
            if (enPassantTargetCoords && 
                toCoords.row === enPassantTargetCoords.row && 
                toCoords.col === enPassantTargetCoords.col) {
                return true;
            }
        }
    }
    
    // If we get here, the move is neither a regular pawn move nor a valid en passant
    return false;
    }

    isValidPawnSimpleMove(fromCoords, toCoords, mycolor) { //CORRECT
        
        const direction = this.pawnDirections[mycolor];
        const rowDiff = toCoords.row - fromCoords.row;
        const colDiff = toCoords.col - fromCoords.col;
        const absRowDiff = Math.abs(rowDiff);
        const absColDiff = Math.abs(colDiff);

        // Get starting rank for this player's pawns
        const startingPositions = this.startingPositionsOfPawns[mycolor];
        const isInStartingPosition = startingPositions.some(pos => {
            const coords = this.convertChessNotationToCoords(pos);
            return coords.row === fromCoords.row && coords.col === fromCoords.col;
        });
        // Check direction based on pawnDirections
        switch (direction) {
            case 'up':
                if (rowDiff >= 0) return false; // Must move up (decreasing row)
                if (absColDiff === 0) { // Straight move
                    if (absRowDiff === 1) return this.board[toCoords.row][toCoords.col] === 0;
                    if (absRowDiff === 2 && isInStartingPosition) {
                        return this.board[toCoords.row][toCoords.col] === 0 && 
                            this.board[fromCoords.row - 1][fromCoords.col] === 0;
                    }
                } else if (absColDiff === 1 && absRowDiff === 1) {
                    return this.board[toCoords.row][toCoords.col] !== 0; // Capture
                }
                break;

            case 'down':
                if (rowDiff <= 0) return false; // Must move down (increasing row)
                if (absColDiff === 0) { // Straight move
                    if (absRowDiff === 1) return this.board[toCoords.row][toCoords.col] === 0;
                    if (absRowDiff === 2 && isInStartingPosition) {
                        return this.board[toCoords.row][toCoords.col] === 0 && 
                            this.board[fromCoords.row + 1][fromCoords.col] === 0;
                    }
                } else if (absColDiff === 1 && absRowDiff === 1) {
                    return this.board[toCoords.row][toCoords.col] !== 0; // Capture
                }
                break;

            case 'right':
                if (colDiff <= 0) return false; // Must move right (increasing column)
                if (absRowDiff === 0) { // Straight move
                    if (absColDiff === 1) return this.board[toCoords.row][toCoords.col] === 0;
                    if (absColDiff === 2 && isInStartingPosition) {
                        return this.board[toCoords.row][toCoords.col] === 0 && 
                            this.board[fromCoords.row][fromCoords.col + 1] === 0;
                    }
                } else if (absRowDiff === 1 && absColDiff === 1) {
                    return this.board[toCoords.row][toCoords.col] !== 0; // Capture
                }
                break;

            case 'left':
                if (colDiff >= 0) return false; // Must move left (decreasing column)
                if (absRowDiff === 0) { // Straight move
                    if (absColDiff === 1) return this.board[toCoords.row][toCoords.col] === 0;
                    if (absColDiff === 2 && isInStartingPosition) {
                        return this.board[toCoords.row][toCoords.col] === 0 && 
                            this.board[fromCoords.row][fromCoords.col - 1] === 0;
                    }
                } else if (absRowDiff === 1 && absColDiff === 1) {
                    return this.board[toCoords.row][toCoords.col] !== 0; // Capture
                }
                break;
        }
        
        return false;
    }

    isPawnAttackingThisField(pawnCoords, targetCoords, pieceOwner) {
    // Get the pawn's direction
    const direction = this.pawnDirections[pieceOwner];
    
    // Calculate differences
    const rowDiff = targetCoords.row - pawnCoords.row;
    const colDiff = targetCoords.col - pawnCoords.col;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);
    
    // Pawns can only attack diagonally (1,1)
    if (absRowDiff !== 1 || absColDiff !== 1) {
        return false;
    }
    
    // Check direction based on pawnDirections
    switch (direction) {
        case 'up':
            // Pawn must move up (decreasing row) to attack
            return rowDiff < 0;
            
        case 'down':
            // Pawn must move down (increasing row) to attack
            return rowDiff > 0;
            
        case 'left':
            // Pawn must move left (decreasing column) to attack
            return colDiff < 0;
            
        case 'right':
            // Pawn must move right (increasing column) to attack
            return colDiff > 0;
    }
    
    return false;
    }

    convertChessNotationToCoords(notation) {
    if (!/^[a-t][1-9]([0-9])?$/.test(notation)) {
        return null; // Invalid notation
    }
    
    const col = notation.charCodeAt(0) - 'a'.charCodeAt(0) + 20; // This part is correct
    const rank = parseInt(notation.slice(1));
    const row = 42 - rank; // Adjust row calculation
    
    // Validate the coordinates are within the board bounds
    if (row < 21 || row > 41 || col < 20 || col > 39) {
        return null;
    }
    
    return { row, col };
    }

    isCheckForMe(mycolor, kingCoords, boardWithoutKing) {
    // Get array of enemy player indices (all players except mycolor)
    const enemyIndices = Array.from(
        {length: this.players.length}, 
        (_, i) => i
    ).filter(i => i !== mycolor && this.isAlivePlayers[i]);

    // Traverse the board to find opponent pieces
    for (let i = 41-this.boardsize; i <= 41; i++) {
        for (let j = 20; j < 20 + this.boardsize; j++) {
            const pieceValue = boardWithoutKing[i][j];
            
            // Skip empty cells and barriers
            if (pieceValue === 0 || pieceValue === 1) {
                continue;
            }

            // Get the piece's owner (player index)
            const pieceOwner = Math.floor(pieceValue / 100) - 1;
            
            // Skip if the piece belongs to the current player
            if (pieceOwner === mycolor || !enemyIndices.includes(pieceOwner)) {
                continue;
            }
            
            // Found an opponent's piece, check if it can attack the king
            const fromCoords = { row: i, col: j };
            
            // Determine which piece it is
            const pieceType = pieceValue % 100;
            
            // Check if this piece can move to the king's position
            let canAttackKing = false;
            
            switch (pieceType) {
                case 1: // King
                    canAttackKing = this.isValidKingMove(fromCoords, kingCoords, pieceOwner);
                    break;
                case 2: // Queen
                    canAttackKing = this.isValidQueenMove(fromCoords, kingCoords);
                    break;
                case 3: // Rook
                    canAttackKing = this.isValidRookMove(fromCoords, kingCoords);
                    break;
                case 4: // Bishop
                    canAttackKing = this.isValidBishopMove(fromCoords, kingCoords);
                    break;
                case 5: // Knight
                    canAttackKing = this.isValidKnightMove(fromCoords, kingCoords);
                    break;
                case 6: // Pawn
                    canAttackKing = this.isPawnAttackingThisField(fromCoords, kingCoords, pieceOwner);
                    break;
            }
            
            // If any piece can attack the king, return true (king is in check)
            if (canAttackKing) {
                return true;
            }
        }
    }
    // No piece can attack the king, so it's not in check
    return false;
    }


    doMove(from, to, promotion, mycolor) {
        this.history += (this.history ? "|" : "") + from + "-" + to;
    // Convert chess notation to board coordinates
    const fromCoords = this.convertChessNotationToCoords(from);
    const toCoords = this.convertChessNotationToCoords(to);
    
    // Get the moving piece
    const movingPiece = this.board[fromCoords.row][fromCoords.col];
    const pieceType = movingPiece % 100;

    // Handle special moves first
    if (pieceType === 6) { // Pawn
        this.doPawnMove(fromCoords, toCoords, promotion, mycolor);
    } else if (pieceType === 1) { // King
        this.doKingMove(fromCoords, toCoords, mycolor)
    } else {
        this.doRegularMove(fromCoords, toCoords);
    }
    this.updateCastlingAbilities();
    // Update the KingCoords
    //console.log("before do king coord", this.kingCoords)
    for (let i = 41-this.boardsize; i <= 41; i++) {
        for (let j = 20; j < 20 + this.boardsize; j++) {
            const piece = this.board[i][j];
            if (piece > 100 && piece % 100 === 1) { // If it's a king
                const playerIndex = Math.floor(piece / 100) - 1;
                if (this.isAlivePlayers[playerIndex]) {
                    this.kingCoords[playerIndex] = { row: i, col: j };
                }
            }
        }
    }
    //console.log("after do king coord", this.kingCoords)
    // Update whose move it is
    this.whoseMove = (this.whoseMove + 1) % this.players.length;
    this.isSomeoneMated();
    this.isSomeonePated();
    this.isGameFinished();
    }

    doRegularMove(fromCoords, toCoords) {
        const movingPiece = this.board[fromCoords.row][fromCoords.col];
        this.board[fromCoords.row][fromCoords.col] = 0;
        this.board[toCoords.row][toCoords.col] = movingPiece;
    }

    doKingMove(fromCoords, toCoords, mycolor) {
        // Calculate the absolute differences in row and column
        const rowDiff = Math.abs(toCoords.row - fromCoords.row);
        const colDiff = Math.abs(toCoords.col - fromCoords.col);
        
        // Check if this is a regular king move (one square in any direction)
        if (rowDiff <= 1 && colDiff <= 1) {
            // Regular king move
            this.doRegularMove(fromCoords, toCoords);
            
            // Disable castling rights after any king move
            this.rightCastleAbilities[mycolor][0] = false;
            this.leftCastleAbilities[mycolor][0] = false;
            
            // Update king coordinates
            this.kingCoords[mycolor] = { row: toCoords.row, col: toCoords.col };
            
            return;
        }
        
        // If not a regular move, check for castling
        const rightCastling = this.rightCastleAbilities[mycolor];
        const leftCastling = this.leftCastleAbilities[mycolor];
        
        if (this.isValidCastling(fromCoords, toCoords, rightCastling, mycolor)) {
            // Do right castling
            const rookStartCoords = this.convertChessNotationToCoords(rightCastling[3]);
            const rookEndCoords = this.convertChessNotationToCoords(rightCastling[4]);
            
            // Move king
            this.doRegularMove(fromCoords, toCoords);
            
            // Move rook
            this.doRegularMove(rookStartCoords, rookEndCoords);
            
            // Disable castling rights for this player
            this.rightCastleAbilities[mycolor][0] = false;
            this.leftCastleAbilities[mycolor][0] = false;
            
            // Update king coordinates
            this.kingCoords[mycolor] = { row: toCoords.row, col: toCoords.col };
            
            return;
        }
        
        if (this.isValidCastling(fromCoords, toCoords, leftCastling, mycolor)) {
            // Do left castling
            const rookStartCoords = this.convertChessNotationToCoords(leftCastling[3]);
            const rookEndCoords = this.convertChessNotationToCoords(leftCastling[4]);
            
            // Move king
            this.doRegularMove(fromCoords, toCoords);
            
            // Move rook
            this.doRegularMove(rookStartCoords, rookEndCoords);
            
            // Disable castling rights for this player
            this.rightCastleAbilities[mycolor][0] = false;
            this.leftCastleAbilities[mycolor][0] = false;
            
            // Update king coordinates
            this.kingCoords[mycolor] = { row: toCoords.row, col: toCoords.col };
            
            return;
        }
    }

    doPawnMove(fromCoords, toCoords, promotion, mycolor) {
        console.log("ENPASSANT", this.enPassantArray)
    const direction = this.pawnDirections[mycolor];
    const rowDiff = toCoords.row - fromCoords.row;
    const colDiff = toCoords.col - fromCoords.col;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);
    
    // Get the 'from' position in chess notation
    const from = this.convertCoordsToChessNotation(fromCoords);
    
    // Clear any existing en passant target for this player
    this.enPassantArray[mycolor] = [];
    
    // Check for regular pawn move (forward 1 or 2 squares)
    if ((direction === 'up' && rowDiff < 0 && colDiff === 0) ||
        (direction === 'down' && rowDiff > 0 && colDiff === 0) ||
        (direction === 'left' && colDiff < 0 && rowDiff === 0) ||
        (direction === 'right' && colDiff > 0 && rowDiff === 0)) {
        
// Check for two-square advance and set en passant
if (absRowDiff === 2 || absColDiff === 2) {
    // Get the square that was passed over
    let passedOverRow = fromCoords.row;
    let passedOverCol = fromCoords.col;
    
    switch (direction) {
        case 'up':
            passedOverRow -= 1;
            break;
        case 'down':
            passedOverRow += 1;
            break;
        case 'left':
            passedOverCol -= 1;
            break;
        case 'right':
            passedOverCol += 1;
            break;
    }
    
    // Convert to chess notation
    const toNotation = this.convertCoordsToChessNotation(toCoords);
    const enPassantSquare = this.convertCoordsToChessNotation({
        row: passedOverRow,
        col: passedOverCol
    });
    
    // Store the en passant information
    this.enPassantArray[mycolor] = [toNotation, enPassantSquare];
    console.log("ENPASSANT is this changed?", this.enPassantArray);
}


        
        // Rest of the function remains the same...

            
            // Move the pawn
            this.doRegularMove(fromCoords, toCoords);
            
            // Check for promotion
            const toNotation = this.convertCoordsToChessNotation(toCoords);
            if (this.endingPositionsOfPawns[mycolor].includes(toNotation)) {
                const promotionPieces = { 'q': 2, 'r': 3, 'b': 4, 'n': 5 };
                if (promotion && promotionPieces[promotion.toLowerCase()]) {
                    this.board[toCoords.row][toCoords.col] = (mycolor + 1) * 100 + promotionPieces[promotion.toLowerCase()];
                } else {
                    // Default to queen if no promotion piece specified
                    this.board[toCoords.row][toCoords.col] = (mycolor + 1) * 100 + 2;
                }
            }
            
            return;
        }
        
        // Check for regular capture (diagonal move to a non-empty square)
        if ((absRowDiff === 1 && absColDiff === 1) && this.board[toCoords.row][toCoords.col] !== 0) {
            this.doRegularMove(fromCoords, toCoords);
            
            // Check for promotion after capture
            const toNotation = this.convertCoordsToChessNotation(toCoords);
            if (this.endingPositionsOfPawns[mycolor].includes(toNotation)) {
                const promotionPieces = { 'q': 2, 'r': 3, 'b': 4, 'n': 5 };
                if (promotion && promotionPieces[promotion.toLowerCase()]) {
                    this.board[toCoords.row][toCoords.col] = (mycolor + 1) * 100 + promotionPieces[promotion.toLowerCase()];
                } else {
                    // Default to queen if no promotion piece specified
                    this.board[toCoords.row][toCoords.col] = (mycolor + 1) * 100 + 2;
                }
            }
            
            return;
        }
        
// Inside doPawnMove method, in the en passant capture section:
if ((absRowDiff === 1 && absColDiff === 1) && this.board[toCoords.row][toCoords.col] === 0) {
    for (let playerIndex = 0; playerIndex < this.players.length; playerIndex++) {
        if (playerIndex === mycolor || !this.enPassantArray[playerIndex] || 
            this.enPassantArray[playerIndex].length < 2) {
            continue;
        }
        const enPassantTargetCoords = this.convertChessNotationToCoords(this.enPassantArray[playerIndex][1]);
        if (enPassantTargetCoords && 
            toCoords.row === enPassantTargetCoords.row && 
            toCoords.col === enPassantTargetCoords.col) {
            
            // Get the position of the pawn to be captured
            const capturedPawnCoords = this.convertChessNotationToCoords(this.enPassantArray[playerIndex][0]);
            // Move the capturing pawn
            this.doRegularMove(fromCoords, toCoords);
            
            // Remove the captured pawn
            this.board[capturedPawnCoords.row][capturedPawnCoords.col] = 0;
            
            // Clear the en passant target for both players
            this.enPassantArray[playerIndex] = [];  // Clear for captured pawn's player
            this.enPassantArray[mycolor] = [];      // Clear for capturing player
            
            return;
        }
    }
}


    }

    updateCastlingAbilities() {
    // Iterate through each player
    for (let playerIndex = 0; playerIndex < this.players.length; playerIndex++) {
        // Check right castling
        if (this.rightCastleAbilities[playerIndex][0]) {
            const kingStartPos = this.convertChessNotationToCoords(this.rightCastleAbilities[playerIndex][1]);
            const rookStartPos = this.convertChessNotationToCoords(this.rightCastleAbilities[playerIndex][3]);
            
            // Check if king is in starting position
            const kingValue = (playerIndex + 1) * 100 + 1;
            const rookValue = (playerIndex + 1) * 100 + 3;
            
            if (this.board[kingStartPos.row][kingStartPos.col] !== kingValue || 
                this.board[rookStartPos.row][rookStartPos.col] !== rookValue) {
                this.rightCastleAbilities[playerIndex][0] = false;
            }
        }
        
        // Check left castling
        if (this.leftCastleAbilities[playerIndex][0]) {
            const kingStartPos = this.convertChessNotationToCoords(this.leftCastleAbilities[playerIndex][1]);
            const rookStartPos = this.convertChessNotationToCoords(this.leftCastleAbilities[playerIndex][3]);
            
            // Check if king is in starting position
            const kingValue = (playerIndex + 1) * 100 + 1;
            const rookValue = (playerIndex + 1) * 100 + 3;
            
            if (this.board[kingStartPos.row][kingStartPos.col] !== kingValue || 
                this.board[rookStartPos.row][rookStartPos.col] !== rookValue) {
                this.leftCastleAbilities[playerIndex][0] = false;
            }
        }
    }
    }

    convertCoordsToChessNotation(coords) {
    const file = String.fromCharCode('a'.charCodeAt(0) + (coords.col - 20));
    const rank = 42 - coords.row; // Adjust rank calculation
    return `${file}${rank}`;
    }

    generateValidMoves(playerColor) {
    const validMoves = [];
    for (coord1 = 'a'; coord1 < 'a'+this.boardsize; coord1++) {
        for(coord2 = 1; coord2 < this.boardsize; coord2++) {
            for (coord3 = 'a'; coord3 < 'a'+this.boardsize; coord3++) {
                for(coord4 = 1; coord4 < this.boardsize; coord4++) {
                    const from = coord1 + coord2;
                    const to = coord3 + coord4;
                    if (this.isValidMove(from, to, playerColor)) {
                        validMoves.push({from, to});
                    }
                }
            }
        }
    }
    return validMoves;
    }

    isSomeonePated(){
        for (let playerInd = 0; playerInd < this.players.length; playerInd++) {
            if (this.isAlivePlayers[playerInd]) {
                thisPlayersMoves = this.generateValidMoves(playerInd);
                if (thisPlayersMoves.length = 0) {
                    if (this.isCheckForMe(playerInd, this.kingCoords[playerInd], this.board) == false) {
                        this.isFinished = true;
                        true;
                    }
                }
            }
        }
    }

    isSomeoneMated(){
        for (let playerInd = 0; playerInd < this.players.length; playerInd++) {
            if (this.isAlivePlayers[playerInd]) {
                thisPlayersMoves = this.generateValidMoves(playerInd);
                if (thisPlayersMoves.length = 0) {
                    if (this.isCheckForMe(playerInd, this.kingCoords[playerInd], this.board)) {
                        this.isAlivePlayers[playerInd] = false;
                    }
                }
            }
        }
    }

    isGameFinished(){
        this.isSomeoneMated();
        let alivePlayersCount = 0;
        for (let playerInd = 0; playerInd < this.players.length; playerInd++) {
            if (this.isAlivePlayers[playerInd]) {
                alivePlayersCount++;
            }
        }
        if (alivePlayersCount <= 1) {
            this.isFinished = true;
        }
    }
}


// Make the class globally available
window.ChessGame = ChessGame;



// function createBoardFromANFEN(ANFEN) {
//     // Split the ANFEN string by "|"
//     const rows = ANFEN.split("|");

//     // Validate that there are exactly 62 rows
//     if (rows.length !== 62) {
//         console.log(rows)
//         throw new Error("Invalid number of rows. The board must have 62 rows.");
//     }

//     // Create a 62x62 board
//     const board = Array.from({ length: 62 }, () => Array(62).fill(0));

//     // Iterate through each row and validate its content
//     for (let i = 0; i < rows.length; i++) {
//         const cells = rows[i].split("-");

//         // Validate that each row has exactly 62 cells
//         if (cells.length !== 62) {
//             console.log(cells.length)
//             throw new Error(`Row ${i + 1} has an invalid number of cells. It must have 62 cells.`);
//         }

//         // Convert the row cells to integers and assign them to the board
//         for (let j = 0; j < cells.length; j++) {
//             board[i][j] = parseInt(cells[j], 10);
//         }
//     }

//     return board;
// }



// // Example Usage
// players = ["Ansar", "Amir"];
// boardsize = 8;

// let ANFEN = "";
// for (let i = 0; i < 20; i++) {
//     ANFEN += "0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0";
//     ANFEN+="|"
// }
// ANFEN+="0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-203-205-204-202-201-204-205-203-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0"
// ANFEN+="|"
// ANFEN+="0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-206-206-206-206-206-206-206-206-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0"
// ANFEN+="|"
// for (let i = 0; i < 4; i++) {
//     ANFEN += "0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0";
//     ANFEN+="|"
// }
// ANFEN+="0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-106-106-106-106-106-106-106-106-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0"
// ANFEN+="|"
// ANFEN+="0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-103-105-104-102-101-104-105-103-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0"
// ANFEN+="|"
// for (let i = 0; i < 34; i++) {
//     ANFEN += "0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0";
//     if (i < 33) {
//         ANFEN += "|"; // Add separator between groups, but not at the end
//     }
// }




