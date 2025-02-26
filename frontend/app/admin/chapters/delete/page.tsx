"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function DeleteChapter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // ✅ Get chapter ID from URL params
  const [chapterTitle, setChapterTitle] = useState("");

  useEffect(() => {
    if (!id) return;

    // ✅ Fetch chapter details
    fetch(`http://localhost:5001/api/chapters/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert("Chapter not found!");
          router.push("/admin/chapters");
        } else {
          setChapterTitle(data.title);
        }
      })
      .catch((error) => console.error("Error fetching chapter:", error));
  }, [id, router]);

  const handleDelete = async () => {
    if (!id) return;

    const confirmDelete = confirm(
      `Are you sure you want to delete "${chapterTitle}"?`
    );
    if (!confirmDelete) return;

    // ✅ Retrieve token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized: No token found. Please log in again.");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5001/api/chapters/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Send token in request header
        },
      });

      // ✅ Check if the response is JSON
      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        console.error("Response is not valid JSON", jsonError);
        alert("Unexpected error occurred. Try again.");
        return;
      }

      if (!res.ok) {
        alert(`Failed to delete chapter: ${data.error || "Unknown error"}`);
      } else {
        alert("Chapter deleted successfully!");
        router.push("/admin/chapters"); // Redirect after delete
      }
    } catch (error) {
      console.error("Error deleting chapter:", error);
      alert("An error occurred while deleting the chapter.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Delete Chapter</h1>
      <p>
        Are you sure you want to delete <strong>{chapterTitle}</strong>?
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
          onClick={() => router.push("/admin/chapters")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
