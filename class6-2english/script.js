document.addEventListener('DOMContentLoaded', () => {
    const wordList = [
        { word: "CAT", hint: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?auto=format&fit=crop&w=300&q=60", level: 1 },
        { word: "SUN", hint: "https://images.unsplash.com/photo-1590327913322-26a97a7a50ad?auto=format&fit=crop&w=300&q=60", level: 1 },
        { word: "DOG", hint: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=60", level: 1 },
        { word: "FROG", hint: "https://images.unsplash.com/photo-1593554931562-7935a297e74c?auto=format&fit=crop&w=300&q=60", level: 2 },
        { word: "STAR", hint: "https://images.unsplash.com/photo-1538331221415-46743130d248?auto=format&fit=crop&w=300&q=60", level: 2 },
        { word: "BALL", hint: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=300&q=60", level: 2 },
        { word: "APPLE", hint: "https://images.unsplash.com/photo-1560806887-1e4cd0b69665?auto=format&fit=crop&w=300&q=60", level: 3 },
        { word: "TIGER", hint: "https://images.unsplash.com/photo-1615566336334-d0835848c9c6?auto=format&fit=crop&w=300&q=60", level: 3 },
        { word: "SMILE", hint: "https://images.unsplash.com/photo-1594420760443-263a4b132895?auto=format&fit=crop&w=300&q=60", level: 3 },
    ];

    // DOM Elements
    const levelIndicator = document.getElementById('level-indicator');
    const scoreIndicator = document.getElementById('score-indicator');
    const hintBtn = document.getElementById('hint-btn');
    const hintImage = document.getElementById('hint-image');
    const letterSlots = document.getElementById('letter-slots');
    const jumbledLetters = document.getElementById('jumbled-letters');
    const feedbackMessage = document.getElementById('feedback-message');
    const nextWordBtn = document.getElementById('next-word-btn');
    const muteBtn = document.getElementById('mute-btn');
    
    // Audio Elements
    const bgMusic = document.getElementById('bg-music');
    const dropSound = document.getElementById('drop-sound');
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');

    // Game State
    let currentWordData;
    let score = 0;
    let level = 1;
    let wordsInLevel = wordList.filter(w => w.level === level);
    let draggedBlock = null;

    function setupWord() {
        if (wordsInLevel.length === 0) {
            level++;
            if (level > 3) {
                feedbackMessage.textContent = "You've completed all levels!";
                nextWordBtn.classList.add('hidden');
                return;
            }
            wordsInLevel = wordList.filter(w => w.level === level);
            levelIndicator.textContent = level;
        }

        const wordIndex = Math.floor(Math.random() * wordsInLevel.length);
        currentWordData = wordsInLevel.splice(wordIndex, 1)[0];
        
        // Reset UI
        letterSlots.innerHTML = '';
        jumbledLetters.innerHTML = '';
        feedbackMessage.textContent = '';
        hintImage.classList.add('hidden');
        hintBtn.disabled = false;
        nextWordBtn.classList.add('hidden');

        // Create slots and letters
        const wordLetters = currentWordData.word.split('');
        wordLetters.forEach(() => {
            const slot = document.createElement('div');
            slot.classList.add('letter-slot');
            letterSlots.appendChild(slot);
        });

        const shuffledLetters = [...wordLetters].sort(() => Math.random() - 0.5);
        shuffledLetters.forEach(letter => {
            const block = document.createElement('div');
            block.classList.add('letter-block');
            block.textContent = letter;
            block.draggable = true;
            jumbledLetters.appendChild(block);
        });

        addDragDropListeners();
    }

    function addDragDropListeners() {
        const blocks = document.querySelectorAll('.letter-block');
        const slots = document.querySelectorAll('.letter-slot');

        blocks.forEach(block => {
            block.addEventListener('dragstart', (e) => {
                draggedBlock = e.target;
                setTimeout(() => block.classList.add('dragging'), 0);
            });
            block.addEventListener('dragend', () => block.classList.remove('dragging'));
        });

        slots.forEach(slot => {
            slot.addEventListener('dragover', (e) => e.preventDefault());
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                if (slot.children.length === 0) { // If slot is empty
                    slot.appendChild(draggedBlock);
                    dropSound.play();
                }
                checkIfComplete();
            });
        });
        
        // Allow dropping back to the pile
        jumbledLetters.addEventListener('dragover', (e) => e.preventDefault());
        jumbledLetters.addEventListener('drop', (e) => {
            e.preventDefault();
            jumbledLetters.appendChild(draggedBlock);
        });
    }

    function checkIfComplete() {
        const slots = document.querySelectorAll('.letter-slot');
        const filledSlots = Array.from(slots).filter(s => s.children.length > 0);
        if (filledSlots.length === currentWordData.word.length) {
            const formedWord = Array.from(slots).map(s => s.textContent).join('');
            if (formedWord === currentWordData.word) {
                correctSound.play();
                feedbackMessage.textContent = "Correct!";
                feedbackMessage.className = 'feedback-message correct';
                updateScore(100);
                nextWordBtn.classList.remove('hidden');
            } else {
                wrongSound.play();
                feedbackMessage.textContent = "Try again!";
                feedbackMessage.className = 'feedback-message incorrect';
            }
        }
    }

    function updateScore(points) {
        score += points;
        scoreIndicator.textContent = score;
        scoreIndicator.classList.add('pop');
        setTimeout(() => scoreIndicator.classList.remove('pop'), 400);
    }
    
    hintBtn.addEventListener('click', () => {
        hintImage.src = currentWordData.hint;
        hintImage.classList.remove('hidden');
        updateScore(-25); // Penalty for using hint
        hintBtn.disabled = true;
    });

    nextWordBtn.addEventListener('click', setupWord);
    
    muteBtn.addEventListener('click', () => {
        const isMuted = bgMusic.muted;
        bgMusic.muted = !isMuted;
        dropSound.muted = !isMuted;
        correctSound.muted = !isMuted;
        wrongSound.muted = !isMuted;
        muteBtn.textContent = bgMusic.muted ? '🔇' : '🎵';
    });

    // Start Game
    setupWord();
    document.body.addEventListener('click', () => bgMusic.play(), { once: true });
});