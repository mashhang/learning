// Run this with: node generateTestPayload.mjs (if using ESM)
// Make sure you already fetched /api/lessons and saved the result as lessons.json

import fs from "fs";

const LESSONS_FILE = "./lessons.json"; // <- path to your saved /api/lessons output
const OUTPUT_FILE = "./mockResults.json";
const USER_ID = "b33b1217-fb6d-45e9-8140-9786a360aa10";
const MAX_EXPECTED_TIME = 20;

const lessons = JSON.parse(fs.readFileSync(LESSONS_FILE, "utf-8"));
const results = [];

let questionIndex = 0;

for (const lesson of lessons) {
  for (const q of lesson.questions) {
    let timeTaken = 0;
    let isCorrect = false;

    if (questionIndex < 30) {
      // Easy — wrong + fast
      timeTaken = Math.floor(Math.random() * 5) + 1;
      isCorrect = false;
    } else if (questionIndex < 60) {
      // Medium — correct + slow
      timeTaken = Math.floor(Math.random() * 6) + 15;
      isCorrect = true;
    } else {
      // Hard — average time, random accuracy
      timeTaken = Math.floor(Math.random() * 11) + 5;
      isCorrect = Math.random() < 0.5;
    }

    results.push({
      questionId: q.id,
      lessonId: lesson.id,
      timeTaken,
      isCorrect,
    });

    questionIndex++;
  }
}

const finalPayload = {
  userId: USER_ID,
  results,
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalPayload, null, 2));
console.log(`✅ Mock diagnostic payload generated: ${OUTPUT_FILE}`);
