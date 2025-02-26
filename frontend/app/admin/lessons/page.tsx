"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

export default function LessonsAdmin() {
  const { token } = useAuth();
  const [lessons, setLessons] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:5001/api/lessons", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setLessons(data))
      .catch((error) => console.error("Error fetching lessons:", error));
  }, [token]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Lessons</h1>
      <Link
        href="/admin/lessons/create"
        className="bg-blue-500 text-white p-2 rounded"
      >
        Add Lesson
      </Link>
      <table className="mt-4 w-full border">
        <thead>
          <tr className="border-b">
            <th className="p-2">Title</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((lesson) => (
            <tr key={lesson.id} className="border-b">
              <td className="p-2">{lesson.title}</td>
              <td className="p-2">
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
