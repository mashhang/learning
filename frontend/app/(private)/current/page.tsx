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

type Lesson = {
  id: string;
  title: string;
  content: string; // Markdown content
  media?: string;
  chapterId: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function CurrentLesson() {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("id");
  const router = useRouter();
  const { isSidebarOpen, sidebarWidth } = useSidebar();

  useEffect(() => {
    fetch(`${API_URL}/api/lessons`)
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
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-11 py-3 px-5 bg-[#D9D9D9]">
          {lessons[lessons.findIndex((l) => l.id === lesson.id) - 1] ? (
            <button
              onClick={() =>
                router.push(
                  `/current?id=${
                    lessons[lessons.findIndex((l) => l.id === lesson.id) - 1].id
                  }`
                )
              }
              className="text-[13px] py-2 px-4 bg-[#30608E] text-white rounded-md"
            >
              Previous Lesson
            </button>
          ) : (
            <div className="py-2 px-12"></div>
          )}
          <h1 className="text-lg my-auto">{lesson.title}</h1>

          {lessons[lessons.findIndex((l) => l.id === lesson.id) + 1] ? (
            <button
              onClick={() =>
                router.push(
                  `/current?id=${
                    lessons[lessons.findIndex((l) => l.id === lesson.id) + 1].id
                  }`
                )
              }
              className="text-[13px] py-2 px-4 bg-[#30608E] text-white rounded-md"
            >
              Next Lesson
            </button>
          ) : (
            <div></div>
          )}
        </div>

        <div className="max-w-full mx-auto max-h-full bg-white">
          {/* ✅ Display Media (Image or Video) */}
          {lesson.media && (
            <div className="flex justify-center mb-6">
              {lesson.media.endsWith(".mp4") ? (
                <video controls className="max-w-full h-auto rounded-lg">
                  <source src={`${API_URL}${lesson.media}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                // <img
                //   src={`${API_URL}${lesson.media}`}
                //   // width={100}
                //   // height={100}
                //   alt="Lesson Media"
                //   className="w-full h-auto rounded-lg"
                //   draggable="false"
                //   // priority
                // />
                <Image
                  src={lesson.media}
                  alt="Lesson Media"
                  width={800} // ✅ Set width
                  height={800} // ✅ Set height
                  className="w-full h-auto rounded-lg"
                  priority // ✅ Improve LCP by prioritizing image loading
                  unoptimized={true}
                />
              )}
            </div>
          )}

          {/* Markdown Renderer */}
          <div className="prose max-w-none text-lg leading-relaxed">
            <ReactMarkdown
              children={lesson.content}
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
