// Factory Player
const Player = (name, marker) => {
  return { name, marker };
};

// Gameboard Module
const Gameboard = (() => {
  const board = ["", "", "", "", "", "", "", "", ""];

  const getBoard = () => board;

  const setMark = (index, marker) => {
    if (board[index] === "") {
      board[index] = marker;
      return true;
    }
    return false;
  };

  const reset = () => {
    for (let i = 0; i < board.length; i++) {
      board[i] = "";
    }
  };

  return { getBoard, setMark, reset };
})();

// Game Controller Module
const Game = (() => {
  let players = [];
  let currentPlayerIndex = 0;
  let gameOver = false;

  const winningCombos = [
    [0,1,2],[3,4,5],[6,7,8], // righe
    [0,3,6],[1,4,7],[2,5,8], // colonne
    [0,4,8],[2,4,6]          // diagonali
  ];

  const setPlayers = (p1Name, p2Name) => {
    players = [Player(p1Name || "Player 1", "X"), Player(p2Name || "Player 2", "O")];
  };

  const getCurrentPlayer = () => players[currentPlayerIndex];

  const switchPlayer = () => {
    currentPlayerIndex = 1 - currentPlayerIndex;
  };

  const checkWin = () => {
    const board = Gameboard.getBoard();
    const marker = getCurrentPlayer().marker;

    return winningCombos.some(combo => 
      combo.every(index => board[index] === marker)
    );
  };

  const checkTie = () => {
    return Gameboard.getBoard().every(cell => cell !== "");
  };

  const playTurn = (index) => {
    if (gameOver) return false;

    if (Gameboard.setMark(index, getCurrentPlayer().marker)) {
      if (checkWin()) {
        gameOver = true;
        DisplayController.showResult(`${getCurrentPlayer().name} ha vinto! 🎉`);
      } else if (checkTie()) {
        gameOver = true;
        DisplayController.showResult(`Pareggio! Nessun vincitore.`);
      } else {
        switchPlayer();
        DisplayController.showResult(`Turno di ${getCurrentPlayer().name} (${getCurrentPlayer().marker})`);
      }
      DisplayController.render();
      return true;
    }
    return false;
  };

  const resetGame = () => {
    Gameboard.reset();
    currentPlayerIndex = 0;
    gameOver = false;
  };

  return { setPlayers, getCurrentPlayer, playTurn, resetGame, isGameOver: () => gameOver };
})();

// Display Controller Module
const DisplayController = (() => {
  const boardElement = document.getElementById("gameboard");
  const resultElement = document.getElementById("result");
  const resetButton = document.getElementById("reset-button");
  const startButton = document.getElementById("start-button");
  const player1Input = document.getElementById("player1-name");
  const player2Input = document.getElementById("player2-name");
  const playerInputsDiv = document.getElementById("player-inputs");

  // crea le 9 celle del tabellone
  const createBoard = () => {
    boardElement.innerHTML = "";
    for(let i=0; i<9; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.index = i;
      boardElement.appendChild(cell);
    }
  };

  // aggiorna il DOM con i valori di Gameboard
  const render = () => {
    const board = Gameboard.getBoard();
    const cells = boardElement.querySelectorAll(".cell");
    cells.forEach((cell, i) => {
      cell.textContent = board[i];
      if(board[i] !== "") {
        cell.classList.add("taken");
      } else {
        cell.classList.remove("taken");
      }
    });
  };

  // mostra messaggi risultati
  const showResult = (msg) => {
    resultElement.textContent = msg;
  };

  // gestione click su celle
  const handleCellClick = (e) => {
    if(!e.target.classList.contains("cell")) return;
    const index = e.target.dataset.index;
    if(Game.isGameOver()) return;
    Game.playTurn(Number(index));
  };

  // avvia la partita
  const startGame = () => {
    const p1 = player1Input.value.trim() || "Player 1";
    const p2 = player2Input.value.trim() || "Player 2";
    Game.setPlayers(p1, p2);
    Game.resetGame();
    createBoard();
    render();
    showResult(`Turno di ${Game.getCurrentPlayer().name} (${Game.getCurrentPlayer().marker})`);

    // mostra reset e nasconde input
    resetButton.style.display = "inline-block";
    playerInputsDiv.style.display = "none";
  };

  // resetta la partita e torna all'input nomi
  const resetGame = () => {
    Game.resetGame();
    createBoard();
    render();
    showResult("Inserisci i nomi e premi Inizia partita");
    resetButton.style.display = "none";
    playerInputsDiv.style.display = "block";
  };

  // Event listeners
  boardElement.addEventListener("click", handleCellClick);
  startButton.addEventListener("click", startGame);
  resetButton.addEventListener("click", resetGame);

  return { render, showResult, createBoard };
})();

// All'inizio creiamo il tabellone vuoto
DisplayController.createBoard();
DisplayController.showResult("Inserisci i nomi e premi Inizia partita");
