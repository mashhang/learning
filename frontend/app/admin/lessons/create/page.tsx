"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddLesson() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [chapters, setChapters] = useState<{ id: string; title: string }[]>([]);
  const [questions, setQuestions] = useState([
    { question: "", choices: ["", "", "", ""], correctAnswer: "" },
  ]);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:5001/api/chapters")
      .then((res) => res.json())
      .then((data) => setChapters(data))
      .catch((error) => console.error("Error fetching chapters:", error));
  }, []);

  // ✅ Handle question field updates
  const handleQuestionChange = (
    index: number,
    field: "question" | "correctAnswer",
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value; // ✅ Direct assignment for string fields
    setQuestions(newQuestions);
  };

  // ✅ Handle choices updates separately
  const handleChoiceChange = (
    qIndex: number,
    cIndex: number,
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].choices[cIndex] = value; // ✅ Assign to the correct index in the array
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", choices: ["", "", "", ""], correctAnswer: "" },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!chapterId) {
      alert("Please select a chapter before adding a lesson.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized: Please log in again.");
      return;
    }

    const res = await fetch("http://localhost:5001/api/lessons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content, chapterId, questions }),
    });

    if (res.ok) {
      alert("Lesson created successfully!");
      router.push("/admin/lessons");
    } else {
      alert("Failed to create lesson");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add Lesson</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Lesson Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <textarea
          placeholder="Lesson Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border p-2 w-full mb-2"
        />

        {/* ✅ Select Chapter */}
        <select
          value={chapterId}
          onChange={(e) => setChapterId(e.target.value)}
          className="border p-2 w-full mb-2"
        >
          <option value="">Select Chapter</option>
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.title}
            </option>
          ))}
        </select>

        {/* ✅ Questions Section */}
        <h2 className="text-xl font-bold mt-4">Questions</h2>
        {questions.map((q, qIndex) => (
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
          Save Lesson
        </button>
      </form>
    </div>
  );
}
