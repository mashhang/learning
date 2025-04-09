"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useSidebar } from "@/app/context/SidebarContext";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Import KaTeX styles
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";

type LessonPage = {
  content: string;
  media?: string | null;
};

type Lesson = {
  id: string;
  title: string;
  chapterId: string;
  pages: LessonPage[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function CurrentLesson() {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentPage, setCurrentPage] = useState(1); //
  const [totalPages, setTotalPages] = useState(1); //
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("id");
  const router = useRouter();
  const { isSidebarOpen, sidebarWidth } = useSidebar();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    const fetchLessons = async () => {
      const res = await fetch(`${API_URL}/api/lessons`);
      const data = await res.json();
      console.log("LESSONS:", data); // <-- Add this
      setLessons(data);

      const targetLesson = lessonId
        ? data.find((l: Lesson) => l.id === lessonId)
        : await fetch(
            `${API_URL}/api/user/${user.id}/top-priority-lesson`
          ).then((r) => r.json());

      const fullLesson = data.find((l: Lesson) => l.id === targetLesson.id);
      setLesson(fullLesson || null);

      setTotalPages(fullLesson?.pages?.length || 1);
    };
    fetchLessons();
  }, [lessonId, user]);

  useEffect(() => {
    if (!lesson || !user?.id) return;

    const updateProgress = async () => {
      const progress = parseFloat((currentPage / totalPages).toFixed(2));
      try {
        const res = await fetch(`${API_URL}/api/progress`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            lessonId: lesson.id,
            currentPage,
            totalPages,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          console.error("Progress update failed:", err.error);
        }
      } catch (err) {
        console.error("Network error while updating progress:", err);
      }
    };

    updateProgress();
  }, [currentPage, lesson, totalPages, user]);

  if (!lesson) {
    return <p className="text-center mt-5 text-lg">Loading lesson...</p>;
  }

  const currentIndex = lessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = lessons[currentIndex - 1];
  const nextLesson = lessons[currentIndex + 1];
  const contentToRender = lesson?.pages?.[currentPage - 1]?.content || "";
  // const pageMedia = lesson?.pages?.[currentPage - 1]?.media || null;
  let pageMedia = lesson?.pages?.[currentPage - 1]?.media || null;

  // ✅ Ensure no double URL prefix
  if (pageMedia?.startsWith("http") && pageMedia.includes(`${API_URL}`)) {
    pageMedia = pageMedia.replace(`${API_URL}${API_URL}`, `${API_URL}`);
  }

  return (
    <ProtectedRoute>
      <div
        className="transition-all duration-300 ease-in-out bg-[#EFEFEF] min-h-screen"
        style={{
          marginLeft: isSidebarOpen ? sidebarWidth : "0",
          width: isSidebarOpen ? `calc(100% - ${sidebarWidth})` : "100%",
        }}
      >
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-11 py-3 px-5 bg-[#D9D9D9]">
          {currentPage > 1 ? (
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="text-[13px] py-2 px-4 bg-[#30608E] text-white rounded-md"
            >
              Previous Page
            </button>
          ) : (
            <div className="py-2 px-12"></div>
          )}

          <h1 className="text-lg my-auto">{lesson.title}</h1>

          {currentPage < totalPages ? (
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              className="text-[13px] py-2 px-4 bg-[#30608E] text-white rounded-md"
            >
              Next Page
            </button>
          ) : (
            <div className="py-2 px-12"></div>
          )}
        </div>

        <div className="max-w-full mx-auto max-h-full bg-white">
          {/* ✅ Display Media (Image or Video) */}
          {pageMedia && (
            <div className="flex justify-center mb-6">
              {pageMedia.endsWith(".mp4") ? (
                <video controls className="max-w-full h-auto rounded-lg">
                  <source src={pageMedia} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <Image
                  src={pageMedia}
                  alt="Lesson Media"
                  width={800}
                  height={800}
                  className="w-full h-auto rounded-lg"
                  priority
                  unoptimized
                />
              )}
            </div>
          )}

          {/* Markdown Renderer */}
          <div className="prose max-w-none text-lg leading-relaxed">
            <ReactMarkdown
              children={contentToRender}
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                p: ({ node, children }) => (
                  <p className="text-gray-700 mb-4">{children}</p>
                ),
                strong: ({ node, children }) => (
                  <strong className="text-red-500">{children}</strong>
                ),
                em: ({ node, children }) => (
                  <em className="text-green-500">{children}</em>
                ),
                h1: ({ node, children }) => (
                  <h1 className="text-2xl font-bold">{children}</h1>
                ),
                h2: ({ node, children }) => (
                  <h2 className="text-xl font-bold mt-4">{children}</h2>
                ),
                blockquote: ({ node, children }) => (
                  <blockquote className="border-l-4 border-yellow-500 pl-4 italic bg-yellow-100 p-2">
                    {children}
                  </blockquote>
                ),
                pre: ({ node, children }) => (
                  <div className="bg-gray-100 p-4 rounded-md">{children}</div>
                ),
              }}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
