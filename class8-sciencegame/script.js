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
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const statusList = document.getElementById('status-list');
    const rocket = document.getElementById('rocket');
    const muteBtn = document.getElementById('mute-btn');
    // ... all audio elements
    let isMuted = true;

    // --- Levels Data ---
    const levels = {
        1: { // Basic Formulas
            title: "Mission 1: Pre-Flight Checks",
            statusChecks: ["Power Grid", "Fuel System", "Navigation"],
            questions: [
                { q: "Calculate Pressure if Force = 50 N and Area = 2 m². (P = F/A)", o: [25, 100, 52], a: 25, unit: " Pa" },
                { q: "Calculate Force if Mass = 10 kg and Acceleration = 5 m/s². (F = m x a)", o: [2, 50, 15], a: 50, unit: " N" },
                { q: "Calculate Pressure if Force = 100 N and Area = 4 m².", o: [400, 25, 96], a: 25, unit: " Pa" }
            ]
        },
        2: { // Mixed & Applied Problems
            title: "Mission 2: Orbital Maneuvers",
            statusChecks: ["Engine Ignition", "Life Support", "Communication"],
            questions: [
                { q: "A 500 kg satellite accelerates at 4 m/s². What is the force needed?", o: [125, 2000, 504], a: 2000, unit: " N" },
                { q: "A force of 300 N is needed to create 60 Pa of pressure. What is the area? (A = F/P)", o: [5, 18000, 240], a: 5, unit: " m²" },
                { q: "An astronaut's boot has an area of 0.02 m². If the force is 160 N, what is the pressure?", o: [3.2, 800, 8000], a: 8000, unit: " Pa" }
            ]
        },
        3: { // Complex Scenarios
            title: "Mission 3: Interstellar Journey",
            statusChecks: ["Main Thrusters", "Warp Drive", "Shields"],
            questions: [
                { q: "A 2000 kg rocket has 50,000 N thrust and 10,000 N air friction. What is the NET force?", o: [60000, 40000, 20], a: 40000, unit: " N" },
                { q: "Using the NET force from the last question (40,000 N), what is the rocket's acceleration? (a = F/m)", o: [20, 25, 30], a: 20, unit: " m/s²" },
                { q: "A landing pad must withstand 100,000 Pa. If the rocket's landing gear has an area of 5 m², what is the maximum force it can handle? (F = P x A)", o: [20000, 500000, 100005], a: 500000, unit: " N" }
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
            questionText.textContent = "All Missions Complete, Commander!";
            optionsContainer.innerHTML = '';
            return;
        }
        levelTitle.textContent = level.title;
        currentQuestionIndex = 0;

        // Setup Status Panel for the level
        statusList.innerHTML = '';
        level.statusChecks.forEach(check => {
            const li = document.createElement('li');
            li.textContent = `${check}: OFFLINE`;
            statusList.appendChild(li);
        });
        loadQuestion();
    }

    function loadQuestion() {
        const level = levels[currentLevel];
        const question = level.questions[currentQuestionIndex];
        
        questionText.textContent = question.q;
        optionsContainer.innerHTML = '';
        
        // Shuffle options for variety
        const shuffledOptions = [...question.o].sort(() => Math.random() - 0.5);

        shuffledOptions.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option + (question.unit || '');
            button.onclick = () => selectAnswer(option, question.a);
            optionsContainer.appendChild(button);
        });
    }

    function selectAnswer(selected, correct) {
        if (isAnswered) return;
        isAnswered = true;

        if (selected === correct) {
            score += 100;
            document.getElementById('sfx-success')?.play();
            
            // Update status panel
            const statusItems = statusList.getElementsByTagName('li');
            if(statusItems[currentQuestionIndex]) {
                const checkName = levels[currentLevel].statusChecks[currentQuestionIndex];
                statusItems[currentQuestionIndex].textContent = `${checkName}: ONLINE`;
                statusItems[currentQuestionIndex].classList.add('online');
            }

            setTimeout(() => {
                currentQuestionIndex++;
                if (currentQuestionIndex >= levels[currentLevel].questions.length) {
                    // Level complete
                    launchSequence();
                } else {
                    isAnswered = false;
                    loadQuestion();
                }
            }, 1500); // 1.5 second delay before next question
        } else {
            score -= 25;
            document.getElementById('sfx-error')?.play();
            // Add shake animation to the computer screen for wrong answer
            document.getElementById('computer-screen').classList.add('screen-shake');
            setTimeout(() => {
                document.getElementById('computer-screen').classList.remove('screen-shake');
                isAnswered = false; // Allow user to try again
            }, 500);
        }
        scoreDisplay.textContent = score;
    }

    function launchSequence() {
        questionText.textContent = "All systems GO. Initiating launch sequence...";
        optionsContainer.innerHTML = '';
        document.getElementById('sfx-launch')?.play();
        gameWrapper.classList.add('screen-shake');
        rocket.classList.add('launch');

        setTimeout(() => {
            gameWrapper.classList.remove('screen-shake');
            rocket.classList.remove('launch'); // Reset rocket position for next level
            currentLevel++;
            loadLevel();
        }, 4000); // 4 seconds for launch animation and level transition
    }

    // --- Event Listeners ---
    startBtn.addEventListener('click', startGame);
    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        document.querySelectorAll('audio').forEach(audio => audio.muted = isMuted);
        muteBtn.textContent = isMuted ? '🔊 Mute' : '🔇 Unmute';
    });
});