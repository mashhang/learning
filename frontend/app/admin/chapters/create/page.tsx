"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddChapter() {
  const [title, setTitle] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5001/api/chapters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token
      },
      body: JSON.stringify({ title }),
    });

    if (res.ok) {
      alert("Chapter created successfully!");
      router.push("/admin/chapters");
    } else {
      alert("Failed to create chapter");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add Chapter</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Chapter Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Save Chapter
        </button>
      </form>
    </div>
  );
}
