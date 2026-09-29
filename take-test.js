import { db } from "./firebase-config.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// Elements
const setupScreen = document.getElementById('setupScreen');
const testScreen = document.getElementById('testScreen');
const subjectSelect = document.getElementById('subjectSelect');
const practiceModeBtn = document.getElementById('practiceModeBtn');
const examModeBtn = document.getElementById('examModeBtn');
const modeDescription = document.getElementById('modeDescription');
const startBtn = document.getElementById('startBtn');
const setupStatus = document.getElementById('setupStatus');

const progressLabel = document.getElementById('progressLabel');
const subjectLabel = document.getElementById('subjectLabel');
const progressFill = document.getElementById('progressFill');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const instantFeedback = document.getElementById('instantFeedback');
const nextBtn = document.getElementById('nextBtn');

// State - everything about the current test lives in this one object
let testState = {
  mode: 'practice',
  questions: [],
  currentIndex: 0,
  userAnswers: [], // stores what the user picked for each question
};

// 1. Mode toggle buttons
practiceModeBtn.addEventListener('click', () => setMode('practice'));
examModeBtn.addEventListener('click', () => setMode('exam'));

function setMode(mode) {
  testState.mode = mode;
  practiceModeBtn.classList.toggle('active', mode === 'practice');
  examModeBtn.classList.toggle('active', mode === 'exam');
  modeDescription.textContent = mode === 'practice'
    ? "See if you're right immediately after each question."
    : "Answer all questions first - corrections shown only at the end.";
}

// 2. Fetch questions for the chosen subject from Firestore
async function fetchQuestions(subject) {
  const questionsRef = collection(db, "questions");
  const q = query(questionsRef, where("subject", "==", subject));
  const snapshot = await getDocs(q);

  const questions = [];
  snapshot.forEach(doc => {
    questions.push({ id: doc.id, ...doc.data() });
  });
  return questions;
}

// 3. Start button - fetch questions, begin the test
startBtn.addEventListener('click', async () => {
  const subject = subjectSelect.value;

  startBtn.disabled = true;
  startBtn.textContent = "Loading...";

  const questions = await fetchQuestions(subject);

  if (questions.length === 0) {
    setupStatus.textContent = `No questions found yet for ${subject}. Add some first!`;
    setupStatus.className = 'status-message error';
    setupStatus.classList.remove('hidden');
    startBtn.disabled = false;
    startBtn.textContent = "Start Test";
    return;
  }

  // Shuffle questions so the test feels different each time
  testState.questions = questions.sort(() => Math.random() - 0.5);
  testState.currentIndex = 0;
  testState.userAnswers = [];

  subjectLabel.textContent = subject;
  setupScreen.classList.add('hidden');
  testScreen.classList.remove('hidden');

  showQuestion();
});

// 4. Display the current question
function showQuestion() {
  const q = testState.questions[testState.currentIndex];
  const total = testState.questions.length;

  progressLabel.textContent = `Question ${testState.currentIndex + 1} of ${total}`;
  progressFill.style.width = `${((testState.currentIndex + 1) / total) * 100}%`;
  questionText.textContent = q.question;

  instantFeedback.classList.add('hidden');
  nextBtn.classList.add('hidden');

  optionsContainer.innerHTML = q.options.map(opt => `
    <button class="option-btn" data-letter="${opt.letter}">
      <span class="option-letter">${opt.letter}</span> ${opt.text}
    </button>
  `).join('');

  // Attach click handlers to the freshly-rendered buttons
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => selectAnswer(btn.dataset.letter));
  });
}

// 5. Handle picking an answer
function selectAnswer(letter) {
  const q = testState.questions[testState.currentIndex];

  // Record the answer (overwrite if they'd already picked one)
  testState.userAnswers[testState.currentIndex] = letter;

  // Disable all option buttons once one is picked
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.letter === letter) btn.classList.add('selected');
  });

  if (testState.mode === 'practice') {
    // Show correct/incorrect immediately
    const isCorrect = letter === q.answer;
    document.querySelectorAll('.option-btn').forEach(btn => {
      if (btn.dataset.letter === q.answer) btn.classList.add('correct');
      else if (btn.dataset.letter === letter && !isCorrect) btn.classList.add('incorrect');
    });

    instantFeedback.textContent = isCorrect
      ? "✅ Correct!"
      : `❌ Incorrect. The right answer is ${q.answer}.`;
    instantFeedback.className = `instant-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    instantFeedback.classList.remove('hidden');
  }

  nextBtn.classList.remove('hidden');
}

// 6. Next question, or finish the test
nextBtn.addEventListener('click', () => {
  testState.currentIndex++;

  if (testState.currentIndex < testState.questions.length) {
    showQuestion();
  } else {
    finishTest();
  }
});

// 7. Save results to sessionStorage and move to the results page
function finishTest() {
  sessionStorage.setItem('testResults', JSON.stringify({
    subject: subjectLabel.textContent,
    mode: testState.mode,
    questions: testState.questions,
    userAnswers: testState.userAnswers
  }));
  window.location.href = 'results.html';
}