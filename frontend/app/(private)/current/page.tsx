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
  const [currentPage, setCurrentPage] = useState(1); //
  const [totalPages, setTotalPages] = useState(1); //
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("id");
  const router = useRouter();
  const { isSidebarOpen, sidebarWidth } = useSidebar();
  const { user } = useAuth();

  // useEffect(() => {
  //   if (!user?.id) return;

  //   fetch(
  //     `${process.env.NEXT_PUBLIC_API_URL}/api/user/${user.id}/top-priority-lesson`
  //   )
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setLesson(data);
  //       setLessons([data]); // optional, if you still want next/prev support
  //     })
  //     .catch((error) => console.error("Failed to fetch top lesson", error));
  // }, [user]);
  // ✅ Fetch top-priority lesson
  useEffect(() => {
    if (!user?.id) return;

    // const fetchLessons = async () => {
    //   try {
    //     const lessonsRes = await fetch(`${API_URL}/api/lessons`);
    //     const lessonsData = await lessonsRes.json();
    //     setLessons(lessonsData);

    //     if (lessonId) {
    //       // Use the one from the URL
    //       const lessonFromURL = lessonsData.find(
    //         (l: Lesson) => l.id === lessonId
    //       );
    //       setLesson(lessonFromURL || null);
    //     } else {
    //       // No id in URL, fallback to top-priority lesson
    //       const topRes = await fetch(
    //         `${API_URL}/api/user/${user.id}/top-priority-lesson`
    //       );
    //       const topLesson = await topRes.json();
    //       const match = lessonsData.find((l: Lesson) => l.id === topLesson.id);
    //       setLesson(match || topLesson);
    //     }
    //   } catch (err) {
    //     console.error("Error loading lessons or top-priority lesson", err);
    //   }
    // };
    const fetchLessons = async () => {
      const res = await fetch(`${API_URL}/api/lessons`);
      const data = await res.json();
      setLessons(data);

      const targetLesson = lessonId
        ? data.find((l: Lesson) => l.id === lessonId)
        : await fetch(
            `${API_URL}/api/user/${user.id}/top-priority-lesson`
          ).then((r) => r.json());

      const fullLesson = data.find((l: Lesson) => l.id === targetLesson.id);
      setLesson(fullLesson || null);

      const pages = (fullLesson?.content || "").split("---");
      setTotalPages(pages.length);
    };
    fetchLessons();
  }, [lessonId, user]);

  useEffect(() => {
    if (!lesson || !user?.id) return;

    const updateProgress = async () => {
      const progress = parseFloat((currentPage / totalPages).toFixed(2));
      await fetch(`${API_URL}/api/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          lessonId: lesson.id,
          currentPage,
          totalPages,
        }),
      });
    };

    updateProgress();
  }, [currentPage, lesson, totalPages, user]);
  // useEffect(() => {
  //   if (!lessonId) return; // ✅ Prevent override if not navigating via ?id=

  //   // fetch(`${API_URL}/api/lessons`);
  //   // .then((res) => res.json())
  //   // .then((data) => {
  //   //   setLessons(data);
  //   //   const currentLesson = data.find((l: Lesson) => l.id === lessonId);
  //   //   setLesson(currentLesson || null);
  //   // })
  //   // .catch((error) => console.error("Error fetching lessons:", error));
  //   // inside the first useEffect, after setting lesson
  //   fetch(`${API_URL}/api/lessons`)
  //     .then((res) => res.json())
  //     .then((data) => setLessons(data))
  //     .catch((error) => console.error("Error loading all lessons", error));
  // }, [lessonId, router]);

  if (!lesson) {
    return <p className="text-center mt-5 text-lg">Loading lesson...</p>;
  }

  const currentIndex = lessons.findIndex((l) => l.id === lesson.id);
  // const prevLesson = lessons[currentIndex - 1];
  // const nextLesson = lessons[currentIndex + 1];
  const pages = lesson.content.split("---");
  const contentToRender = pages[currentPage - 1] || "";

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
              // onClick={() =>
              //   router.push(
              //     `/current?id=${
              //       lessons[lessons.findIndex((l) => l.id === lesson.id) - 1].id
              //     }`
              //   )
              // }
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
              // onClick={() =>
              //   router.push(
              //     `/current?id=${
              //       lessons[lessons.findIndex((l) => l.id === lesson.id) + 1].id
              //     }`
              //   )
              // }
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
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
