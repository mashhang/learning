"use client";

// External libraries
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Import KaTeX styles
import Image from "next/image";
import { toast } from "sonner";

// Internal components and context
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useSidebar } from "@/app/context/SidebarContext";
import { useAuth } from "@/app/context/AuthContext";
import AssessmentQuiz from "@/app/components/AssessmentQuiz";
import MathPreview from "@/app/components/MathPreview";

// Environment/config
import API_URL from "@/lib/getApiUrl";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type LessonPage = {
  content: string;
  media?: string | null;
};

type Lesson = {
  id: string;
  lessonId: string; // ✅ this is now returned
  title: string;
  videoUrl?: string | null;
  chapterId: string;
  chapterTitle: string;
  progress: number;
  updatedAt?: string | null;
  pages: LessonPage[];
};

type ExampleExercise = {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  skillTag?: string;
  explanation: string;
};

export default function CurrentLesson() {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentPage, setCurrentPage] = useState(1); //
  const [totalPages, setTotalPages] = useState(1); //
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("id");
  const router = useRouter();
  const { isSidebarOpen, sidebarWidth } = useSidebar();
  const { user } = useAuth();
  const [showPreAssessment] = useState(false);
  const [showPostAssessment, setShowPostAssessment] = useState(false);
  const [currentPageLoaded, setCurrentPageLoaded] = useState(false);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  const [pageEnterTime, setPageEnterTime] = useState<number>(Date.now());
  const [showExercise, setShowExercise] = useState<boolean>(false);
  const [showGeneratedExerciseModal, setShowGeneratedExerciseModal] =
    useState(false);
  const [generatedExercise, setGeneratedExercise] =
    useState<ExampleExercise | null>(null);
  const [noMoreExercises, setNoMoreExercises] = useState(false);

  const [exerciseDifficulty, setExerciseDifficulty] = useState<
    "EASY" | "MEDIUM" | "HARD"
  >("MEDIUM");

  const [selectedAnswers, setSelectedAnswers] = useState<{
    [id: string]: string;
  }>({});
  const [answerResults, setAnswerResults] = useState<{ [id: string]: boolean }>(
    {}
  );

  const [score, setScore] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [exercisePerPage, setExercisePerPage] = useState<{
    [page: number]: string;
  }>({});

  const updateProgress = async (pageNumber: number) => {
    if (!lesson || !user) return;

    let calculatedProgress = parseFloat((pageNumber / totalPages).toFixed(2));
    if (calculatedProgress >= 1) {
      calculatedProgress = 0.99;
    }

    try {
      await fetch(`${API_URL}/api/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          lessonId: lesson.id,
          currentPage: pageNumber,
          totalPages,
          calculatedProgress,
        }),
      });
    } catch (err) {
      console.error("Network error while updating progress:", err);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const fetchLessons = async () => {
      try {
        const res = await fetch(`${API_URL}/api/lessons`);
        const data = await res.json();
        setLessons(data);

        const targetLesson = lessonId
          ? data.find((l: Lesson) => l.id === lessonId)
          : await fetch(
              `${API_URL}/api/user/${user.id}/top-priority-lesson`
            ).then((r) => r.json());

        const fullLesson = data.find((l: Lesson) => l.id === targetLesson.id);
        setLesson(fullLesson || null);
        setTotalPages(fullLesson?.pages?.length || 1);

        if (fullLesson?.id) {
          const progressRes = await fetch(
            `${API_URL}/api/progress/${user.id}/${fullLesson.id}`
          );
          if (progressRes.ok) {
            const { currentPage } = await progressRes.json();
            if (currentPage && !isNaN(currentPage)) {
              setCurrentPage(currentPage);
            }
          }
        }

        // Determine pre/post assessment visibility
        if (currentPage === 1 && fullLesson.progress === 0) {
          router.push(`/pre-assessment?id=${fullLesson.id}`);
        } else if (
          currentPage === fullLesson.pages.length &&
          fullLesson.progress < 1
        ) {
          setShowPostAssessment(true);
        }

        setCurrentPageLoaded(true);
      } catch (err) {
        console.error("Error loading lesson:", err);
      }
    };

    fetchLessons();
  }, [lessonId, user]);

  const [exercises, setExercises] = useState<ExampleExercise[]>([]);

  useEffect(() => {
    if (!lesson?.id || !user?.id) return;

    const fetchPrioritizedExercises = async () => {
      try {
        const res = await fetch(`${API_URL}/api/exercises/prioritized`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, lessonId: lesson.id }),
        });

        if (!res.ok) throw new Error("Failed to load exercises");

        const prioritized = await res.json();
        setExercises(prioritized);

        console.log("📌 Current Page:", currentPage);
        console.log("📌 Prioritized Exercises:", prioritized);
        console.log("📌 Existing Page Mapping:", exercisePerPage);

        // ✅ Apply adaptive logic on Page 1 if not assigned yet
        if (
          currentPage >= 1 &&
          !exercisePerPage[currentPage] &&
          prioritized.length > 0
        ) {
          const timeSpent = (Date.now() - pageEnterTime) / 1000;

          let difficulty: "EASY" | "MEDIUM" | "HARD" = "MEDIUM";
          if (timeSpent >= 20) {
            difficulty = "EASY";
          } else if (timeSpent <= 9) {
            difficulty = "HARD";
          }

          const usedIds = Object.values(exercisePerPage);
          const available = prioritized.filter(
            (ex) => !usedIds.includes(ex.id)
          );

          const match =
            available.find((ex) => ex.difficulty === difficulty) ||
            available.find((ex) => ex.difficulty === "MEDIUM") ||
            available[0]; // fallback

          setExercisePerPage((prev) => ({
            ...prev,
            [currentPage]: match.id,
          }));
          setExerciseDifficulty(match.difficulty);
          setShowExercise(true);

          console.log(
            `✅ Assigned exercise "${match.id}" to page ${currentPage}`
          );
        }

        setExerciseIndex(0);
      } catch (err) {
        console.error("⚠️ Error loading prioritized exercises:", err);
      }
    };

    fetchPrioritizedExercises();
  }, [lesson?.id, user?.id, currentPage]);

  if (!lesson || lesson.pages.length === 0) {
    return <p className="text-center mt-5 text-lg">Loading lesson...</p>;
  }

  const contentToRender = lesson?.pages?.[currentPage - 1]?.content || "";
  let pageMedia = lesson?.pages?.[currentPage - 1]?.media || null;

  // ✅ Ensure no double URL prefix
  if (pageMedia && !pageMedia.startsWith("http")) {
    pageMedia = `${API_URL}${pageMedia.startsWith("/") ? "" : "/"}${pageMedia}`;
  }

  if (showPreAssessment && lesson) {
    return (
      <AssessmentQuiz
        type="PRE"
        lesson={lesson}
        onFinish={() => {
          router.push(`/pre-assessment?id=${lesson.id}`);
        }}
        selectedAnswers={selectedAnswers}
        timedAnswers={[]}
        setSelectedAnswers={setSelectedAnswers}
        setTimedAnswers={() => {}}
      />
    );
  }

  if (showPostAssessment && lesson) {
    return (
      <AssessmentQuiz
        type="POST"
        lesson={lesson}
        onFinish={async () => {
          await fetch(`${API_URL}/api/progress`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user?.id,
              lessonId: lesson.id,
              currentPage: totalPages,
              totalPages,
              forceComplete: true,
            }),
          });

          toast.success("🎉 Lesson Completed!", {
            duration: 3000, // 3 seconds
          });

          setTimeout(() => {
            router.push(`/post-assessment?id=${lesson.id}`);
          }, 1000); // ✅ short delay so toast shows nicely before redirect
        }}
        selectedAnswers={selectedAnswers}
        timedAnswers={[]}
        setSelectedAnswers={setSelectedAnswers}
        setTimedAnswers={() => {}}
      />
    );
  }

  let currentExercises: ExampleExercise[] = [];

  const storedId = exercisePerPage[currentPage];
  if (storedId) {
    const matched = exercises.find((ex) => ex.id === storedId);
    if (matched) currentExercises = [matched];
  }

  if (currentExercises.length === 0) {
    currentExercises = exercises.filter(
      (ex) => ex.difficulty === exerciseDifficulty
    );
  }

  // Fallbacks if none match
  if (currentExercises.length === 0) {
    // Try medium
    currentExercises = exercises.filter((ex) => ex.difficulty === "MEDIUM");
  }
  if (currentExercises.length === 0) {
    // Try easy
    currentExercises = exercises.filter((ex) => ex.difficulty === "EASY");
  }
  if (currentExercises.length === 0) {
    // Try hard
    currentExercises = exercises.filter((ex) => ex.difficulty === "HARD");
  }

  return (
    <ProtectedRoute>
      <div
        className="transition-all duration-300 ease-in-out bg-[#EFEFEF] min-h-screen"
        style={{
          marginLeft: isSidebarOpen ? sidebarWidth : "0",
          width: isSidebarOpen ? `calc(100% - ${sidebarWidth})` : "100%",
        }}
      >
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-11 py-3 px-5 bg-[#D9D9D9]">
          {currentPage > 1 ? (
            <button
              onClick={async () => {
                const now = Date.now();
                const timeSpent = (now - pageEnterTime) / 1000;
                const targetPage = Math.max(currentPage - 1, 1);

                setCurrentPage(targetPage);
                setPageEnterTime(now);

                const storedId = exercisePerPage[targetPage];
                const matched = storedId
                  ? exercises.find((e) => e.id === storedId)
                  : null;

                if (matched) {
                  setExerciseDifficulty(matched.difficulty);
                  setShowExercise(true);
                } else {
                  setShowExercise(false);
                }

                await updateProgress(targetPage); // ✅ Save progress when moving
              }}
              className="text-xs lg:text-sm py-2 px-4 bg-[#30608E] text-white rounded-md"
            >
              Previous Page
            </button>
          ) : (
            <div className="py-2 px-10"></div>
          )}

          <h1 className="text-sm lg:text-lg my-auto mx-4 text-center">
            {lesson.title}
          </h1>
          {lesson?.videoUrl && (
            <button
              className="fixed bottom-24 right-4 sm:right-6 z-50 px-4 py-2 sm:px-5 sm:py-3 rounded-full bg-blue-600 text-white text-xs sm:text-sm shadow-lg hover:bg-blue-700 transition w-[90%] sm:w-auto max-w-sm"
              onClick={() => setShowVideoModal(true)}
            >
              🎥 Watch Lesson Video
            </button>
          )}

          {currentPage < totalPages ? (
            <button
              onClick={async () => {
                const now = Date.now();
                const timeSpent = (now - pageEnterTime) / 1000;
                const targetPage = Math.min(currentPage + 1, totalPages);

                // const currentExerciseId = exercises.find((ex) => ex.id)?.id;
                // if (currentExerciseId) {
                //   setExercisePerPage((prev) => ({
                //     ...prev,
                //     [currentPage]: currentExerciseId,
                //   }));
                // }

                setCurrentPage(targetPage);
                setPageEnterTime(now);

                const storedId = exercisePerPage[targetPage];
                const matched = storedId
                  ? exercises.find((e) => e.id === storedId)
                  : null;

                if (matched) {
                  setExerciseDifficulty(matched.difficulty);
                  setShowExercise(true);
                } else {
                  setShowExercise(false);
                }

                await updateProgress(targetPage); // ✅ Save progress when moving
              }}
              className="text-xs lg:text-sm py-2 px-4 bg-[#30608E] text-white rounded-md"
            >
              Next Page
            </button>
          ) : (
            <button
              onClick={() => router.push(`/post-assessment?id=${lesson.id}`)}
              className="text-[13px] py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md"
            >
              Take Post-Assessment
            </button>
          )}
        </div>

        <div className="max-w-full mx-auto max-h-full bg-white">
          {/* ✅ Display Media (Image or Video) */}
          {pageMedia && (
            <div className="flex justify-center mb-6">
              {pageMedia.endsWith(".mp4") ? (
                <video controls className="max-w-full h-auto rounded-lg">
                  <source src={pageMedia} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={pageMedia}
                  alt="Lesson Media"
                  onClick={() => setShowImagePreview(true)}
                  className="w-full h-auto rounded-lg select-none cursor-zoom-in"
                  draggable="false"
                />
              )}
            </div>
          )}

          {/* Markdown Renderer */}
          <div className="prose max-w-none text-lg leading-relaxed">
            <ReactMarkdown
              children={contentToRender}
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                p: ({ node, children }) => (
                  <p className="text-gray-700 mb-4">{children}</p>
                ),
                strong: ({ node, children }) => (
                  <strong className="text-red-500">{children}</strong>
                ),
                em: ({ node, children }) => (
                  <em className="text-green-500">{children}</em>
                ),
                h1: ({ node, children }) => (
                  <h1 className="text-2xl font-bold">{children}</h1>
                ),
                h2: ({ node, children }) => (
                  <h2 className="text-xl font-bold mt-4">{children}</h2>
                ),
                blockquote: ({ node, children }) => (
                  <blockquote className="border-l-4 border-yellow-500 pl-4 italic bg-yellow-100 p-2">
                    {children}
                  </blockquote>
                ),
                pre: ({ node, children }) => (
                  <div className="bg-gray-100 p-4 rounded-md">{children}</div>
                ),
              }}
            />
          </div>

          {/* 🧠 Example Exercises */}
          {exercises.length > 0 && (
            <>
              {showExercise && currentExercises.length > 0 ? (
                <ExerciseCard
                  exercise={currentExercises[0]}
                  index={0}
                  total={currentExercises.length}
                  selectedAnswers={selectedAnswers}
                  setSelectedAnswers={setSelectedAnswers}
                  answerResults={answerResults}
                  setAnswerResults={setAnswerResults}
                  score={score}
                  setScore={setScore}
                  exercises={exercises}
                />
              ) : currentPage !== totalPages && noMoreExercises ? (
                <div className="text-center text-gray-500 mt-4">
                  ✅ You’ve answered all available exercises!
                  <br />
                  <button
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={() => setShowSummary(true)}
                  >
                    View Summary
                  </button>
                </div>
              ) : null}
            </>
          )}

          {currentPage === totalPages && (
            <div className="flex flex-col items-center mt-6">
              {/* Check if there are exercises for the last page */}
              {exercises.length === 0 || !exercises[currentPage - 1] ? (
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded"
                  onClick={() => setShowSummary(true)}
                >
                  ✅ View Summary & Score
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded"
                    onClick={async () => {
                      const excludeIds = Object.keys(selectedAnswers);
                      const res = await fetch(
                        `${API_URL}/api/exercises/${lesson?.id}/unanswered`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ excludeIds }),
                        }
                      );

                      if (res.ok) {
                        const newExercises = await res.json();
                        if (newExercises.length > 0) {
                          setGeneratedExercise(newExercises[0]); // ✅ Only the first one
                          setShowGeneratedExerciseModal(true); // ✅ Open modal
                          setNoMoreExercises(false); // ✅ Reset state
                        } else {
                          setNoMoreExercises(true); // ✅ Mark that no more to show
                          alert("✅ No more new exercises available.");
                        }
                      } else {
                        alert("⚠️ Failed to load more exercises.");
                      }
                    }}
                  >
                    ➕ Generate More Exercises
                  </button>
                  <button
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded"
                    onClick={() => setShowSummary(true)}
                  >
                    🚫 Skip & View Summary
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-center mb-4">
              📝 Exercise Summary
            </h2>

            <p className="mb-2">
              Total Exercises Taken: {Object.keys(selectedAnswers).length}
            </p>
            <p className="mb-2">
              ✅ Correct: {Object.values(answerResults).filter((x) => x).length}
            </p>
            <p className="mb-4">
              ❌ Incorrect:{" "}
              {Object.values(answerResults).filter((x) => !x).length}
            </p>

            <p className="font-bold mb-3">
              Overall Score:{" "}
              {Math.round(
                (Object.values(answerResults).filter((x) => x).length /
                  Object.keys(selectedAnswers).length) *
                  100 || 0
              )}
              %
            </p>

            <ul className="text-sm space-y-3">
              {exercises.map((ex, i) =>
                selectedAnswers[ex.id] ? (
                  <li key={ex.id} className="border p-3 rounded">
                    <p className="font-medium mb-1">
                      Q{i + 1}: {ex.question}
                    </p>
                    <p>
                      Your answer:{" "}
                      <span
                        className={`font-semibold ${
                          answerResults[ex.id]
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {selectedAnswers[ex.id]}
                      </span>{" "}
                      | Correct:{" "}
                      <span className="text-blue-600">{ex.correctAnswer}</span>
                    </p>
                    {ex.explanation && (
                      <p className="text-gray-600 mt-1">💡 {ex.explanation}</p>
                    )}
                  </li>
                ) : null
              )}
            </ul>

            <div className="text-center mt-6">
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded"
                onClick={() => setShowSummary(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl relative">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
            <div className="aspect-video">
              <iframe
                src={lesson.videoUrl?.replace("watch?v=", "embed/")}
                title="Lesson Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {exercises.length > 0 && (
        <button
          className="fixed bottom-6 right-4 sm:right-6 z-50 px-4 py-2 sm:px-5 sm:py-3 rounded-full bg-gray-800 text-white text-xs sm:text-sm shadow-lg hover:bg-gray-700 transition w-[90%] sm:w-auto max-w-sm"
          onClick={() => setReviewMode(true)}
        >
          🧠 Review Past Exercises
        </button>
      )}

      {reviewMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-[1400px] max-h-[80vh] overflow-y-auto rounded-lg shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">🧠 Reviewed Exercises</h2>
              <button
                onClick={() => setReviewMode(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✖
              </button>
            </div>

            {exercises.filter((ex) => selectedAnswers[ex.id]).length > 0 ? (
              exercises
                .filter((ex) => selectedAnswers[ex.id])
                .map((ex, i) => (
                  <ExerciseCard
                    key={ex.id}
                    exercise={ex}
                    index={i}
                    total={exercises.length}
                    selectedAnswers={selectedAnswers}
                    setSelectedAnswers={setSelectedAnswers}
                    answerResults={answerResults}
                    setAnswerResults={setAnswerResults}
                    score={score}
                    setScore={setScore}
                    exercises={exercises}
                  />
                ))
            ) : (
              <p className="text-center text-gray-500">
                No past exercises answered yet.
              </p>
            )}
          </div>
        </div>
      )}

      {showGeneratedExerciseModal && generatedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-lg shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">🆕 New Exercise</h2>
              <button
                onClick={() => setShowGeneratedExerciseModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✖
              </button>
            </div>
            <ExerciseCard
              exercise={generatedExercise}
              index={0}
              total={1}
              selectedAnswers={selectedAnswers}
              setSelectedAnswers={setSelectedAnswers}
              answerResults={answerResults}
              setAnswerResults={setAnswerResults}
              score={score}
              setScore={setScore}
              exercises={[generatedExercise]}
            />

            {/* 👇 Add this button bottom-center inside modal */}
            <div className="flex justify-center mt-6">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                onClick={async () => {
                  const excludeIds = Object.keys(selectedAnswers);
                  const res = await fetch(
                    `${API_URL}/api/exercises/${lesson?.id}/unanswered`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ excludeIds }),
                    }
                  );

                  if (res.ok) {
                    const newExercises = await res.json();
                    if (newExercises.length > 0) {
                      setGeneratedExercise(newExercises[0]);
                      setNoMoreExercises(false);
                    } else {
                      setNoMoreExercises(true);
                      alert("✅ No more new exercises available.");
                    }
                  } else {
                    alert("⚠️ Failed to load more exercises.");
                  }
                }}
              >
                ➕ Generate Another
              </button>
            </div>
          </div>
        </div>
      )}
      {showImagePreview && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
          onClick={() => setShowImagePreview(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-0">
            <img
              src={pageMedia!}
              alt="Zoomed Lesson Media"
              className="rounded shadow-lg max-h-[90vh] sm:max-h-[90vh] sm:max-w-[90vw]
                   rotate-0 sm:rotate-0
                   [@media(max-width:640px)]:rotate-90 
                   [@media(max-width:640px)]:max-w-[90vh] 
                   [@media(max-width:640px)]:max-h-[90vw]"
              draggable="false"
            />
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

function ExerciseCard({
  exercise,
  index,
  total,
  selectedAnswers,
  setSelectedAnswers,
  answerResults,
  setAnswerResults,
  score,
  setScore,
  exercises,
}) {
  useEffect(() => {
    setSelected(selectedAnswers[exercise.id] || null);
  }, [exercise.id, selectedAnswers]);

  const [selected, setSelected] = useState<string | null>(
    selectedAnswers[exercise.id] || null
  );

  const handleChoice = (choice: string) => {
    if (selected) return;

    const isCorrect = choice === exercise.correctAnswer;

    setSelected(choice);
    setSelectedAnswers((prev) => ({ ...prev, [exercise.id]: choice }));
    setAnswerResults((prev) => ({ ...prev, [exercise.id]: isCorrect }));

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const isCorrect = selected === exercise.correctAnswer;

  return (
    <div className="bg-white shadow-md rounded-md p-4 mb-6 border border-gray-200 select-none">
      {/* <h3 className="font-semibold text-md mb-4">{exercise.question}</h3> */}
      <div className="mb-3">
        <p className="text-md font-medium text-gray-800">{exercise.question}</p>
        {exercise.exerciseEquation && (
          <div className="mt-1">
            <MathPreview value={exercise.exerciseEquation} />
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Column: Question Choices */}
        <div>
          {exercise.choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => handleChoice(choice)}
              disabled={!!selected}
              className={`block w-full text-left py-2 px-4 my-1 border rounded transition-all select-none
              ${
                selected && choice === exercise.correctAnswer
                  ? "bg-green-100 border-green-500"
                  : ""
              }
              ${
                selected &&
                choice === selected &&
                choice !== exercise.correctAnswer
                  ? "bg-red-100 border-red-500"
                  : ""
              }
              ${
                !selected
                  ? "bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border-gray-300"
                  : ""
              }`}
            >
              <MathPreview value={choice} />
            </button>
          ))}
        </div>

        {/* Right Column: Feedback */}
        <div className="text-sm pt-1">
          {selected && (
            <div className="text-sm flex items-start space-x-2 text-left">
              <div>
                {isCorrect ? (
                  <p className="text-green-600 font-medium">✅ Correct!</p>
                ) : (
                  <p className="text-red-600 font-medium">
                    ❌ Incorrect. The correct answer is:{" "}
                    <strong>
                      <MathPreview value={exercise.correctAnswer} />
                    </strong>
                  </p>
                )}

                {/* Explanation Section */}
                {(exercise.explanation || exercise.explanationEquation) && (
                  <div className="mt-2 bg-gray-100 p-3 rounded border-l-4 border-blue-500">
                    <p className="font-semibold text-blue-700 mb-1">
                      Explanation:
                    </p>
                    {exercise.explanation && (
                      <p className="text-gray-700">{exercise.explanation}</p>
                    )}
                    {exercise.explanationEquation && (
                      <div className="mt-2">
                        <MathPreview value={exercise.explanationEquation} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
