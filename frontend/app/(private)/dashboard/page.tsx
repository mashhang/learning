"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useSidebar } from "@/app/context/SidebarContext";
import { useAuth } from "@/app/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Dashboard() {
  const [formattedDate, setFormattedDate] = useState("");
  const [greeting, setGreeting] = useState("");
  const { user } = useAuth();
  const [hasTakenDiagnostic, setHasTakenDiagnostic] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      const res = await fetch(`${API_URL}/api/user/${user.id}`); // Your API endpoint
      const data = await res.json();
      setHasTakenDiagnostic(data.hasTakenDiagnostic);
    };

    fetchUserData();
  }, [user]);

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
                    <p className="font-bold text-xl">
                      Lesson 5:
                      <span> Algebra Basics</span>
                    </p>
                    <p className="text-xl">
                      Progress:
                      <span> 75% completed</span>
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#C8C8C8] rounded-full h-3 mt-7">
                      <div
                        className="bg-[#30608E] h-3 rounded-full transition-all duration-500"
                        style={{ width: `75%` }}
                      ></div>
                    </div>
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
                    <p className="font-bold text-xl">
                      Lesson 7:
                      <span> Quadratic Equations</span>
                    </p>
                    <p className="text-lg">
                      Scheduled for:
                      <span> November 20</span>
                    </p>

                    <p className="font-bold text-xl mt-3">
                      Lesson 8:
                      <span> Polynomials</span>
                    </p>
                    <p className="text-lg">
                      Scheduled for:
                      <span> November 25</span>
                    </p>
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
