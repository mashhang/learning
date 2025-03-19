"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LessonsAdmin() {
  const { token } = useAuth();
  const [lessons, setLessons] = useState<
    { id: string; title: string; chapterId: string; chapterTitle: string }[]
  >([]);
  const [chapters, setChapters] = useState<{ id: string; title: string }[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>("All");

  //Fetch Lessons
  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/api/lessons`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setLessons(data))
      .catch((error) => console.error("Error fetching lessons:", error));
  }, [token]);

  // Fetch chapters for dropdown
  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/api/chapters`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setChapters(data))
      .catch((error) => console.error("Error fetching chapters:", error));
  }, [token]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Lessons</h1>
      <div className="flex justify-between items-center">
        {/* Chapter Selection Dropdown */}
        <div className="flex items-center space-x-2">
          <p>Select Chapter:</p>
          <select
            className="bg-#9b9b9b-500 text-black p-2 rounded cursor-pointer shadow-sm"
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
          >
            <option value="All">All</option>
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.title}
              </option>
            ))}
          </select>
        </div>
        <Link
          href="/admin/lessons/create"
          className="bg-blue-500 text-white p-2 rounded shadow-sm"
        >
          Add Lesson
        </Link>
      </div>

      {/* Lessons Table */}
      <table className="mt-4 w-full border border-collapse">
        <thead>
          <tr className="border bg-gray-200">
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Chapter</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {lessons
            .filter(
              (lesson) =>
                selectedChapter === "All" ||
                lesson.chapterId === selectedChapter
            )
            .map((lesson) => (
              <tr key={lesson.id} className="border ">
                <td className="p-2 border">{lesson.title}</td>
                <td className="p-2 text-left border">{lesson.chapterTitle}</td>
                <td className="p-2 text-left border">
                  <Link
                    href={`/admin/lessons/${lesson.id}`}
                    className="text-blue-600"
                  >
                    Edit
                  </Link>{" "}
                  |
                  <Link
                    href={`/admin/lessons/delete?id=${lesson.id}`}
                    className="text-red-600 ml-2"
                  >
                    Delete
                  </Link>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
