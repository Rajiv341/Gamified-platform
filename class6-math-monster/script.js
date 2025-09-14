const levels = {
  1: [
    { q: "5 + 3 = ?", options: [7, 8, 9, 10], ans: 8 },
    { q: "12 + 7 = ?", options: [18, 19, 20, 21], ans: 19 }
  ],
  2: [
    { q: "1/2 + 1/2 = ?", options: ["1", "2", "1/4"], ans: "1" },
    { q: "3/4 - 1/4 = ?", options: ["1/2", "1/4", "2/4"], ans: "1/2" }
  ],
  3: [
    { q: "6 + 2 × 2 = ?", options: [10, 12, 8], ans: 10 },
    { q: "9 ÷ 3 + 4 = ?", options: [6, 7, 8], ans: 7 }
  ]
};

let currentLevel = 1;
let currentQuestion = 0;

function loadQuestion() {
  const qObj = levels[currentLevel][currentQuestion];
  document.getElementById("question").innerText = qObj.q;

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  qObj.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.classList.add("option");
    btn.innerText = opt;
    btn.onclick = () => checkAnswer(opt, qObj.ans);
    optionsDiv.appendChild(btn);
  });

  document.getElementById("feedback").innerText = "";
  document.getElementById("next-btn").style.display = "none";
}

function checkAnswer(selected, correct) {
  if (selected == correct) {
    document.getElementById("feedback").innerText = "✅ Correct! You hit the monster!";
    document.getElementById("feedback").style.color = "green";
    document.getElementById("monster").style.opacity = "0.5";
    document.getElementById("next-btn").style.display = "inline-block";
  } else {
    document.getElementById("feedback").innerText = "❌ Wrong! Monster attacks!";
    document.getElementById("feedback").style.color = "red";
  }
}

document.getElementById("next-btn").onclick = () => {
  currentQuestion++;
  if (currentQuestion < levels[currentLevel].length) {
    loadQuestion();
  } else {
    if (currentLevel < 3) {
      currentLevel++;
      currentQuestion = 0;
      document.getElementById("level").innerText = 
        currentLevel === 2 ? "Level 2: Fractions" : "Level 3: Mixed Problems";
      document.getElementById("monster").src = 
        currentLevel === 2 ? "assets/monster2.png" : "assets/monster1.png";
      loadQuestion();
    } else {
      document.getElementById("question").innerText = "🎉 You defeated all monsters!";
      document.getElementById("options").innerHTML = "";
      document.getElementById("feedback").innerText = "Great job, Math Hero!";
      document.getElementById("monster").style.display = "none";
      document.getElementById("next-btn").style.display = "none";
    }
  }
};

loadQuestion();

const bgMusic = document.getElementById("bg-music");

function toggleMusic() {
    if (bgMusic.paused) {
        bgMusic.play();
    } else {
        bgMusic.pause();
    }
}
