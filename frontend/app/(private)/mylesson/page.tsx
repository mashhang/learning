"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useSidebar } from "@/app/context/SidebarContext";

export default function MyLessons() {
  const { isSidebarOpen } = useSidebar();

  return (
    <ProtectedRoute>
      <div
        className="transition-all duration-300 ease-in-out bg-[#EFEFEF] overflow-hidden"
        style={{
          marginLeft: isSidebarOpen ? "5.5rem" : "0",
          width: isSidebarOpen ? `calc(100% - 5.5rem)` : "100%",
          height: "100vh",
        }}
      >
        <div className="mt-[46.4px] p-6">
          <div className="ml-[200px] w-[1520px]">
            <h1 className="text-[#30608E] text-[18px] font-semibold">
              Current Lesson
            </h1>
            <div className="w-full rounded-xl h-[160px] bg-[#D9D9D9] shadow-custom mt-4">
              <div className="mx-8 pt-2">
                <h1 className="text-[24px] font-semibold">
                  Algebra - Linear Equations
                </h1>
                <p className="text-[#666666]">
                  Explore the basics of linear equations, solving techniques,
                  and applications in real life.
                </p>

                <div className="bg-[#979797] w-full h-[10px] rounded-xl mt-3">
                  <div
                    className="bg-[#30608E] w-full h-[10px] rounded-l-xl"
                    style={{ width: `${71}%` }} //progress should be on 20
                  ></div>
                </div>
                <button
                  className="text-[14px] py-2 px-4 mt-4 bg-[#30608E] text-white rounded-md "
                  //onClick={handleSignIn}
                >
                  Resume Lesson
                </button>
              </div>
            </div>

            <h1 className="text-[#30608E] text-[18px] font-semibold mt-16">
              Upcoming Lessons
            </h1>

            <div className="w-full rounded-xl h-[160px] bg-[#D9D9D9] shadow-custom mt-4">
              <div className="mx-8 pt-2">
                <h1 className="text-[24px] font-semibold">
                  Quadratic Equations
                </h1>
                <p className="text-[#666666]">
                  Understand the structure of quadratic equations and how to
                  find their roots.
                </p>

                <div className="bg-[#979797] w-full h-[10px] rounded-xl mt-3">
                  <div
                    className="bg-[#30608E] w-full h-[10px] rounded-l-xl"
                    style={{ width: `${67}%` }} //progress should be on 20
                  ></div>
                </div>
                <button
                  className="text-[14px] py-2 px-4 mt-4 bg-[#30608E] text-white rounded-md "
                  //onClick={handleSignIn}
                >
                  Resume Lesson
                </button>
              </div>
            </div>

            <div className="w-full rounded-xl h-[160px] bg-[#D9D9D9] shadow-custom mt-4">
              <div className="mx-8 pt-2">
                <h1 className="text-[24px] font-semibold">Inequalities</h1>
                <p className="text-[#666666]">
                  Learn how to solve and graph inequalities on a number line.
                </p>

                <div className="bg-[#979797] w-full h-[10px] rounded-xl mt-3">
                  <div
                    className="bg-[#30608E] w-full h-[10px] rounded-l-xl"
                    style={{ width: `${67}%` }} //progress should be on 20
                  ></div>
                </div>
                <button
                  className="text-[14px] py-2 px-4 mt-4 bg-[#30608E] text-white rounded-md "
                  //onClick={handleSignIn}
                >
                  Resume Lesson
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
