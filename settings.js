const firebaseConfig = {
    apiKey: "AIzaSyCZFJw1_ig3Ctg6P8wWkX6CL3QiyEtAVZw",
    authDomain: "shahmat-d555c.firebaseapp.com",
    databaseURL: "https://shahmat-d555c-default-rtdb.firebaseio.com",
    projectId: "shahmat-d555c",
    storageBucket: "shahmat-d555c.firebasestorage.app",
    messagingSenderId: "1007601901767",
    appId: "1:1007601901767:web:1465687d739f20c2a0dee2"
};
window.firebaseConfig =firebaseConfig
 const updateMoveHistoryDisplay = (game) => {
    const moveList = document.getElementById('move-list');
    moveList.innerHTML = '';
    if (!game.history) return;
    const moves = game.history.split('|')
        .filter(move => move.trim() !== '')
        .map(move => move.replace('undefined', ''));

    for (let i = 0; i < moves.length; i += 2) {
        const movePair = document.createElement('div');
        const whiteMove = moves[i] || '';
        const blackMove = moves[i + 1] || '';

        movePair.textContent = `${(i / 2) + 1}. ${whiteMove} ${blackMove}`;
        moveList.appendChild(movePair);
    }

    const historyContainer = document.getElementById('history-container');
    if (historyContainer) {
        historyContainer.scrollTop = historyContainer.scrollHeight;
    }
};

 const getSelectedPromotion = () => {
    const selected = document.querySelector('input[name="promotion"]:checked');
    return selected ? selected.value : 'q';
};

 const getSelectedOrientation = () => {
    const selected = document.querySelector('input[name="orientation"]:checked');
    return selected ? selected.value : 'normal';
};

 const displayBoard = (standing = 'normal', game) => {
    const validStandings = ['normal', 'upside', 'right', 'left'];
    if (!validStandings.includes(standing)) {
        throw new Error("Standing must be 'normal', 'upside', 'right', or 'left'");
    }

    const boardContainer = document.getElementById('board');
    boardContainer.innerHTML = '';

    const buttonSize = game.boardsize <= 8 ? 80 : 
                    game.boardsize <= 12 ? 60 :
                    game.boardsize <= 16 ? 50 : 40;

    if (standing === 'right' || standing === 'left') {
        boardContainer.style.gridTemplateRows = `repeat(${game.boardsize}, ${buttonSize}px)`;
        boardContainer.style.gridTemplateColumns = `repeat(${game.boardsize}, ${buttonSize}px)`;
        boardContainer.style.transform = standing === 'right' ? 'rotate(90deg)' : 'rotate(-90deg)';
    } else {
        boardContainer.style.gridTemplateColumns = `repeat(${game.boardsize}, ${buttonSize}px)`;
        boardContainer.style.gridTemplateRows = `repeat(${game.boardsize}, ${buttonSize}px)`;
        boardContainer.style.transform = standing === 'upside' ? 'rotate(180deg)' : 'none';
    }

    // First, create a miniboard dictionary with chess notation as keys and piece values as values
    const miniboardDict = {};
    
    for (let i = 0; i < game.boardsize; i++) {
        for (let j = 0; j < game.boardsize; j++) {
            const actualRow = 42 - game.boardsize + i;
            const actualCol = 20 + j;
            
            // Calculate the chess notation for this position
            const file = String.fromCharCode('a'.charCodeAt(0) + j);
            const rank = game.boardsize - i;
            const position = `${file}${rank}`;
            
            // Store the piece value in the dictionary
            miniboardDict[position] = game.board[actualRow][actualCol];
        }
    }
    
    // Now iterate through the board positions to generate buttons
    for (let row = 0; row < game.boardsize; row++) {
        for (let col = 0; col < game.boardsize; col++) {
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
            const rank = game.boardsize - row;
            const position = `${file}${rank}`;
            
            // Store the position as a data attribute for move handling
            button.dataset.position = position;
            
            // Set background color (alternating pattern)
            button.style.backgroundColor = ((row + col) % 2 === 0) ? '#f0d9b5' : '#b58863';
            
            // Get the piece value from the dictionary
            const cellValue = miniboardDict[position];
            
            // Add piece image if present
            if (cellValue > 100) {
                const figureImage = getFigureImage(cellValue);
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
};

const getFigureImage = (cellValue) =>{
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
};

 const generate6RandomKey = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

window.generate6RandomKey = generate6RandomKey;
window.getSelectedPromotion = getSelectedPromotion;
window.getSelectedOrientation = getSelectedOrientation;
window.displayBoard = displayBoard;
window.updateMoveHistoryDisplay = updateMoveHistoryDisplay;