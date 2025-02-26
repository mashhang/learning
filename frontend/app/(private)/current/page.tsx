"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useSidebar } from "@/app/context/SidebarContext";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Import KaTeX styles

type Lesson = {
  id: string;
  title: string;
  content: string; // Markdown content
  chapterId: string;
};

export default function CurrentLesson() {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("id");
  const router = useRouter();
  const { isSidebarOpen, sidebarWidth } = useSidebar();

  useEffect(() => {
    fetch("http://localhost:5001/api/lessons")
      .then((res) => res.json())
      .then((data) => {
        setLessons(data);
        const currentLesson = data.find((l: Lesson) => l.id === lessonId);
        setLesson(currentLesson || null);
      })
      .catch((error) => console.error("Error fetching lessons:", error));
  }, [lessonId, router]);

  if (!lesson) {
    return <p className="text-center mt-5 text-lg">Loading lesson...</p>;
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
        <div className="max-w-[90%] mx-auto mt-8 p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-center my-4">
            {lesson.title}
          </h1>
          {/*  */}
          {/* Markdown Renderer */}
          <div className="prose max-w-none text-lg leading-relaxed">
            <ReactMarkdown
              children={lesson.content}
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                p: ({ node, children }) => (
                  <p className="text-gray-700">{children}</p>
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

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {lessons[lessons.findIndex((l) => l.id === lesson.id) - 1] ? (
              <button
                onClick={() =>
                  router.push(
                    `/current?id=${
                      lessons[lessons.findIndex((l) => l.id === lesson.id) - 1]
                        .id
                    }`
                  )
                }
                className="text-[14px] py-2 px-4 bg-[#30608E] text-white rounded-md"
              >
                Previous Lesson
              </button>
            ) : (
              <div></div>
            )}

            {lessons[lessons.findIndex((l) => l.id === lesson.id) + 1] ? (
              <button
                onClick={() =>
                  router.push(
                    `/current?id=${
                      lessons[lessons.findIndex((l) => l.id === lesson.id) + 1]
                        .id
                    }`
                  )
                }
                className="text-[14px] py-2 px-4 bg-[#30608E] text-white rounded-md"
              >
                Next Lesson
              </button>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
