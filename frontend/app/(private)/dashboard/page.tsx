"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useSidebar } from "@/app/context/SidebarContext";
import { useAuth } from "@/app/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function Dashboard() {
  const [formattedDate, setFormattedDate] = useState("");
  const [greeting, setGreeting] = useState("");
  const { user } = useAuth();
  const [hasTakenDiagnostic, setHasTakenDiagnostic] = useState<boolean | null>(
    null
  );
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [nextLessons, setNextLessons] = useState<any[]>([]);

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
          <div className="flex flex-col justify-center items-center h-screen">
            <h2 className="text-2xl font-bold text-[#30608E]">
              Start the Diagnostic Exam
            </h2>
            <p className="text-gray-600 mt-2">
              Take the diagnostic exam to determine your proficiency in General
              Mathematics.
            </p>
            <a
              href="/diagnosticexam"
              className="mt-4 inline-block bg-[#30608E] text-white px-6 py-3 rounded shadow hover:bg-[#244e75]"
            >
              Take Diagnostic Exam
            </a>
          </div>
        )}
        {hasTakenDiagnostic && (
          <div
            className="transition-all duration-300 ease-in-out h-screen"
            style={{
              marginLeft: isSidebarOpen ? sidebarWidth : "0",
              width: isSidebarOpen ? `calc(100% - ${sidebarWidth})` : "100%",
            }}
          >
            <div className="pt-[96px] mb-6 p-6">
              <h3 className="text-center font-[200]">{formattedDate}</h3>
              <h1 className="text-center text-4xl font-[300]">
                {greeting}, {user?.name ?? "Guest"}
              </h1>
            </div>

            <div className="max-w-[1520px] h-[500px] mx-auto">
              <div className="h-full grid grid-cols-4 grid-rows-9 gap-14">
                <div className="w-full h-[200px] bg-white border-black border-[1px] col-span-2 row-span-3 col-start-1 row-start-1 rounded-xl py-2 shadow-custom">
                  <h1 className="text-center text-[28px] font-medium">
                    Current Lesson
                  </h1>

                  <div className="mx-12 mt-3">
                    {currentLesson ? (
                      <>
                        <p className="font-bold text-xl">
                          {currentLesson?.title
                            ? `Lesson: ${currentLesson.title}`
                            : "Untitled"}
                        </p>
                        <p className="text-xl">
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
                <div className="w-full h-[200px] bg-white border-black border-[1px] col-span-2 row-span-3 col-start-1 row-start-5 rounded-xl py-2 shadow-custom">
                  <h1 className="text-center text-[28px] font-medium">
                    Progress Report
                  </h1>

                  <div className="mx-12 mt-5 text-xl">
                    <p>
                      Total Lessons Completed:
                      <span className="font-bold"> 4/10</span>
                    </p>
                    <p>
                      Total Assignments Submitted:
                      <span className="font-bold"> 5/8</span>
                    </p>
                    <p>
                      Average Score: <span className="font-bold"> 85%</span>
                    </p>
                  </div>
                </div>
                <div className="w-full h-[200px] bg-white border-black border-[1px] col-span-2 row-span-3 col-start-3 row-start-1 rounded-xl py-2 shadow-custom">
                  <h1 className="text-center text-[28px] font-medium">
                    Next Lessons
                  </h1>

                  <div className="mx-12 mt-3">
                    {nextLessons.length > 0 ? (
                      nextLessons.map((lesson) => (
                        <div key={lesson.lessonId} className="mt-2">
                          <p className="font-bold text-xl">
                            Lesson: {lesson.title}
                          </p>
                          <p className="text-lg text-gray-700">
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
                <div className="w-full h-[200px] bg-white border-black border-[1px] col-span-2 row-span-3 col-start-3 row-start-5 rounded-xl py-2 shadow-custom">
                  <h1 className="text-center text-[28px] font-medium">
                    Announcements
                  </h1>

                  <div className="mx-12 mt-5 text-xl">
                    <p className="font-bold text-xl">
                      New Lesson Released:
                      <span className="font-normal"> Algebra Practice Set</span>
                    </p>
                    <p className="text-lg">Due: November 15</p>
                    <p className="font-bold text-xl mt-3">
                      Exam Reminder:
                      <span className="font-normal">
                        Midterm Exam on November 30
                      </span>
                    </p>
                  </div>
                </div>
                <div className="w-full h-[200px] bg-white border-black border-[1px] col-span-2 row-span-3 col-start-2 row-start-9 rounded-xl py-2 shadow-custom">
                  <h1 className="text-center text-[28px] font-medium">
                    Current Lesson
                  </h1>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
