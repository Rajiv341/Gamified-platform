document.addEventListener('DOMContentLoaded', () => {
    // Sabhi levels ka data ab yahan hai
    const quizData = {
        1: {
            title: "Level 1: Vital Organs",
            description: "Answer these questions to unlock the main organs.",
            type: "unlock",
            questions: [
                { question: "Which organ pumps blood?", answers: ["Lungs", "Stomach", "Heart", "Brain"], correct: "Heart", unlocks: ["heart"] },
                { question: "This is the control center of the body.", answers: ["Heart", "Brain", "Liver", "Kidneys"], correct: "Brain", unlocks: ["brain"] },
                { question: "These take in oxygen from the air.", answers: ["Stomach", "Heart", "Lungs", "Intestines"], correct: "Lungs", unlocks: ["lungs"] },
                { question: "Which organ helps in digesting food?", answers: ["Stomach", "Brain", "Heart", "Lungs"], correct: "Stomach", unlocks: ["stomach"] }
            ]
        },
        2: {
            title: "Level 2: Body Systems",
            description: "Choose a system and answer all questions to unlock it.",
            type: "system",
            systems: [
                { 
                    name: "Digestive System", 
                    questions: [
                        { question: "Where does digestion begin?", answers: ["Stomach", "Mouth", "Intestine", "Liver"], correct: "Mouth" },
                        { question: "Which organ is the main site for food digestion?", answers: ["Liver", "Esophagus", "Stomach", "Brain"], correct: "Stomach" },
                        { question: "Which organ absorbs nutrients from digested food?", answers: ["Heart", "Lungs", "Stomach", "Intestines"], correct: "Intestines" },
                    ],
                    unlocks: ["stomach", "intestines"]
                },
                {
                    name: "Respiratory System",
                    questions: [
                        { question: "What is the main organ of the respiratory system?", answers: ["Heart", "Lungs", "Brain", "Nose"], correct: "Lungs" },
                        { question: "What gas do we breathe out?", answers: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correct: "Carbon Dioxide" },
                    ],
                    unlocks: ["lungs"]
                }
            ]
        },
        3: {
            title: "Level 3: Full Body Quiz",
            description: "Let's test your overall knowledge of the human body!",
            type: "quiz",
            questions: [
                { question: "How do the Lungs and Heart work together?", answers: ["Lungs clean blood for the heart", "Heart sends oxygen to lungs", "Lungs give oxygen to blood, heart pumps it", "They don't work together"], correct: "Lungs give oxygen to blood, heart pumps it" },
                { question: "The Brain is part of which system?", answers: ["Digestive", "Nervous", "Skeletal", "Muscular"], correct: "Nervous" },
                { question: "Which system gives your body its shape?", answers: ["Nervous", "Muscular", "Skeletal", "Digestive"], correct: "Skeletal" },
            ]
        }
    };

    // DOM Elements
    const levelIndicator = document.getElementById('level-indicator');
    const scoreIndicator = document.getElementById('score-indicator');
    const startPanel = document.getElementById('start-panel');
    const startTitle = document.getElementById('start-title');
    const startDescription = document.getElementById('start-description');
    const levelSelectionButtons = document.getElementById('level-selection-buttons');
    const quizPanel = document.getElementById('quiz-panel');
    const questionText = document.getElementById('question-text');
    const answerButtons = Array.from(document.querySelectorAll('.answer-btn'));
    const muteBtn = document.getElementById('mute-btn');
    
    // Audio
    const bgMusic = document.getElementById('bg-music');
    const sounds = { correct: document.getElementById('correct-sound'), wrong: document.getElementById('wrong-sound'), unlock: document.getElementById('unlock-sound') };

    // Game State
    let currentLevel = 1;
    let currentQuiz = null;
    let currentQuestionIndex = 0;
    let score = 0;
    let completedSystems = [];

    function showMainScreen() {
        quizPanel.classList.add('hidden');
        startPanel.classList.remove('hidden');
        startTitle.textContent = "Welcome, Junior Scientist!";
        startDescription.textContent = "Choose a level to begin your quest.";
        levelSelectionButtons.innerHTML = '';
        
        for (const levelNum in quizData) {
            const button = document.createElement('button');
            button.textContent = quizData[levelNum].title;
            button.classList.add('level-btn');
            button.onclick = () => selectLevel(parseInt(levelNum));
            levelSelectionButtons.appendChild(button);
        }
    }

    function selectLevel(levelNum) {
        currentLevel = levelNum;
        levelIndicator.textContent = currentLevel;
        const level = quizData[currentLevel];
        startTitle.textContent = level.title;
        startDescription.textContent = level.description;
        levelSelectionButtons.innerHTML = '';

        if (level.type === 'unlock' || level.type === 'quiz') {
            currentQuiz = level.questions;
            const button = document.createElement('button');
            button.textContent = "Start Quiz";
            button.onclick = () => startQuiz();
            levelSelectionButtons.appendChild(button);
        } else if (level.type === 'system') {
            completedSystems = [];
            level.systems.forEach((system, index) => {
                const button = document.createElement('button');
                button.textContent = system.name;
                button.classList.add('system-btn');
                button.onclick = () => {
                    currentQuiz = system.questions;
                    startQuiz(system);
                };
                levelSelectionButtons.appendChild(button);
            });
        }
    }

    function startQuiz(system = null) {
        currentQuestionIndex = 0;
        startPanel.classList.add('hidden');
        quizPanel.classList.remove('hidden');
        displayQuestion(system);
    }

    function displayQuestion(system = null) {
        if (currentQuestionIndex >= currentQuiz.length) {
            endQuiz(system);
            return;
        }
        const questionData = currentQuiz[currentQuestionIndex];
        questionText.textContent = questionData.question;
        answerButtons.forEach((button, index) => {
            button.textContent = questionData.answers[index];
            button.className = 'answer-btn';
            button.disabled = false;
        });
    }
    
    function selectAnswer(e) {
        const selectedBtn = e.target;
        const correctAnsw = currentQuiz[currentQuestionIndex].correct;
        answerButtons.forEach(button => {
            button.disabled = true;
            if (button.textContent === correctAnsw) button.classList.add('correct');
        });

        if (selectedBtn.textContent === correctAnsw) {
            sounds.correct.play();
            updateScore(100);
            if (quizData[currentLevel].type === 'unlock') {
                // BUG FIX: Yahan par 'currentQuestionIndex' ki typing mistake theek ki gayi hai
                unlockParts(currentQuiz[currentQuestionIndex].unlocks);
            }
        } else {
            sounds.wrong.play();
            selectedBtn.classList.add('incorrect');
        }

        setTimeout(() => {
            currentQuestionIndex++;
            displayQuestion();
        }, 2000);
    }

    function unlockParts(partIds) {
        sounds.unlock.play();
        partIds.forEach(partId => {
            const partElement = document.getElementById(partId);
            if (partElement) partElement.classList.add('unlocked');
        });
    }

    function updateScore(points) {
        score += points;
        scoreIndicator.textContent = score;
    }
    
    function endQuiz(system) {
        quizPanel.classList.add('hidden');
        startPanel.classList.remove('hidden');

        if (system) {
            unlockParts(system.unlocks);
            completedSystems.push(system.name);
            startTitle.textContent = `${system.name} Unlocked!`;
            if (completedSystems.length === quizData[2].systems.length) {
                startDescription.textContent = "Great job! You've unlocked all systems in Level 2. Now, on to the final challenge!";
                levelSelectionButtons.innerHTML = '';
                const button = document.createElement('button');
                button.textContent = "Go to Level 3";
                button.onclick = () => selectLevel(3);
                levelSelectionButtons.appendChild(button);
            } else {
                startDescription.textContent = "Select another system to continue.";
                selectLevel(2);
            }
        } else {
            startTitle.textContent = 'Quiz Complete!';
            startDescription.textContent = `You finished with a score of ${score}.`;
            levelSelectionButtons.innerHTML = '';
            const button = document.createElement('button');
            button.textContent = "Back to Main Menu";
            button.onclick = showMainScreen;
            levelSelectionButtons.appendChild(button);
        }
    }

    answerButtons.forEach(button => button.addEventListener('click', selectAnswer));
    
    muteBtn.addEventListener('click', () => {
        const isMuted = bgMusic.muted;
        bgMusic.muted = !isMuted;
        Object.values(sounds).forEach(sound => sound.muted = !isMuted);
        muteBtn.textContent = bgMusic.muted ? '🔇' : '🎵';
    });

    // Start Game
    showMainScreen();
    document.body.addEventListener('click', () => bgMusic.play(), { once: true });
});