"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { InlineMath, BlockMath } from "react-katex";
import QuestionModal from "@/app/components/modals/QuestionModal";
import LessonPageModal from "@/app/components/modals/LessonPageModal";
import ExerciseModal from "@/app/components/modals/ExerciseModal";
import { Trash2 } from "lucide-react";
import API_URL from "@/lib/getApiUrl";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type LessonPage = {
  content: string;
  media: File | null;
  existingMedia?: string | null;
  serverFilename?: string | null; // 👈 NEW
};

type Question = {
  id: string;
  question: string;
  questionImage?: File | null;
  choices: string[];
  choiceImages?: (File | null)[];
  isChoiceImage?: boolean;
  correctAnswer: string;
  skillTag?: string;
};

type ExampleExercise = {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  skillTag?: string;
  explanation: string; // ✅ Add this
};

export default function EditLesson() {
  const router = useRouter();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<
    "info" | "pages" | "questions" | "exercises"
  >("info");
  const [showPageModal, setShowPageModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [tempPage, setTempPage] = useState<LessonPage>({
    content: "",
    media: null,
    existingMedia: null,
  });
  const [tempQuestion, setTempQuestion] = useState({
    question: "",
    choices: ["", "", "", ""],
    correctAnswer: "",
    skillTag: "",
  });
  const [tempExercise, setTempExercise] = useState({
    question: "",
    choices: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    difficulty: "EASY" as "EASY" | "MEDIUM" | "HARD",
    skillTag: "",
  });

  const [editPageIndex, setEditPageIndex] = useState<number | null>(null);
  const [editQuestionIndex, setEditQuestionIndex] = useState<number | null>(
    null
  );
  const [editExerciseIndex, setEditExerciseIndex] = useState<number | null>(
    null
  );

  const [status, setStatus] = useState("DRAFT");
  const [lesson, setLesson] = useState<{
    title: string;
    chapterId: string;
    media: string;
    pages: LessonPage[];
    questions: Question[];
    exercises: ExampleExercise[];
  }>({
    title: "",
    chapterId: "",
    media: "",
    pages: [{ content: "", media: null, existingMedia: null }],
    questions: [],
    exercises: [],
  });

  const [currentQuestionPage, setCurrentQuestionPage] = useState(1);
  const questionsPerPage = 10;
  const [currentExercisePage, setCurrentExercisePage] = useState(1);
  const ExerciseitemsPerPage = 10;

  const paginatedQuestions = lesson.questions.slice(
    (currentQuestionPage - 1) * questionsPerPage,
    currentQuestionPage * questionsPerPage
  );
  const paginatedExercises = lesson.exercises.slice(
    (currentExercisePage - 1) * ExerciseitemsPerPage,
    currentExercisePage * ExerciseitemsPerPage
  );

  useEffect(() => {
    setCurrentExercisePage(1);
  }, [lesson.exercises.length]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null); // ✅ Track file upload
  const [chapters, setChapters] = useState<{ id: string; title: string }[]>([]);

  //Fetch Exercises
  useEffect(() => {
    if (!id) return;

    Promise.all([
      fetch(`${API_URL}/api/lessons/${id}`).then((res) => res.json()),
      fetch(`${API_URL}/api/exercises/${id}`).then((res) => res.json()),
      fetch(`${API_URL}/api/chapters`).then((res) => res.json()),
    ])
      .then(([lessonData, exercisesData, chaptersData]) => {
        const parsedQuestions = Array.isArray(lessonData.questions)
          ? lessonData.questions.map((q: any) => ({
              ...q,
              isChoiceImage: q.choices.some((c: string) =>
                c.startsWith("/uploads/")
              ),
              questionImage: q.questionImage?.startsWith("/uploads/")
                ? q.questionImage
                : null,
              choiceImages: q.choices.map((c: string) =>
                c.startsWith("/uploads/") ? c : null
              ),
            }))
          : [];

        const formattedExercises = exercisesData.map((ex: any) => ({
          ...ex,
          explanation: ex.explanation ?? "",
        }));

        setChapters(chaptersData);

        setLesson({
          title: lessonData.title || "",
          chapterId: lessonData.chapterId || "",
          media: lessonData.media || "",
          pages:
            lessonData.pages?.map((p: any) => ({
              content: p.content,
              existingMedia: p.media || null,
              serverFilename: p.serverFilename || null,
            })) || [],
          questions: parsedQuestions,
          exercises: formattedExercises, // ✅ include exercises!
        });

        setStatus(lessonData.status || "DRAFT");

        console.log("Fetched exercises:", exercisesData);
      })
      .catch((err) =>
        console.error("Failed to load lesson or exercises:", err)
      );
  }, [id]);

  const handleLessonChange = (field: keyof typeof lesson, value: string) => {
    setLesson((prevLesson) => ({
      ...prevLesson,
      [field]: value,
      media: prevLesson.media, // ✅ Preserve existing file
      questions: prevLesson.questions, // ✅ Preserve existing questions
    }));
  };

  const handlePreUpload = async (file: File, pageIndex: number) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        const updatedPages = [...lesson.pages];
        updatedPages[pageIndex].existingMedia = data.url; // 🟢 This is already the full Supabase public URL
        updatedPages[pageIndex].serverFilename = data.filename;
        updatedPages[pageIndex].media = null; // Don't resend file during PUT
        setLesson({ ...lesson, pages: updatedPages });
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]); // ✅ Only update file when a new one is selected
    }
  };

  const handleQuestionChange = (
    qIndex: number,
    field: keyof Question,
    value: string
  ) => {
    const updatedQuestions = lesson.questions.map((q, index) => {
      if (index === qIndex) {
        return { ...q, [field]: value }; // ✅ Update question fields correctly
      }
      return q;
    });

    setLesson({ ...lesson, questions: updatedQuestions });
  };

  const handleChoiceChange = (
    qIndex: number,
    cIndex: number,
    value: string
  ) => {
    setLesson((prevLesson) => {
      const updatedQuestions = prevLesson.questions.map((q, index) => {
        if (index === qIndex) {
          const updatedChoices = [...q.choices];
          updatedChoices[cIndex] = value;
          return { ...q, choices: updatedChoices };
        }
        return q;
      });

      return { ...prevLesson, questions: updatedQuestions };
    });
  };

  const addQuestion = () => {
    setLesson((prevLesson) => ({
      ...prevLesson,
      questions: [
        ...prevLesson.questions,
        { id: "", question: "", choices: ["", "", "", ""], correctAnswer: "" },
      ],
    }));
  };

  const removeQuestion = (qIndex: number) => {
    setLesson((prevLesson) => ({
      ...prevLesson,
      questions: prevLesson.questions.filter((_, index) => index !== qIndex),
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("title", lesson.title);
    // ✅ Attach filename reference to each page
    const pagesWithFilename = lesson.pages.map((page, index) => ({
      content: page.content,
      order: index + 1,
      filename: page.serverFilename || null, // fallback to existing UUID filename
    }));

    formData.append("pages", JSON.stringify(pagesWithFilename));

    // ✅ Upload media files separately
    lesson.pages.forEach((page) => {
      if (page.media) {
        // new file selected
        formData.append("pageMedias", page.media);
      }
    });

    if (selectedFile) formData.append("media", selectedFile);

    lesson.questions.forEach((q, index) => {
      if (q.questionImage) {
        formData.append(`questionImages`, q.questionImage);
      }
      if (q.isChoiceImage && q.choiceImages) {
        q.choiceImages.forEach((img, cIndex) => {
          if (img) {
            formData.append(`choiceImages`, img);
          }
        });
      }
    });
    formData.append("questions", JSON.stringify(lesson.questions));
    formData.append("chapterId", lesson.chapterId);
    formData.append("status", status);

    const res = await fetch(`${API_URL}/api/lessons/${id}`, {
      method: "PUT",
      headers: {
        // "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // body: JSON.stringify(formData),
      body: formData,
    });

    if (res.ok) {
      alert("Lesson updated successfully!");
      router.push("/admin/lessons");
    } else {
      alert("Failed to update lesson");
    }
  };

  return (
    //max-w-[1610px]
    <div className="p-4 overflow-x-hidden max-w-screen-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Lesson</h1>

      <div className="flex space-x-4 border-b mb-4">
        {[
          { key: "info", label: "General Info" },
          { key: "pages", label: "Lesson Pages" },
          { key: "questions", label: "Questions" },
          { key: "exercises", label: "Exercises" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === tab.key
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-h-[calc(100vh-120px)] overflow-y-auto pr-4">
        <form onSubmit={handleUpdate} encType="multipart/form-data">
          {activeTab === "info" && (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  value={lesson.title}
                  onChange={(e) => handleLessonChange("title", e.target.value)}
                  className="border p-2 w-full mb-2"
                  placeholder="Lesson Title"
                />

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border p-2 w-full bg-white"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>

                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-1 rounded mt-4"
                >
                  Update Lesson
                </button>
              </div>
            </>
          )}

          {activeTab === "pages" && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Lesson Pages
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({lesson.pages.length} total)
                  </span>
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-1 rounded"
                    onClick={() => setShowPageModal(true)}
                  >
                    + Add Page
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-1 rounded"
                  >
                    Update Lesson
                  </button>
                </div>
              </div>

              <table className="w-full border-collapse border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-3 py-2 text-left">Content</th>
                    <th className="border px-3 py-2 text-left">Media</th>
                    <th className="border px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lesson.pages.map((page, i) => (
                    <tr
                      key={i}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setEditPageIndex(i);
                        setTempPage({
                          content: page.content,
                          media: null, // don’t preload File object
                          existingMedia: page.existingMedia ?? null, // ✅ send for preview
                        });
                        setShowPageModal(true);
                      }}
                    >
                      {/* <td className="border px-4 py-2 max-w-[400px] whitespace-normal break-words">
                        {/* <BlockMath math={page.content} />
                        {page.content}
                      </td> */}
                      <td className="border px-3 py-2 max-w-[400px] whitespace-normal break-words">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: `<math-field read-only style="pointer-events: none; width: 100%; font-size: 1rem;">${page.content}</math-field>`,
                          }}
                        />
                      </td>

                      <td className="border px-3 py-2">
                        {page.existingMedia || page.media ? (
                          (() => {
                            const rawPath = page.existingMedia ?? "";

                            // ✅ Detect Supabase URL — skip prefixing
                            const fullUrl = (() => {
                              if (!rawPath) return "";
                              if (rawPath.startsWith("http")) return rawPath;
                              return `${API_URL}${
                                rawPath.startsWith("/") ? "" : "/"
                              }${rawPath}`;
                            })();

                            return rawPath.endsWith(".mp4") ? (
                              <video className="w-32" controls src={fullUrl} />
                            ) : (
                              <img
                                className="w-20 rounded border"
                                src={fullUrl}
                                alt="Media"
                              />
                            );
                          })()
                        ) : (
                          <span className="text-gray-500">No media</span>
                        )}
                      </td>
                      <td
                        className="border px-3 py-2 text-center cursor-pointer text-red-400 hover:text-red-700 transition"
                        onClick={(e) => {
                          e.stopPropagation();

                          const confirmDelete = window.confirm(
                            "Are you sure you want to delete this page?"
                          );
                          if (!confirmDelete) return;

                          setLesson((prev) => ({
                            ...prev,
                            pages: prev.pages.filter((_, index) => index !== i),
                          }));
                        }}
                      >
                        <Trash2 size={24} className="mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {activeTab === "questions" && (
            <>
              <div className="relative">
                <div className="sticky top-0 z-10 bg-white pb-2">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                      Edit Questions
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({lesson.questions.length} total)
                      </span>
                    </h2>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="bg-blue-500 text-white px-4 py-1 rounded"
                        onClick={() => {
                          setTempQuestion({
                            question: "",
                            choices: ["", "", "", ""],
                            correctAnswer: "",
                            skillTag: "",
                          });
                          setEditQuestionIndex(null); // new item
                          setShowQuestionModal(true);
                        }}
                      >
                        + Add Question
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[calc(100vh-320px)]">
                  <table className="min-w-full table-auto border-collapse text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="sticky top-0 bg-gray-100 px-3 py-2 text-left z-10 border">
                          Question
                        </th>
                        <th className="sticky top-0 bg-gray-100 px-3 py-2 text-left z-10 border">
                          Choices
                        </th>
                        <th className="sticky top-0 bg-gray-100 px-3 py-2 text-left z-10 border">
                          Correct Answer
                        </th>
                        <th className="sticky top-0 bg-gray-100 px-3 py-2 text-center z-10 border">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedQuestions.map((q, index) => {
                        const globalIndex =
                          (currentQuestionPage - 1) * questionsPerPage + index;

                        return (
                          <tr
                            key={globalIndex}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => {
                              setEditQuestionIndex(globalIndex);
                              setTempQuestion({
                                question: q.question,
                                choices: [...q.choices],
                                correctAnswer: q.correctAnswer,
                                skillTag: q.skillTag ?? "",
                              });
                              setShowQuestionModal(true);
                            }}
                          >
                            <td className="border px-3 py-2">
                              <InlineMath math={q.question} />
                            </td>
                            <td className="border px-3 py-2">
                              {q.choices.map((c, i) => (
                                <div key={i}>
                                  <InlineMath math={c} />
                                </div>
                              ))}
                            </td>
                            <td className="border px-3 py-2">
                              <InlineMath math={q.correctAnswer} />
                            </td>
                            <td
                              className="border px-3 py-2 text-center cursor-pointer text-red-400 hover:text-red-700 transition"
                              onClick={async (e) => {
                                e.stopPropagation();
                                const confirmDelete = window.confirm(
                                  "Are you sure you want to delete this question?"
                                );
                                if (!confirmDelete) return;

                                const questionToDelete =
                                  lesson.questions[globalIndex];
                                const token = localStorage.getItem("token");

                                try {
                                  await fetch(
                                    `${API_URL}/api/questions/${questionToDelete.id}`,
                                    {
                                      method: "DELETE",
                                      headers: {
                                        Authorization: `Bearer ${token}`,
                                      },
                                    }
                                  );

                                  setLesson((prev) => ({
                                    ...prev,
                                    questions: prev.questions.filter(
                                      (_, i) => i !== globalIndex
                                    ),
                                  }));

                                  setCurrentQuestionPage(1);
                                } catch (error) {
                                  alert("Failed to delete question");
                                  console.error(
                                    "Delete question error:",
                                    error
                                  );
                                }
                              }}
                            >
                              <Trash2 size={24} className="mx-auto" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentQuestionPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentQuestionPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Prev
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentQuestionPage((prev) =>
                        prev <
                        Math.ceil(lesson.questions.length / questionsPerPage)
                          ? prev + 1
                          : prev
                      )
                    }
                    disabled={
                      currentQuestionPage ===
                      Math.ceil(lesson.questions.length / questionsPerPage)
                    }
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "exercises" && (
            <>
              <div className="relative">
                <div className="sticky top-0 z-10 bg-white pb-2">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                      Edit Exercises
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({lesson.exercises.length} total)
                      </span>
                    </h2>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="bg-blue-500 text-white px-4 py-1 rounded"
                        onClick={() => {
                          setTempExercise({
                            question: "",
                            choices: ["", "", "", ""],
                            correctAnswer: "",
                            explanation: "",
                            difficulty: "EASY",
                            skillTag: "",
                          });
                          setEditExerciseIndex(null); // new item
                          setShowExerciseModal(true);
                        }}
                      >
                        + Add Exercise
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[calc(100vh-320px)]">
                  <table className="min-w-full table-auto border-collapse text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="sticky top-0 bg-gray-100 border px-3 py-2 z-10">
                          Question
                        </th>
                        <th className="sticky top-0 bg-gray-100 border px-3 py-2 z-10">
                          Choices
                        </th>
                        <th className="sticky top-0 bg-gray-100 border px-3 py-2 z-10">
                          Correct
                        </th>
                        <th className="sticky top-0 bg-gray-100 border px-3 py-2 z-10">
                          Explanation
                        </th>
                        <th className="sticky top-0 bg-gray-100 border px-3 py-2 z-10">
                          Difficulty
                        </th>
                        <th className="sticky top-0 bg-gray-100 border px-3 py-2 z-10">
                          Skill Tag
                        </th>
                        <th className="sticky top-0 bg-gray-100 border px-3 py-2 z-10 text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedExercises.map((ex, i) => {
                        const globalIndex =
                          (currentExercisePage - 1) * ExerciseitemsPerPage + i;
                        return (
                          <tr
                            key={globalIndex}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setTempExercise({
                                question: ex.question,
                                choices: [...ex.choices],
                                correctAnswer: ex.correctAnswer,
                                explanation: ex.explanation,
                                difficulty: ex.difficulty,
                                skillTag: ex.skillTag ?? "",
                              });
                              setEditExerciseIndex(globalIndex); // ✅ Correct full index
                              setShowExerciseModal(true);
                            }}
                          >
                            <td className="border px-3 py-2">
                              <InlineMath math={ex.question} />
                            </td>
                            <td className="border px-3 py-2">
                              {ex.choices.map((c, j) => (
                                <div key={j}>
                                  <InlineMath>{c}</InlineMath>
                                </div>
                              ))}
                            </td>
                            <td className="border px-3 py-2">
                              <InlineMath>{ex.correctAnswer}</InlineMath>
                            </td>
                            <td className="border px-3 py-2">
                              <InlineMath>{ex.explanation}</InlineMath>
                            </td>
                            <td className="border px-3 py-2">
                              {ex.difficulty}
                            </td>
                            <td className="border px-3 py-2">{ex.skillTag}</td>
                            <td
                              className="border px-3 py-2 text-center cursor-pointer text-red-400 hover:text-red-700 transition"
                              onClick={async (e) => {
                                e.stopPropagation(); // prevent row click

                                const confirmDelete = window.confirm(
                                  "Are you sure you want to delete this exercise?"
                                );
                                if (!confirmDelete) return;

                                const exerciseToDelete =
                                  lesson.exercises[globalIndex];
                                const token = localStorage.getItem("token");

                                try {
                                  await fetch(
                                    `${API_URL}/api/exercises/${exerciseToDelete.id}`,
                                    {
                                      method: "DELETE",
                                      headers: {
                                        Authorization: `Bearer ${token}`,
                                      },
                                    }
                                  );

                                  setLesson((prev) => ({
                                    ...prev,
                                    exercises: prev.exercises.filter(
                                      (_, idx) => idx !== globalIndex
                                    ),
                                  }));
                                } catch (error) {
                                  alert("Failed to delete exercise");
                                  console.error("Delete error:", error);
                                }
                              }}
                            >
                              <Trash2 size={24} className="mx-auto" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ✅ Add pagination controls here */}
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button" // ✅ Add this
                    onClick={() =>
                      setCurrentExercisePage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentExercisePage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Prev
                  </button>

                  <button
                    type="button" // ✅ Add this
                    onClick={() =>
                      setCurrentExercisePage((prev) =>
                        prev <
                        Math.ceil(
                          lesson.exercises.length / ExerciseitemsPerPage
                        )
                          ? prev + 1
                          : prev
                      )
                    }
                    disabled={
                      currentExercisePage ===
                      Math.ceil(lesson.exercises.length / ExerciseitemsPerPage)
                    }
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      </div>

      {/* QUESTION MODAL*/}
      <QuestionModal
        isOpen={showQuestionModal}
        onClose={() => {
          setShowQuestionModal(false);
          setEditQuestionIndex(null);
        }}
        editIndex={editQuestionIndex}
        initialData={tempQuestion}
        onSaveToServer={async (data, index) => {
          const token = localStorage.getItem("token");

          if (index !== null) {
            // 🟡 Update existing question
            const updated = [...lesson.questions];
            const questionId = lesson.questions[index].id;

            const res = await fetch(`${API_URL}/api/questions/${questionId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                ...data,
                isChoiceImage: false,
                questionImage: null,
              }),
            });

            const saved = await res.json();

            updated[index] = saved;
            setLesson((prev) => ({ ...prev, questions: updated }));
          } else {
            // 🟢 Create new question
            const res = await fetch(`${API_URL}/api/questions`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ ...data, lessonId: id }),
            });

            const saved = await res.json();

            setLesson((prev) => ({
              ...prev,
              questions: [...prev.questions, saved],
            }));
          }
        }}
      />

      {/* PAGES MODAL*/}
      <LessonPageModal
        isOpen={showPageModal}
        onClose={() => {
          setShowPageModal(false);
          setTempPage({ content: "", media: null });
          setEditPageIndex(null); // reset index
        }}
        tempPage={tempPage}
        setTempPage={setTempPage}
        editMode={editPageIndex !== null}
        onSave={() => {
          if (editPageIndex !== null) {
            const updatedPages = [...lesson.pages];
            updatedPages[editPageIndex] = {
              ...updatedPages[editPageIndex],
              content: tempPage.content,
              media: tempPage.media,
            };
            setLesson((prev) => ({ ...prev, pages: updatedPages }));
          } else {
            setLesson((prev) => ({
              ...prev,
              pages: [...prev.pages, { ...tempPage }],
            }));
          }
          setTempPage({ content: "", media: null });
          setShowPageModal(false);
          setEditPageIndex(null);
        }}
      />
      {/* EXERCISE MODAL*/}
      <ExerciseModal
        isOpen={showExerciseModal}
        onClose={() => {
          setShowExerciseModal(false);
          setEditExerciseIndex(null);
        }}
        editIndex={editExerciseIndex} // ✅ Pass it
        initialData={tempExercise}
        onSaveToServer={async (data, index) => {
          const token = localStorage.getItem("token");

          // Update existing exercise
          if (index !== null) {
            const updated = [...lesson.exercises];
            updated[index] = {
              ...updated[index],
              ...data,
            };
            setLesson((prev) => ({ ...prev, exercises: updated }));

            // 📨 Send PUT or PATCH to your backend
            await fetch(
              `${API_URL}/api/exercises/${lesson.exercises[index].id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updated[index]),
              }
            );
          } else {
            // Add new
            const newExercise = {
              ...data,
              difficulty: "EASY",
              skillTag: "",
            };

            const res = await fetch(`${API_URL}/api/exercise`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                ...newExercise,
                lessonId: id,
              }),
            });

            const saved = await res.json();

            // Update local state
            setLesson((prev) => ({
              ...prev,
              exercises: [...prev.exercises, saved],
            }));
          }
        }}
      />
    </div>
  );
}
