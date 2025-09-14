// Sounds
const correctSound = new Audio("assets/sounds/correct.mp3");
const wrongSound = new Audio("assets/sounds/wrong.mp3");
const bridgeSound = new Audio("assets/sounds/bridge-cross.mp3");
const bgMusic = document.getElementById("bg-music");

let score = 0;
let level = 1; // 1 = Simple Fractions, 2 = Word Problems, 3 = Complex

function newQuestion() {
  let questionText, correctAnswer, options;

  if (level === 1) {
    // Simple Fractions
    questionText = "½ + ¼ = ?";
    correctAnswer = "¾";
    options = ["½", "¾", "1", "⅔"];
  } else if (level === 2) {
    // Word problem
    questionText = "Raju ate ½ apple, then ¼ apple. How much total?";
    correctAnswer = "¾";
    options = ["¼", "¾", "1", "⅔"];
  } else {
    // Complex problem
    questionText = "Which is greater? ⅔ or ¾";
    correctAnswer = "¾";
    options = ["⅔", "¾", "Equal", "½"];
  }

  document.getElementById("question").innerText = questionText;

  let optionsHTML = "";
  options.forEach(opt => {
    optionsHTML += `<button class="option-btn" onclick="checkAnswer('${opt}','${correctAnswer}')">${opt}</button>`;
  });
  document.getElementById("options").innerHTML = optionsHTML;
}

function checkAnswer(ans, correctAnswer) {
  if (ans === correctAnswer) {
    correctSound.play();
    bridgeSound.play();
    score++;
    document.getElementById("score").innerText = `🍎 Fruits Collected: ${score}`;
    if (score >= 3 && level < 3) {
      level++;
      document.getElementById("level").innerText = `Level: ${level}`;
      alert("🎉 Level Up! Moving to harder puzzles...");
    }
    newQuestion();
  } else {
    wrongSound.play();
    alert("❌ Wrong Answer! Try again.");
  }
}

function toggleMusic() {
  if (bgMusic.paused) {
    bgMusic.play();
  } else {
    bgMusic.pause();
  }
}

// Start
window.onload = newQuestion;
