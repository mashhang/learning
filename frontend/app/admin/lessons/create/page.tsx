"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddLesson() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [chapterId, setChapterId] = useState(""); // ✅ Ensure chapterId is selected
  const [chapters, setChapters] = useState<{ id: string; title: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    // ✅ Fetch all available chapters
    fetch("http://localhost:5001/api/chapters")
      .then((res) => res.json())
      .then((data) => setChapters(data))
      .catch((error) => console.error("Error fetching chapters:", error));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Ensure a chapter is selected before proceeding
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
      body: JSON.stringify({ title, content, chapterId }), // ✅ Include chapterId
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

        {/* ✅ Add Chapter Selection */}
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

        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Save Lesson
        </button>
      </form>
    </div>
  );
}
