"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useSidebar } from "@/app/context/SidebarContext";

export default function Dashboard() {
  const [formattedDate, setFormattedDate] = useState("");
  const [greeting, setGreeting] = useState("");

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
        className="transition-all duration-300 ease-in-out bg-[#EFEFEF] h-screen"
        style={{
          marginLeft: isSidebarOpen ? sidebarWidth : "0",
          width: isSidebarOpen ? `calc(100% - ${sidebarWidth})` : "100%",
        }}
      >
        <div className="pt-[96px] mb-6 p-6">
          <h3 className="text-center font-[200]">{formattedDate}</h3>
          <h1 className="text-center text-4xl font-[300]">{greeting}, King</h1>
        </div>

        <div className="max-w-[1520px] h-[500px] mx-auto">
          <div className="h-full grid grid-cols-4 grid-rows-9 gap-14">
            <div className="w-full h-[200px] border-black border-[1px] col-span-2 row-span-3 col-start-1 row-start-1 rounded-xl py-2">
              <h1 className="text-center text-[28px] font-medium">
                Current Lesson
              </h1>

              <div className="mx-12 mt-3">
                <p className="font-bold">
                  Lesson 5:
                  <span> Algebra Basics</span>
                </p>
                <p>
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
            <div className="w-full h-[200px] border-black border-[1px] col-span-2 row-span-3 col-start-1 row-start-5 rounded-xl py-2">
              <h1 className="text-center text-[28px] font-medium">
                Progress Report
              </h1>

              <div className="mx-12 mt-5">
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
            <div className="w-full h-[200px] border-black border-[1px] col-span-2 row-span-3 col-start-1 row-start-9 rounded-xl py-2">
              <h1 className="text-center text-[28px] font-medium">
                Assignments Due
              </h1>
            </div>
            <div className="w-full h-[200px] border-black border-[1px] col-span-2 row-span-3 col-start-3 row-start-1 rounded-xl py-2">
              <h1 className="text-center text-[28px] font-medium">
                Next Lessons
              </h1>
            </div>
            <div className="w-full h-[200px] border-black border-[1px] col-span-2 row-span-3 col-start-3 row-start-5 rounded-xl py-2">
              <h1 className="text-center text-[28px] font-medium">
                Announcements
              </h1>
            </div>
            <div className="w-full h-[200px] border-black border-[1px] col-span-2 row-span-3 col-start-3 row-start-9 rounded-xl py-2">
              <h1 className="text-center text-[28px] font-medium">
                Current Lesson
              </h1>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
