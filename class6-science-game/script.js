document.addEventListener('DOMContentLoaded', () => {
    // Card data (same as before)
    const cardPairs = [
        { content: '🌿<br>Leaf', type: 'image', matchId: 1 }, { content: 'Makes Food', type: 'function', matchId: 1 },
        { content: '💧<br>Root', type: 'image', matchId: 2 }, { content: 'Takes Water', type: 'function', matchId: 2 },
        { content: '🌼<br>Flower', type: 'image', matchId: 3 }, { content: 'Makes Seeds', type: 'function', matchId: 3 },
        { content: '🎋<br>Stem', type: 'image', matchId: 4 }, { content: 'Supports Plant', type: 'function', matchId: 4 },
        { content: '🍅<br>Fruit', type: 'image', matchId: 5 }, { content: 'Protects Seeds', type: 'function', matchId: 5 },
        { content: '🌱<br>Seed', type: 'image', matchId: 6 }, { content: 'Grows Plant', type: 'function', matchId: 6 }
    ];

    // DOM Elements
    const gameBoard = document.getElementById('game-board');
    const levelEl = document.getElementById('level');
    const scoreEl = document.getElementById('score');
    const nextLevelBtn = document.getElementById('next-level-btn');
    
    // Sound Elements
    const bgMusic = document.getElementById('bg-music');
    const flipSound = document.getElementById('flip-sound');
    const matchSound = document.getElementById('match-sound');
    const mismatchSound = document.getElementById('mismatch-sound');
    const muteBtn = document.getElementById('mute-btn');

    // Game State
    let currentLevel = 1;
    let score = 0;
    let flippedCards = [];
    let matchedPairs = 0;
    let lockBoard = false;
    let cardsPerLevel = [4, 8, 12];

    function loadLevel() {
        levelEl.textContent = currentLevel;
        matchedPairs = 0;
        gameBoard.innerHTML = '';
        nextLevelBtn.classList.add('hidden');

        let numCards = cardsPerLevel[currentLevel - 1];
        let levelCardsData = cardPairs.slice(0, numCards);
        levelCardsData.sort(() => 0.5 - Math.random());

        levelCardsData.forEach(data => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.matchId = data.matchId;
            card.innerHTML = `
                <div class="card-face card-front">🌿</div>
                <div class="card-face card-back ${data.type}-card">
                    <span>${data.content}</span>
                </div>
            `;
            card.addEventListener('click', () => handleCardClick(card));
            gameBoard.appendChild(card);
        });
    }

    function handleCardClick(card) {
        if (lockBoard || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }

        flipSound.play();
        card.classList.add('flipped');
        flippedCards.push(card);
        bgMusic.play().catch(() => {});

        if (flippedCards.length === 2) {
            lockBoard = true;
            checkForMatch();
        }
    }

    function checkForMatch() {
        const [card1, card2] = flippedCards;
        if (card1.dataset.matchId === card2.dataset.matchId) {
            matchSound.play();
            score += 10;
            matchedPairs++;
            card1.classList.add('matched');
            card2.classList.add('matched');
            createParticles(card1); // Particle effect trigger
            createParticles(card2); // Particle effect trigger
            resetFlippedCards();
        } else {
            mismatchSound.play();
            score = Math.max(0, score - 5);
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                resetFlippedCards();
            }, 1200);
        }
        updateScore();
        checkLevelComplete();
    }
    
    function resetFlippedCards() {
        flippedCards = [];
        lockBoard = false;
    }

    function updateScore() {
        scoreEl.textContent = score;
        scoreEl.classList.add('pop');
        setTimeout(() => scoreEl.classList.remove('pop'), 500); // Animation ke baad class hatao
    }
    
    function checkLevelComplete() {
        if (matchedPairs * 2 === cardsPerLevel[currentLevel - 1]) {
            if (currentLevel < 3) {
                setTimeout(() => nextLevelBtn.classList.remove('hidden'), 500);
            } else {
                setTimeout(() => alert(`Game Over! Your final score is ${score}`), 500);
            }
        }
    }

    function createParticles(card) {
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            const x = (Math.random() - 0.5) * 200; // Horizontal spread
            const y = (Math.random() - 0.5) * 200; // Vertical spread
            particle.style.setProperty('--x', `${x}px`);
            particle.style.setProperty('--y', `${y}px`);
            card.querySelector('.card-face').appendChild(particle);
        }
    }

    nextLevelBtn.addEventListener('click', () => {
        currentLevel++;
        loadLevel();
    });

    muteBtn.addEventListener('click', () => {
        const isMuted = bgMusic.muted;
        bgMusic.muted = !isMuted;
        flipSound.muted = !isMuted;
        matchSound.muted = !isMuted;
        mismatchSound.muted = !isMuted;
        muteBtn.textContent = bgMusic.muted ? '🔇' : '🎵';
    });

    loadLevel();
});