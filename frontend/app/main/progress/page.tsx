"use client";

import React, { useState } from "react";
import Navbar from "..//..//Navbar";

const page = () => {
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
    <div
      className={`transition-all duration-300 ease-in-out ml-0 bg-[#EFEFEF] h-screen overflow-y-hidden ${
        isSidebarOpen ? "ml-[7rem] w-[calc(100%-7rem)]" : "ml-0 w-full"
      }`}
    >
      <Navbar
        isAuthenticated={isAuthenticated}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isProfileOpen={isProfileMenuOpen}
        toggleProfile={toggleProfile}
      />

      <div className="pt-[105px] p-6 w-[1520px] ml-[200px]">
        <div className="grid grid-cols-3 grid-rows-3 gap-8 h-full">
          <div className="w-full h-[250px] bg-white shadow-custom col-span-2 row-span-1 col-start-1 row-start-1 rounded-xl px-10 pt-4">
            <h1 className="text-[28px] font-medium">Progress Report</h1>

            <div className="flex flex-row mt-3">
              <p className="font-semibold mr-[5px]">Total Lessons:</p>
              <p>10</p>
            </div>

            <div className="flex flex-row">
              <p className="font-semibold mr-[5px]">Completed: </p>
              <p>5/7</p>
            </div>

            <div className="flex flex-row">
              <p className="font-semibold mr-[5px]">Average Score: </p>
              <p>88%</p>
            </div>

            <div className="flex flex-row">
              <p className="font-semibold mr-[5px]">Last Activity: </p>
              <p>2 days ago</p>
            </div>

            <div className="bg-[#979797] w-full h-[15px] rounded-xl mt-3">
              <div
                className="bg-[#30608E] w-full h-[15px] rounded-l-xl"
                style={{ width: `${71}%` }} //progress should be on 20
              ></div>
            </div>

            <h1 className="text-[20px] font-light mt-3">
              Keep up the great work! You're close to completing the course.
            </h1>
          </div>
          <div className="w-full h-[400px] bg-white shadow-custom col-span-2 row-span-3 col-start-1 row-start-2 rounded-xl px-10 pt-4">
            <h1 className="text-[28px] font-medium">Skill Development Goals</h1>
          </div>
          <div className="w-full h-[250px] bg-white shadow-custom col-span-1 row-span-1 col-start-3 row-start-1 rounded-xl px-10 pt-4">
            <h1 className="text-[28px] font-medium">Current Lesson</h1>
          </div>
          <div className="w-full h-[400px] bg-white shadow-custom col-span-1 row-span-3 col-start-3 row-start-2 rounded-xl px-10 pt-4">
            <h1 className="text-[28px] font-medium">Next Lessons</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
