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

type TopicPerformance = {
  title: string;
  chapter: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DiagnosticExam() {
  const router = useRouter();
  const { user } = useAuth();

  const [lessons, setLessons] = useState<Lesson[]>([]);
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
    <div className="pt-[96px] px-10">
      <div className="text-[#30608E] text-center mt-[50px]">
        <h1 className="text-3xl font-bold">Diagnostic Exam</h1>
      </div>

      {/* ✅ Stacked Layout (Vertical) */}
      {Object.entries(groupedLessons)
        .sort(([a], [b]) => {
          const getChapterNumber = (title: string) =>
            parseInt(title.replace(/\D/g, ""), 10); // extract number from "Chapter 1"
          return getChapterNumber(a) - getChapterNumber(b);
        })
        .map(([chapterTitle, lessonsInChapter]) => (
          <div key={chapterTitle} className="mb-10 mt-[50px] ">
            <h2 className="text-3xl font-bold text-[#30608E] ml-[15.6em]">
              {chapterTitle}
            </h2>
            <div className="flex flex-col gap-10">
              {lessonsInChapter.map((lesson) => (
                <div key={lesson.id} className="w-full">
                  <h2 className="text-2xl font-bold text-[#30608E] mb-4 ml-[19.6em]">
                    {lesson.title}
                  </h2>

                  {/* ✅ Center the Question Box */}
                  <div className="flex flex-col items-center gap-6">
                    {lesson.questions.map((question, qIndex) => (
                      <div
                        key={question.id}
                        className="bg-[#30608E] text-white p-6 rounded-lg w-full max-w-5xl shadow-custom"
                      >
                        {/* Header */}
                        <div className="text-left text-sm font-semibold">
                          Question {qIndex + 1}
                        </div>

                        {/* Question Text */}
                        {question.question && (
                          <p className="mt-4 text-xl break-words whitespace-normal leading-relaxed">
                            <InlineMath>{question.question}</InlineMath>
                          </p>
                        )}

                        {/* <p className="mt-4 text-xl">{question.question}</p> */}

                        {/* ✅ Show image if available */}
                        {question.questionImage && (
                          <div className="my-4">
                            <img
                              src={
                                question.questionImage.startsWith("http")
                                  ? question.questionImage
                                  : `${API_URL}${question.questionImage}`
                              }
                              alt="Question"
                              className="max-w-full rounded"
                            />
                          </div>
                        )}

                        <p className="mt-2 text-md">
                          Choose the correct answer.
                        </p>

                        {/* Answer Choices */}
                        <div className="mt-4 flex flex-col gap-2">
                          {question.choices.map((choice, index) => (
                            <button
                              key={index}
                              onClick={() =>
                                handleAnswerClick(question.id, choice)
                              }
                              className={`w-full border border-[#C5C5C5] py-3 px-4 rounded-md text-left transition
                          ${
                            selectedAnswers[question.id] === choice
                              ? "bg-white text-[#30608E] font-bold"
                              : "bg-transparent text-white"
                          }
                          hover:bg-white hover:text-[#30608E]`}
                            >
                              {choice.startsWith("/uploads/") ? (
                                <img
                                  src={`${API_URL}${choice}`}
                                  alt={`Choice ${index + 1}`}
                                  className="w-auto h-auto rounded"
                                />
                              ) : (
                                <InlineMath>{choice}</InlineMath>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      <div className="text-right my-14 max-w-[50%] mx-auto as">
        {!submitted ? (
          <button
            onClick={handleSubmitExam}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition shadow-custom"
          >
            Submit Exam
          </button>
        ) : (
          <div className="text-2xl font-semibold text-[#30608E]">
            Your score: {score} /{" "}
            {lessons.reduce((acc, lesson) => acc + lesson.questions.length, 0)}
          </div>
        )}
      </div>

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
