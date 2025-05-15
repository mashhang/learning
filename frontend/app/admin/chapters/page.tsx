"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import API_URL from "@/lib/getApiUrl";
import { useSidebar } from "@/app/context/SidebarContext";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function ChaptersAdmin() {
  const [chapters, setChapters] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/chapters`) // ✅ Fetch from backend
      .then((res) => res.json())
      .then((data) => setChapters(data))
      .catch((error) => console.error("Error fetching chapters:", error));
  }, []);

  const { isSidebarOpen, sidebarWidth } = useSidebar();
  const [screenWidth, setScreenWidth] = useState(0);
  return (
    <div
      className="transition-all duration-300 ease-in-out h-screen"
      style={{
        marginLeft:
          typeof window !== "undefined" &&
          window.innerWidth >= 768 &&
          isSidebarOpen
            ? "224px" // Tailwind's w-56 (14rem)
            : "0",
        width:
          typeof window !== "undefined" &&
          window.innerWidth >= 768 &&
          isSidebarOpen
            ? "calc(100% - 224px)"
            : "100%",
      }}
    >
      <div className="p-8 my-4">
        <h1 className="text-2xl font-bold mb-4">Manage Chapters</h1>
        <Link
          href="/admin/chapters/create"
          className="bg-blue-500 text-white p-2 rounded"
        >
          Add Chapter
        </Link>
        <table className="bg-white mt-4 w-full border">
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
    </div>
  );
}
