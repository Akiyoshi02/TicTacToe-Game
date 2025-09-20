const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const restartButton = document.getElementById('restart');
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
const container = document.querySelector('.container');

let currentPlayer = 'X';
let gameBoard = Array(9).fill(null);
let gameActive = false; // Start inactive until names are set
let xScore = 0;
let oScore = 0;
let turnCount = 0;
let player1Name = '';
let player2Name = '';
let player1Symbol = 'X';
let player2Symbol = 'O';

const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Audio setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
function playSound() {
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2); // 200ms sound
}

function syncSymbols() {
    player1Symbol = player1SymbolSelect.value;
    player2Symbol = player1Symbol === 'X' ? 'O' : 'X';
    player2SymbolSelect.value = player2Symbol;
}

function startGame(event) {
    event.preventDefault();
    player1Name = player1NameInput.value.trim() || 'Player 1';
    player2Name = player2NameInput.value.trim() || 'Player 2';
    player1Symbol = player1SymbolSelect.value;
    player2Symbol = player2SymbolSelect.value;

    updateScore();
    status.textContent = `${player1Name}'s turn (${player1Symbol})`;
    startScreen.classList.add('hidden');
    container.classList.remove('hidden');
    gameActive = true;
}

function handleCellClick(event) {
    const cell = event.target;
    const index = cell.getAttribute('data-cell-index');

    if (gameBoard[index] || !gameActive) return;

    gameBoard[index] = currentPlayer;
    cell.textContent = currentPlayer;
    turnCount++;

    if (checkWin()) {
        highlightWinningCells();
        playSound();
        showPopup(`${currentPlayer === player1Symbol ? player1Name : player2Name} wins!`);
        if (currentPlayer === player1Symbol) xScore++;
        else oScore++;
        updateScore();
        gameActive = false;
    } else if (gameBoard.every(cell => cell)) {
        playSound();
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
    return winningCombinations.some(combination => {
        return combination.every(index => gameBoard[index] === currentPlayer);
    });
}

function highlightWinningCells() {
    winningCombinations.forEach(combination => {
        if (combination.every(index => gameBoard[index] === currentPlayer)) {
            combination.forEach(index => cells[index].classList.add('win'));
        }
    });
}

function updateScore() {
    scoreDisplay.textContent = `Score - ${player1Name}: ${xScore} | ${player2Name}: ${oScore}`;
}

function updateTurnCounter() {
    turnCounter.textContent = `Turns: ${turnCount}`;
}

function restartGame() {
    gameBoard = Array(9).fill(null);
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('win');
    });
    currentPlayer = player1Symbol;
    status.style.opacity = '0';
    setTimeout(() => {
        status.textContent = `${player1Name}'s turn (${player1Symbol})`;
        status.style.opacity = '1';
    }, 300);
    gameActive = true;
    turnCount = 0;
    updateTurnCounter();
}

function showPopup(message) {
    popupMessage.textContent = message;
    popup.classList.remove('hidden');
}

function closePopup() {
    popup.classList.add('hidden');
    restartGame();
}

player1SymbolSelect.addEventListener('change', syncSymbols);
playerForm.addEventListener('submit', startGame);
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', restartGame);
popupRestart.addEventListener('click', closePopup);

updateScore();
updateTurnCounter();