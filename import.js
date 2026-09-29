import { db } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const saveBtn = document.getElementById('saveBtn');
const statusMessage = document.getElementById('statusMessage');

saveBtn.addEventListener('click', async () => {
  // 1. Grab every field's current value
  const subject = document.getElementById('subject').value;
  const questionText = document.getElementById('questionText').value.trim();
  const optionA = document.getElementById('optionA').value.trim();
  const optionB = document.getElementById('optionB').value.trim();
  const optionC = document.getElementById('optionC').value.trim();
  const optionD = document.getElementById('optionD').value.trim();
  const correctAnswer = document.getElementById('correctAnswer').value;
  const explanation = document.getElementById('explanation').value.trim();

  // 2. Basic validation - make sure nothing important is empty
  if (!questionText || !optionA || !optionB || !optionC || !optionD) {
    showStatus("Please fill in the question and all four options.", "error");
    return;
  }

  // 3. Shape the data the way we want to store it
  const questionData = {
    subject,
    question: questionText,
    options: [
      { letter: "A", text: optionA },
      { letter: "B", text: optionB },
      { letter: "C", text: optionC },
      { letter: "D", text: optionD }
    ],
    answer: correctAnswer,
    explanation: explanation || "No explanation provided.",
    createdAt: serverTimestamp()
  };

  // 4. Save it to Firestore
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  try {
    const questionsRef = collection(db, "questions");
    await addDoc(questionsRef, questionData);

    showStatus(`✅ Question saved under "${subject}".`, "success");
    clearForm();
  } catch (err) {
    showStatus("Something went wrong saving to the database. Try again.", "error");
    console.error(err);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Question";
  }
});

function clearForm() {
  document.getElementById('questionText').value = '';
  document.getElementById('optionA').value = '';
  document.getElementById('optionB').value = '';
  document.getElementById('optionC').value = '';
  document.getElementById('optionD').value = '';
  document.getElementById('explanation').value = '';
}

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.classList.remove('hidden');
}