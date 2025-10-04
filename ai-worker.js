let boardSize, winCondition, player1Symbol, player2Symbol;

function checkWinForSymbol(board, symbol, currentPlayerSymbol) {
    const win = checkWin(board, symbol);
    return win;
}

function checkWin(board, currentPlayerSymbol) {
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j <= boardSize - winCondition; j++) {
            const row = Array.from({ length: winCondition }, (_, k) => board[i * boardSize + j + k]);
            if (row.every(cell => cell === currentPlayerSymbol)) {
                return true;
            }
        }
    }

    for (let j = 0; j < boardSize; j++) {
        for (let i = 0; i <= boardSize - winCondition; i++) {
            const col = Array.from({ length: winCondition }, (_, k) => board[(i + k) * boardSize + j]);
            if (col.every(cell => cell === currentPlayerSymbol)) {
                return true;
            }
        }
    }

    for (let i = 0; i <= boardSize - winCondition; i++) {
        for (let j = 0; j <= boardSize - winCondition; j++) {
            const diag = Array.from({ length: winCondition }, (_, k) => board[(i + k) * boardSize + j + k]);
            if (diag.every(cell => cell === currentPlayerSymbol)) {
                return true;
            }
        }
    }

    for (let i = 0; i <= boardSize - winCondition; i++) {
        for (let j = winCondition - 1; j < boardSize; j++) {
            const diag = Array.from({ length: winCondition }, (_, k) => board[(i + k) * boardSize + j - k]);
            if (diag.every(cell => cell === currentPlayerSymbol)) {
                return true;
            }
        }
    }

    return false;
}

function evaluateBoard(board) {
    let aiScore = 0;
    let playerScore = 0;

    const scoreLine = (line, symbol) => {
        const oppSymbol = symbol === player2Symbol ? player1Symbol : player2Symbol;
        const countOwn = line.filter(cell => cell === symbol).length;
        const countOpp = line.filter(cell => cell === oppSymbol).length;
        if (countOpp > 0) return 0;
        return Math.pow(10, countOwn);
    };

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j <= boardSize - winCondition; j++) {
            const row = Array.from({ length: winCondition }, (_, k) => board[i * boardSize + j + k]);
            aiScore += scoreLine(row, player2Symbol);
            playerScore += scoreLine(row, player1Symbol);
        }
    }
    for (let j = 0; j < boardSize; j++) {
        for (let i = 0; i <= boardSize - winCondition; i++) {
            const col = Array.from({ length: winCondition }, (_, k) => board[(i + k) * boardSize + j]);
            aiScore += scoreLine(col, player2Symbol);
            playerScore += scoreLine(col, player1Symbol);
        }
    }
    for (let i = 0; i <= boardSize - winCondition; i++) {
        for (let j = 0; j <= boardSize - winCondition; j++) {
            const diag = Array.from({ length: winCondition }, (_, k) => board[(i + k) * boardSize + j + k]);
            aiScore += scoreLine(diag, player2Symbol);
            playerScore += scoreLine(diag, player1Symbol);
        }
    }
    for (let i = 0; i <= boardSize - winCondition; i++) {
        for (let j = winCondition - 1; j < boardSize; j++) {
            const diag = Array.from({ length: winCondition }, (_, k) => board[(i + k) * boardSize + j - k]);
            aiScore += scoreLine(diag, player2Symbol);
            playerScore += scoreLine(diag, player1Symbol);
        }
    }

    return aiScore - playerScore;
}

function minimax(board, depth, isMaximizing, alpha, beta, maxDepth) {
    if (checkWinForSymbol(board, player2Symbol, player2Symbol)) return 1000 - depth;
    if (checkWinForSymbol(board, player1Symbol, player1Symbol)) return depth - 1000;
    if (board.every(cell => cell)) return 0;

    if (depth >= maxDepth) {
        return evaluateBoard(board);
    }

    const moves = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
            moves.push(i);
        }
    }

    const center = Math.floor(board.length / 2);
    moves.sort((a, b) => {
        const distA = Math.abs(a - center);
        const distB = Math.abs(b - center);
        return distA - distB;
    });

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const i of moves) {
            board[i] = player2Symbol;
            const evalScore = minimax(board, depth + 1, false, alpha, beta, maxDepth);
            board[i] = null;
            maxEval = Math.max(maxEval, evalScore);
            alpha = Math.max(alpha, evalScore);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const i of moves) {
            board[i] = player1Symbol;
            const evalScore = minimax(board, depth + 1, true, alpha, beta, maxDepth);
            board[i] = null;
            minEval = Math.min(minEval, evalScore);
            beta = Math.min(beta, evalScore);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

function getMinimaxMove(board, config) {
    boardSize = config.boardSize;
    winCondition = config.winCondition;
    player1Symbol = config.player1Symbol;
    player2Symbol = config.player2Symbol;
    const maxDepth = config.maxDepth;

    let bestScore = -Infinity;
    let bestMove;
    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
            board[i] = player2Symbol;
            const score = minimax(board, 0, false, -Infinity, Infinity, maxDepth);
            board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}

self.addEventListener('message', (event) => {
    const { board, config } = event.data;
    const move = getMinimaxMove(board.slice(), config);
    self.postMessage(move);
});