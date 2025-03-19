"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type Question = {
  id: string;
  question: string;
  choices: string[];
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

  useEffect(() => {
    if (!id) return;

    fetch(`${API_URL}/api/lessons/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setLesson({
            title: data.title || "",
            content: data.content || "",
            chapterId: data.chapterId || "",
            media: data.media || "", // ✅ Load existing media file
            questions: Array.isArray(data.questions) ? data.questions : [], // ✅ Ensure it's an array
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

    const formData = {
      title: lesson.title,
      content: lesson.content,
      questions: lesson.questions.map((q) => ({
        id: q.id,
        question: q.question,
        choices: q.choices,
        correctAnswer: q.correctAnswer,
      })),
    };

    const res = await fetch(`${API_URL}/api/lessons/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
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
                <source
                  src={`http://localhost:5001${lesson.media}`}
                  type="video/mp4"
                />
              </video>
            ) : (
              <img
                src={`http://localhost:5001${lesson.media}`}
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
            <input
              type="text"
              placeholder="Enter Question"
              value={q.question}
              onChange={(e) =>
                handleQuestionChange(qIndex, "question", e.target.value)
              }
              className="border p-2 w-full mb-2"
            />

            {q.choices.map((choice, cIndex) => (
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
            ))}

            <input
              type="text"
              placeholder="Correct Answer"
              value={q.correctAnswer}
              onChange={(e) =>
                handleQuestionChange(qIndex, "correctAnswer", e.target.value)
              }
              className="border p-2 w-full mb-2"
            />

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
