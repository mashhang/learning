"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AddLesson() {
  const [title, setTitle] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [chapters, setChapters] = useState<{ id: string; title: string }[]>([]);
  const [questions, setQuestions] = useState([
    {
      question: "",
      questionImage: null as File | null,
      choices: ["", "", "", ""],
      choiceImages: [null, null, null, null] as (File | null)[],
      isChoiceImage: false,
      correctAnswer: "",
    },
  ]);
  const router = useRouter();
  const [pages, setPages] = useState([
    { content: "", media: null as File | null },
  ]);

  const addPage = () => setPages([...pages, { content: "", media: null }]);

  const removePage = (index: number) =>
    setPages(pages.filter((_, i) => i !== index));

  useEffect(() => {
    fetch(`${API_URL}/api/chapters`)
      .then((res) => res.json())
      .then((data) => setChapters(data))
      .catch((error) => console.error("Error fetching chapters:", error));
  }, []);

  // ✅ Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMedia(e.target.files[0]);
    }
  };

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
      {
        question: "",
        questionImage: null as File | null,
        choices: ["", "", "", ""],
        choiceImages: [null, null, null, null] as (File | null)[],
        isChoiceImage: false,
        correctAnswer: "",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // ✅ Handle form submission
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

    // ✅ Use FormData to send text + file data
    const formData = new FormData();
    formData.append("title", title);
    // formData.append("content", content);
    formData.append("chapterId", chapterId);
    // if (media) formData.append("media", media);
    formData.append("questions", JSON.stringify(questions));
    const pagesWithFilename = pages.map((page, index) => ({
      content: page.content,
      order: index + 1,
      filename: page.media?.name || null,
    }));

    formData.append("pages", JSON.stringify(pagesWithFilename));

    pages.forEach((page) => {
      if (page.media) {
        formData.append("pageMedias", page.media);
      }
    });

    const res = await fetch(`${API_URL}/api/lessons`, {
      method: "POST",
      headers: {
        // "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ Still needs auth, but no 'Content-Type'
      },
      body: formData, // ✅ Send as FormData
      // JSON.stringify({ title, content, chapterId, questions }),
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

        <h2 className="text-xl font-bold mt-4">Lesson Pages</h2>
        <input
          type="text"
          placeholder="Lesson Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        {pages.map((page, i) => (
          <div key={i} className="border p-4 mb-4 rounded">
            <label className="block mb-1 font-medium">
              Page {i + 1} Content
            </label>

            <textarea
              value={page.content}
              onChange={(e) => {
                const updated = [...pages];
                updated[i].content = e.target.value;
                setPages(updated);
              }}
              className="border p-2 w-full mb-2"
              placeholder="Page Content"
            />

            <label className="block mb-1 font-medium">Optional Media</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => {
                const updated = [...pages];
                updated[i].media = e.target.files?.[0] || null;
                setPages(updated);
              }}
              className="border p-2 w-full mb-2"
            />

            <button
              type="button"
              className="text-red-500"
              onClick={() => removePage(i)}
            >
              Remove Page
            </button>
          </div>
        ))}
        <button
          type="button"
          className="bg-blue-500 text-white p-2 rounded mb-4"
          onClick={addPage}
        >
          + Add Page
        </button>

        {/* ORIGNAKL FORMMMMMMMMMMMMMMMMMMMMMMM */}
        {/* <input
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
          className="border p-2 w-full mb-2 h-80"
        />

        {/* ✅ File Upload Field 
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="border p-2 w-full mb-2"
        /> */}

        {/* ✅ Questions Section */}
        <h2 className="text-xl font-bold mt-4">Questions</h2>
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="border p-4 mb-4 rounded">
            {/* Toggle for text/image choices */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={q.isChoiceImage}
                onChange={(e) => {
                  setQuestions((prev) => {
                    const updated = [...prev];
                    updated[qIndex].isChoiceImage = e.target.checked;
                    return updated;
                  });
                }}
              />
              Use image choices
            </label>

            {/* Question Text or Image Upload */}
            {!q.questionImage ? (
              <>
                <input
                  type="text"
                  placeholder="Enter question with LaTeX (e.g. \\frac{1}{3})"
                  value={q.question}
                  onChange={(e) =>
                    handleQuestionChange(qIndex, "question", e.target.value)
                  }
                  className="border p-2 w-full"
                />
                <div className="bg-gray-100 p-2 rounded mb-2">
                  <InlineMath>{q.question}</InlineMath>
                </div>
              </>
            ) : (
              <img
                src={URL.createObjectURL(q.questionImage)}
                alt="Preview"
                className="mb-2"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setQuestions((prev) => {
                  const updated = [...prev];
                  updated[qIndex].questionImage = file || null;
                  return updated;
                });
              }}
              className="border p-2 w-full mb-2"
            />

            {/* Choices */}
            {q.choices.map((choice, cIndex) =>
              q.isChoiceImage ? (
                <input
                  type="file"
                  accept="image/*"
                  key={cIndex}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setQuestions((prev) => {
                      const updated = [...prev];
                      updated[qIndex].choiceImages[cIndex] = file;
                      return updated;
                    });
                  }}
                  className="border p-2 w-full mb-2"
                />
              ) : (
                <div className="key={cIndex} mb-2">
                  <input
                    type="text"
                    placeholder={`Choice ${cIndex + 1}`}
                    value={choice}
                    onChange={(e) =>
                      handleChoiceChange(qIndex, cIndex, e.target.value)
                    }
                    className="border p-2 w-full "
                  />
                  <div className="bg-gray-100 p-2 rounded mb-5">
                    <InlineMath>{choice}</InlineMath>
                  </div>
                </div>
              )
            )}

            <>
              <input
                type="text"
                placeholder="Correct Answer"
                value={q.correctAnswer}
                onChange={(e) =>
                  handleQuestionChange(qIndex, "correctAnswer", e.target.value)
                }
                className="border p-2 w-full"
              />
              <div className="bg-gray-100 p-2 rounded mb-2">
                <InlineMath>{q.correctAnswer}</InlineMath>
              </div>
            </>

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
