"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

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
    questions: [] as Question[],
  });

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:5001/api/lessons/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setLesson({
            ...data,
            questions: data.questions ? data.questions : [], // ✅ Ensure questions is an array
          });
        } else {
          alert("Lesson not found.");
          router.push("/admin/lessons");
        }
      })
      .catch((err) => console.error("Failed to load lesson:", err));
  }, [id]);

  const handleLessonChange = (field: keyof typeof lesson, value: string) => {
    setLesson({ ...lesson, [field]: value });
  };

  const handleQuestionChange = (
    qIndex: number,
    field: keyof Question,
    value: string
  ) => {
    const updatedQuestions = [...lesson.questions];

    if (field === "choices") {
      console.error("Use handleChoiceChange instead for choices.");
      return;
    }

    updatedQuestions[qIndex][field] = value;
    setLesson({ ...lesson, questions: updatedQuestions });
  };

  const handleChoiceChange = (
    qIndex: number,
    cIndex: number,
    value: string
  ) => {
    const updatedQuestions = [...lesson.questions];
    updatedQuestions[qIndex].choices = [...updatedQuestions[qIndex].choices];
    updatedQuestions[qIndex].choices[cIndex] = value;

    setLesson({ ...lesson, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setLesson({
      ...lesson,
      questions: [
        ...lesson.questions,
        { id: "", question: "", choices: ["", "", "", ""], correctAnswer: "" },
      ],
    });
  };

  const removeQuestion = (qIndex: number) => {
    const updatedQuestions = lesson.questions.filter(
      (_, index) => index !== qIndex
    );
    setLesson({ ...lesson, questions: updatedQuestions });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5001/api/lessons/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(lesson),
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
      <form onSubmit={handleUpdate}>
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
          className="border p-2 w-full mb-2"
          placeholder="Lesson Content"
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
