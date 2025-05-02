"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import DiagnosticResultSummary from "@/app/components/DiagnosticResultSummary";
import API_URL from "@/lib/getApiUrl";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { InlineMath } from "react-katex";
import { MathJax } from "better-react-mathjax";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

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

type LessonChartEntry = {
  name: string;
  chapter: string;
  lesson: string;
  percentage: number;
};

interface DiagnosticResultSummaryProps {
  score: number;
  correctCount: number;
  totalCount: number;
  strengths: Record<string, string[]>;
  weaknesses: Record<string, string[]>;
  chartData: LessonChartEntry[];
}

export default function DiagnosticExam() {
  const router = useRouter();
  const { user } = useAuth();
  const questionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // ---------- State Declarations ----------
  const [showInstructions, setShowInstructions] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<
    QuestionWithLessonInfo[]
  >([]);

  const [reviewLaterIds, setReviewLaterIds] = useState<Set<string>>(new Set());
  const [showProgressDropdown, setShowProgressDropdown] = useState(true);

  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: string | null;
  }>({});
  const [questionStartTime, setQuestionStartTime] = useState<number>(
    Date.now()
  );
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timedAnswers, setTimedAnswers] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [strengths, setStrengths] = useState<TopicPerformance[]>([]);
  const [weaknesses, setWeaknesses] = useState<TopicPerformance[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [chartData, setChartData] = useState<LessonChartEntry[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [timerMinutes, setTimerMinutes] = useState<number>(60); // default
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const [showResetDialog, setShowResetDialog] = useState(false);

  // ---------- Timer countdown effect ----------
  useEffect(() => {
    fetch(`${API_URL}/api/settings/diagnostic-timer`)
      .then((res) => res.json())
      .then((data) => {
        setTimerMinutes(data.diagnosticTimerMinutes);
        setRemainingSeconds(data.diagnosticTimerMinutes * 60); // convert to seconds
      })
      .catch(console.error);
  }, []);

  // ---------- Fetch lessons ----------
  useEffect(() => {
    fetch(`${API_URL}/api/lessons`)
      .then((res) => res.json())
      .then((data) => setLessons(data))
      .catch((error) => console.error("Error fetching lessons:", error));
  }, []);

  // ---------- Show Timer Countdown ----------
  useEffect(() => {
    if (!showInstructions && remainingSeconds !== null) {
      const interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitExam(); // auto submit when timer ends
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showInstructions, remainingSeconds]);

  // ---------- Flatten and shuffle all questions once lessons are loaded ----------
  useEffect(() => {
    if (lessons.length > 0) {
      const questionsPerLesson = Math.floor(100 / lessons.length); // 5
      const remainder = 100 % lessons.length; // distribute remainder randomly

      let all: QuestionWithLessonInfo[] = [];

      lessons.forEach((lesson, index) => {
        // Slice first N random questions per lesson
        const limit =
          index < remainder ? questionsPerLesson + 1 : questionsPerLesson;
        const available = [...lesson.questions].sort(() => Math.random() - 0.5);
        const selected = available.slice(0, Math.min(limit, available.length));

        const formatted = selected.map((q) => ({
          ...q,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          chapterTitle: lesson.chapterTitle,
        }));

        all.push(...formatted);
      });

      // Fallback to ensure total is exactly 100
      if (all.length < 100) {
        const extras: QuestionWithLessonInfo[] = [];

        for (const lesson of lessons) {
          const remaining = lesson.questions.filter(
            (q) => !all.some((sel) => sel.id === q.id)
          );

          const toAdd = remaining
            .sort(() => Math.random() - 0.5)
            .map((q) => ({
              ...q,
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              chapterTitle: lesson.chapterTitle,
            }));

          for (const q of toAdd) {
            if (extras.length + all.length >= 100) break;
            extras.push(q);
          }

          if (extras.length + all.length >= 100) break;
        }

        all.push(...extras);
      }

      // Optional: Shuffle all 100 after combining
      setShuffledQuestions(all.sort(() => Math.random() - 0.5));

      // ✅ Limit to first 5 random questions only
      // const limited = all.sort(() => Math.random() - 0.5).slice(0, 5);
      // setShuffledQuestions(limited);
    }
  }, [lessons]);

  // ---------- Scroll into view on sidebar jump ----------
  useEffect(() => {
    const ref = questionRefs.current[currentIndex];
    if (ref) {
      ref.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [currentIndex]);

  // ---------- Developer shortcut: Shift+D to auto-answer all ----------
  useEffect(() => {
    const handleDevKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "D") {
        console.log("🧪 Developer mode: Auto-selecting answers...");

        // Pick first non-empty choice for each question
        const autoAnswers: { [key: string]: string } = {};
        shuffledQuestions.forEach((q) => {
          const validChoices = q.choices.filter((c) => c && c.trim() !== "");
          if (validChoices.length > 0) {
            const randomChoice =
              validChoices[Math.floor(Math.random() * validChoices.length)];
            autoAnswers[q.id] = randomChoice;
          }
        });

        setSelectedAnswers(autoAnswers);

        // Also auto-fill timedAnswers
        const now = Date.now();
        const autoTimed = shuffledQuestions.map((q) => ({
          questionId: q.id,
          lessonId: q.lessonId,
          timeTaken: Math.floor(Math.random() * (599 - 10 + 1)) + 10, // 10 to 599 seconds
          isCorrect: autoAnswers[q.id] === q.correctAnswer,
        }));

        setTimedAnswers(autoTimed);
        setQuestionStartTime(now);
        // alert("🧪 Auto-answered all questions.");
      }
    };

    window.addEventListener("keydown", handleDevKey);
    return () => window.removeEventListener("keydown", handleDevKey);
  }, [shuffledQuestions]);

  // ---------- Keyboard navigation: ArrowLeft / ArrowRight ----------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToNext();
      else if (e.key === "ArrowLeft") goToPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, shuffledQuestions]);

  // ---------- Prevent tab switch (blur) if exam not yet submitted ----------
  useEffect(() => {
    const handleBlur = () => {
      if (!isSubmitting && !submitted) {
        // alert("You left the exam window. The exam will now reset.");
        // location.reload();
        setShowResetDialog(true);
      }
    };

    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [isSubmitting, submitted]); // ✅ Listen to both

  // ---------- Track time and store result per question ----------
  const recordTimeForCurrentQuestion = () => {
    const current = shuffledQuestions[currentIndex];
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    setTimedAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === current.id);
      if (existing) {
        return prev.map((a) =>
          a.questionId === current.id
            ? { ...a, timeTaken: a.timeTaken + timeTaken }
            : a
        );
      } else {
        return [
          ...prev,
          {
            questionId: current.id,
            lessonId: current.lessonId,
            timeTaken,
            isCorrect: selectedAnswers[current.id] === current.correctAnswer,
          },
        ];
      }
    });
    setQuestionStartTime(Date.now());
  };

  // ---------- Submit Exam ----------
  const handleSubmitExam = async () => {
    if (shuffledQuestions.some((q) => !selectedAnswers[q.id])) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true); // 🔵 Start loading

    try {
      let correct = 0;
      const topicStats: Record<string, { correct: number; total: number }> = {};

      // Calculate total correct and group per lesson
      shuffledQuestions.forEach((q) => {
        const isCorrect = selectedAnswers[q.id] === q.correctAnswer;

        if (!topicStats[q.lessonId]) {
          topicStats[q.lessonId] = { correct: 0, total: 0 };
        }
        topicStats[q.lessonId].total++;
        if (isCorrect) topicStats[q.lessonId].correct++;

        if (isCorrect) correct++;
      });

      const total = shuffledQuestions.length; // Always 100 now
      const percent = Math.round((correct / total) * 100);

      setScore(percent);
      setCorrectCount(correct);
      setTotalCount(total);

      // Ensure final question's time is recorded before submit
      await new Promise((resolve) => {
        recordTimeForCurrentQuestion();
        setTimeout(resolve, 100); // small delay to ensure state is updated
      });

      // ✅ Submit to backend
      if (user?.id) {
        await fetch(`${API_URL}/api/diagnostic/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, results: timedAnswers }),
        });
      }

      // Group performance
      const strong: TopicPerformance[] = [];
      const weak: TopicPerformance[] = [];

      Object.entries(topicStats).forEach(([lessonId, stat]) => {
        const lesson = lessons.find((l) => l.id === lessonId);
        if (!lesson) return;

        const accuracy = stat.correct / stat.total;
        const entry = {
          title: lesson.title,
          chapter: lesson.chapterTitle,
        };

        (accuracy >= 0.8 ? strong : weak).push(entry);
      });

      setStrengths(strong);
      setWeaknesses(weak);

      const lessonAccuracyMap: Record<
        string,
        { chapter: string; lesson: string; total: number; correct: number }
      > = {};

      shuffledQuestions.forEach((q) => {
        const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
        const key = `${q.chapterTitle} - ${q.lessonTitle}`;
        if (!lessonAccuracyMap[key]) {
          lessonAccuracyMap[key] = {
            chapter: q.chapterTitle,
            lesson: q.lessonTitle,
            total: 0,
            correct: 0,
          };
        }
        lessonAccuracyMap[key].total++;
        if (isCorrect) lessonAccuracyMap[key].correct++;
      });

      const lessonChartData = Object.entries(lessonAccuracyMap).map(
        ([key, value]) => ({
          name: key,
          chapter: value.chapter,
          lesson: value.lesson,
          percentage: Math.round((value.correct / value.total) * 100),
          correct: value.correct,
          total: value.total,
        })
      );

      setChartData(lessonChartData);
      setSubmitted(true);
      setShowSummary(true);
    } catch (error) {
      console.error("Submission failed", error);
      alert("An error occurred while submitting your exam.");
    } finally {
      setIsSubmitting(false); // 🔵 Stop loading
    }
  };

  // ---------- Group topics by chapter for summary display ----------
  function groupByChapter(topics: TopicPerformance[]) {
    return topics.reduce((acc: Record<string, string[]>, topic) => {
      if (!acc[topic.chapter]) acc[topic.chapter] = [];
      acc[topic.chapter].push(topic.title);
      return acc;
    }, {});
  }

  const groupedStrengths = groupByChapter(strengths);
  const groupedWeaknesses = groupByChapter(weaknesses);

  // ---------- Answer selection ----------
  const handleAnswerClick = (questionId: string, choice: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: choice,
    }));
  };

  // ---------- Navigation ----------
  const goToNext = () => {
    recordTimeForCurrentQuestion();
    if (currentIndex < shuffledQuestions.length - 1)
      setCurrentIndex(currentIndex + 1);
  };
  const goToPrev = () => {
    recordTimeForCurrentQuestion();
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleBackToDashboard = () => router.push("/dashboard");

  return (
    <>
      // Root container with fixed header offset and horizontal layout
      <div className="relative min-h-screen flex flex-col md:flex-row overflow-auto pt-20">
        {/* Instructions Overlay */}
        {showInstructions && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 relative animate-fadeIn mx-8 leading-relaxed">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-[#1A3D6D] mb-3">
                📘 Diagnostic Exam Instructions
              </h2>
              <p className="text-center text-gray-600 mb-6 text-sm">
                Please read the guidelines below carefully before starting the
                exam.
              </p>
              <ul className="space-y-3 text-sm sm:text-base text-gray-800 leading-relaxed">
                <li>
                  ✅ The exam contains <strong>100 questions</strong> randomly
                  selected from various topics.
                </li>
                <li>
                  🕒 Each question is <strong>timed</strong> to track difficulty
                  level.
                </li>
                <li>
                  🧠 You can <strong>mark questions</strong> to review later.
                </li>
                <li>
                  🚫 <strong className="text-red-600">DO NOT</strong> switch
                  tabs or refresh — your progress <strong>will reset</strong>.
                </li>
                <li>
                  📊 Your results will show <strong>strengths</strong> and{" "}
                  <strong>weaknesses</strong> per topic.
                </li>
                <li>
                  📩 Click <strong>Submit</strong> only when{" "}
                  <strong>all questions are answered</strong>.
                </li>
              </ul>
              <div className="mt-8 flex justify-center">
                <button
                  className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full text-sm font-semibold shadow-md transition"
                  onClick={() => {
                    setShowInstructions(false);
                    setRemainingSeconds(timerMinutes * 60); // Start counting
                  }}
                >
                  Start Exam
                </button>
              </div>
            </div>
          </div>
        )}

        {!showInstructions && (
          // your existing main diagnostic exam JSX stays here...
          <>
            {/* Sidebar (Left) - Exam Toolbar */}
            {/* Toggle Sidebar Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`fixed top-1/2 z-50 -translate-y-1/2 bg-white border border-gray-300 rounded-full h-10 w-10 flex items-center justify-center hover:bg-gray-100 shadow-md transition-all duration-300
    ${sidebarOpen ? "left-[15.5rem]" : "-left-5"} md:hidden`}
              aria-label="Toggle Exam Toolbar"
            >
              {sidebarOpen ? (
                <ChevronLeft size={18} />
              ) : (
                <ChevronRight size={18} className="ml-4" />
              )}
            </button>

            <div
              className={`fixed top-0 left-0 z-40 bg-white w-64 h-[calc(100vh-5rem)] border-r transition-transform duration-300 transform ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              } md:relative md:translate-x-0 md:block px-4`}
            >
              <h2 className="text-sm font-semibold text-gray-700 mb-4">
                Exam Toolbar
              </h2>
              <ul className="space-y-2 text-sm">
                {/* Static item for visual section header */}
                <li className="flex items-center gap-2 text-[#1A3D6D] font-medium cursor-pointer hover:underline">
                  <span>📄</span>
                  Exam Question Details
                </li>

                {/* Dropdown toggle for question progress pills */}
                <li className="text-[#1A3D6D] font-medium">
                  <div
                    onClick={() => setShowProgressDropdown((prev) => !prev)}
                    className="flex items-center gap-2 cursor-pointer hover:underline"
                  >
                    <span>📊</span>
                    <span>Exam Progress</span>
                    <span>{showProgressDropdown ? "▲" : "▼"}</span>
                  </div>

                  {/* Question pills: Jump to question */}
                  {showProgressDropdown && (
                    <div className="grid grid-cols-6 gap-3 p-2 mt-2">
                      {shuffledQuestions.map((question, index) => {
                        const isCurrent = currentIndex === index;
                        const isReviewLater = reviewLaterIds.has(question.id);
                        const hasAnswer =
                          selectedAnswers[question.id] !== null &&
                          selectedAnswers[question.id] !== undefined;

                        return (
                          <button
                            key={index}
                            ref={(el) => {
                              questionRefs.current[index] = el; // ✅ No return
                            }}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-8 h-8 text-sm rounded-full border text-center transition
        ${isCurrent ? "bg-blue-600 text-white font-bold" : ""}
        ${isReviewLater ? "bg-red-500 text-white" : ""}
        ${
          !isCurrent && !isReviewLater && hasAnswer
            ? "bg-green-500 text-white"
            : ""
        }
        ${
          !isCurrent && !isReviewLater && !hasAnswer
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

            {/* Main Exam Content (Right) */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex-1 overflow-auto px-4 sm:px-8">
                {/* Top Header:  Title and Progress */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 px-8">
                  <h1 className="text-2xl lg:text-3xl font-bold text-[#30608E]">
                    {/* Title */}
                    Diagnostic Exam
                  </h1>

                  {/* Center progress bar */}
                  <div className="flex flex-col items-center flex-grow text-center">
                    <span className="text-xs lg:text-sm text-gray-500">
                      Exam Question Progress ({currentIndex + 1}/
                      {shuffledQuestions.length})
                    </span>
                    <div className="w-48 bg-gray-300 h-2 rounded mt-1">
                      <div
                        className="bg-[#1A3D6D] h-2 rounded"
                        style={{
                          width: `${
                            ((currentIndex + 1) / shuffledQuestions.length) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Spacer to align layout 
                <div className="w-[180px]" />
                */}
                  {remainingSeconds !== null && (
                    <div className="inline-flex items-center gap-2 px-4 py-1 mt-4 md:mt-0 bg-red-100 text-red-700 font-semibold rounded-full shadow-sm border border-red-300 text-xs lg:text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6l4 2m4-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Time Left: {Math.floor(remainingSeconds / 60)}m{" "}
                      {String(remainingSeconds % 60).padStart(2, "0")}s
                    </div>
                  )}
                </div>

                {/* Question Viewer */}
                {shuffledQuestions.length > 0 && (
                  <div className="flex flex-col items-center gap-6 mt-10">
                    <div className="bg-white border rounded-lg p-6 shadow-md w-full max-w-[95%] mx-auto">
                      {/* Question Count Label */}
                      <div className="text-left text-xs lg:text-sm font-semibold mb-4 text-gray-700">
                        Question {currentIndex + 1} of{" "}
                        {shuffledQuestions.length}
                      </div>

                      {/* Question Text */}
                      {shuffledQuestions[currentIndex].question && (
                        <div className="overflow-x-auto max-w-full">
                          <div className="inline-block min-w-fit text-gray-800 text-sm lg:text-base leading-relaxed select-none">
                            <MathJax inline>
                              {`\\( ${shuffledQuestions[currentIndex].question} \\)`}
                            </MathJax>
                          </div>
                        </div>
                      )}

                      {/* Question Image (if any) */}
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

                      {/* Answer Choices */}
                      <div className="mt-6 space-y-3 text-sm lg:text-base">
                        {shuffledQuestions[currentIndex].choices
                          .filter((choice) => choice && choice.trim() !== "")
                          .map((choice, index) => (
                            <label
                              key={index}
                              className={`flex flex-wrap items-center space-x-3 cursor-pointer border px-4 py-3 rounded-md select-none ${
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
                          ))}
                      </div>

                      {/* Reset + Review Later controls */}
                      <div className="flex items-center mt-6 space-x-6">
                        <button
                          onClick={() =>
                            setSelectedAnswers((prev) => ({
                              ...prev,
                              [shuffledQuestions[currentIndex].id]: null,
                            }))
                          }
                          className="text-xs lg:text-sm text-gray-700 px-3 py-1 border border-gray-400 rounded hover:bg-gray-100"
                        >
                          Reset Answer
                        </button>

                        <label className="text-xs lg:text-sm text-gray-700 flex items-center gap-2">
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

                    {/* Navigation & Submit Buttons */}
                    <div className="flex justify-between items-center w-full max-w-[95%] mt-4">
                      {/* Previous / Next Navigation */}
                      <div className="flex space-x-4">
                        <button
                          onClick={goToPrev}
                          disabled={currentIndex === 0}
                          className={`w-full sm:w-36 px-4 py-3 rounded text-white text-xs lg:text-sm font-semibold transition ${
                            currentIndex === 0
                              ? "bg-gray-300 cursor-not-allowed text-gray-600"
                              : "bg-blue-700 hover:bg-blue-800"
                          }`}
                        >
                          Previous
                        </button>

                        <button
                          onClick={goToNext}
                          disabled={
                            currentIndex === shuffledQuestions.length - 1
                          }
                          className={`w-full sm:w-36 px-4 py-3 rounded text-white text-xs lg:text-sm font-semibold transition ${
                            currentIndex === shuffledQuestions.length - 1
                              ? "bg-gray-300 cursor-not-allowed text-gray-600"
                              : "bg-blue-700 hover:bg-blue-800"
                          }`}
                        >
                          Next
                        </button>
                      </div>

                      {/* Submit Button */}
                      <button
                        onClick={handleSubmitExam}
                        disabled={isSubmitting}
                        className={`min-w-[100px] px-4 py-3 rounded text-white text-xs lg:text-sm font-semibold transition flex items-center justify-center
    ${
      isSubmitting
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-700 hover:bg-blue-800"
    }`}
                      >
                        {isSubmitting ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 mr-2 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                              />
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          "Submit"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Modal Overlay */}
            {showSummary && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-[#fffaf5] p-8 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative mx-8">
                  <button
                    onClick={() => setShowSummary(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg lg:text-xl"
                  >
                    ✕
                  </button>

                  {/* Diagnostic Result Component */}
                  <DiagnosticResultSummary
                    score={score}
                    correctCount={correctCount}
                    totalCount={totalCount}
                    strengths={groupedStrengths}
                    weaknesses={groupedWeaknesses}
                    chartData={chartData}
                  />

                  <div className="flex justify-center mt-6">
                    <button
                      className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded text-sm lg:text-base"
                      onClick={handleBackToDashboard}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="animate-fade-in duration-300">
          <AlertDialogHeader>
            <span className="flex ">
              <AlertTriangle className="my-auto text-yellow-500 w-6 h-6 mr-2" />
              <AlertDialogTitle className="text-base lg:text-lg">
                Session Ended
              </AlertDialogTitle>
            </span>
          </AlertDialogHeader>
          <div className="text-sm lg:text-base text-gray-600">
            You left the exam window. The exam will now reset.
          </div>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowResetDialog(false);
                location.reload(); // ✅ Reload after clicking OK
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm lg:text-base px-10"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
