"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function DeleteLesson() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // Get lesson ID from URL query params
  const [lessonTitle, setLessonTitle] = useState("");

  useEffect(() => {
    if (!id) return;

    // Fetch lesson details before deletion
    fetch(`http://localhost:5001/api/lessons/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert("Lesson not found!");
          router.push("/admin/lessons");
        } else {
          setLessonTitle(data.title);
        }
      })
      .catch((error) => console.error("Error fetching lesson:", error));
  }, [id, router]);

  const handleDelete = async () => {
    if (!id) return;

    const confirmDelete = confirm(
      `Are you sure you want to delete "${lessonTitle}"?`
    );
    if (!confirmDelete) return;

    // ✅ Retrieve token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized: No token found. Please log in again.");
      router.push("/login");
      return;
    }

    const res = await fetch(`http://localhost:5001/api/lessons/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ Send token in request header
      },
    });

    if (res.ok) {
      alert("Lesson deleted successfully!");
      router.push("/admin/lessons"); // Redirect after delete
    } else {
      const errorData = await res.json();
      alert(`Failed to delete lesson: ${errorData.error}`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Delete Lesson</h1>
      <p>
        Are you sure you want to delete <strong>{lessonTitle}</strong>?
      </p>
      <div className="mt-4">
        <button
          className="bg-red-600 text-white p-2 rounded mr-2"
          onClick={handleDelete}
        >
          Yes, Delete
        </button>
        <button
          className="bg-gray-400 text-white p-2 rounded"
          onClick={() => router.push("/admin/lessons")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
