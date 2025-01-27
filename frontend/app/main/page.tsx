"use client";

import React, { useState } from "react";
import Navbar from "../Navbar";

const Dashboard = () => {
  const currentDate = new Date();

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  const formattedDate = currentDate.toLocaleDateString("en-US", options);

  const currentHour = currentDate.getHours();
  let greeting = "";
  if (currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour < 18) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  const toggleProfile = () => {
    setIsProfileOpen((prev) => !prev);
  };

  const isAuthenticated = true;

  return (
    <>
      <Navbar
        isAuthenticated={isAuthenticated}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isProfileOpen={isProfileMenuOpen}
        toggleProfile={toggleProfile}
      />
      <div
        className={`transition-all duration-300 ease-in-out ml-0 bg-[#EFEFEF] h-screen ${
          isSidebarOpen ? "ml-[14rem] w-[calc(100%-14rem)]" : "ml-0 w-full"
        }`}
      >
        <div className="pt-[96px] mb-6 p-6">
          <h3 className="text-center font-[200]">{formattedDate}</h3>
          <h1 className="text-center text-4xl font-[300]">{greeting}, King</h1>
        </div>

        <div className="max-w-[1520px] h-[500px] mx-auto">
          <div className="h-full grid grid-cols-4 grid-rows-9 gap-14">
            <div className="w-full h-[200px] border-black border-[1px] col-span-2 row-span-3 col-start-1 row-start-1 rounded-xl ">
              <h1 className="text-center text-[28px] font-medium">
                Current Lesson
              </h1>
            </div>
            <div className="w-full h-[200px] border-black border-[1px] col-span-2 row-span-3 col-start-1 row-start-5 rounded-xl">
              <h1 className="text-center text-[28px] font-medium">
                Progress Report
              </h1>
            </div>
            <div className="w-full h-[200px] border-black border-[1px] col-span-2 row-span-3 col-start-1 row-start-9 rounded-xl">
              <h1 className="text-center text-[28px] font-medium">
                Assignments Due
              </h1>
            </div>
            <div className="w-full h-[200px] border-black border-[1px] col-span-2 row-span-3 col-start-3 row-start-1 rounded-xl">
              <h1 className="text-center text-[28px] font-medium">
                Next Lessons
              </h1>
            </div>
            <div className="w-full h-[200px] border-black border-[1px] col-span-2 row-span-3 col-start-3 row-start-5 rounded-xl">
              <h1 className="text-center text-[28px] font-medium">
                Announcements
              </h1>
            </div>
            <div className="w-full h-[200px] border-black border-[1px] col-span-2 row-span-3 col-start-3 row-start-9 rounded-xl">
              <h1 className="text-center text-[28px] font-medium">
                Current Lesson
              </h1>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
