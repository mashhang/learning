"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type Question = {
  id: string;
  question: string;
  questionImage?: File | null;
  choices: string[];
  choiceImages?: (File | null)[];
  isChoiceImage?: boolean;
  correctAnswer: string;
};

export default function EditLesson() {
  const router = useRouter();
  const { id } = useParams();

  const [lesson, setLesson] = useState({
    title: "",
    content: "",
    chapterId: "",
    media: "", // ✅ Keep existing media file
    questions: [] as Question[],
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null); // ✅ Track file upload
  const [chapters, setChapters] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    if (!id) return;

    // Fetch all chapters
    fetch(`${API_URL}/api/chapters`)
      .then((res) => res.json())
      .then((data) => setChapters(data))
      .catch((error) => console.error("Error fetching chapters:", error));

    fetch(`${API_URL}/api/lessons/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setLesson({
            title: data.title || "",
            content: data.content || "",
            chapterId: data.chapterId || "",
            media: data.media || "",
            questions: Array.isArray(data.questions)
              ? data.questions.map((q: any) => ({
                  ...q,
                  isChoiceImage: q.choices.some((c: string) =>
                    c.startsWith("/uploads/")
                  ),
                  questionImage:
                    typeof q.question === "string" &&
                    q.question.startsWith("/uploads/")
                      ? q.question
                      : null,

                  choiceImages: q.choices.map((c: string) =>
                    c.startsWith("/uploads/") ? c : null
                  ),
                }))
              : [],
          });
        } else {
          alert("Lesson not found.");
          router.push("/admin/lessons");
        }
      })
      .catch((err) => console.error("Failed to load lesson:", err));
  }, [id]);

  const handleLessonChange = (field: keyof typeof lesson, value: string) => {
    setLesson((prevLesson) => ({
      ...prevLesson,
      [field]: value,
      media: prevLesson.media, // ✅ Preserve existing file
      questions: prevLesson.questions, // ✅ Preserve existing questions
    }));
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
    formData.append("content", lesson.content);
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Lesson</h1>
      <form onSubmit={handleUpdate} encType="multipart/form-data">
        <input
          type="text"
          value={lesson.title}
          onChange={(e) => handleLessonChange("title", e.target.value)}
          className="border p-2 w-full mb-2"
          placeholder="Lesson Title"
        />
        <select
          value={lesson.chapterId}
          onChange={(e) =>
            setLesson((prev) => ({ ...prev, chapterId: e.target.value }))
          }
          className="border p-2 w-full mb-2"
        >
          <option value="">Select Chapter</option>
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.title}
            </option>
          ))}
        </select>
        <textarea
          value={lesson.content}
          onChange={(e) => handleLessonChange("content", e.target.value)}
          className="border p-2 w-full mb-2 h-80"
          placeholder="Lesson Content"
        />

        {/* ✅ Display existing file */}
        {lesson.media && (
          <div className="mb-4">
            <p>Current Media:</p>
            {lesson.media.endsWith(".mp4") ? (
              <video controls className="w-full">
                <source src={`${API_URL}${lesson.media}`} type="video/mp4" />
              </video>
            ) : (
              <img
                src={`${API_URL}${lesson.media}`}
                alt="Lesson media"
                className="max-w-4xl"
              />
            )}
          </div>
        )}

        {/* ✅ File input */}
        <input
          type="file"
          onChange={handleFileChange}
          className="border p-2 w-full mb-2"
        />

        <h2 className="text-xl font-bold mt-4">Edit Questions</h2>
        {lesson.questions.map((q, qIndex) => (
          <div key={qIndex} className="border p-4 mb-4 rounded">
            {/* Toggle image or text for choices */}
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={q.isChoiceImage || false}
                onChange={(e) =>
                  setLesson((prev) => {
                    const updated = { ...prev };
                    const question = updated.questions[qIndex];

                    // ✅ Initialize choiceImages if toggled to true
                    question.isChoiceImage = e.target.checked;
                    if (e.target.checked && !question.choiceImages) {
                      question.choiceImages = [null, null, null, null]; // or based on number of choices
                    }

                    return updated;
                  })
                }
              />
              Use image choices
            </label>

            {/* Question Text or Image */}
            {!q.questionImage ? (
              <input
                type="text"
                placeholder="Enter Question"
                value={q.question}
                onChange={(e) =>
                  handleQuestionChange(qIndex, "question", e.target.value)
                }
                className="border p-2 w-full mb-2"
              />
            ) : (
              <img
                src={URL.createObjectURL(q.questionImage)}
                alt="Preview"
                className="w-48 mb-2"
              />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setLesson((prev) => {
                  const updated = { ...prev };
                  updated.questions[qIndex].questionImage = file || null;
                  return updated;
                });
              }}
              className="border p-2 w-full mb-2"
            />

            {/* Answer Choices */}
            {q.choices.map((choice, cIndex) => {
              if (q.isChoiceImage) {
                const imgFile = q.choiceImages?.[cIndex];

                return (
                  <div key={cIndex} className="flex items-center gap-4 mb-2">
                    <input
                      type="radio"
                      name={`correctImage-${qIndex}`}
                      onChange={() =>
                        handleQuestionChange(
                          qIndex,
                          "correctAnswer",
                          `image-${cIndex}`
                        )
                      }
                      checked={q.correctAnswer === `image-${cIndex}`}
                    />

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setLesson((prev) => {
                          const updated = { ...prev };
                          if (!updated.questions[qIndex].choiceImages) {
                            updated.questions[qIndex].choiceImages = [];
                          }
                          updated.questions[qIndex].choiceImages![cIndex] =
                            file;
                          return updated;
                        });
                      }}
                      className="border p-2"
                    />

                    {imgFile && (
                      <img
                        src={
                          typeof imgFile === "string"
                            ? `${API_URL}${imgFile}`
                            : URL.createObjectURL(imgFile)
                        }
                        alt={`Choice ${cIndex + 1}`}
                        className="w-20 h-20 rounded border"
                      />
                    )}
                  </div>
                );
              } else {
                return (
                  <input
                    key={cIndex}
                    type="text"
                    placeholder={`Choice ${cIndex + 1}`}
                    value={choice}
                    onChange={(e) =>
                      handleChoiceChange(qIndex, cIndex, e.target.value)
                    }
                    className="border p-2 w-full mb-2"
                  />
                );
              }
            })}

            {/* Correct Answer */}
            {!q.isChoiceImage && (
              <input
                type="text"
                placeholder="Correct Answer"
                value={q.correctAnswer}
                onChange={(e) =>
                  handleQuestionChange(qIndex, "correctAnswer", e.target.value)
                }
                className="border p-2 w-full mb-2"
              />
            )}

            {/* Render correct image selector (if image choices enabled) */}
            {/* {q.isChoiceImage &&
              q.choiceImages?.map((img, cIndex) => (
                <div key={cIndex} className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name={`correctImage-${qIndex}`}
                    onChange={() =>
                      handleQuestionChange(
                        qIndex,
                        "correctAnswer",
                        `image-${cIndex}`
                      )
                    }
                    checked={q.correctAnswer === `image-${cIndex}`}
                  />
                  {img && (
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`Choice ${cIndex + 1}`}
                      className="w-24 h-auto rounded border"
                    />
                  )}
                </div>
              ))} */}

            <button
              type="button"
              onClick={() => removeQuestion(qIndex)}
              className="bg-red-500 text-white p-2 rounded"
            >
              Remove Question
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="bg-blue-500 text-white p-2 rounded mb-4"
        >
          + Add Question
        </button>

        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Update Lesson
        </button>
      </form>
    </div>
  );
}
