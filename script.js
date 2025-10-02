let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let wrongAnswers = [];
let timer; // timer interval
let timeLeft = 15; // seconds
const TIMER_DURATION = 15; // default

const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const timerDisplay = document.getElementById("timerDisplay");
const feedbackBox = document.getElementById("feedbackBox");

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
});
restartBtn.addEventListener("click", () => location.reload());

function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  wrongAnswers = [];
  document.getElementById("resultBox").classList.add("hidden");
  document.getElementById("controlsBox").classList.add("hidden");
  document.getElementById("quizBox").classList.remove("hidden");
  progressContainer.classList.remove("hidden");

  fetchQuiz();
}

async function fetchQuiz() {
  let category = document.getElementById("category").value;
  let difficulty = document.getElementById("difficulty").value;
  let num = document.getElementById("numQuestions").value;

  let url = `https://opentdb.com/api.php?amount=${num}`;
  if (category) url += `&category=${category}`;
  if (difficulty) url += `&difficulty=${difficulty}`;

  let res = await fetch(url);
  let data = await res.json();
  questions = data.results;
  showQuestion();
}

function showQuestion() {
  resetState();

  let currentQ = questions[currentQuestionIndex];
  document.getElementById("questionBox").innerHTML = currentQ.question;

  currentQ.incorrect_answers.concat(currentQ.correct_answer)
    .sort(() => Math.random() - 0.5)
    .forEach(choice => {
      let btn = document.createElement("button");
      btn.innerHTML = choice;
      btn.classList.add("choice-btn");
      btn.addEventListener("click", () => selectAnswer(btn, currentQ.correct_answer));
      document.getElementById("choices").appendChild(btn);
    });

  // update progress bar
  let progress = (currentQuestionIndex / questions.length) * 100;
  progressBar.style.width = progress + "%";

  // start timer
  startTimer();
}

function resetState() {
  document.getElementById("choices").innerHTML = "";
  nextBtn.classList.add("hidden");
  feedbackBox.innerHTML = "";
  clearInterval(timer);
}

function startTimer() {
  timeLeft = TIMER_DURATION;
  timerDisplay.textContent = `Time Left: ${timeLeft}`;

  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time Left: ${timeLeft}`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      timerDisplay.textContent = "Time's up!";
      autoSkip();
    }
  }, 1000);
}

function autoSkip() {
  let currentQ = questions[currentQuestionIndex];
  let buttons = document.querySelectorAll(".choice-btn");
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.innerHTML === currentQ.correct_answer) {
      btn.classList.add("correct");
    }
  });
  feedbackBox.innerHTML = `<p class="feedback-wrong">Time's up! The correct answer was: <strong>${currentQ.correct_answer}</strong></p>`;

  wrongAnswers.push({
    question: currentQ.question,
    yourAnswer: "Time's up!",
    correctAnswer: currentQ.correct_answer
  });
  nextBtn.classList.remove("hidden");
}

function selectAnswer(button, correctAnswer) {
  clearInterval(timer);
  let buttons = document.querySelectorAll(".choice-btn");
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.innerHTML === correctAnswer) {
      btn.classList.add("correct");
    } else if (btn === button) {
      btn.classList.add("wrong");
    }
  });

  if (button.innerHTML === correctAnswer) {
    feedbackBox.innerHTML = `<p class="feedback-correct">Correct! 🎉</p>`;
    score++;
  } else {
    feedbackBox.innerHTML = `<p class="feedback-wrong">Sorry, that's not right. The correct answer was: <strong>${correctAnswer}</strong></p>`;
    wrongAnswers.push({
      question: questions[currentQuestionIndex].question,
      yourAnswer: button.innerHTML,
      correctAnswer: correctAnswer
    });
  }
  nextBtn.classList.remove("hidden");
}

function showResult() {
  clearInterval(timer);
  document.getElementById("quizBox").classList.add("hidden");
  nextBtn.classList.add("hidden"); // Hide the next button
  document.getElementById("resultBox").classList.remove("hidden");
  progressBar.style.width = "100%";
  document.getElementById("score").innerHTML =
    `You scored ${score} out of ${questions.length}! 🎉`;

  const wrongAnswersBox = document.getElementById("wrongAnswersBox");
  const wrongAnswersList = document.getElementById("wrongAnswersList");
  wrongAnswersList.innerHTML = "";

  if (wrongAnswers.length > 0) {
    wrongAnswersBox.classList.remove("hidden");
    wrongAnswers.forEach(item => {
      const resultItem = document.createElement("div");
      resultItem.classList.add("result-item");

      resultItem.innerHTML = `
        <p class="result-question"><strong>Q:</strong> ${item.question}</p>
        <p class="result-user-answer"><strong>Your Answer:</strong> ${item.yourAnswer}</p>
        <p class="result-correct-answer"><strong>Correct Answer:</strong> ${item.correctAnswer}</p>
      `;
      wrongAnswersList.appendChild(resultItem);
    });
  } else {
    wrongAnswersBox.classList.add("hidden");
  }
}
