"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useSidebar } from "@/app/context/SidebarContext";
import { BiSolidVideoRecording } from "react-icons/bi";
import { RiBallPenFill } from "react-icons/ri";
import { PiReadCvLogoFill } from "react-icons/pi";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

export default function ProgressReport() {
  const { isSidebarOpen } = useSidebar();

  type LessonWithProgress = {
    lessonId: string;
    title: string;
    chapterId: string;
    chapterTitle: string;
    progress: number;
    priority: number;
    updatedAt: string;
  };

  const { user } = useAuth();
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const currentLesson = lessons.find((l) => l.progress < 1);
  const nextLessons = lessons.filter(
    (l) => l.progress < 1 && l.lessonId !== currentLesson?.lessonId
  );

  useEffect(() => {
    if (!user?.id) return;

    const fetchLessons = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/progress/ordered/${user.id}`
      );
      const data = await res.json();
      console.log("📦 Lesson Data:", data);
      setLessons(data);
    };

    fetchLessons();
  }, [user]);

  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((l) => l.progress === 1).length;
  const progressPercent = totalLessons
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  //GET LAST ACTIVITY
  function getTimeAgo(dateString: string): string {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  }

  const lastActivityLesson = [...lessons].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];

  const lastActivity = lastActivityLesson
    ? getTimeAgo(lastActivityLesson.updatedAt)
    : "No activity yet";

  return (
    <ProtectedRoute>
      <div
        className="transition-all duration-300 ease-in-out bg-[#EFEFEF] overflow-hidden"
        style={{
          marginLeft: isSidebarOpen ? "7rem" : "0",
          width: isSidebarOpen ? `calc(100% - 7rem)` : "100%",
          height: "100vh",
        }}
      >
        <div className="pt-[105px] p-6 w-[1520px] ml-[200px]">
          <div className="grid grid-cols-3 grid-rows-3 gap-8 h-full">
            {/* ----------------------PROGRESS OVERVIEW---------------------- */}
            <div className="w-full h-[250px] bg-white shadow-custom col-span-2 row-span-1 col-start-1 row-start-1 rounded-xl px-10 pt-4">
              <h1 className="text-[28px] font-medium">Progress Overview</h1>

              <div className="flex flex-row mt-3">
                <p className="font-semibold mr-[5px]">Total Lessons:</p>
                <p>{totalLessons}</p>
              </div>

              <div className="flex flex-row">
                <p className="font-semibold mr-[5px]">Completed: </p>
                <p>
                  {completedLessons}/{totalLessons}
                </p>
              </div>

              <div className="flex flex-row">
                <p className="font-semibold mr-[5px]">Average Score: </p>
                <p>88%</p>
              </div>

              {lessons.length > 0 && (
                <div className="flex flex-row">
                  <p className="font-semibold mr-[5px]">Last Activity: </p>
                  <p>{lastActivity}</p>
                </div>
              )}

              <div className="bg-[#979797] w-full h-[15px] rounded-xl mt-3">
                <div
                  className="bg-[#30608E] h-[15px] rounded-l-xl"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              {progressPercent === 0 ? (
                <p className="text-[20px] font-light mt-3">
                  Start your first lesson to begin your journey!
                </p>
              ) : progressPercent < 50 ? (
                <p className="text-[20px] font-light mt-3">
                  Great job! Keep progressing through the course.
                </p>
              ) : progressPercent < 100 ? (
                <p className="text-[20px] font-light mt-3">
                  You're more than halfway there. Keep going!
                </p>
              ) : (
                <p className="text-[20px] font-light mt-3">
                  Congratulations! You’ve completed the course! 🎉
                </p>
              )}
            </div>
            {/* ----------------------Skill Development Goals---------------------- */}
            <div className="w-full h-[400px] bg-white shadow-custom col-span-2 row-span-3 col-start-1 row-start-2 rounded-xl px-10 pt-4">
              <h1 className="text-[28px] font-medium">
                Skill Development Goals
              </h1>

              {/* ----------------------Lesson 1---------------------- */}
              <div className="flex flex-row mt-3">
                <p className="font-semibold mr-[5px] text-[#30608E] text-[20px]">
                  Algebra
                </p>
              </div>

              <div className="flex flex-col">
                <p className="font-light mr-[5px] text-[#666666]">
                  Current Level: <span>Intermediate</span>
                </p>
                <p className="font-light mr-[5px] text-[#666666]">
                  Suggested Next Step: Practice advanced equations
                </p>

                <button
                  className="w-[150px] text-[14px] py-2 px-4 mt-4 bg-[#30608E] text-white rounded-md "
                  //onClick={handleSignIn}
                >
                  Resume Lesson
                </button>
                <div className="mt-[25px] w-full h-[1px] bg-[#D6D6D6]"></div>
              </div>

              {/* ----------------------Lesson 2---------------------- */}
              <div className="flex flex-row mt-3">
                <p className="font-semibold mr-[5px] text-[#30608E] text-[20px]">
                  Geometry
                </p>
              </div>

              <div className="flex flex-col">
                <p className="font-light mr-[5px] text-[#666666]">
                  Current Level: <span>Beginner</span>
                </p>
                <p className="font-light mr-[5px] text-[#666666]">
                  Suggested Next Step: Learn basic theorems
                </p>

                <button
                  className="w-[150px] text-[14px] py-2 px-4 mt-4 bg-[#30608E] text-white rounded-md "
                  //onClick={handleSignIn}
                >
                  View Lesson
                </button>
              </div>
            </div>

            {/* ----------------------Current Lesson---------------------- */}
            <div className="w-full h-[250px] bg-white shadow-custom col-span-1 row-span-1 col-start-3 row-start-1 rounded-xl px-10 pt-4">
              {currentLesson ? (
                <>
                  <h1 className="text-[28px] font-medium">Current Lesson</h1>
                  <p className="font-semibold mr-[5px] text-[#30608E] text-[20px]">
                    {currentLesson.title}
                  </p>

                  <div className="flex flex-col">
                    <p className="font-light mr-[5px] text-[#666666]">
                      Status: In Progress
                    </p>
                    <p className="flex font-light mr-[5px] text-[#2D2D2D]">
                      <BiSolidVideoRecording className="text-[#2D2D2D] mr-1 mt-1" />
                      <span>Video: Basics of Algebra</span>
                    </p>
                    <p className="flex font-light mr-[5px] text-[#2D2D2D]">
                      <RiBallPenFill className="mr-1 mt-1" />
                      <span>Quiz: Practice Problems</span>
                    </p>
                    <p className="flex font-light mr-[5px] text-[#2D2D2D]">
                      <PiReadCvLogoFill className="mr-1 mt-1" />
                      <span>Reading: Theory Recap</span>
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-[#666]">No current lesson</p>
              )}
            </div>
            {/* ----------------------Next Lessons---------------------- */}
            <div className="w-full h-[400px] bg-white shadow-custom col-span-1 row-span-3 col-start-3 row-start-2 rounded-xl px-10 pt-4">
              <h1 className="text-[28px] font-medium">Next Lessons</h1>

              {nextLessons.length > 0 ? (
                nextLessons.slice(0, 2).map((lesson, index) => (
                  <div key={lesson.lessonId} className="mt-4">
                    <p className="font-semibold text-[#30608E] text-[20px]">
                      {lesson.title}
                    </p>
                    <div className="flex flex-col">
                      <p className="font-light mr-[5px] text-[#666666]">
                        Status: <span>Pending</span>
                      </p>
                      <p className="font-light mr-[5px] text-[#666666]">
                        Deadline: <span>Nov 22, 2024</span>
                      </p>
                      <p className="flex font-light mr-[5px] text-[#2D2D2D]">
                        <BiSolidVideoRecording className="text-[#2D2D2D] mr-1 mt-1" />
                        <span>Video: Problem-Solving Skills</span>
                      </p>
                      <p className="flex font-light mr-[5px] text-[#2D2D2D]">
                        <RiBallPenFill className="mr-1 mt-1" />
                        <span>Quiz: Practice Test</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[#666]">No upcoming lessons</p>
              )}
            </div>
            {/* ----------------------------------------------------------- */}
          </div>
        </div>

        <div></div>
      </div>
    </ProtectedRoute>
  );
}
