// Run this with: node generateCustomDiagnosticPayload.mjs
// Make sure you have lessons.json in the same folder (fetched from /api/lessons)

import fs from "fs";

// === CONFIGURATION ===
const LESSONS_FILE = "./lessons.json"; // fetched from your backend
const TARGET_SCORE_PERCENT = 25; // ✅ change this to 25, 50, 100
const OUTPUT_FILE = `./mockResults-${TARGET_SCORE_PERCENT}1.json`;
const MAX_EXPECTED_TIME = 20;
const QUESTION_LIMIT = 100;
// const USER_ID = "04ab8ced-0753-41fa-a21a-7c9bd0d06f54"; // change if needed

// === STUDENT INFO ===
const studentInfo = {
  userId: "e295b8d6-0e13-415d-9bae-572365431b66", // ✅ Replace with valid user ID
  studentId: "1148-005", // ✅ Replace with student number
  lastName: "Mendoza",
  firstName: "Maria",
};

const lessons = JSON.parse(fs.readFileSync(LESSONS_FILE, "utf-8"));
const allQuestions = [];

for (const lesson of lessons) {
  for (const q of lesson.questions) {
    allQuestions.push({ questionId: q.id, lessonId: lesson.id });
  }
}

// Limit and shuffle
const shuffled = allQuestions
  .sort(() => Math.random() - 0.5)
  .slice(0, QUESTION_LIMIT);
const numCorrect = Math.floor((TARGET_SCORE_PERCENT / 100) * shuffled.length);

const results = shuffled.map((q, index) => {
  const isCorrect = index < numCorrect;
  const timeTaken = isCorrect
    ? Math.floor(Math.random() * 6) + 10
    : Math.floor(Math.random() * 6) + 1;

  return {
    questionId: q.questionId,
    lessonId: q.lessonId,
    timeTaken,
    isCorrect,
  };
});

const finalPayload = {
  ...studentInfo,
  results,
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalPayload, null, 2));
console.log(`✅ Mock diagnostic payload generated: ${OUTPUT_FILE}`);
