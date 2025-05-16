"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import API_URL from "@/lib/getApiUrl";
import { toast } from "sonner";
import groupBy from "lodash/groupBy";
import { CgSpinner } from "react-icons/cg";
import MathPreview from "./MathPreview";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function AssessmentQuiz({
  type,
  lesson,
  selectedAnswers,
  timedAnswers,
  setSelectedAnswers,
  setTimedAnswers,
  onClose,
  onContinue,
  lessonId,
}: {
  type: "PRE" | "POST";
  score: number;
  correctCount: number;
  incorrectCount: number;
  averageTime: number;
  lesson: any;
  onFinish: () => void;
  onClose: () => void;
  onContinue: (lessonId: string) => void;
  selectedAnswers: { [key: string]: string };
  timedAnswers: any[];
  setSelectedAnswers: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  >;
  setTimedAnswers: React.Dispatch<React.SetStateAction<any[]>>;
  lessonId: string;
}) {
  const router = useRouter();
  const [questions, setQuestions] = useState(lesson.questions);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  // const [selectedAnswers, setSelectedAnswers] = useState<{
  //   [key: string]: string | null;
  // }>({});
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  // const [timedAnswers, setTimedAnswers] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const lessonObjectives: Record<string, string> = {
    "Lesson 1: Functions and Relations":
      "Understand the definition and representation of functions and relations.",
    "Lesson 2: Domain and Range of Function":
      "Identify the domain and range of various types of functions from equations, graphs, and mappings.",
    "Lesson 3: Operations on Functions":
      "Perform addition, subtraction, multiplication, and division of functions.",
    "Lesson 4: Evaluation on functions":
      "Evaluate functions for specific input values using substitution.",
    "Lesson 1: Rational Functions":
      "Define, simplify, and graph rational functions including asymptotes.",
    "Lesson 2: Rational Equations":
      "Solve equations involving rational expressions and identify extraneous solutions.",
    "Lesson 3: Rational Inequalities":
      "Solve inequalities with rational expressions and express solutions in interval notation.",
    "Lesson 1: Inverse Functions":
      "Find and verify inverse functions algebraically and graphically.",
    "Lesson 2: Exponential Function":
      "Interpret and analyze exponential functions and their graphs.",
    "Lesson 3: Exponential Equations":
      "Solve exponential equations using logarithms.",
    "Lesson 4: Exponential Inequalities":
      "Solve inequalities involving exponential functions.",
    "Lesson 5: Logarithmic Functions":
      "Understand logarithms, their properties, and solve logarithmic equations.",
    "Lesson 1: Simple and Compound Interests":
      "Calculate interest and amount using simple and compound interest formulas.",
    "Lesson 2: Simple and General Annuities":
      "Compute present and future values of ordinary and general annuities.",
    "Lesson 3: Stock and Bonds":
      "Understand the basic concepts of stock and bond investment and compute returns.",
    "Lesson 4: Business and Consumer Loans":
      "Analyze types of loans and calculate monthly amortizations.",
    "Lesson 1: Logical Preposition":
      "Distinguish between simple and compound propositions and determine truth values.",
    "Lesson 2: Methods of Proof":
      "Apply different methods of mathematical proof including direct, indirect, and contradiction.",
  };

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
    try {
      setIsSubmitting(true);
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
    } catch (error) {
      console.error("Login Error:", error);
      toast.error((error as Error).message || "Something went wrong");
    } finally {
      setIsSubmitting(false); // ✅ End loading
    }
  };

  useEffect(() => {
    setQuestions(lesson.questions);
  }, [lesson.questions]);

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

        {(current.question || current.questionEquation) && (
          <div className="mb-4">
            {current.question && (
              <p className="text-gray-800 text-lg">{current.question}</p>
            )}
            {current.questionEquation && (
              <div className="mt-1 text-lg text-gray-800">
                <InlineMath>{current.questionEquation}</InlineMath>
              </div>
            )}
          </div>
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <CgSpinner className="animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
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
          <div className="bg-white p-6 sm:p-10 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
            {/* <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button> */}

            <h2 className="text-2xl font-bold text-center mb-6 capitalize text-blue-900">
              {type === "PRE" ? "Pre-Assessment" : "Post-Assessment"} Summary
            </h2>

            <div className="flex justify-center items-center mb-4">
              <div className="w-28 h-28 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-3xl font-bold border-4 border-blue-300">
                {score}%
              </div>
            </div>

            {/* ✅ Objective Section */}
            <div className="mb-6 text-sm text-gray-700 text-center max-w-xl mx-auto">
              {lesson && lessonObjectives[lesson.title?.trim()] ? (
                <p>{lessonObjectives[lesson.title.trim()]}</p>
              ) : (
                <p className="italic text-gray-500">
                  No objective available for this lesson.
                </p>
              )}
            </div>

            <h3 className="text-md font-semibold mb-2 border-b pb-1">
              📝 Question Breakdown
            </h3>
            <ul className="text-sm space-y-4 max-h-[250px] overflow-y-auto">
              {questions.map((q, index) => {
                const record = timedAnswers.find((a) => a.questionId === q.id);
                return (
                  <li key={q.id} className="border p-3 rounded-md">
                    <div className="font-medium mb-1">
                      Q{index + 1}: {q.question}
                    </div>
                    {q.questionEquation && (
                      <div className=" mb-2">
                        <MathPreview value={q.questionEquation} />
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      <span className="mr-2">🕐 {record?.timeTaken}s</span>
                      {record?.isCorrect ? (
                        <span className="text-green-600">✅ Correct</span>
                      ) : (
                        <span className="text-red-600">❌ Incorrect</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex justify-center gap-4 mt-8">
              <button
                className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
                onClick={() => router.push("/dashboard")}
              >
                Return to Dashboard
              </button>

              {type === "POST" ? (
                <button
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                  onClick={() => router.push("/mylessons")}
                >
                  Back to Lessons
                </button>
              ) : (
                <button
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  onClick={() => onContinue(lesson.id)}
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
