document.addEventListener('DOMContentLoaded', () => {

    // --- DATA ---
    const levels = [
        // ... (level data remains the same)
        { // Level 1
            animals: [
                { id: 'cow', icon: '🐄', group: 'herbivore' },
                { id: 'lion', icon: '🦁', group: 'carnivore' },
                { id: 'bear', icon: '🐻', group: 'omnivore' }
            ]
        },
        { // Level 2
            animals: [
                { id: 'rabbit', icon: '🐇', group: 'herbivore' },
                { id: 'deer', icon: '🦌', group: 'herbivore' },
                { id: 'shark', icon: '🦈', group: 'carnivore' },
                { id: 'tiger', icon: '🐅', group: 'carnivore' },
                { id: 'chicken', icon: '🐔', group: 'omnivore' },
                { id: 'pig', icon: '🐖', group: 'omnivore' }
            ]
        },
        { // Level 3 (Tricky Cases)
            animals: [
                { id: 'gorilla', icon: '🦍', group: 'herbivore' },
                { id: 'panda', icon: '🐼', group: 'herbivore' },
                { id: 'vulture', icon: '🦅', group: 'carnivore' },
                { id: 'piranha', icon: '🐟', group: 'omnivore' },
                { id: 'raccoon', icon: '🦝', group: 'omnivore' }
            ]
        }
    ];

    // --- GAME STATE ---
    let currentLevel = 0;
    let correctlyPlacedCount = 0;
    let score = 0; // Score variable added

    // --- DOM ELEMENTS ---
    const animalsContainer = document.getElementById('animals-container');
    const dropZones = document.querySelectorAll('.zone');
    const feedbackMessage = document.getElementById('feedback-message');
    const nextLevelBtn = document.getElementById('next-level-btn');
    const levelIndicator = document.getElementById('level-indicator');
    const scoreEl = document.getElementById('score'); // Score element
    const bgMusic = document.getElementById('bg-music'); // Music element
    const muteBtn = document.getElementById('mute-btn'); // Mute button

    // --- FUNCTIONS ---
    function updateScore(points) {
        score += points;
        if (score < 0) score = 0; // Score can't be negative
        scoreEl.textContent = score;
    }

    function loadLevel(levelIndex) {
        levelIndicator.textContent = `Level ${levelIndex + 1}`;
        const levelData = levels[levelIndex];
        correctlyPlacedCount = 0;

        animalsContainer.innerHTML = '';
        dropZones.forEach(zone => {
            const title = zone.querySelector('h2');
            zone.innerHTML = '';
            zone.appendChild(title);
        });
        
        feedbackMessage.textContent = '';
        nextLevelBtn.classList.add('hidden');

        levelData.animals.forEach(animal => {
            const animalEl = document.createElement('div');
            animalEl.id = animal.id;
            animalEl.className = 'animal';
            animalEl.textContent = animal.icon;
            animalEl.draggable = true;
            animalEl.dataset.group = animal.group;
            animalsContainer.appendChild(animalEl);
        });

        addDragListeners();
    }

    function handleDrop(event) {
        event.preventDefault();
        const animalId = event.dataTransfer.getData('text/plain');
        const animalEl = document.getElementById(animalId);
        const targetZone = event.currentTarget;

        if (animalEl.dataset.group === targetZone.dataset.group) {
            targetZone.appendChild(animalEl);
            animalEl.draggable = false;
            animalEl.classList.add('placed');
            correctlyPlacedCount++;
            
            showFeedback('Correct! +10 Points ✅', 'green');
            updateScore(10); // Add 10 points for correct answer
            
            if (correctlyPlacedCount === levels[currentLevel].animals.length) {
                if (currentLevel < levels.length - 1) {
                    nextLevelBtn.classList.remove('hidden');
                    showFeedback('Level Complete! 🎉', 'blue');
                } else {
                    showFeedback('You Win! All levels completed! 🏆', 'gold');
                }
            }
        } else {
            showFeedback('Oops! -5 Points ❌', 'red');
            updateScore(-5); // Subtract 5 points for wrong answer
        }
        targetZone.classList.remove('drag-over');
    }

    function showFeedback(message, color) {
        feedbackMessage.textContent = message;
        feedbackMessage.style.color = color;
        // Keep level complete/win message, clear others
        if (!message.includes('🎉') && !message.includes('🏆')) {
             setTimeout(() => { if (feedbackMessage.textContent === message) feedbackMessage.textContent = ''; }, 2000);
        }
    }

    function addDragListeners() {
        const animals = document.querySelectorAll('.animal:not(.placed)');
        animals.forEach(animal => {
            animal.addEventListener('dragstart', (event) => {
                // Try to play music on first user interaction
                bgMusic.play().catch(error => console.log("User must interact with the page to play audio."));
                event.dataTransfer.setData('text/plain', event.target.id);
                event.target.classList.add('dragging');
            });
            animal.addEventListener('dragend', (event) => {
                event.target.classList.remove('dragging');
            });
        });
    }

    // --- EVENT LISTENERS ---
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (event) => {
            event.preventDefault();
            zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });
        zone.addEventListener('drop', handleDrop);
    });

    nextLevelBtn.addEventListener('click', () => {
        currentLevel++;
        if (currentLevel < levels.length) {
            loadLevel(currentLevel);
        }
    });

    muteBtn.addEventListener('click', () => {
        bgMusic.muted = !bgMusic.muted;
        muteBtn.textContent = bgMusic.muted ? '🔇' : '🎵';
    });

    // --- INITIALIZE GAME ---
    loadLevel(currentLevel);
});