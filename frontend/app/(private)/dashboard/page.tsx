"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useSidebar } from "@/app/context/SidebarContext";
import { useAuth } from "@/app/context/AuthContext";
import API_URL from "@/lib/getApiUrl";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function Dashboard() {
  const [formattedDate, setFormattedDate] = useState("");
  const [greeting, setGreeting] = useState("");
  const { user, token } = useAuth();
  const [hasTakenDiagnostic, setHasTakenDiagnostic] = useState<boolean | null>(
    null
  );
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [nextLessons, setNextLessons] = useState<any[]>([]);

  // const totalLessons = nextLessons.length + (currentLesson ? 1 : 0);
  // const totalCompletedLessons =
  //   (currentLesson?.progress === 1 ? 1 : 0) +
  //   nextLessons.filter((lesson) => lesson.progress === 1).length;

  // const lastLesson = [currentLesson, ...nextLessons]
  //   .filter(Boolean)
  //   .sort(
  //     (a, b) =>
  //       new Date(b.updatedAt ?? "").getTime() -
  //       new Date(a.updatedAt ?? "").getTime()
  //   )[0];

  // function getTimeAgo(dateString: string) {
  //   const now = new Date();
  //   const date = new Date(dateString);
  //   const diff = now.getTime() - date.getTime();
  //   const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  //   if (days === 0) return "Today";
  //   if (days === 1) return "1 day ago";
  //   return `${days} days ago`;
  // }

  // const lastActivity = lastLesson?.updatedAt
  //   ? getTimeAgo(lastLesson.updatedAt)
  //   : "No activity yet";
  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchLessons = async () => {
      try {
        const res = await fetch(`${API_URL}/api/progress/ordered/${user.id}`);
        const data = await res.json();
        setLessons(data);
      } catch (err) {
        console.error("Failed to fetch lesson priorities", err);
      }
    };

    fetchLessons();
  }, [user]);

  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((l) => l.progress === 1).length;

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
    (a, b) =>
      new Date(b.updatedAt ?? "").getTime() -
      new Date(a.updatedAt ?? "").getTime()
  )[0];

  const lastActivity = lastActivityLesson
    ? getTimeAgo(lastActivityLesson.updatedAt)
    : "No activity yet";

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      const res = await fetch(`${API_URL}/api/user/${user.id}`); // Your API endpoint
      const data = await res.json();
      setHasTakenDiagnostic(data.hasTakenDiagnostic);
    };

    fetchUserData();
  }, [user]);

  // ✅ 2. Once diagnostic is confirmed, fetch lesson priorities
  useEffect(() => {
    if (!hasTakenDiagnostic || !user?.id) return;

    const fetchLessons = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/progress/ordered/${user.id}` // Your API endpoint
        );

        const data = await res.json();

        if (data.length > 0) {
          const current = data.find((l: any) => l.progress < 1);
          const next = data
            .filter(
              (l: any) => l.progress < 1 && l.lessonId !== current?.lessonId
            )
            .slice(0, 2);

          setCurrentLesson(current || null);
          setNextLessons(next);
        } else {
          setCurrentLesson(null);
          setNextLessons([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch lesson priorities", err);
      }
    };

    fetchLessons();
  }, [hasTakenDiagnostic, user]);

  useEffect(() => {
    const currentDate = new Date();

    // ✅ Fix hydration by setting dynamic data inside `useEffect`
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
    };
    setFormattedDate(currentDate.toLocaleDateString("en-US", options));

    const currentHour = currentDate.getHours();
    if (currentHour < 12) {
      setGreeting("Good morning");
    } else if (currentHour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  const { isSidebarOpen, sidebarWidth } = useSidebar();

  return (
    <ProtectedRoute>
      <div
        className="bg-no-repeat bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `url('/bg-mylesson.png')`,
          minHeight: "100vh",
        }}
      >
        {hasTakenDiagnostic === null && (
          <div className="flex items-center justify-center h-screen">
            <p className="text-gray-500 text-lg">Loading dashboard...</p>
          </div>
        )}

        {hasTakenDiagnostic === false && (
          <div className="flex flex-col justify-center items-center h-screen text-center mx-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#30608E] ">
              Start the Diagnostic Exam
            </h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Take the diagnostic exam to determine your proficiency in General
              Mathematics.
            </p>
            <a
              href="/diagnosticexam"
              className="mt-4 inline-block bg-[#30608E] text-white text-sm sm:text-base px-6 py-3 rounded shadow hover:bg-[#244e75]"
            >
              Take Diagnostic Exam
            </a>
          </div>
        )}
        {hasTakenDiagnostic && (
          <div
            className="transition-all duration-300 ease-in-out h-screen"
            style={{
              marginLeft: isSidebarOpen
                ? window.innerWidth >= 768
                  ? sidebarWidth
                  : "0"
                : "0",
              width: isSidebarOpen
                ? window.innerWidth >= 768
                  ? `calc(100% - ${sidebarWidth})`
                  : "100%"
                : "100%",
            }}
          >
            <div className="pt-[96px] ">
              <h3 className="text-center text-sm md:text-base font-[200]">
                {formattedDate}
              </h3>
              <h1 className="text-center text-3xl md:text-4xl font-[300]">
                {greeting}, {user?.lastName ?? "Guest"}
              </h1>
            </div>

            {/* max-w-[1520px] */}
            <div className="max-w-full  xl:max-w-[1520px] p-8 md:p-14 mb-40 mx-auto">
              <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="w-full bg-white border-black border-[1px] rounded-xl pt-2 pb-4 shadow-custom">
                  <h1 className="text-center text-2xl md:text-3xl font-medium">
                    Current Lesson
                  </h1>

                  <div className="mx-4 md:mx-12 mt-2">
                    {currentLesson ? (
                      <>
                        <p className="font-bold text-base md:text-xl break-words whitespace-pre-wrap">
                          {currentLesson?.title
                            ? `Lesson: ${currentLesson.title}`
                            : "Untitled"}
                        </p>
                        <p className="text-base md:text-xl break-words whitespace-pre-wrap">
                          Progress:{" "}
                          <span>
                            {Math.round(currentLesson.progress * 100)}%
                            completed
                          </span>
                        </p>
                        <div className="w-full bg-[#C8C8C8] rounded-full h-3 mt-7">
                          <div
                            className="bg-[#30608E] h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.round(
                                currentLesson.progress * 100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-gray-500">
                        No current lesson found
                      </p>
                    )}
                  </div>
                </div>
                <div className="w-full bg-white border-black border-[1px] rounded-xl pt-2 pb-4 shadow-custom">
                  <h1 className="text-center text-2xl md:text-3xl font-medium">
                    Progress Report
                  </h1>

                  <div className="mx-4 md:mx-12 my-2 text-base md:text-xl">
                    <p>
                      Total Lessons Completed:
                      <span className="font-bold">
                        {completedLessons}/{totalLessons}
                      </span>
                    </p>
                    <p>
                      Last Activity:
                      <span className="font-bold">{lastActivity}</span>
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className=" bg-[#C8C8C8] rounded-full h-3 mt-2 mx-4 md:mx-12">
                    <div
                      className="bg-[#30608E] h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          totalLessons
                            ? Math.round(
                                (completedLessons / totalLessons) * 100
                              )
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="mt-2 text-left mx-4 md:mx-12">
                    {totalLessons === 0 ? (
                      <p className="text-sm md:text-base font-light break-words whitespace-pre-wrap">
                        Start your first lesson to begin your journey!
                      </p>
                    ) : totalLessons < 50 ? (
                      <p className="text-sm md:text-base font-light break-words whitespace-pre-wrap">
                        Great job! Keep progressing through the course.
                      </p>
                    ) : totalLessons < 100 ? (
                      <p className="text-sm md:text-base font-light break-words whitespace-pre-wrap">
                        You're more than halfway there. Keep going!
                      </p>
                    ) : (
                      <p className="text-sm md:text-base font-light break-words whitespace-pre-wrap">
                        Congratulations! You’ve completed the course! 🎉
                      </p>
                    )}
                  </div>
                </div>

                <div className="w-full bg-white border-black border-[1px] rounded-xl pt-2 pb-4 shadow-custom">
                  <h1 className="text-center text-2xl md:text-3xl font-medium">
                    Next Lessons
                  </h1>

                  <div className="mx-4 md:mx-12 mt-2">
                    {nextLessons.length > 0 ? (
                      nextLessons.map((lesson) => (
                        <div key={lesson.lessonId} className="mt-2">
                          <p className="font-bold text-base md:text-xl break-words whitespace-pre-wrap">
                            Lesson: {lesson.title}
                          </p>
                          <p className="text-base md:text-xl text-gray-700">
                            Progress: {Math.round(lesson.progress * 100)}%
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500">
                        No next lessons found
                      </p>
                    )}
                  </div>
                </div>

                <div className="w-full bg-white border-black border-[1px] rounded-xl pt-2 pb-4 shadow-custom">
                  <h1 className="text-center text-2xl md:text-3xl font-medium">
                    Announcements
                  </h1>

                  <div className="mt-2 mx-4 md:mx-12 text-base md:text-xl">
                    <p className="font-bold text-base md:text-xl">
                      New Lesson Released:
                      <span className="font-normal"> Algebra Practice Set</span>
                    </p>
                    <p className="text-lg">Due: November 15</p>
                    <p className="font-bold text-base md:text-xl mt-3">
                      Exam Reminder:
                      <span className="font-normal">
                        Midterm Exam on November 30
                      </span>
                    </p>
                  </div>
                </div>
                {/* <div className="w-full h-[200px] bg-white border-black border-[1px] col-span-2 row-span-3 col-start-2 row-start-9 rounded-xl py-2 shadow-custom">
                  <h1 className="text-center text-[28px] font-medium">
                    Current Lesson
                  </h1>
                </div> */}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
