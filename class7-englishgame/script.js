document.addEventListener('DOMContentLoaded', () => {
    // --- Game State & Elements ---
    let currentLevel = 1;
    let currentQuestionIndex = 0;
    let score = 0;
    let timer;
    let timerInterval;
    let isAnswered = false;

    // Elements
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const gameWrapper = document.getElementById('game-wrapper');
    const scoreDisplay = document.getElementById('score');
    const levelTitle = document.getElementById('level-title');
    const part1Span = document.getElementById('part1');
    const part2Span = document.getElementById('part2');
    const optionsContainer = document.getElementById('options-container');
    const timerBar = document.getElementById('timer-bar');
    const muteBtn = document.getElementById('mute-btn');
    const bgMusic = document.getElementById('bg-music');
    const sfxCorrect = document.getElementById('sfx-correct');
    const sfxWrong = document.getElementById('sfx-wrong');
    let isMuted = true;
    bgMusic.volume = 0.3;

    // --- Levels Data ---
    const levels = {
        1: { // Present Tense
            title: "Level 1: Path of the Present",
            questions: [
                { sentence: ["She ", " a book every day."], options: ["read", "reads"], answer: "reads" },
                { sentence: ["They ", " football right now."], options: ["is playing", "are playing"], answer: "are playing" },
                { sentence: ["I ", " a student."], options: ["am", "is"], answer: "am" },
                { sentence: ["The sun ", " in the east."], options: ["rise", "rises"], answer: "rises" },
                { sentence: ["Listen! Someone ", " at the door."], options: ["knocks", "is knocking"], answer: "is knocking" }
            ]
        },
        2: { // Past Tense
            title: "Level 2: Echoes of the Past",
            questions: [
                { sentence: ["He ", " to the store yesterday."], options: ["go", "went"], answer: "went" },
                { sentence: ["We ", " a movie last night."], options: ["watched", "watch"], answer: "watched" },
                { sentence: ["She ", " her homework when I called."], options: ["was doing", "is doing"], answer: "was doing" },
                { sentence: ["They ", " not see the sign."], options: ["did", "do"], answer: "did" },
                { sentence: ["I ", " a strange noise a minute ago."], options: ["hear", "heard"], answer: "heard" }
            ]
        },
        3: { // Mixed Tenses
            title: "Level 3: Trial of Time",
            questions: [
                { sentence: ["Tomorrow, we ", " visit our cousins."], options: ["will", "did"], answer: "will" },
                { sentence: ["Look! It ", " heavily."], options: ["is raining", "rained"], answer: "is raining" },
                { sentence: ["He ", " his keys yesterday."], options: ["loses", "lost"], answer: "lost" },
                { sentence: ["I think she ", " pass the test."], options: ["will", "was"], answer: "will" },
                { sentence: ["She usually ", " to school."], options: ["walks", "walked"], answer: "walks" }
            ]
        }
    };

    function startGame() {
        startScreen.style.display = 'none';
        gameWrapper.style.display = 'flex';
        isMuted = false;
        muteBtn.textContent = '🔇 Unmute';
        if (bgMusic) bgMusic.play().catch(e => console.log("Audio play failed."));
        loadQuestion();
    }

    function loadQuestion() {
        // Reset state for the new question
        isAnswered = false;
        clearInterval(timerInterval); // Purana timer band kar do

        const level = levels[currentLevel];
        
        // Check if all levels are complete
        if (!level) {
            document.getElementById('game-area').innerHTML = `<h1 style="color: white; text-align: center;">Congratulations, Grammar Ninja!<br>Final Score: ${score}</h1>`;
            return;
        }

        // Check if all questions in the current level are complete
        if (currentQuestionIndex >= level.questions.length) {
            currentLevel++;
            currentQuestionIndex = 0;
            // Dobara loadQuestion ko call karo agle level ke liye
            loadQuestion();
            return;
        }
        
        const question = level.questions[currentQuestionIndex];
        
        levelTitle.textContent = level.title;
        part1Span.textContent = question.sentence[0];
        part2Span.textContent = question.sentence[1];
        
        optionsContainer.innerHTML = '';
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.onclick = () => selectAnswer(button, option, question.answer);
            optionsContainer.appendChild(button);
        });

        startTimer();
    }

    function startTimer() {
        timer = 10; // 10 seconds per question
        timerBar.style.transition = 'none'; // Reset transition for instant fill
        timerBar.style.width = '100%';
        
        // A small delay before starting the depletion animation
        setTimeout(() => {
            timerBar.style.transition = `width ${timer}s linear`;
            timerBar.style.width = '0%';
        }, 100);

        timerInterval = setInterval(() => {
            timer--;
            if (timer < 0) {
                // Time out hone par automatic answer select ho jayega
                selectAnswer(null, "timeout", levels[currentLevel].questions[currentQuestionIndex].answer);
            }
        }, 1000);
    }

    function selectAnswer(button, selectedOption, correctAnswer) {
        if (isAnswered) return; // Ek baar answer dene ke baad dobara na chale
        isAnswered = true;
        clearInterval(timerInterval); // Timer rok do

        if (selectedOption === correctAnswer) {
            score += 10 + Math.max(0, timer); // Base points + time bonus
            if (button) button.classList.add('correct');
            if (sfxCorrect) sfxCorrect.play();
        } else {
            score -= 5;
            if (button) button.classList.add('incorrect');
            if (sfxWrong) sfxWrong.play();
        }

        scoreDisplay.textContent = score;

        // 2 second baad agla question load karo
        setTimeout(() => {
            currentQuestionIndex++;
            loadQuestion();
        }, 2000);
    }

    // --- Event Listeners ---
    startBtn.addEventListener('click', startGame);
    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        bgMusic.muted = isMuted;
        if(sfxCorrect) sfxCorrect.muted = isMuted;
        if(sfxWrong) sfxWrong.muted = isMuted;
        muteBtn.textContent = isMuted ? '🔊 Mute' : '🔇 Unmute';
    });
});