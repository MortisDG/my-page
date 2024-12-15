const board = document.getElementById("game-board");
const addNumbersBtn = document.getElementById("add-numbers");
const newGameBtn = document.getElementById("new-game");
const showHintBtn = document.getElementById("show-hint");
const scoreDisplay = document.getElementById("score");
const highscoreDisplay = document.getElementById("highscore");

const BOARD_WIDTH = 9;
const STARTING_NUMBERS = 35;
let score = 0;
let selectedCells = [];
let stage = 1;
let currentScore = 0;

let highscore = parseInt(localStorage.getItem("highscore")) || 0;
highscoreDisplay.textContent = `Highscore: ${highscore}`;

function updateScore(newScore) {
  currentScore = newScore;
  document.getElementById("current-score").textContent = currentScore;

  // Update highscore if current score exceeds the previous highscore
  if (currentScore > highscore) {
    highscore = currentScore;
    localStorage.setItem("highscore", highscore);
    highscoreDisplay.textContent = `Highscore: ${highscore}`;
  }
}

// Utility: Creates a grid cell
function createCell(value, empty = false) {
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.textContent = empty ? "" : value;
  if (!empty) {
    cell.addEventListener("click", () => handleCellClick(cell));
  }
  return cell;
}

// Initialize a new game
function initializeGame() {
  board.innerHTML = ""; // Clear the board
  score = 0;
  scoreDisplay.textContent = `Score: ${score}`;
  selectedCells = [];
  renderInitialBoard();
}
// Render an empty board grid
function renderInitialBoard() {
  for (let i = 0; i < BOARD_WIDTH * 9; i++) {
    const cell = createCell("", true);
    board.appendChild(cell);
  }
  addNumbers();
}

// Add numbers dynamically to the board
function addNumbers() {
  const emptyCells = Array.from(board.children).filter(
    (cell) => cell.textContent === ""
  );
  const newNumbersCount = Math.ceil(emptyCells.length * 0.5); // Fill ~50% of remaining cells
  const numbers = generateNumbers(newNumbersCount);

  shuffle(numbers);
  for (let i = 0; i < newNumbersCount; i++) {
    emptyCells[i].textContent = numbers[i];
    emptyCells[i].addEventListener("click", () =>
      handleCellClick(emptyCells[i])
    );
  }
}

// Generate numbers for new cells
function generateNumbers(count) {
  const numbers = [];
  for (let i = 0; i < count; i++) {
    numbers.push(Math.floor(Math.random() * 9) + 1);
  }
  return numbers;
}

// Shuffle the array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Handle cell click event
function handleCellClick(cell) {
  if (cell.classList.contains("selected")) {
    cell.classList.remove("selected");
    selectedCells = selectedCells.filter((c) => c !== cell);
  } else {
    if (selectedCells.length < 2) {
      cell.classList.add("selected");
      selectedCells.push(cell);
    }
  }
  if (selectedCells.length === 2) {
    checkMatch();
  }
}

// Check if two selected cells are a valid match
function checkMatch() {
  const [cell1, cell2] = selectedCells;

  const sum = parseInt(cell1.textContent) + parseInt(cell2.textContent);

  if (
    (sum === 10 || cell1.textContent === cell2.textContent) &&
    isPathClear(cell1, cell2)
  ) {
    const distance = calculateDistance(cell1, cell2);
    updateScore(distance);

    // Mark cells as inactive
    cell1.classList.add("inactive");
    cell2.classList.add("inactive");

    checkAndRemoveEmptyRows();
    checkAndUpdateGameState();
  }

  selectedCells.forEach((cell) => cell.classList.remove("selected"));
  selectedCells = [];
}

// Check for empty rows and remove them
function checkAndRemoveEmptyRows() {
  const rowsToRemove = [];

  for (let row = 0; row < board.children.length / BOARD_WIDTH; row++) {
    let isRowEmpty = true;

    // Check all cells in the row
    for (let col = 0; col < BOARD_WIDTH; col++) {
      const index = row * BOARD_WIDTH + col;
      const cell = board.children[index];
      if (!cell.classList.contains("inactive")) {
        isRowEmpty = false;
        break;
      }
    }

    if (isRowEmpty) rowsToRemove.push(row);
  }
  rowsToRemove.reverse().forEach((row) => removeRow(row));
}

// Remove a row and shift rows above down
function removeRow(rowIndex) {
  for (let col = 0; col < BOARD_WIDTH; col++) {
    const index = rowIndex * BOARD_WIDTH + col;
    board.children[index].remove();
  }

  // Move rows above down
  const cells = Array.from(board.children);
  board.innerHTML = ""; // Clear board
  cells.forEach((cell) => board.appendChild(cell));
}

// Check if the path between two cells is clear
function isPathClear(cell1, cell2) {
  const index1 = Array.from(board.children).indexOf(cell1);
  const index2 = Array.from(board.children).indexOf(cell2);

  const x1 = index1 % BOARD_WIDTH;
  const y1 = Math.floor(index1 / BOARD_WIDTH);
  const x2 = index2 % BOARD_WIDTH;
  const y2 = Math.floor(index2 / BOARD_WIDTH);

  // Direct horizontal or vertical path
  if (x1 === x2) {
    // Vertical path
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    for (let i = minY + 1; i < maxY; i++) {
      const cell = board.children[i * BOARD_WIDTH + x1];
      if (cell && !cell.classList.contains("inactive") && cell.textContent)
        return false;
    }
  } else if (y1 === y2) {
    // Horizontal path
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    for (let i = minX + 1; i < maxX; i++) {
      const cell = board.children[y1 * BOARD_WIDTH + i];
      if (cell && !cell.classList.contains("inactive") && cell.textContent)
        return false;
    }
  } else if (Math.abs(x2 - x1) === Math.abs(y2 - y1)) {
    // Diagonal path
    const stepX = x2 > x1 ? 1 : -1;
    const stepY = y2 > y1 ? 1 : -1;
    let currentX = x1 + stepX;
    let currentY = y1 + stepY;

    while (currentX !== x2 && currentY !== y2) {
      const cell = board.children[currentY * BOARD_WIDTH + currentX];
      if (cell && !cell.classList.contains("inactive") && cell.textContent)
        return false;
      currentX += stepX;
      currentY += stepY;
    }
  } else {
    const flexiblePaths = [
      // Horizontal then vertical (L-shape)
      [
        [x1, y1],
        [x2, y1],
        [x2, y2],
      ],
      // Vertical then horizontal (L-shape)
      [
        [x1, y1],
        [x1, y2],
        [x2, y2],
      ],
      // Try an L-bend that goes around matched cells
      [
        [x1, y1],
        [x1, y2],
        [x2, y1],
      ],
      [
        [x1, y1],
        [x2, y1],
        [x2, y2],
      ],
    ];

    for (let path of flexiblePaths) {
      let validPath = true;
      for (let [x, y] of path) {
        const cell = board.children[y * BOARD_WIDTH + x];
        if (cell && !cell.classList.contains("inactive") && cell.textContent) {
          validPath = false;
          break;
        }
      }

      if (validPath) return true;
    }

    return false; // No valid path
  }

  return true; // Path is clear
}

// Calculate distance between two cells
function calculateDistance(cell1, cell2) {
  const index1 = Array.from(board.children).indexOf(cell1);
  const index2 = Array.from(board.children).indexOf(cell2);

  const x1 = index1 % BOARD_WIDTH;
  const y1 = Math.floor(index1 / BOARD_WIDTH);
  const x2 = index2 % BOARD_WIDTH;
  const y2 = Math.floor(index2 / BOARD_WIDTH);

  return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

// Update score based on distance
function updateScore(distance) {
  const points = Math.max(10 - distance, 1);
  score += points;
  scoreDisplay.textContent = `Score: ${score}`;
}

// Check if any matches are possible
function checkGameStatus() {
  const cells = Array.from(board.children).filter(
    (cell) => !cell.classList.contains("inactive")
  );

  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      const num1 = parseInt(cells[i].textContent);
      const num2 = parseInt(cells[j].textContent);

      if (
        (num1 + num2 === 10 || num1 === num2) &&
        isPathClear(cells[i], cells[j])
      ) {
        return true; // Matches exist
      }
    }
  }

  return false; // No more matches exist
}

// Advance to the next stage
function advanceToNextStage() {
  alert(`Stage ${stage} Complete! Moving to Stage ${stage + 1}...`);
  stage++;
  updateStageDisplay();
  initializeGame();
}

function updateStageDisplay() {
  const stageDisplay = document.getElementById("stage");
  stageDisplay.textContent = `Stage: ${stage}`;
}

// Check and update game status
function checkAndUpdateGameState() {
  const activeCells = Array.from(board.children).filter(
    (cell) => !cell.classList.contains("inactive")
  );

  if (activeCells.length === 0) {
    // Board is empty: Move to the next stage
    advanceToNextStage();
  } else if (!checkGameStatus()) {
    // No moves left: Game Over
    alert(`Game Over! You reached Stage ${stage} with a score of ${score}.`);
    if (score > highscore) {
      highscore = score;
      localStorage.setItem("highscore", highscore);
      highscoreDisplay.textContent = `Highscore: ${highscore}`;
    }
    initializeGame(); // Restart the game if new game is started or game over
    stage = 1;
    updateStageDisplay();
  }
}

// Event listeners
addNumbersBtn.addEventListener("click", addNumbers);
newGameBtn.addEventListener("click", () => {
  initializeGame();
  // Ensure the highscore is always there after a new game
  highscoreDisplay.textContent = `Highscore: ${highscore}`;
});

initializeGame();
