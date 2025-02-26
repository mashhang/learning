"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function UpdateChapter() {
  const router = useRouter();
  const { id } = useParams();
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:5001/api/chapters/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert("Chapter not found!");
          router.push("/admin/chapters");
        } else {
          setTitle(data.title);
        }
      })
      .catch((error) => console.error("Error fetching chapter:", error));
  }, [id, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized: No token found. Please log in again.");
      router.push("/login");
      return;
    }

    const res = await fetch(`http://localhost:5001/api/chapters/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });

    if (res.ok) {
      alert("Chapter updated successfully!");
      router.push("/admin/chapters");
    } else {
      const errorData = await res.json();
      alert(`Failed to update chapter: ${errorData.error}`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Chapter</h1>
      <form onSubmit={handleUpdate}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full mb-2"
          placeholder="Chapter Title"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Update Chapter
        </button>
      </form>
    </div>
  );
}
