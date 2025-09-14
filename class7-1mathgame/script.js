document.addEventListener('DOMContentLoaded', () => {
    // --- Game State & Elements ---
    let currentLevel = 1;
    let score = 0;
    let activeTile = null; // Jo tile click hui hai
    let isTransitioning = false;

    // Elements
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const gameWrapper = document.getElementById('game-wrapper');
    const scoreDisplay = document.getElementById('score');
    const levelTitle = document.getElementById('level-title');
    const gameBoard = document.getElementById('game-board');
    const modal = document.getElementById('problem-modal');
    const questionText = document.getElementById('question-text');
    const answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-answer-btn');
    const muteBtn = document.getElementById('mute-btn');
    const bgMusic = document.getElementById('bg-music');
    // ... other audio elements
    let isMuted = true;
    bgMusic.volume = 0.3;

    // --- Levels Data ---
    const levels = {
        1: {
            title: "Level 1: Sunny Shores",
            grid: "3x3", // 3 rows, 3 columns
            map: 'images/map_piece1.jpg',
            problems: [
                { q: "15 + 8", a: 23 }, { q: "30 - 12", a: 18 }, { q: "5 x 7", a: 35 },
                { q: "40 ÷ 5", a: 8 },  { q: "22 + 9", a: 31 },  { q: "19 - 6", a: 13 },
                { q: "6 x 4", a: 24 },  { q: "27 ÷ 3", a: 9 },   { q: "14 + 17", a: 31 }
            ]
        },
        2: {
            title: "Level 2: Dark Caves",
            grid: "4x3", // 4 rows, 3 columns
            map: 'images/map_piece2.jpg',
            problems: [
                { q: "(-5) + (-4)", a: -9 },   { q: "(-8) - 3", a: -11 },    { q: "(-7) x 2", a: -14 },
                { q: "10 + (-6)", a: 4 },      { q: "(-15) ÷ 3", a: -5 },    { q: "(-2) - (-5)", a: 3 },
                { q: "(-9) + 9", a: 0 },       { q: "4 - 10", a: -6 },       { q: "(-6) x (-3)", a: 18 },
                { q: "(-12) ÷ (-2)", a: 6 },   { q: "(-1) + 11", a: 10 },    { q: "5 - (-5)", a: 10 }
            ]
        },
        3: {
            title: "Level 3: Stormy Seas",
            grid: "4x4", // 4 rows, 4 columns
            map: 'images/map_piece3.jpg',
            problems: [
                { q: "12 + (-18)", a: -6 },     { q: "(-25) - (-10)", a: -15 }, { q: "(-8) x (-5)", a: 40 },
                { q: "40 ÷ (-8)", a: -5 },      { q: "(-14) + 7", a: -7 },      { q: "16 - 20", a: -4 },
                { q: "9 x (-6)", a: -54 },      { q: "(-36) ÷ 6", a: -6 },      { q: "(-5) - 15", a: -20 },
                { q: "(-3) x 11", a: -33 },     { q: "2 - (-11)", a: 13 },      { q: "(-48) ÷ (-4)", a: 12 },
                { q: "(-19) + (-2)", a: -21 },  { q: "0 - 17", a: -17 },        { q: "15 x (-2)", a: -30 },
                { q: "50 ÷ (-25)", a: -2 }
            ]
        }
    };

    function startGame() {
        startScreen.style.display = 'none';
        gameWrapper.style.display = 'flex';
        isMuted = false;
        muteBtn.textContent = '🔇 Unmute';
        bgMusic.play().catch(e => console.log("Audio play failed."));
        loadLevel(currentLevel);
    }

    function loadLevel(levelNum) {
        if (!levels[levelNum] || isTransitioning) return;
        isTransitioning = true;
        
        const level = levels[levelNum];
        levelTitle.textContent = level.title;
        gameBoard.innerHTML = ''; // Clear previous tiles

        const [rows, cols] = level.grid.split('x');
        gameBoard.style.gridTemplateColumns = `repeat(${cols}, 100px)`;
        
        // Add map background
        const mapBg = document.createElement('div');
        mapBg.className = 'map-background';
        mapBg.style.backgroundImage = `url(${level.map})`;
        gameBoard.appendChild(mapBg);

        level.problems.forEach((problem, index) => {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.problemIndex = index;
            
            tile.addEventListener('click', () => {
                if (!tile.classList.contains('revealed') && !isTransitioning) {
                    activeTile = tile;
                    questionText.textContent = problem.q + " = ?";
                    answerInput.value = '';
                    modal.style.display = 'flex';
                    answerInput.focus();
                }
            });
            gameBoard.appendChild(tile);
        });
        isTransitioning = false;
    }

    function handleSubmit() {
        const problemIndex = activeTile.dataset.problemIndex;
        const problem = levels[currentLevel].problems[problemIndex];
        const userAnswer = parseInt(answerInput.value);

        if (userAnswer === problem.a) {
            // Correct answer
            score += 10;
            if (!activeTile.dataset.attempted) score += 5; // First try bonus
            // sfxSuccess.play();
            activeTile.classList.add('revealed');
            modal.style.display = 'none';
            checkLevelComplete();
        } else {
            // Incorrect answer
            score -= 2;
            activeTile.dataset.attempted = true;
            // sfxError.play();
            modal.querySelector('.modal-content').classList.add('shake');
            setTimeout(() => {
                modal.querySelector('.modal-content').classList.remove('shake');
            }, 500);
        }
        scoreDisplay.textContent = score;
    }

    function checkLevelComplete() {
        const totalTiles = levels[currentLevel].problems.length;
        const revealedTiles = gameBoard.querySelectorAll('.tile.revealed').length;
        
        if (totalTiles === revealedTiles) {
            isTransitioning = true;
            score += 50; // Level complete bonus
            scoreDisplay.textContent = score;
            levelTitle.textContent = "Map Revealed!";
            
            setTimeout(() => {
                currentLevel++;
                if (levels[currentLevel]) {
                    loadLevel(currentLevel);
                } else {
                    levelTitle.textContent = "You found the Treasure!";
                    gameBoard.innerHTML = `<div style="color: yellow; font-size: 2em; text-align: center; z-index: 3;">Final Score: ${score}</div>`;
                }
            }, 3000); // 3-second delay before next level
        }
    }

    // --- Event Listeners ---
    startBtn.addEventListener('click', startGame);
    submitBtn.addEventListener('click', handleSubmit);
    answerInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    });
    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        bgMusic.muted = isMuted;
        muteBtn.textContent = isMuted ? '🔊 Mute' : '🔇 Unmute';
    });
});