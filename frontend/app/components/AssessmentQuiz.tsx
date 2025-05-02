"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import API_URL from "@/lib/getApiUrl";
import groupBy from "lodash/groupBy";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function AssessmentQuiz({
  type,
  lesson,
  onFinish,
}: {
  type: "PRE" | "POST";
  lesson: any;
  onFinish: () => void;
}) {
  const router = useRouter();
  const [questions, setQuestions] = useState(lesson.questions);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: string | null;
  }>({});
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timedAnswers, setTimedAnswers] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const recordTimeForCurrentQuestion = () => {
    const current = questions[currentIndex];
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - questionStartTime) / 1000);

    setTimedAnswers((prev) => {
      const selected = selectedAnswers[current.id];
      const isCorrect = selected === current.correctAnswer;

      const updated = prev.filter((a) => a.questionId !== current.id);
      return [
        ...updated,
        {
          questionId: current.id,
          lessonId: lesson.id,
          timeTaken,
          isCorrect,
        },
      ];
    });

    setQuestionStartTime(Date.now());
  };

  const handleAnswerClick = (questionId: string, choice: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: choice }));
  };

  const goToNext = () => {
    recordTimeForCurrentQuestion();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    recordTimeForCurrentQuestion();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const { user } = useAuth();

  const handleSubmit = async () => {
    const unanswered = questions.some((q) => !selectedAnswers[q.id]);
    if (unanswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    await fetch(`${API_URL}/api/assessment/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.id,
        results: timedAnswers,
        type, // already passed as "pre" or "post"
      }),
    });

    if (type === "POST") {
      await fetch(`${API_URL}/api/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          lessonId: lesson.id,
          currentPage: lesson.pages.length,
          totalPages: lesson.pages.length,
          forceComplete: true,
        }),
      });
    }

    recordTimeForCurrentQuestion();

    const correct = timedAnswers.filter((a) => a.isCorrect).length;
    const percentage = Math.round((correct / questions.length) * 100);
    setScore(percentage);
    setSubmitted(true);
  };

  const current = questions[currentIndex];

  return (
    <div className="min-h-screen p-6">
      {/* Question Rendering */}
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow mt-20">
        <h1 className="text-xl font-semibold mb-2 text-[#30608E]">
          {type === "PRE" ? "Pre-Assessment" : "Post-Assessment"}
        </h1>
        <div className="text-gray-500 text-sm mb-4">
          Question {currentIndex + 1} of {questions.length}
        </div>

        {current.question && (
          <p className="text-gray-800 text-lg mb-4">
            <InlineMath>{current.question}</InlineMath>
          </p>
        )}

        {current.questionImage && (
          <img
            src={
              current.questionImage.startsWith("http")
                ? current.questionImage
                : `${API_URL}${current.questionImage}`
            }
            alt=""
            className="w-full max-w-lg mx-auto mb-4"
          />
        )}

        <div className="space-y-3">
          {current.choices.map((choice: string, idx: number) => (
            <label
              key={idx}
              className={`block border px-4 py-2 rounded cursor-pointer select-none ${
                selectedAnswers[current.id] === choice
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300"
              }`}
            >
              <input
                type="radio"
                name={`q-${current.id}`}
                value={choice}
                checked={selectedAnswers[current.id] === choice}
                onChange={() => handleAnswerClick(current.id, choice)}
                className="mr-3"
              />
              <InlineMath>{choice}</InlineMath>
            </label>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Submit
            </button>
          ) : (
            <button
              onClick={goToNext}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Next
            </button>
          )}
        </div>
      </div>

      {/* ✅ Move this outside the logic block and into JSX */}
      {submitted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-center mb-4 capitalize">
              {type === "PRE" ? "Pre-Assessment" : "Post-Assessment"} Summary
            </h2>

            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-blue-200 flex items-center justify-center text-2xl font-bold text-blue-800">
                {score}%
              </div>
              <p className="text-gray-600 mt-2">Total Score</p>
            </div>

            <div className="text-gray-700 mb-6 text-sm">
              <p>
                ✅ Correct Answers:{" "}
                {timedAnswers.filter((a) => a.isCorrect).length}
              </p>
              <p>
                ❌ Incorrect Answers:{" "}
                {timedAnswers.filter((a) => !a.isCorrect).length}
              </p>
              <p>
                ⏱️ Average Time per Question:{" "}
                {(
                  timedAnswers.reduce((acc, a) => acc + a.timeTaken, 0) /
                  timedAnswers.length
                ).toFixed(2)}{" "}
                seconds
              </p>
            </div>

            <h3 className="text-md font-semibold mb-2">
              📝 Question Breakdown
            </h3>
            <ul className="text-sm max-h-40 overflow-y-auto pr-2">
              {questions.map((q, index) => {
                const record = timedAnswers.find((a) => a.questionId === q.id);
                return (
                  <li key={q.id} className="mb-2 border-b pb-1">
                    <p className="font-medium">
                      Q{index + 1}: {q.question}
                    </p>
                    <p>
                      🕐 {record?.timeTaken}s |{" "}
                      {record?.isCorrect ? "✅ Correct" : "❌ Incorrect"}
                    </p>
                  </li>
                );
              })}
            </ul>

            <div className="flex justify-center gap-4 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
                onClick={() => router.push("/dashboard")}
              >
                Return to Dashboard
              </button>

              {type === "POST" && (
                <button
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                  onClick={() => router.push("/mylesson")}
                >
                  Back to lessons
                </button>
              )}

              {type === "PRE" && (
                <button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  onClick={() => router.push(`/current?id=${lesson.id}`)}
                >
                  View Full Lesson
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
