document.addEventListener('DOMContentLoaded', () => {
    const levelData = [
        { level: 1, pairs: [{ word1: "CAT", word2: "HAT" }], distractors: ["SUN", "PIG"] },
        { level: 2, pairs: [{ word1: "BALL", word2: "FALL" }, { word1: "DUCK", word2: "TRUCK" }, { word1: "GOAT", word2: "BOAT" }], distractors: [] },
        { level: 3, pairs: [{ word1: "KING", word2: "SWING" }, { word1: "TREE", word2: "BEE" }, { word1: "HOUSE", word2: "MOUSE" }, { word1: "PLATE", word2: "EIGHT" }], distractors: ["CLOUD", "BALL"] },
    ];

    // DOM Elements
    const levelIndicator = document.getElementById('level-indicator');
    const scoreIndicator = document.getElementById('score-indicator');
    const leftColumn = document.getElementById('left-column');
    const rightColumn = document.getElementById('right-column');
    const nextLevelBtn = document.getElementById('next-level-btn');
    const muteBtn = document.getElementById('mute-btn');
    const canvas = document.getElementById('line-canvas');
    const ctx = canvas.getContext('2d');
    
    // Audio
    const bgMusic = document.getElementById('bg-music');
    const sounds = { correct: document.getElementById('correct-sound'), wrong: document.getElementById('wrong-sound'), complete: document.getElementById('level-complete-sound') };

    // Game State
    let currentLevel = 0;
    let score = 0;
    let selectedWordEl = null;
    let matchedPairs = 0;

    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }

    function loadLevel(levelIndex) {
        const level = levelData[levelIndex];
        matchedPairs = 0;
        levelIndicator.textContent = levelIndex + 1;
        
        leftColumn.innerHTML = '';
        rightColumn.innerHTML = '';
        nextLevelBtn.classList.add('hidden');
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear lines
        
        const leftWords = level.pairs.map(p => p.word1);
        let rightWords = level.pairs.map(p => p.word2);
        if (level.distractors) rightWords.push(...level.distractors);
        
        // Shuffle right column for challenge
        rightWords.sort(() => Math.random() - 0.5);

        populateColumn(leftColumn, leftWords, level.pairs, 'word1');
        populateColumn(rightColumn, rightWords, level.pairs, 'word2');

        document.querySelectorAll('.word-leaf').forEach(leaf => {
            leaf.addEventListener('click', handleWordClick);
        });
    }
    
    function populateColumn(columnEl, words, pairs, key) {
        words.forEach(word => {
            const leaf = document.createElement('div');
            leaf.className = 'word-leaf';
            leaf.textContent = word;
            const pair = pairs.find(p => p[key] === word);
            if (pair) leaf.dataset.pairId = pairs.indexOf(pair);
            columnEl.appendChild(leaf);
        });
    }

    function handleWordClick(e) {
        const clickedLeaf = e.target;
        if (clickedLeaf.classList.contains('matched')) return;

        if (!selectedWordEl) {
            // First word selected
            if (clickedLeaf.parentElement.id !== 'left-column') return; // Can only start from left
            selectedWordEl = clickedLeaf;
            selectedWordEl.classList.add('selected');
        } else {
            // Second word selected (potential match)
            if (clickedLeaf.parentElement.id !== 'right-column') return; // Must connect to right
            
            const pairId1 = selectedWordEl.dataset.pairId;
            const pairId2 = clickedLeaf.dataset.pairId;

            if (pairId1 !== undefined && pairId1 === pairId2) {
                // Correct Match
                sounds.correct.play();
                updateScore(50);
                
                const startPos = getElementCenter(selectedWordEl);
                const endPos = getElementCenter(clickedLeaf);
                drawPermanentLine(startPos, endPos);
                
                selectedWordEl.classList.add('matched');
                clickedLeaf.classList.add('matched');
                matchedPairs++;
                
                if (matchedPairs === levelData[currentLevel].pairs.length) {
                    levelComplete();
                }
            } else {
                // Incorrect Match
                sounds.wrong.play();
                updateScore(-10);
                selectedWordEl.classList.add('shake');
                setTimeout(() => selectedWordEl.classList.remove('shake'), 500);
            }
            selectedWordEl.classList.remove('selected');
            selectedWordEl = null;
        }
    }

    function getElementCenter(el) {
        const rect = el.getBoundingClientRect();
        const parentRect = canvas.parentElement.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2 - parentRect.left,
            y: rect.top + rect.height / 2 - parentRect.top,
        };
    }
    
    function drawPermanentLine(start, end) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.lineWidth = 5;
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow
    }

    function updateScore(points) {
        score += points;
        if (score < 0) score = 0;
        scoreIndicator.textContent = score;
        scoreIndicator.classList.add('pop');
        setTimeout(() => scoreIndicator.classList.remove('pop'), 400);
    }
    
    function levelComplete() {
        sounds.complete.play();
        if (currentLevel < levelData.length - 1) {
            nextLevelBtn.classList.remove('hidden');
        } else {
            nextLevelBtn.textContent = 'Play Again?';
            nextLevelBtn.classList.remove('hidden');
        }
    }

    nextLevelBtn.addEventListener('click', () => {
        currentLevel++;
        if (currentLevel >= levelData.length) {
            currentLevel = 0;
            score = 0;
            updateScore(0);
        }
        loadLevel(currentLevel);
    });
    
    muteBtn.addEventListener('click', () => {
        const isMuted = bgMusic.muted;
        bgMusic.muted = !isMuted;
        Object.values(sounds).forEach(sound => sound.muted = !isMuted);
        muteBtn.textContent = bgMusic.muted ? '🔇' : '🎵';
    });

    // Initial setup
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    loadLevel(currentLevel);
    updateScore(0);
    document.body.addEventListener('click', () => bgMusic.play(), { once: true });
});