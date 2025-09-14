document.addEventListener('DOMContentLoaded', () => {
    // --- Game State & Elements ---
    let currentLevel = 1;
    let currentQuestionIndex = 0;
    let score = 0;
    let isAnswered = false;

    // Elements
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const gameWrapper = document.getElementById('game-wrapper');
    const scoreDisplay = document.getElementById('score');
    const levelTitle = document.getElementById('level-title');
    const figureTitle = document.getElementById('figure-title');
    const figureContainer = document.getElementById('figure-container');
    const questionText = document.getElementById('question-text');
    const shapeImage = document.getElementById('shape-image');
    const optionsContainer = document.getElementById('options-container');
    const muteBtn = document.getElementById('mute-btn');
    // ... all audio elements
    let isMuted = true;

    // --- Levels Data ---
    const levels = {
        1: { // Area
            title: "Level 1: The Foundation",
            figure: { name: "Pyramid", pieces: 3 },
            questions: [
                { q: "Find the area of a square with side 5 cm.", img: "square.png", o: [20, 25, 30], a: 25, unit: " cm²" },
                { q: "Find the area of a circle with radius 7 cm. (Use π ≈ 22/7)", img: "circle.png", o: [44, 154, 49], a: 154, unit: " cm²" },
                { q: "Find the area of a trapezium with parallel sides 8cm & 10cm, and height 4cm.", img: "trapezium.png", o: [72, 40, 36], a: 36, unit: " cm²" }
            ]
        },
        2: { // Volume & Surface Area
            title: "Level 2: The Structure",
            figure: { name: "Castle Tower", pieces: 3 },
            questions: [
                { q: "Find the volume of a cube with side 4 cm.", img: "cube.png", o: [16, 48, 64], a: 64, unit: " cm³" },
                { q: "Find the Total Surface Area of a cuboid (l=5, b=4, h=3 cm).", img: "cuboid.png", o: [60, 94, 47], a: 94, unit: " cm²" },
                { q: "Find the volume of a cylinder with radius 7 cm and height 5 cm. (Use π ≈ 22/7)", img: "cylinder.png", o: [770, 245, 154], a: 770, unit: " cm³" }
            ]
        },
        3: { // Mixed Problems
            title: "Level 3: The Grand Design",
            figure: { name: "Rocket", pieces: 3 },
            questions: [
                { q: "A rectangular field has an area of 200 m² and length of 20 m. Find its breadth.", img: "rectangle.png", o: [10, 20, 40], a: 10, unit: " m" },
                { q: "The volume of a cube is 125 cm³. What is the length of its side?", img: "cube.png", o: [25, 15, 5], a: 5, unit: " cm" },
                { q: "How many small cubes of side 2cm can fit in a box of 8x8x8 cm?", img: "cuboid.png", o: [64, 32, 16], a: 64, unit: " cubes" }
            ]
        }
    };

    function startGame() {
        startScreen.style.display = 'none';
        gameWrapper.style.display = 'flex';
        isMuted = false;
        muteBtn.textContent = '🔇 Unmute';
        document.getElementById('bg-music')?.play().catch(e => {});
        loadLevel();
    }

    function loadLevel() {
        isAnswered = false;
        const level = levels[currentLevel];
        if (!level) {
            document.getElementById('game-area').innerHTML = `<h1 style="color: black; text-align: center;">All figures constructed!<br>Final Score: ${score}</h1>`;
            return;
        }

        levelTitle.textContent = level.title;
        figureTitle.textContent = `Construct the ${level.figure.name}`;
        currentQuestionIndex = 0;
        
        // Setup figure pieces for the level
        figureContainer.innerHTML = '';
        for (let i = 1; i <= level.figure.pieces; i++) {
            const piece = document.createElement('img');
            piece.className = 'figure-piece';
            piece.id = `piece-${i}`;
            // NOTE: You must create images like pyramid_1.png, pyramid_2.png etc.
            piece.src = `assets/${level.figure.name.toLowerCase()}_${i}.png`; 
            figureContainer.appendChild(piece);
        }
        loadQuestion();
    }

    function loadQuestion() {
        const level = levels[currentLevel];
        const question = level.questions[currentQuestionIndex];

        questionText.textContent = question.q;
        shapeImage.src = `assets/${question.img}`;
        
        optionsContainer.innerHTML = '';
        const shuffledOptions = [...question.o].sort(() => Math.random() - 0.5);

        shuffledOptions.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option + (question.unit || '');
            button.onclick = (event) => selectAnswer(event.target, option, question.a);
            optionsContainer.appendChild(button);
        });
    }

    function selectAnswer(button, selected, correct) {
        if (isAnswered) return;
        isAnswered = true;

        if (selected === correct) {
            score += 100;
            button.classList.add('correct');
            document.getElementById('sfx-correct')?.play();
            
            // Reveal a piece of the figure
            const piece = document.getElementById(`piece-${currentQuestionIndex + 1}`);
            if (piece) piece.style.opacity = '1';

            setTimeout(() => {
                currentQuestionIndex++;
                if (currentQuestionIndex >= levels[currentLevel].questions.length) {
                    // Level complete
                    figureTitle.textContent = `${levels[currentLevel].figure.name} Complete!`;
                    setTimeout(() => {
                        currentLevel++;
                        loadLevel();
                    }, 3000); // 3-second delay before next level
                } else {
                    isAnswered = false;
                    loadQuestion();
                }
            }, 1500);
        } else {
            score -= 20;
            button.classList.add('incorrect');
            document.getElementById('sfx-wrong')?.play();
            setTimeout(() => {
                isAnswered = false; // Allow user to try again
                button.classList.remove('incorrect');
            }, 1000);
        }
        scoreDisplay.textContent = score;
    }

    // --- Event Listeners ---
    startBtn.addEventListener('click', startGame);
    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        document.querySelectorAll('audio').forEach(audio => audio.muted = isMuted);
        muteBtn.textContent = isMuted ? '🔊 Mute' : '🔇 Unmute';
    });
});