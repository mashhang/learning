"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useSidebar } from "@/app/context/SidebarContext";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type PrioritizedLesson = {
  lesson: {
    id: string;
    title: string;
    content: string;
    // progress: number;
    chapter: { title: string };
  };
  progress: number;
  priority: number;
  updatedAt: string; // ✅ add this
};

export default function MyLessons() {
  const { isSidebarOpen } = useSidebar();
  const { user } = useAuth();
  const [lessons, setLessons] = useState<PrioritizedLesson[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchLessons = async () => {
      const res = await fetch(
        `${API_URL}/api/diagnostic/${user.id}/prioritized-lessons`,
        {
          cache: "no-store", // ✅ force fresh data
        }
      );
      const data = await res.json();
      console.log("🧪 Prioritized Lessons", data);
      setLessons(data);
    };

    fetchLessons();
  }, [user]);

  const currentLesson = lessons.find((l) => l.progress < 1); // first incomplete
  const upcomingLessons = lessons
    .filter((l) => l.progress < 1 && l.lesson.id !== currentLesson?.lesson.id)
    .slice(0, 3); // limit to 3
  const pastLessons = lessons
    .filter((l) => l.progress === 1)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  return (
    <ProtectedRoute>
      <div //bg-[#EFEFEF]
        className="transition-all duration-300 ease-in-out bg-no-repeat bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `url('/bg-mylesson.png')`,
          marginLeft: isSidebarOpen ? "5.5rem" : "0",
          width: isSidebarOpen ? `calc(100% - 5.5rem)` : "100%",
          minHeight: "100vh",
        }}
      >
        <div className="mt-[46.4px] p-6">
          <div className="ml-[200px] w-[1520px]">
            <h1 className="text-[#30608E] text-[18px] font-semibold">
              Current Lesson
            </h1>

            {currentLesson && (
              <LessonCard
                lesson={currentLesson.lesson}
                progress={currentLesson.progress} // ✅ pass progress
                index={0}
              />
            )}

            <h1 className="text-[#30608E] text-[18px] font-semibold mt-16">
              Upcoming Lessons
            </h1>

            {upcomingLessons.map((l, i) => (
              <LessonCard
                key={l.lesson.id}
                lesson={l.lesson}
                progress={l.progress} // ✅ pass progress
                index={i + 1}
              />
            ))}

            <h1 className="text-[#30608E] text-[18px] font-semibold mt-16">
              Past Lessons
            </h1>

            {pastLessons.map((l, i) => (
              <LessonCard
                key={l.lesson.id}
                lesson={l.lesson}
                progress={l.progress}
                index={i + 1}
              />
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function LessonCard({
  lesson,
  progress,
  index,
}: {
  lesson: {
    id: string;
    title: string;
    content: string;
  };
  progress?: number;
  index: number;
}) {
  const router = useRouter();
  const isCompleted = progress === 1;
  const isStarted = progress !== undefined && progress > 0 && progress < 1;
  const isNew = progress === 0 || progress === undefined;

  let buttonLabel = "Start Lesson";
  if (isCompleted) {
    buttonLabel = "Start Over";
  } else if (isStarted) {
    buttonLabel = "Continue Lesson";
  }

  return (
    <div className="w-full rounded-xl h-[160px] bg-[#D9D9D9] shadow-custom mt-4">
      <div className="mx-8 pt-2">
        <h1 className="text-[24px] font-semibold">{lesson.title}</h1>
        <p className="text-[#666666]">{lesson.content}</p>

        <div className="bg-[#979797] w-full h-[10px] rounded-xl mt-3">
          <div
            className="bg-[#30608E] h-[10px] rounded-l-xl"
            style={{ width: `${(progress ?? 0) * 100}%` }} // ✅ Convert 0.45 → 45%
          />
          <p className="text-sm text-right text-gray-500 mt-1">
            Progress:{" "}
            {progress !== undefined ? `${(progress * 100).toFixed(0)}%` : "0%"}
          </p>
        </div>

        <button
          className="text-[14px] py-2 px-4 mt-4 bg-[#30608E] text-white rounded-md"
          onClick={() => router.push(`/current?id=${lesson.id}`)}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
