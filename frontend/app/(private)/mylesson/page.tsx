"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useSidebar } from "@/app/context/SidebarContext";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type OrderedLesson = {
  lessonId: string;
  title: string;
  chapterId: string;
  chapterTitle?: string;
  progress: number;
  priority: number;
  updatedAt: string;
};

export default function MyLessons() {
  const { isSidebarOpen } = useSidebar();
  const { user } = useAuth();
  const [lessons, setLessons] = useState<OrderedLesson[]>([]);
  const [showAllCurrent, setShowAllCurrent] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showAllPast, setShowAllPast] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchLessons = async () => {
      const res = await fetch(`${API_URL}/api/progress/ordered/${user.id}`, {
        cache: "no-store", // ✅ force fresh data
      });
      const data = await res.json();
      console.log("🧪 Ordered Lessons", data);
      setLessons(
        data.map((l: any) => ({
          ...l,
          lessonId: l.lessonId || l.id, // ✅ fallback to `id`
        }))
      );
    };

    fetchLessons();
  }, [user]);

  const startedLessons = lessons.filter(
    (l) => l.progress !== undefined && l.progress > 0 && l.progress < 1
  );

  let currentLessons: OrderedLesson[] = [];

  if (startedLessons.length > 0) {
    currentLessons = startedLessons;
  } else {
    // ✅ Only include the nextAvailable if nothing is in progress yet
    const nextAvailable = lessons.find((l) => l.progress === 0);
    if (nextAvailable) currentLessons = [nextAvailable];
  }

  const visibleCurrent = showAllCurrent
    ? currentLessons
    : currentLessons.slice(0, 1);

  const upcomingLessons = lessons.filter(
    (l) =>
      l.progress === 0 && !currentLessons.some((c) => c.lessonId === l.lessonId)
  );
  const visibleUpcoming = showAllUpcoming
    ? upcomingLessons
    : upcomingLessons.slice(0, 2);

  const pastLessons = lessons
    .filter((l) => l.progress === 1)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  const visiblePast = showAllPast ? pastLessons : pastLessons.slice(0, 2);

  return (
    <ProtectedRoute>
      <div //bg-[#EFEFEF]
        className="transition-all duration-300 ease-in-out bg-no-repeat bg-cover bg-center bg-fixed "
        style={{
          backgroundImage: `url('/bg-mylesson.png')`,
          marginLeft: isSidebarOpen ? "14rem" : "0",
          width: isSidebarOpen ? `calc(100% - 14rem)` : "100%",
          minHeight: "100vh",
        }}
      >
        {/*w-[1520px]*/}
        <div className="mt-[46.4px] p-6">
          <div className="  mb-10">
            <h1 className="text-[#30608E] text-[18px] font-semibold">
              Current Lesson
            </h1>

            {visibleCurrent.length === 0 ? (
              <p className="text-gray-500 italic mt-2">
                No current lessons yet.
              </p>
            ) : (
              <>
                {visibleCurrent.map((l, i) => (
                  <LessonCard
                    key={l.lessonId}
                    lesson={{ id: l.lessonId, title: l.title, content: "" }}
                    progress={l.progress}
                    index={i}
                  />
                ))}

                {currentLessons.length > 1 && (
                  <button
                    onClick={() => setShowAllCurrent(!showAllCurrent)}
                    className="float-right mt-2 text-[#8f8f8f] underline hover:text-[#383838] transition"
                  >
                    {showAllCurrent ? "See less" : "See more"}
                  </button>
                )}
              </>
            )}

            <h1 className="text-[#30608E] text-[18px] font-semibold mt-16">
              Upcoming Lessons
            </h1>

            {visibleUpcoming.length === 0 ? (
              <p className="text-gray-500 italic mt-2">No upcoming lessons.</p>
            ) : (
              <>
                {visibleUpcoming.map((l, i) => (
                  <LessonCard
                    key={l.lessonId}
                    lesson={{ id: l.lessonId, title: l.title, content: "" }}
                    progress={l.progress}
                    index={i}
                  />
                ))}

                {upcomingLessons.length > 2 && (
                  <button
                    onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                    className="float-right mt-2 text-[#8f8f8f] underline hover:text-[#383838] transition"
                  >
                    {showAllUpcoming ? "See less" : "See more"}
                  </button>
                )}
              </>
            )}

            <h1 className="text-[#30608E] text-[18px] font-semibold mt-16">
              Past Lessons
            </h1>

            {visiblePast.length === 0 ? (
              <p className="text-gray-500 italic mt-2">
                No lessons completed yet.
              </p>
            ) : (
              <>
                {visiblePast.map((l, i) => (
                  <LessonCard
                    key={l.lessonId}
                    lesson={{ id: l.lessonId, title: l.title, content: "" }}
                    progress={l.progress}
                    index={i}
                  />
                ))}

                {pastLessons.length > 2 && (
                  <button
                    onClick={() => setShowAllPast(!showAllPast)}
                    className="float-right mt-2 text-[#8f8f8f] underline hover:text-[#383838] transition"
                  >
                    {showAllPast ? "See less" : "See more"}
                  </button>
                )}
              </>
            )}
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
  } else if (isNew) {
    buttonLabel = "Take Pre-Assessment";
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
          className="text-[14px] w-36 h-12 mt-4 bg-[#30608E] text-white rounded-md hover:bg-[#254a6d] transition"
          // onClick={() => router.push(`/current?id=${lesson.id}`)}
          onClick={() =>
            progress === 0
              ? router.push(`/pre-assessment?id=${lesson.id}`)
              : router.push(`/current?id=${lesson.id}`)
          }
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
