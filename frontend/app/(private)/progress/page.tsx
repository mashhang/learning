"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useSidebar } from "@/app/context/SidebarContext";
import { BiSolidVideoRecording } from "react-icons/bi";
import { RiBallPenFill } from "react-icons/ri";
import { PiReadCvLogoFill } from "react-icons/pi";

export default function ProgressReport() {
  const { isSidebarOpen } = useSidebar();

  return (
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
              Keep up the great work! You&apos;re close to completing the
              course.
            </h1>
          </div>
          {/* ----------------------Skill Development Goals---------------------- */}
          <div className="w-full h-[400px] bg-white shadow-custom col-span-2 row-span-3 col-start-1 row-start-2 rounded-xl px-10 pt-4">
            <h1 className="text-[28px] font-medium">Skill Development Goals</h1>

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
            <h1 className="text-[28px] font-medium">Current Lesson</h1>

            <div className="flex flex-row mt-3">
              <p className="font-semibold mr-[5px] text-[#30608E] text-[20px]">
                Lesson 9: <span>Graphing Linear Equations</span>
              </p>
            </div>

            <div className="flex flex-col">
              <p className="font-light mr-[5px] text-[#666666]">
                Status: <span>In progress</span>
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
          </div>
          {/* ----------------------Next Lessons---------------------- */}
          <div className="w-full h-[400px] bg-white shadow-custom col-span-1 row-span-3 col-start-3 row-start-2 rounded-xl px-10 pt-4">
            <h1 className="text-[28px] font-medium">Next Lessons</h1>

            <div className="flex flex-row mt-3">
              <p className="font-semibold mr-[5px] text-[#30608E] text-[20px]">
                Lesson 10: <span>Polynomial Functions</span>
              </p>
            </div>

            <div className="flex flex-col">
              <p className="font-light mr-[5px] text-[#666666]">
                Status: <span>Pending</span>
              </p>
              <p className="font-light mr-[5px] text-[#666666]">
                Deadline: <span>Nov 15, 2024</span>
              </p>
              <p className="flex font-light mr-[5px] text-[#2D2D2D]">
                <BiSolidVideoRecording className="text-[#2D2D2D] mr-1 mt-1" />
                <span>Video: Advanced Topics</span>
              </p>
              <p className="flex font-light mr-[5px] text-[#2D2D2D]">
                <RiBallPenFill className="mr-1 mt-1" />
                <span>Quiz: Upcoming Exam</span>
              </p>
            </div>

            <div className="flex flex-row mt-3">
              <p className="font-semibold mr-[5px] text-[#30608E] text-[20px]">
                Lesson 11: <span>Exponential Growth</span>
              </p>
            </div>

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
          {/* ----------------------------------------------------------- */}
        </div>
      </div>

      <div></div>
    </div>
  );
}
