document.addEventListener('DOMContentLoaded', () => {
    // Game data for each level
    const levels = [
        { // Level 1
            story: "The quick brown {} jumped over the lazy {}.",
            words: ["fox", "dog"],
            distractors: [],
            illustration: 'https://images.unsplash.com/photo-1598429440319-450410852467?auto=format&fit=crop&w=400&q=80'
        },
        { // Level 2
            story: "The bright {} shines in the blue {}. A small bird {} a happy song.",
            words: ["sun", "sky", "sings"],
            distractors: ["moon", "runs"],
            illustration: 'https://images.unsplash.com/photo-1604937455095-2633a5165a2d?auto=format&fit=crop&w=400&q=80'
        },
        { // Level 3
            story: "The brave {} went to {} castle to find the lost treasure. {} journey was long and difficult.",
            words: ["knight", "their", "Their"],
            distractors: ["there", "they're", "king"],
            illustration: 'https://images.unsplash.com/photo-1605057132049-55a3b378c2e2?auto=format&fit=crop&w=400&q=80'
        }
    ];

    // DOM Elements
    const storyTextEl = document.getElementById('story-text');
    const wordChestEl = document.getElementById('word-chest');
    const chainProgressEl = document.getElementById('story-chain-progress');
    const nextLevelBtn = document.getElementById('next-level-btn');
    const modal = document.getElementById('narration-modal');
    const narrateBtn = document.getElementById('narrate-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const muteBtn = document.getElementById('mute-btn');

    // Audio Elements
    const bgMusic = document.getElementById('bg-music');
    const sounds = {
        drop: document.getElementById('drop-sound'),
        correct: document.getElementById('correct-sound'),
        wrong: document.getElementById('wrong-sound'),
        complete: document.getElementById('level-complete-sound')
    };
    
    // Game State
    let currentLevel = 0;
    let placedWordsCount = 0;

    function loadLevel(levelIndex) {
        const level = levels[levelIndex];
        placedWordsCount = 0;
        
        // Reset UI elements
        wordChestEl.innerHTML = '';
        chainProgressEl.innerHTML = '';
        nextLevelBtn.classList.add('hidden');
        modal.classList.add('hidden');
        
        // Create the story with blank spaces
        let storyHTML = level.story;
        level.words.forEach(word => {
            storyHTML = storyHTML.replace('{}', `<span class="blank" data-answer="${word}"></span>`);
        });
        storyTextEl.innerHTML = storyHTML;

        // Create draggable word tiles in the word chest
        const allWords = [...level.words, ...level.distractors].sort(() => Math.random() - 0.5);
        allWords.forEach((word, index) => {
            const tile = document.createElement('div');
            tile.className = 'word-tile';
            tile.textContent = word;
            tile.draggable = true;
            tile.id = `tile-${index}`; // Unique ID for robust drag/drop
            wordChestEl.appendChild(tile);
        });
        
        addDragDropListeners();
    }

    function addDragDropListeners() {
        const tiles = document.querySelectorAll('.word-tile');
        const blanks = document.querySelectorAll('.blank');

        // Add drag start and end events for each word tile
        tiles.forEach(tile => {
            tile.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', tile.id); // Drag by ID, not text
                tile.classList.add('dragging');
                sounds.drop.play();
            });
            tile.addEventListener('dragend', () => tile.classList.remove('dragging'));
        });

        // Add drag over, leave, and drop events for each blank space
        blanks.forEach(blank => {
            if (blank.classList.contains('filled')) return;
            blank.addEventListener('dragover', (e) => {
                e.preventDefault();
                blank.classList.add('drag-over');
            });
            blank.addEventListener('dragleave', () => blank.classList.remove('drag-over'));
            blank.addEventListener('drop', handleDrop);
        });
    }

    function handleDrop(e) {
        e.preventDefault();
        const blank = e.target;
        const droppedTileId = e.dataTransfer.getData('text/plain');
        const droppedTile = document.getElementById(droppedTileId);
        
        blank.classList.remove('drag-over');

        // Check if the dropped word is correct for the blank
        if (blank.dataset.answer === droppedTile.textContent) {
            sounds.correct.play();
            blank.textContent = droppedTile.textContent;
            blank.classList.add('filled');
            
            // Hide the word tile from the chest
            droppedTile.style.display = 'none';

            placedWordsCount++;
            addChainLink();

            // Check if all words for the level have been placed
            if (placedWordsCount === levels[currentLevel].words.length) {
                levelComplete();
            }
        } else {
            sounds.wrong.play();
            blank.classList.add('shake');
            setTimeout(() => blank.classList.remove('shake'), 500);
        }
    }

    // Adds a chain link to the progress bar
    function addChainLink() {
        const link = document.createElement('span');
        link.className = 'chain-link';
        link.textContent = '🔗';
        chainProgressEl.appendChild(link);
    }
    
    // Function to run when the level is completed
    function levelComplete() {
        sounds.complete.play();
        const level = levels[currentLevel];
        
        // Populate and show the narration modal
        document.getElementById('modal-image').src = level.illustration;
        document.getElementById('modal-story').textContent = storyTextEl.innerText;
        setTimeout(() => modal.classList.remove('hidden'), 500);

        // Show the next level button or a play again button
        if (currentLevel < levels.length - 1) {
            nextLevelBtn.classList.remove('hidden');
        } else {
            nextLevelBtn.textContent = "Play Again?";
            nextLevelBtn.classList.remove('hidden');
        }
    }
    
    // Uses the browser's speech synthesis to read the story
    function narrateStory() {
        const storyToRead = storyTextEl.innerText;
        const utterance = new SpeechSynthesisUtterance(storyToRead);
        utterance.lang = 'en-US';
        speechSynthesis.speak(utterance);
    }

    // --- Event Listeners for Buttons ---
    nextLevelBtn.addEventListener('click', () => {
        currentLevel++;
        if (currentLevel >= levels.length) currentLevel = 0; // Loop back to start
        loadLevel(currentLevel);
    });
    
    narrateBtn.addEventListener('click', narrateStory);
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));

    muteBtn.addEventListener('click', () => {
        const isMuted = bgMusic.muted;
        bgMusic.muted = !isMuted;
        Object.values(sounds).forEach(sound => sound.muted = !isMuted);
        muteBtn.textContent = bgMusic.muted ? '🔇' : '🎵';
    });

    // --- Start the Game ---
    loadLevel(currentLevel);
    // Try to play background music on the first user interaction
    document.body.addEventListener('click', () => bgMusic.play(), { once: true });
});