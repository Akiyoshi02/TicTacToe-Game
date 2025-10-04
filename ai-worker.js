let boardSize, winCondition, player1Symbol, player2Symbol;

function checkWinForSymbol(board, symbol) {
    return checkWin(board, symbol);
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
        return Math.pow(100, countOwn);
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

    const centerStart = Math.floor((boardSize - 1) / 2) - 1;
    const centerEnd = centerStart + (boardSize % 2 === 0 ? 3 : 2);
    for (let row = centerStart; row < centerEnd; row++) {
        for (let col = centerStart; col < centerEnd; col++) {
            const idx = row * boardSize + col;
            if (board[idx] === player2Symbol) aiScore += 50;
            if (board[idx] === player1Symbol) playerScore += 50;
        }
    }

    return aiScore - playerScore;
}

function minimax(board, depth, isMaximizing, alpha, beta, maxDepth) {
    if (checkWinForSymbol(board, player2Symbol)) return 100000 - depth;
    if (checkWinForSymbol(board, player1Symbol)) return depth - 100000;
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

    const moveScores = moves.map(i => {
        board[i] = isMaximizing ? player2Symbol : player1Symbol;
        const score = evaluateBoard(board);
        board[i] = null;
        return { i, score };
    });
    moveScores.sort((a, b) => isMaximizing ? b.score - a.score : a.score - b.score);

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const { i } of moveScores) {
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
        for (const { i } of moveScores) {
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

    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
            board[i] = player2Symbol;
            if (checkWinForSymbol(board, player2Symbol)) {
                board[i] = null;
                return i;
            }
            board[i] = null;
        }
    }

    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
            board[i] = player1Symbol;
            if (checkWinForSymbol(board, player1Symbol)) {
                board[i] = null;
                return i;
            }
            board[i] = null;
        }
    }

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