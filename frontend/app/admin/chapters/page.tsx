"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ChaptersAdmin() {
  const [chapters, setChapters] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/chapters`) // ✅ Fetch from backend
      .then((res) => res.json())
      .then((data) => setChapters(data))
      .catch((error) => console.error("Error fetching chapters:", error));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Chapters</h1>
      <Link
        href="/admin/chapters/create"
        className="bg-blue-500 text-white p-2 rounded"
      >
        Add Chapter
      </Link>
      <table className="mt-4 w-full border border-collapse">
        <thead>
          <tr className="border bg-gray-200">
            <th className="p-2">Title</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {chapters.map((chapter) => (
            <tr key={chapter.id} className="border">
              <td className="p-2 border pl-5">{chapter.title}</td>
              <td className="p-2 border pl-5">
                <Link
                  href={`/admin/chapters/${chapter.id}`}
                  className="text-blue-600"
                >
                  Edit
                </Link>{" "}
                |
                <Link
                  href={`/admin/chapters/delete?id=${chapter.id}`}
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
