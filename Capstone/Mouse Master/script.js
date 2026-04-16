// Game variables
let score = 0;
let timeLeft = 30;
let lives = 3;
let gameActive = false;
let gameTimer;
let spawnTimer;

// Element Selectors
const gameArea = document.getElementById('game-area');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const livesEl = document.getElementById('lives');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const closeHelpBtn = document.getElementById('close-help-btn');

// Event Listeners for buttons
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', resetGame);

helpBtn.addEventListener('click', () => {
    helpModal.classList.remove('hidden');
});

closeHelpBtn.addEventListener('click', () => {
    helpModal.classList.add('hidden');
});

/**
 * Reset variables and start the game loops
 */
function startGame() {
    score = 0;
    timeLeft = 45;
    lives = 3;
    gameActive = true;

    helpModal.classList.add('hidden');
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    
    updateUI();
    runGameClock();
    gameLoop();
}

/**
 * Main game loop that decides what objects to spawn
 */
function gameLoop() {
    if (!gameActive) return;

    // Clear the board for transitions between modes
    // Mode 1: Single Click (Time > 30s)
    if (timeLeft > 30) {
        spawnClickTarget(false);
    } 
    // Mode 2: Double Click (Time between 15s and 30s)
    else if (timeLeft > 15) {
        spawnClickTarget(true);
    } 
    // Mode 3: Drag & Drop (Final 15 seconds)
    else {
        spawnDragDrop();
        // Drag and drop spawns its own next item, so we stop the loop here
        return; 
    }

    // Set speed: targets appear faster as time decreases
    let speed = timeLeft > 10 ? 1000 : 700;
    spawnTimer = setTimeout(gameLoop, speed);
}

function spawnClickTarget(isDouble) {
    const target = document.createElement('div');
    target.className = isDouble ? 'target double-click-me' : 'target click-me';
    target.innerText = isDouble ? '2x' : '1x';

    // Random position within the game container
    const x = Math.random() * (700) + 20;
    const y = Math.random() * (400) + 100;
    target.style.left = `${x}px`;
    target.style.top = `${y}px`;

    // Handle Clicks
    if (isDouble) {
        target.addEventListener('dblclick', () => handleSuccess(target, 20));
    } else {
        target.addEventListener('click', () => handleSuccess(target, 10));
    }

    gameArea.appendChild(target);

    // If student doesn't click in 2 seconds, remove it and lose a life
    setTimeout(() => {
        if (target.parentNode && gameActive) {
            target.remove();
            loseLife();
        }
    }, 2000);
}

function spawnDragDrop() {
    gameArea.innerHTML = ''; // Clear area for the drop zone
    
    const dropZone = document.createElement('div');
    dropZone.className = 'drop-target';
    dropZone.innerText = "DROP HERE";
    gameArea.appendChild(dropZone);

    const item = document.createElement('div');
    item.className = 'draggable';
    item.innerText = "📦";
    item.draggable = true;
    item.style.left = (Math.random() * 600 + 50) + "px";
    item.style.top = "150px";
    gameArea.appendChild(item);

    // Drag Logic
    item.addEventListener('dragstart', (e) => e.dataTransfer.setData('text', ''));
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('hover');
    });

    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('hover'));

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        handleSuccess(item, 50);
        // Brief pause before spawning the next item
        setTimeout(() => {
            if (gameActive && timeLeft <= 15) spawnDragDrop();
        }, 500);
    });
}

function handleSuccess(element, points) {
    score += points;
    element.remove();
    updateUI();
}

function loseLife() {
    lives--;
    updateUI();
    if (lives <= 0) endGame();
}

function updateUI() {
    scoreEl.innerText = score;
    timerEl.innerText = timeLeft;
    livesEl.innerText = lives;
}

function runGameClock() {
    gameTimer = setInterval(() => {
        timeLeft--;
        updateUI();
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function endGame() {
    gameActive = false;
    clearInterval(gameTimer);
    clearTimeout(spawnTimer);
    
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('end-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = score;
    gameArea.innerHTML = '';
}

function resetGame() {
    startGame();
}