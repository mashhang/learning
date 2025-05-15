"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import API_URL from "@/lib/getApiUrl";
import { toast } from "sonner";
import DeleteLessonButton from "@/components/DeleteLessonButton";
import { useSidebar } from "@/app/context/SidebarContext";

// const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LessonsAdmin() {
  const { isSidebarOpen, sidebarWidth } = useSidebar();
  const [screenWidth, setScreenWidth] = useState(0);

  const { token } = useAuth();
  const [lessons, setLessons] = useState<
    {
      id: string;
      title: string;
      chapterId: string;
      chapterTitle: string;
      status: string;
      questionCount: number;
      pageCount: number;
      exerciseCount: number;
    }[]
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

  // Store selected chapter in local storage
  useEffect(() => {
    const storedChapter = localStorage.getItem("selectedChapter");
    if (storedChapter) {
      setSelectedChapter(storedChapter);
    }
  }, []);

  const handleChapterChange = (value: string) => {
    setSelectedChapter(value);
    localStorage.setItem("selectedChapter", value);
  };

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
        <h1 className="text-2xl font-bold mb-4">Manage Lessons</h1>
        <div className="flex justify-between items-center">
          {/* Chapter Selection Dropdown */}
          <div className="flex items-center space-x-2">
            <p>Select Chapter:</p>
            <select
              className="bg-#9b9b9b-500 text-black p-2 rounded cursor-pointer shadow-sm"
              value={selectedChapter}
              onChange={(e) => handleChapterChange(e.target.value)}
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
        <table className="bg-white mt-4 w-full border border-collapse">
          <thead>
            <tr className="border bg-gray-200">
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-center w-32">Chapter</th>
              <th className="p-2 text-center w-24">Pages</th>
              <th className="p-2 text-center w-24">Questions</th>
              <th className="p-2 text-center w-24">Exercises</th>
              <th className="p-2 text-center w-28">Status</th>{" "}
              {/* ✅ Add this */}
              <th className="p-2 text-center w-24">Actions</th>
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
                <tr
                  key={lesson.id}
                  className="border cursor-pointer hover:bg-gray-100"
                  onClick={() =>
                    (window.location.href = `/admin/lessons/${lesson.id}`)
                  }
                >
                  <td className="p-2 border">{lesson.title}</td>
                  <td className="p-2 text-center border">
                    {lesson.chapterTitle}
                  </td>
                  <td className="p-2 text-center border">{lesson.pageCount}</td>
                  <td className="p-2 text-center border">
                    {lesson.questionCount}
                  </td>
                  <td className="p-2 text-center border">
                    {lesson.exerciseCount}
                  </td>
                  <td className="p-2 text-center border">
                    {lesson.status === "published" ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                        🟢 Published
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm">
                        📝 Draft
                      </span>
                    )}
                  </td>
                  <td
                    className="p-1 text-center align-middle border"
                    onClick={(e) => e.stopPropagation()} // prevent triggering row click
                  >
                    <div className="flex justify-center items-center space-x-2">
                      {/* <Link
                      href={`/admin/lessons/${lesson.id}/exercises`}
                      className="text-green-600 ml-2"
                      >
                      Exercises
                      </Link> */}

                      <DeleteLessonButton
                        lesson={lesson}
                        token={token}
                        setLessons={setLessons}
                      />
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
