"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

type Question = {
  id: string;
  question?: string;
  questionImage?: string; // ✅ correct field name
  choices: string[];
  correctAnswer: string;
  isChoiceImage: boolean;
};

type Lesson = {
  id: string;
  title: string;
  content: string;
  chapterId: string;
  chapterTitle: string;
  questions: Question[];
};

type QuestionWithLessonInfo = Question & {
  lessonId: string;
  lessonTitle: string;
  chapterTitle: string;
};

type TopicPerformance = {
  title: string;
  chapter: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DiagnosticExam() {
  const router = useRouter();
  const { user } = useAuth();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<
    (Question & {
      lessonId: string;
      lessonTitle: string;
      chapterTitle: string;
    })[]
  >([]);

  const [reviewLaterIds, setReviewLaterIds] = useState<Set<string>>(new Set());
  const [showProgressDropdown, setShowProgressDropdown] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const groupedLessons = lessons.reduce(
    (acc: Record<string, Lesson[]>, lesson) => {
      if (!acc[lesson.chapterTitle]) {
        acc[lesson.chapterTitle] = [];
      }
      acc[lesson.chapterTitle].push(lesson);
      return acc;
    },
    {}
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: string | null;
  }>({});

  // Score
  const [showSummary, setShowSummary] = useState(false);
  const [score, setScore] = useState(0);
  const [strengths, setStrengths] = useState<TopicPerformance[]>([]);
  const [weaknesses, setWeaknesses] = useState<TopicPerformance[]>([]);

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (showSummary) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showSummary]);
  //
  const handleSubmitExam = async () => {
    let totalQuestions = 0;
    let correctCount = 0;

    const topicStats: Record<string, { correct: number; total: number }> = {};
    const lessonResults: {
      lessonId: string;
      score: number;
      isCompleted: boolean;
    }[] = [];

    lessons.forEach((lesson) => {
      const questions = lesson.questions;
      let correct = 0;

      questions.forEach((q) => {
        totalQuestions++;
        const selected = selectedAnswers[q.id];
        const isCorrect = selected === q.correctAnswer;
        if (isCorrect) correct++;
      });

      const score =
        questions.length === 0 ? 0 : (correct / questions.length) * 100;
      const isCompleted = correct === questions.length;

      lessonResults.push({
        lessonId: lesson.id,
        score,
        isCompleted,
      });

      correctCount += correct;

      topicStats[lesson.id] = {
        correct,
        total: questions.length,
      };
    });

    // Save score
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    setScore(percentage);

    // Submit to backend
    if (user?.id) {
      try {
        const res = await fetch(`${API_URL}/api/diagnostic/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            results: lessonResults,
          }),
        });

        const data = await res.json();
        console.log("Diagnostic Submitted:", data);
      } catch (error) {
        console.error("Error submitting diagnostic:", error);
      }
    }

    // Classify strengths & weaknesses
    const strong: TopicPerformance[] = [];
    const weak: TopicPerformance[] = [];

    lessons.forEach((lesson) => {
      const stats = topicStats[lesson.id];
      if (!stats) return;

      const entry = {
        title: lesson.title,
        chapter: lesson.chapterTitle,
      };

      if (stats.correct === stats.total) {
        strong.push(entry);
      } else {
        weak.push(entry);
      }
    });

    setStrengths(strong);
    setWeaknesses(weak);
    setShowSummary(true);
    setSubmitted(true);
  };

  // Utility function to group by chapter
  const groupByChapter = (topics: TopicPerformance[]) => {
    return topics.reduce((acc, topic) => {
      if (!acc[topic.chapter]) acc[topic.chapter] = [];
      acc[topic.chapter].push(topic.title);
      return acc;
    }, {} as Record<string, string[]>);
  };

  const groupedStrengths = groupByChapter(strengths);
  const groupedWeaknesses = groupByChapter(weaknesses);

  useEffect(() => {
    fetch(`${API_URL}/api/lessons`) // ✅ Fetch all lessons with questions
      .then((res) => res.json())
      .then((data) => setLessons(data))
      .catch((error) => console.error("Error fetching lessons:", error));
  }, []);

  useEffect(() => {
    if (lessons.length > 0) {
      const allQuestions: QuestionWithLessonInfo[] = [];

      lessons.forEach((lesson) => {
        lesson.questions.forEach((q) => {
          allQuestions.push({
            ...q,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            chapterTitle: lesson.chapterTitle,
          });
        });
      });

      const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      setShuffledQuestions(shuffled);
    }
  }, [lessons]);

  const goToNext = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (lessons.length === 0) {
    return (
      <p className=" text-gray-500 flex flex-col justify-center items-center h-screen">
        Loading questions...
      </p>
    );
  }

  // ✅ Handle Answer Selection
  const handleAnswerClick = (questionId: string, choice: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: choice }));
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden pt-20">
      {/* Sidebar - independently scrollable */}
      <div className="w-64 border-r overflow-y-auto h-full px-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Exam Toolbar
        </h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2 text-[#1A3D6D] font-medium cursor-pointer hover:underline">
            <span>📄</span>
            Exam Question Details
          </li>

          <li className="text-[#1A3D6D] font-medium">
            <div
              onClick={() => setShowProgressDropdown((prev) => !prev)}
              className="flex items-center gap-2 cursor-pointer hover:underline"
            >
              <span>📊</span>
              <span>Exam Progress</span>
              <span>{showProgressDropdown ? "▲" : "▼"}</span>
            </div>

            {/* Compact pills */}
            {showProgressDropdown && (
              <div className="grid grid-cols-6 gap-3 p-2 mt-2">
                {shuffledQuestions.map((question, index) => {
                  const isCurrent = currentIndex === index;
                  const isReviewLater = reviewLaterIds.has(question.id);

                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-8 h-8 text-sm rounded-full border text-center transition
                        ${isCurrent ? "bg-blue-600 text-white font-bold" : ""}
                        ${isReviewLater ? "bg-red-500 text-white" : ""}
                        ${
                          !isCurrent && !isReviewLater
                            ? "bg-white hover:bg-blue-100 text-gray-700 border-gray-300"
                            : ""
                        }
                      `}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            )}
          </li>
        </ul>
      </div>

      {/* Main Exam Content (no scroll) */}
      <div className="flex-1 overflow-y-hidden">
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-center mb-6  px-10">
            {/* Title on the left */}
            <h1 className="text-3xl font-bold text-[#30608E]">
              Diagnostic Exam
            </h1>

            {/* Centered Question Info and Progress */}
            <div className="flex flex-col items-center flex-grow text-center">
              {/* <span className="text-sm font-semibold text-gray-800">
            Question {currentIndex + 1}
          </span> */}
              <span className="text-sm text-gray-500">
                Exam Question Progress ({currentIndex + 1}/
                {shuffledQuestions.length})
              </span>
              <div className="w-48 bg-gray-300 h-2 rounded mt-1">
                <div
                  className="bg-[#1A3D6D] h-2 rounded"
                  style={{
                    width: `${
                      ((currentIndex + 1) / shuffledQuestions.length) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Spacer on the right to balance flex layout */}
            <div className="w-[180px]" />
          </div>

          {/* ✅ Stacked Layout (Vertical) */}
          {shuffledQuestions.length > 0 && (
            <div className="flex flex-col items-center gap-6 mt-10">
              <div className="bg-white border rounded-lg p-6 shadow-md w-full max-w-[95%] mx-auto">
                {/* top label */}
                <div className="text-left text-sm font-semibold mb-4 text-gray-700">
                  Question {currentIndex + 1} of {shuffledQuestions.length}
                </div>

                {/* Question text */}
                {shuffledQuestions[currentIndex].question && (
                  <p className="mt-2 text-gray-800 text-base whitespace-pre-line leading-relaxed">
                    <InlineMath>
                      {shuffledQuestions[currentIndex].question}
                    </InlineMath>
                  </p>
                )}

                {/* Question image */}
                {shuffledQuestions[currentIndex].questionImage && (
                  <div className="my-4">
                    <img
                      src={
                        shuffledQuestions[
                          currentIndex
                        ].questionImage?.startsWith("http")
                          ? shuffledQuestions[currentIndex].questionImage
                          : `${API_URL}${shuffledQuestions[currentIndex].questionImage}`
                      }
                      alt="Question"
                      className="max-w-full rounded"
                    />
                  </div>
                )}

                {/* Choices */}
                <div className="mt-6 space-y-3">
                  {shuffledQuestions[currentIndex].choices.map(
                    (choice, index) => (
                      <label
                        key={index}
                        className={`flex items-center space-x-3 cursor-pointer border px-4 py-3 rounded-md ${
                          selectedAnswers[
                            shuffledQuestions[currentIndex].id
                          ] === choice
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${shuffledQuestions[currentIndex].id}`}
                          value={choice}
                          checked={
                            selectedAnswers[
                              shuffledQuestions[currentIndex].id
                            ] === choice
                          }
                          onChange={() =>
                            handleAnswerClick(
                              shuffledQuestions[currentIndex].id,
                              choice
                            )
                          }
                          className="form-radio text-blue-600"
                        />
                        <span className="text-gray-800">
                          <InlineMath>{choice}</InlineMath>
                        </span>
                      </label>
                    )
                  )}
                </div>

                {/* Optional footer like 'Reset Answer', 'Review Later' etc. */}
                <div className="flex items-center mt-6 space-x-6">
                  <button
                    onClick={() =>
                      setSelectedAnswers((prev) => ({
                        ...prev,
                        [shuffledQuestions[currentIndex].id]: null,
                      }))
                    }
                    className="text-sm text-gray-700 px-3 py-1 border border-gray-400 rounded hover:bg-gray-100"
                  >
                    Reset Answer
                  </button>

                  {/* Placeholder checkboxes, purely UI like in your screenshot */}
                  <label className="text-sm text-gray-700 flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={reviewLaterIds.has(
                        shuffledQuestions[currentIndex].id
                      )}
                      onChange={(e) => {
                        const updated = new Set(reviewLaterIds);
                        const qId = shuffledQuestions[currentIndex].id;
                        if (e.target.checked) {
                          updated.add(qId);
                        } else {
                          updated.delete(qId);
                        }
                        setReviewLaterIds(updated);
                      }}
                    />
                    Review later
                  </label>

                  {/* <label className="text-sm text-gray-700 flex items-center gap-2">
                    <input type="checkbox" className="form-checkbox" />
                    Leave Feedback
                  </label> */}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center w-full max-w-[95%] mt-4">
                <div className="flex space-x-4">
                  <button
                    onClick={goToPrev}
                    disabled={currentIndex === 0}
                    className={`w-36 px-4 py-3 rounded text-white text-sm font-semibold transition ${
                      currentIndex === 0
                        ? "bg-gray-300 cursor-not-allowed text-gray-600"
                        : "bg-blue-700 hover:bg-blue-800"
                    }`}
                  >
                    Previous
                  </button>

                  <button
                    onClick={goToNext}
                    disabled={currentIndex === shuffledQuestions.length - 1}
                    className={`w-36 px-4 py-3 rounded text-white text-sm font-semibold transition ${
                      currentIndex === shuffledQuestions.length - 1
                        ? "bg-gray-300 cursor-not-allowed text-gray-600"
                        : "bg-blue-700 hover:bg-blue-800"
                    }`}
                  >
                    Next
                  </button>
                </div>

                <button
                  onClick={handleSubmitExam}
                  className="w-36 px-4 py-3 rounded bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {submitted && (
        <div className="text-center my-14 max-w-[50%] mx-auto">
          <div className="text-2xl font-semibold text-[#30608E]">
            Your score: {score} / {shuffledQuestions.length}
          </div>
        </div>
      )}

      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-center mb-4">
              Exam Summary
            </h2>

            <div className="flex justify-center items-center mb-4">
              <div className="w-24 h-24 rounded-full bg-red-300 flex items-center justify-center text-2xl font-bold text-white">
                {score}%
              </div>
            </div>
            <p className="text-center text-gray-600 mb-6">Overall Score</p>

            {/* Strengths */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-green-700">
                Strengths
              </h3>
              {Object.keys(groupedStrengths).length > 0 ? (
                Object.entries(groupedStrengths).map(
                  ([chapter, lessons], idx) => (
                    <div key={idx} className="ml-4 mb-2">
                      <p className="font-semibold text-green-800">{chapter}</p>
                      <ul className="list-disc list-inside text-sm text-green-800 ml-4">
                        {lessons.map((title, index) => (
                          <li key={index}>{title}</li>
                        ))}
                      </ul>
                    </div>
                  )
                )
              ) : (
                <p className="text-sm text-gray-500">
                  No strong areas identified.
                </p>
              )}
            </div>

            {/* Weaknesses */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-red-700">Weaknesses</h3>
              {Object.keys(groupedWeaknesses).length > 0 ? (
                Object.entries(groupedWeaknesses).map(
                  ([chapter, lessons], idx) => (
                    <div key={idx} className="ml-4 mb-2">
                      <p className="font-semibold text-red-800">{chapter}</p>
                      <ul className="list-disc list-inside text-sm text-red-800 ml-4">
                        {lessons.map((title, index) => (
                          <li key={index}>{title}</li>
                        ))}
                      </ul>
                    </div>
                  )
                )
              ) : (
                <p className="text-sm text-gray-500">
                  No weaknesses identified.
                </p>
              )}
            </div>

            <div className="flex justify-center mt-6 gap-4">
              <button
                onClick={() => setShowSummary(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                onClick={handleBackToDashboard}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-12 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
          aria-label="Scroll to top"
        >
          ↑ Top
        </button>
      )}
    </div>
  );
}
