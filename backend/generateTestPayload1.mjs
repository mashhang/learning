// generateTestPayload.mjs
import fs from "fs";
const LESSONS_FILE = "./lessons.json";
const OUTPUT_FILE = "./mockResults14.json";
const USER_ID = "b33b1217-fb6d-45e9-8140-9786a360aa10";
const MAX_EXPECTED_TIME = 20;

const lessons = JSON.parse(fs.readFileSync(LESSONS_FILE, "utf-8"));
const results = [];

for (const lesson of lessons) {
  const questions = lesson.questions;
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    let timeTaken = 0;
    let isCorrect = false;

    if (i === 0) {
      // Easy
      timeTaken = Math.floor(Math.random() * 5) + 1;
      isCorrect = false;
    } else if (i === 1) {
      // Medium
      timeTaken = Math.floor(Math.random() * 6) + 15;
      isCorrect = true;
    } else {
      // Hard
      timeTaken = Math.floor(Math.random() * 9) + 6;
      isCorrect = Math.random() < 0.5;
    }

    results.push({
      questionId: q.id,
      lessonId: lesson.id,
      timeTaken,
      isCorrect,
    });
  }
}

const finalPayload = {
  userId: USER_ID,
  results,
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalPayload, null, 2));
console.log(`✅ Generated mockResults.json for Postman testing.`);
