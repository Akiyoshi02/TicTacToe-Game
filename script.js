const status = document.getElementById('status');
const restartButton = document.getElementById('restart');
const newGameButton = document.getElementById('new-game');
const scoreDisplay = document.getElementById('score');
const scoreValues = document.querySelector('.score-values');
const turnCounter = document.getElementById('turn-counter');
const popup = document.getElementById('popup');
const popupMessage = document.getElementById('popup-message');
const popupRestart = document.getElementById('popup-restart');
const startScreen = document.getElementById('start-screen');
const playerForm = document.getElementById('player-form');
const player1NameInput = document.getElementById('player1-name');
const player2NameInput = document.getElementById('player2-name');
const player1SymbolSelect = document.getElementById('player1-symbol');
const player2SymbolSelect = document.getElementById('player2-symbol');
const levelSelect = document.getElementById('level-select');
const container = document.querySelector('.container');
const loadingScreen = document.getElementById('loading-screen');
const gameModeSelect = document.getElementById('game-mode');
const player1Section = document.getElementById('player1-section');
const player2Section = document.getElementById('player2-section');
const aiDifficultySection = document.getElementById('ai-difficulty-section');

const winSound = new Audio('src/sounds/win_sound.mp3');
const drawSound = new Audio('src/sounds/draw_sound.mp3');

let currentPlayer = 'X';
let gameBoard = [];
let gameActive = false;
let player1Score = 0;
let player2Score = 0;
let turnCount = 0;
let player1Name = '';
let player2Name = '';
let player1Symbol = 'X';
let player2Symbol = 'O';
let boardSize = 3;
let winCondition = 3;
let gameMode = '1v1';
let aiDifficulty = 'easy';
let isAIPlaying = false;

const levelConfig = {
    easy: { boardSize: 3, winCondition: 3 },
    normal: { boardSize: 4, winCondition: 4 },
    hard: { boardSize: 5, winCondition: 4 },
    expert: { boardSize: 5, winCondition: 5 },
    master: { boardSize: 6, winCondition: 5 }
};

function syncSymbols() {
    player1Symbol = player1SymbolSelect.value;
    player2Symbol = player1Symbol === 'X' ? 'O' : 'X';
    player2SymbolSelect.value = player2Symbol;
}

gameModeSelect.addEventListener('change', function() {
    gameMode = this.value;
    if (gameMode === '1v1') {
        player2Section.classList.remove('hidden');
        aiDifficultySection.classList.add('hidden');
        player1Section.querySelector('label').textContent = 'Player 1 Name:';
        player2NameInput.setAttribute('required', 'true');
    } else {
        player2Section.classList.add('hidden');
        aiDifficultySection.classList.remove('hidden');
        player1Section.querySelector('label').textContent = 'Your Name:';
        player2NameInput.removeAttribute('required');
    }
});

function initializeBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    board.style.setProperty('--board-size', boardSize);
    gameBoard = Array(boardSize * boardSize).fill(null);
    for (let i = 0; i < boardSize * boardSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-cell-index', i);
        cell.addEventListener('click', handleCellClick);
        board.appendChild(cell);
    }
}

function startGame(event) {
    event.preventDefault();
    player1Name = player1NameInput.value.trim() || 'Player';
    player1Symbol = player1SymbolSelect.value;
    player2Symbol = player1Symbol === 'X' ? 'O' : 'X';
    const level = levelSelect.value;
    gameMode = gameModeSelect.value;
    boardSize = levelConfig[level].boardSize;
    winCondition = levelConfig[level].winCondition;

    if (gameMode === '1v1') {
        player2Name = player2NameInput.value.trim() || 'Player 2';
        if (player1Name.toLowerCase() === player2Name.toLowerCase()) {
            alert('Please use different names for each player.');
            return;
        }
        isAIPlaying = false;
    } else {
        player2Name = `AI (${aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)})`;
        aiDifficulty = document.getElementById('ai-difficulty').value;
        isAIPlaying = true;
        player2SymbolSelect.value = player2Symbol;
    }

    initializeBoard();
    currentPlayer = Math.random() < 0.5 ? player1Symbol : player2Symbol;
    scoreValues.textContent = `${player1Name} (${player1Symbol}): ${player1Score} | ${player2Name} (${player2Symbol}): ${player2Score}`;
    status.textContent = `${currentPlayer === player1Symbol ? player1Name : player2Name}'s turn (${currentPlayer})`;
    startScreen.classList.add('hidden');
    container.classList.remove('hidden');
    gameActive = true;
    updateTurnCounter();

    if (isAIPlaying && currentPlayer === player2Symbol) {
        setTimeout(makeAIMove, 500);
    }
}

function newGame() {
    gameBoard = Array(boardSize * boardSize).fill(null);
    player1Score = 0;
    player2Score = 0;
    turnCount = 0;
    player1Name = '';
    player2Name = '';
    player1Symbol = 'X';
    player2Symbol = 'O';
    gameMode = '1v1';
    aiDifficulty = 'easy';
    isAIPlaying = false;
    player1NameInput.value = '';
    player2NameInput.value = '';
    player1SymbolSelect.value = 'X';
    player2SymbolSelect.value = 'O';
    levelSelect.value = 'easy';
    gameModeSelect.value = '1v1';
    player2Section.classList.remove('hidden');
    aiDifficultySection.classList.add('hidden');
    player1Section.querySelector('label').textContent = 'Player 1 Name:';
    player2NameInput.setAttribute('required', 'true');
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('win');
    });
    container.classList.add('hidden');
    startScreen.classList.remove('hidden');
    gameActive = false;
    updateScore();
    updateTurnCounter();
}

window.onload = () => {
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    }, 2000);
};

function handleCellClick(event) {
    const cell = event.target;
    const index = parseInt(cell.getAttribute('data-cell-index'));

    if (gameBoard[index] || !gameActive) return;

    gameBoard[index] = currentPlayer;
    cell.textContent = currentPlayer;
    turnCount++;

    if (checkWin()) {
        highlightWinningCells();
        if (isAIPlaying && currentPlayer === player2Symbol) {
            drawSound.play();
            showPopup('You lose!');
        } else {
            winSound.play();
            showPopup(`${currentPlayer === player1Symbol ? player1Name : player2Name} wins!`);
        }
        if (currentPlayer === player1Symbol) player1Score++;
        else player2Score++;
        updateScore();
        gameActive = false;
    } else if (gameBoard.every(cell => cell)) {
        drawSound.play();
        showPopup("It's a draw!");
        gameActive = false;
    } else {
        currentPlayer = currentPlayer === player1Symbol ? player2Symbol : player1Symbol;
        status.style.opacity = '0';
        setTimeout(() => {
            status.textContent = `${currentPlayer === player1Symbol ? player1Name : player2Name}'s turn (${currentPlayer})`;
            status.style.opacity = '1';
            if (isAIPlaying && currentPlayer === player2Symbol) {
                makeAIMove();
            }
        }, 300);
    }
    updateTurnCounter();
}

function makeAIMove() {
    if (!gameActive || !isAIPlaying || currentPlayer !== player2Symbol) return;
    status.textContent = 'AI is thinking...';
    setTimeout(() => {
        let moveIndex;
        if (aiDifficulty === 'easy') {
            moveIndex = getRandomMove();
        } else if (aiDifficulty === 'medium') {
            moveIndex = getMediumMove();
        } else {
            moveIndex = getMinimaxMove();
        }
        if (moveIndex !== undefined) {
            gameBoard[moveIndex] = currentPlayer;
            const cell = document.querySelector(`[data-cell-index="${moveIndex}"]`);
            cell.textContent = currentPlayer;
            turnCount++;
            if (checkWin()) {
                highlightWinningCells();
                drawSound.play();
                showPopup('You lose!');
                player2Score++;
                updateScore();
                gameActive = false;
            } else if (gameBoard.every(cell => cell)) {
                drawSound.play();
                showPopup("It's a draw!");
                gameActive = false;
            } else {
                currentPlayer = player1Symbol;
                status.textContent = `${player1Name}'s turn (${currentPlayer})`;
            }
            updateTurnCounter();
        }
    }, 500);
}

function checkWin(board = gameBoard) {
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j <= boardSize - winCondition; j++) {
            const row = Array.from({ length: winCondition }, (_, k) => board[i * boardSize + j + k]);
            if (row.every(cell => cell === currentPlayer)) {
                return true;
            }
        }
    }

    for (let j = 0; j < boardSize; j++) {
        for (let i = 0; i <= boardSize - winCondition; i++) {
            const col = Array.from({ length: winCondition }, (_, k) => board[(i + k) * boardSize + j]);
            if (col.every(cell => cell === currentPlayer)) {
                return true;
            }
        }
    }

    for (let i = 0; i <= boardSize - winCondition; i++) {
        for (let j = 0; j <= boardSize - winCondition; j++) {
            const diag = Array.from({ length: winCondition }, (_, k) => board[(i + k) * boardSize + j + k]);
            if (diag.every(cell => cell === currentPlayer)) {
                return true;
            }
        }
    }

    for (let i = 0; i <= boardSize - winCondition; i++) {
        for (let j = winCondition - 1; j < boardSize; j++) {
            const diag = Array.from({ length: winCondition }, (_, k) => board[(i + k) * boardSize + j - k]);
            if (diag.every(cell => cell === currentPlayer)) {
                return true;
            }
        }
    }

    return false;
}

function highlightWinningCells() {
    const cells = document.querySelectorAll('.cell');
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j <= boardSize - winCondition; j++) {
            const row = Array.from({ length: winCondition }, (_, k) => gameBoard[i * boardSize + j + k]);
            if (row.every(cell => cell === currentPlayer)) {
                for (let k = 0; k < winCondition; k++) {
                    cells[i * boardSize + j + k].classList.add('win');
                }
            }
        }
    }

    for (let j = 0; j < boardSize; j++) {
        for (let i = 0; i <= boardSize - winCondition; i++) {
            const col = Array.from({ length: winCondition }, (_, k) => gameBoard[(i + k) * boardSize + j]);
            if (col.every(cell => cell === currentPlayer)) {
                for (let k = 0; k < winCondition; k++) {
                    cells[(i + k) * boardSize + j].classList.add('win');
                }
            }
        }
    }

    for (let i = 0; i <= boardSize - winCondition; i++) {
        for (let j = 0; j <= boardSize - winCondition; j++) {
            const diag = Array.from({ length: winCondition }, (_, k) => gameBoard[(i + k) * boardSize + j + k]);
            if (diag.every(cell => cell === currentPlayer)) {
                for (let k = 0; k < winCondition; k()) {
                    cells[(i + k) * boardSize + j + k].classList.add('win');
                }
            }
        }
    }

    for (let i = 0; i <= boardSize - winCondition; i++) {
        for (let j = winCondition - 1; j < boardSize; j++) {
            const diag = Array.from({ length: winCondition }, (_, k) => gameBoard[(i + k) * boardSize + j - k]);
            if (diag.every(cell => cell === currentPlayer)) {
                for (let k = 0; k < winCondition; k++) {
                    cells[(i + k) * boardSize + j - k].classList.add('win');
                }
            }
        }
    }
}

function updateScore() {
    scoreValues.textContent = `${player1Name} (${player1Symbol}): ${player1Score} | ${player2Name} (${player2Symbol}): ${player2Score}`;
}

function updateTurnCounter() {
    turnCounter.textContent = `Turns: ${turnCount}`;
}

function restartGame() {
    gameBoard = Array(boardSize * boardSize).fill(null);
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('win');
    });
    currentPlayer = Math.random() < 0.5 ? player1Symbol : player2Symbol;
    status.style.opacity = '0';
    setTimeout(() => {
        status.textContent = `${currentPlayer === player1Symbol ? player1Name : player2Name}'s turn (${currentPlayer})`;
        status.style.opacity = '1';
        if (isAIPlaying && currentPlayer === player2Symbol) {
            makeAIMove();
        }
    }, 300);
    gameActive = true;
    turnCount = 0;
    updateScore();
    updateTurnCounter();
}

function getRandomMove() {
    const emptyCells = gameBoard.map((val, idx) => val === null ? idx : null).filter(idx => idx !== null);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function getMediumMove() {
    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === null) {
            gameBoard[i] = player2Symbol;
            if (checkWin()) {
                gameBoard[i] = null;
                return i;
            }
            gameBoard[i] = null;
        }
    }
    const originalPlayer = currentPlayer;
    currentPlayer = player1Symbol;
    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === null) {
            gameBoard[i] = player1Symbol;
            if (checkWin()) {
                gameBoard[i] = null;
                currentPlayer = originalPlayer;
                return i;
            }
            gameBoard[i] = null;
        }
    }
    currentPlayer = originalPlayer;
    return getRandomMove();
}

function getMinimaxMove() {
    function minimax(board, depth, isMaximizing, alpha, beta) {
        if (depth > 5) return 0;
        if (checkWinForSymbol(board, player2Symbol)) return 10 - depth;
        if (checkWinForSymbol(board, player1Symbol)) return depth - 10;
        if (board.every(cell => cell)) return 0;

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = player2Symbol;
                    const score = minimax(board, depth + 1, false, alpha, beta);
                    board[i] = null;
                    maxEval = Math.max(maxEval, score);
                    alpha = Math.max(alpha, score);
                    if (beta <= alpha) break;
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = player1Symbol;
                    const score = minimax(board, depth + 1, true, alpha, beta);
                    board[i] = null;
                    minEval = Math.min(minEval, score);
                    beta = Math.min(beta, score);
                    if (beta <= alpha) break;
                }
            }
            return minEval;
        }
    }

    function checkWinForSymbol(tempBoard, symbol) {
        const originalPlayer = currentPlayer;
        currentPlayer = symbol;
        const win = checkWin(tempBoard);
        currentPlayer = originalPlayer;
        return win;
    }

    let bestScore = -Infinity;
    let bestMove;
    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === null) {
            gameBoard[i] = player2Symbol;
            const score = minimax(gameBoard, 0, false, -Infinity, Infinity);
            gameBoard[i] = null;
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}

function showPopup(message) {
    document.getElementById('board').classList.add('board-draw');
    setTimeout(() => document.getElementById('board').classList.remove('board-draw'), 1000);
    popupMessage.textContent = message;
    popup.classList.remove('hidden');
    if (message.includes('wins') && !(isAIPlaying && message === 'You lose!')) {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF0000', '#0000FF', '#800080', '#FFA500', '#FFC1CC', '#FFFF00', '#FFD700'],
            zIndex: 140
        });
    }
}

function closePopup() {
    popup.classList.add('hidden');
    restartGame();
}

player1SymbolSelect.addEventListener('change', syncSymbols);
playerForm.addEventListener('submit', startGame);
restartButton.addEventListener('click', restartGame);
newGameButton.addEventListener('click', newGame);
popupRestart.addEventListener('click', closePopup);

updateTurnCounter();