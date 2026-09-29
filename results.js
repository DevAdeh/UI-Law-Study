const data = JSON.parse(sessionStorage.getItem('testResults'));
const scoreSummary = document.getElementById('scoreSummary');
const reviewList = document.getElementById('reviewList');

if (!data) {
  scoreSummary.innerHTML = `<p>No results found. <a href="take-test.html">Take a test first</a>.</p>`;
} else {
  const { subject, mode, questions, userAnswers } = data;

  // Calculate score
  let correctCount = 0;
  questions.forEach((q, i) => {
    if (userAnswers[i] === q.answer) correctCount++;
  });

  const total = questions.length;
  const percentage = Math.round((correctCount / total) * 100);

  scoreSummary.innerHTML = `
    <p class="eyebrow">${subject} &middot; ${mode === 'exam' ? 'Exam' : 'Practice'} Mode</p>
    <h1 class="score-number">${correctCount}/${total}</h1>
    <p class="score-percent">${percentage}%</p>
  `;

  // Build the review list - one card per question
  reviewList.innerHTML = questions.map((q, i) => {
    const userAnswer = userAnswers[i];
    const isCorrect = userAnswer === q.answer;

    const optionsHtml = q.options.map(opt => {
      let cls = '';
      if (opt.letter === q.answer) cls = 'correct';
      else if (opt.letter === userAnswer && !isCorrect) cls = 'incorrect';
      return `<div class="review-option ${cls}">${opt.letter}) ${opt.text}</div>`;
    }).join('');

    return `
      <div class="review-card">
        <p class="review-question">${i + 1}. ${q.question}</p>
        <div class="review-options">${optionsHtml}</div>
        <p class="review-explanation"><strong>Explanation:</strong> ${q.explanation}</p>
      </div>
    `;
  }).join('');
}