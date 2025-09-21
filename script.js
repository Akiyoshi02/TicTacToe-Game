const status = document.getElementById('status');
const restartButton = document.getElementById('restart');
const newGameButton = document.getElementById('new-game');
const scoreDisplay = document.getElementById('score');
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

const winSound = new Audio('src/sounds/win_sound.mp3');
const drawSound = new Audio('src/sounds/draw_sound.mp3');

let currentPlayer = 'X';
let gameBoard = [];
let gameActive = false;
let xScore = 0;
let oScore = 0;
let turnCount = 0;
let player1Name = '';
let player2Name = '';
let player1Symbol = 'X';
let player2Symbol = 'O';
let boardSize = 3;
let winCondition = 3;

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

function initializeBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    board.style.width = `${boardSize * 100}px`;
    board.style.height = `${boardSize * 100}px`;
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
    player1Name = player1NameInput.value.trim() || 'Player 1';
    player2Name = player2NameInput.value.trim() || 'Player 2';
    player1Symbol = player1SymbolSelect.value;
    player2Symbol = player2SymbolSelect.value;
    const level = levelSelect.value;

    if (player1Name.toLowerCase() === player2Name.toLowerCase()) {
        alert('Please use different names for each player.');
        return;
    }

    boardSize = levelConfig[level].boardSize;
    winCondition = levelConfig[level].winCondition;
    initializeBoard();

    currentPlayer = Math.random() < 0.5 ? player1Symbol : player2Symbol;
    scoreDisplay.textContent = `Score - ${player1Name}: ${xScore} | ${player2Name}: ${oScore}`;
    status.textContent = `${currentPlayer === player1Symbol ? player1Name : player2Name}'s turn (${currentPlayer})`;
    startScreen.classList.add('hidden');
    container.classList.remove('hidden');
    gameActive = true;
    updateTurnCounter();
}

function newGame() {
    gameBoard = Array(boardSize * boardSize).fill(null);
    xScore = 0;
    oScore = 0;
    turnCount = 0;
    player1Name = '';
    player2Name = '';
    player1Symbol = 'X';
    player2Symbol = 'O';
    player1NameInput.value = '';
    player2NameInput.value = '';
    player1SymbolSelect.value = 'X';
    player2SymbolSelect.value = 'O';
    levelSelect.value = 'easy';
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
        winSound.play();
        showPopup(`${currentPlayer === player1Symbol ? player1Name : player2Name} wins!`);
        if (currentPlayer === player1Symbol) xScore++;
        else oScore++;
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
        }, 300);
    }
    updateTurnCounter();
}

function checkWin() {
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j <= boardSize - winCondition; j++) {
            const row = Array.from({ length: winCondition }, (_, k) => gameBoard[i * boardSize + j + k]);
            if (row.every(cell => cell === currentPlayer)) {
                return true;
            }
        }
    }

    for (let j = 0; j < boardSize; j++) {
        for (let i = 0; i <= boardSize - winCondition; i++) {
            const col = Array.from({ length: winCondition }, (_, k) => gameBoard[(i + k) * boardSize + j]);
            if (col.every(cell => cell === currentPlayer)) {
                return true;
            }
        }
    }

    for (let i = 0; i <= boardSize - winCondition; i++) {
        for (let j = 0; j <= boardSize - winCondition; j++) {
            const diag = Array.from({ length: winCondition }, (_, k) => gameBoard[(i + k) * boardSize + j + k]);
            if (diag.every(cell => cell === currentPlayer)) {
                return true;
            }
        }
    }

    for (let i = 0; i <= boardSize - winCondition; i++) {
        for (let j = winCondition - 1; j < boardSize; j++) {
            const diag = Array.from({ length: winCondition }, (_, k) => gameBoard[(i + k) * boardSize + j - k]);
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
                for (let k = 0; k < winCondition; k++) {
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
    scoreDisplay.textContent = `Score - ${player1Name}: ${xScore} | ${player2Name}: ${oScore}`;
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
    }, 300);
    gameActive = true;
    turnCount = 0;
    updateScore();
    updateTurnCounter();
}

function showPopup(message) {
    
    document.getElementById('board').classList.add('board-draw');
    setTimeout(() => document.getElementById('board').classList.remove('board-draw'), 1000);

    popupMessage.textContent = message;
    popup.classList.remove('hidden');
    if (message.includes('wins')) {
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