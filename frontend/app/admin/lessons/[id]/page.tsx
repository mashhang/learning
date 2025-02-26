"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditLesson() {
  const router = useRouter();
  const { id } = useParams(); // ✅ Get the lesson ID from the URL
  const [lesson, setLesson] = useState({ title: "", content: "" });

  // ✅ Fetch lesson details when the page loads
  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:5001/api/lessons/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setLesson(data);
        } else {
          alert("Lesson not found.");
          router.push("/admin/lessons");
        }
      })
      .catch((err) => console.error("Failed to load lesson:", err));
  }, [id]);

  // ✅ Update lesson details
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token"); // ✅ Retrieve token

    const res = await fetch(`http://localhost:5001/api/lessons/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ Include token
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
          onChange={(e) => setLesson({ ...lesson, title: e.target.value })}
          className="border p-2 w-full mb-2"
          placeholder="Lesson Title"
        />
        <textarea
          value={lesson.content}
          onChange={(e) => setLesson({ ...lesson, content: e.target.value })}
          className="border p-2 w-full mb-2"
          placeholder="Lesson Content"
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Update Lesson
        </button>
      </form>
    </div>
  );
}
