"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useSidebar } from "@/app/context/SidebarContext";
import { BiSolidVideoRecording } from "react-icons/bi";
import { RiBallPenFill } from "react-icons/ri";
import { PiReadCvLogoFill } from "react-icons/pi";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import API_URL from "@/lib/getApiUrl";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function ProgressReport() {
  const skillDescriptions: Record<string, string> = {
    "evaluating functions":
      "Practice substituting input values into a function to determine outputs.",
    "domain and range":
      "Understand the possible inputs (domain) and outputs (range) of a function.",
    mapping:
      "Visualize how input values correspond to output values using mapping diagrams.",
    "vertical line test":
      "Determine if a graph represents a function by using the vertical line test.",
    "operations on functions":
      "Perform addition, subtraction, multiplication, and division on functions.",
    "rational functions":
      "Analyze functions expressed as the ratio of two polynomials.",
    "rational equations": "Solve equations involving rational expressions.",
    "rational inequalities":
      "Solve inequalities that involve rational expressions.",
    "inverse functions":
      "Learn to reverse a function's process and find its inverse.",
    "exponential equations":
      "Solve equations involving exponential expressions.",
    "exponential inequalities":
      "Understand how to solve inequalities with exponential terms.",
    "logarithmic functions":
      "Explore the inverse of exponential functions using logarithms.",
    "logical propositions":
      "Study the truth values and structure of logical statements.",
    "methods of proof":
      "Learn different proof strategies such as direct, indirect, and contradiction.",
    "simple interest":
      "Calculate interest using the basic formula for simple interest.",
    "compound interest":
      "Understand how interest accumulates over time when compounded.",
    annuities: "Examine regular payments or deposits over time with interest.",
    "stocks and bonds":
      "Analyze financial instruments like shares and debt securities.",
    "business and consumer loans":
      "Explore how loans work, including terms, interest, and repayment.",
    "general question":
      "Covers broad or introductory topics to assess general understanding.",
  };

  const skillNextSteps: Record<string, string> = {
    "evaluating functions":
      "Try evaluating more complex functions involving fractions or exponents.",
    "domain and range":
      "Practice finding domains and ranges from graphs and word problems.",
    mapping:
      "Explore how different mappings represent various types of functions.",
    "vertical line test":
      "Review function graphs and apply the vertical line test visually.",
    "operations on functions":
      "Combine functions using addition, subtraction, and composition.",
    "rational functions":
      "Solve real-world problems involving rational function graphs.",
    "rational equations":
      "Practice solving equations with multiple rational terms.",
    "rational inequalities":
      "Graph rational inequalities and analyze solution sets.",
    "inverse functions":
      "Practice switching x and y and solving for the inverse.",
    "exponential equations":
      "Try solving exponential equations with different bases.",
    "exponential inequalities":
      "Practice applying logarithms to solve exponential inequalities.",
    "logarithmic functions":
      "Explore the rules and properties of logarithms in real-life problems.",
    "logical propositions":
      "Practice identifying truth values in compound statements.",
    "methods of proof":
      "Apply direct and indirect proofs to solve logic puzzles.",
    "simple interest":
      "Apply the formula to various loan and savings scenarios.",
    "compound interest": "Compare compound vs. simple interest scenarios.",
    annuities: "Use formulas to determine future values of recurring payments.",
    "stocks and bonds": "Interpret stock tables and calculate returns.",
    "business and consumer loans":
      "Analyze amortization tables and loan repayment schedules.",
    "general question":
      "Review core concepts to strengthen foundational understanding.",
  };

  const lessonDescriptions: Record<string, string> = {
    // 📘 Chapter 1: Functions
    "Lesson 1: Functions":
      "Understand what functions are and how they relate inputs to outputs.",
    "Lesson 2: Domain and Range":
      "Learn how to identify the set of valid inputs (domain) and possible outputs (range) of a function.",
    "Lesson 3: Mapping and Vertical Line Test":
      "Use visual tools like mapping diagrams and the vertical line test to determine valid functions.",
    "Lesson 4: Evaluation on Functions":
      "Evaluate functions by substituting input values to find the corresponding output.",
    "Lesson 5: Operations on Functions":
      "Perform addition, subtraction, multiplication, and division on two or more functions.",

    // 📘 Chapter 2: Rational Functions
    "Lesson 1: Rational Functions":
      "Explore functions that are ratios of two polynomials and analyze their behavior.",
    "Lesson 2: Rational Equations":
      "Learn how to solve equations involving rational expressions.",
    "Lesson 3: Rational Inequalities":
      "Solve inequalities that contain rational expressions and represent their solution sets.",

    // 📘 Chapter 3: Exponential and Logarithmic Functions
    "Lesson 1: Inverse Functions":
      "Understand the concept of inverse functions and how to find them.",
    "Lesson 2: Exponential Functions":
      "Study exponential growth and decay and the general form of exponential functions.",
    "Lesson 3: Exponential Equations":
      "Solve equations that include exponential expressions using algebraic methods.",
    "Lesson 4: Logarithmic Functions":
      "Learn the definition of logarithms and how to convert between exponential and logarithmic forms.",
    "Lesson 5: Exponential and Logarithmic Inequalities":
      "Analyze and solve inequalities involving exponential and logarithmic expressions.",

    // 📘 Module 4: Business Math
    "Lesson 1: Simple and Compound Interest":
      "Calculate simple and compound interest and compare their long-term effects.",
    "Lesson 2: Simple and General Annuities":
      "Understand how annuities work and compute their present and future values.",
    "Lesson 3: Stocks and Bonds":
      "Learn the basics of investing in stocks and bonds and how to compute returns.",
    "Lesson 4: Business and Consumer Loans":
      "Analyze loan amortizations and calculate total repayment in business scenarios.",

    // 📘 Module 5: Logic and Proof
    "Lesson 1: Logical Propositions":
      "Explore the structure of logical statements and learn how to evaluate their truth values.",
    "Lesson 2: Methods of Proof":
      "Apply different strategies such as direct, indirect, and contradiction proofs to logical arguments.",
  };

  type LessonWithProgress = {
    lessonId: string;
    title: string;
    chapterId: string;
    chapterTitle: string;
    progress: number;
    priority: number;
    updatedAt: string;
    videoUrl?: string;
  };

  const { user } = useAuth();
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const currentLesson = lessons.find((l) => l.progress < 1);
  const nextLessons = lessons.filter(
    (l) => l.progress < 1 && l.lessonId !== currentLesson?.lessonId
  );

  const [skillTags, setSkillTags] = useState<string[]>([]);
  const lowercaseTags = skillTags.map((tag) => tag.toLowerCase());
  const uniqueTags = [...new Set(lowercaseTags)];

  const nonGeneral = uniqueTags.filter((tag) => tag !== "general question");

  let displayTags: string[] = [];

  if (nonGeneral.length >= 2) {
    // Show first 2 non-"general question" tags
    displayTags = nonGeneral.slice(0, 2);
  } else if (
    nonGeneral.length === 1 &&
    uniqueTags.includes("general question")
  ) {
    // Show the one real tag + general question
    displayTags = [nonGeneral[0], "general question"];
  } else if (
    nonGeneral.length === 0 &&
    uniqueTags.includes("general question")
  ) {
    // Only general question exists
    displayTags = ["general question"];
  }

  useEffect(() => {
    if (!currentLesson?.lessonId) return;

    const fetchSkillTags = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/lessons/${currentLesson.lessonId}/skill-tags`
        );
        const data = await res.json();
        setSkillTags(data);
      } catch (err) {
        console.error("Failed to fetch skill tags:", err);
      }
    };

    fetchSkillTags();
  }, [currentLesson]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchLessons = async () => {
      const res = await fetch(`${API_URL}/api/progress/ordered/${user.id}`);
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
        <div
          className="transition-all duration-300 ease-in-out lg:overflow-hidden"
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
            height: "100vh",
          }}
        >
          <div className="pt-[105px] px-4 md:px-6 lg:px-10 pb-12 md:pb-0 mx-auto w-full max-w-[1520px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {/* ----------------------PROGRESS OVERVIEW---------------------- */}
              <div className="w-full bg-white border-[#d4d4d4] border-[1px] h-auto shadow-custom col-span-1 lg:col-span-2 md:row-span-1 md:col-start-1 md:row-start-1 rounded-xl px-6 pt-4">
                <h1 className="text-xl lg:text-2xl font-medium">
                  Progress Overview
                </h1>

                <div className="flex flex-row mt-3">
                  <p className="font-semibold mr-[5px] text-sm lg:text-base">
                    Total Lessons:
                  </p>
                  <p className="text-sm lg:text-base">{totalLessons}</p>
                </div>

                <div className="flex flex-row">
                  <p className="font-semibold mr-[5px] text-sm lg:text-base">
                    Completed:{" "}
                  </p>
                  <p className="text-sm lg:text-base">
                    {completedLessons}/{totalLessons}
                  </p>
                </div>

                <div className="flex flex-row">
                  <p className="font-semibold mr-[5px] text-sm lg:text-base">
                    Average Score:{" "}
                  </p>
                  <p className="text-sm lg:text-base">88%</p>
                </div>

                {lessons.length > 0 && (
                  <div className="flex flex-row">
                    <p className="font-semibold mr-[5px] text-sm lg:text-base">
                      Last Activity:{" "}
                    </p>
                    <p className="text-sm lg:text-base">{lastActivity}</p>
                  </div>
                )}

                <div className="bg-[#979797] w-full h-[10px] lg:h-[15px] rounded-xl mt-3">
                  <div
                    className="bg-[#30608E] h-[10px] lg:h-[15px] rounded-l-xl"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                {progressPercent === 0 ? (
                  <p className="text-base lg:text-lg font-light my-2">
                    Start your first lesson to begin your journey!
                  </p>
                ) : progressPercent < 50 ? (
                  <p className="text-base lg:text-lg font-light my-2">
                    Great job! Keep progressing through the course.
                  </p>
                ) : progressPercent < 100 ? (
                  <p className="text-base lg:text-lg font-light my-2">
                    You're more than halfway there. Keep going!
                  </p>
                ) : (
                  <p className="text-base lg:text-lg font-light my-2">
                    Congratulations! You’ve completed the course! 🎉
                  </p>
                )}
              </div>
              {/* ----------------------Skill Development Goals---------------------- */}
              <div className="w-full bg-white border-[#d4d4d4] border-[1px] h-auto shadow-custom col-span-1 lg:col-span-2 md:row-span-3 col-start-1 md:row-start-2 rounded-xl px-6 pt-4">
                <h1 className="text-xl lg:text-2xl font-medium">
                  Skill Development Goals
                </h1>

                {displayTags.map((tag, index) => {
                  const formattedTag = tag
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");

                  const description =
                    skillDescriptions[tag] ?? "No description available.";

                  return (
                    <div key={index} className="mb-4 mt-2">
                      <p className="font-semibold text-[#30608E] text-base lg:text-lg">
                        {formattedTag}
                      </p>
                      <p className="font-light text-[#666666] text-sm lg:text-base">
                        Description: <span>{description}</span>
                      </p>
                      <p className="font-light text-[#666666] text-sm lg:text-base">
                        Suggested Next Step:{" "}
                        {skillNextSteps[tag] ??
                          `Explore more on ${formattedTag.toLowerCase()}.`}
                      </p>

                      <p className="text-sm text-gray-500 italic mt-2">
                        Covered in current lesson
                      </p>

                      <div className="mt-4 w-full h-[1px] bg-[#D6D6D6]"></div>
                    </div>
                  );
                })}
              </div>

              {/* ----------------------Current Lesson---------------------- */}
              <div className="w-full bg-white border-[#d4d4d4] border-[1px] h-auto shadow-custom col-span-1 md:row-span-1 lg:col-start-3 md:row-start-1 rounded-xl px-6 pt-4">
                {currentLesson ? (
                  <>
                    <h1 className="text-xl lg:text-2xl font-medium">
                      Current Lesson
                    </h1>
                    <p className="font-semibold mr-[5px] text-[#30608E] text-base lg:text-lg">
                      {currentLesson.title}
                    </p>

                    <div className="flex flex-col">
                      <p className="font-light mr-[5px] text-[#666666] text-sm lg:text-base">
                        Status: In Progress
                      </p>
                      {currentLesson.videoUrl && (
                        <p className="flex font-light my-2 text-[#2D2D2D] text-sm lg:text-base">
                          <BiSolidVideoRecording className="mr-1 mt-1" />
                          <span>Lesson Video</span>
                        </p>
                      )}
                      {/* Exercises */}
                      <p className="flex font-light mb-2 text-[#2D2D2D] text-sm lg:text-base">
                        <RiBallPenFill className="mr-1 mt-1" />
                        <span>Exercises</span>
                      </p>
                      {/* Description */}
                      {(() => {
                        if (!currentLesson) return null;

                        const normalizedTitle = currentLesson.title
                          .replace(/\s*:\s*/g, ": ")
                          .trim()
                          .toLowerCase(); // normalize casing

                        const matchKey = Object.keys(lessonDescriptions).find(
                          (key) => key.toLowerCase() === normalizedTitle
                        );
                        const description = matchKey
                          ? lessonDescriptions[matchKey]
                          : null;

                        return description ? (
                          <p className="flex font-light mb-2 text-[#2D2D2D] text-xs lg:text-sm">
                            {/* <PiReadCvLogoFill className="mr-1 mt-1" /> */}
                            <span>{description}</span>
                          </p>
                        ) : null;
                      })()}
                    </div>
                  </>
                ) : (
                  <p className="text-[#666]">No current lesson</p>
                )}
              </div>
              {/* ----------------------Next Lessons---------------------- */}
              <div className="w-full bg-white border-[#d4d4d4] border-[1px] h-auto shadow-custom col-span-1 md:row-span-3 lg:col-start-3 md:row-start-2 rounded-xl px-6 pt-4">
                <h1 className="text-xl lg:text-2xl font-medium">
                  Next Lessons
                </h1>

                {nextLessons.length > 0 ? (
                  nextLessons.slice(0, 2).map((lesson, index) => {
                    const normalizedTitle = lesson.title
                      .replace(/\s*:\s*/g, ": ")
                      .trim()
                      .toLowerCase();

                    const matchKey = Object.keys(lessonDescriptions).find(
                      (key) => key.toLowerCase() === normalizedTitle
                    );
                    const description = matchKey
                      ? lessonDescriptions[matchKey]
                      : null;

                    return (
                      <div key={lesson.lessonId} className="mb-6">
                        <p className="font-semibold text-[#30608E] text-base lg:text-lg">
                          {lesson.title}
                        </p>
                        <div className="flex flex-col">
                          <p className="font-light mr-[5px] text-[#666666] text-sm lg:text-base">
                            Status: <span>Pending</span>
                          </p>
                          {lesson.videoUrl && (
                            <p className="flex font-light mb-2 text-[#2D2D2D] text-sm lg:text-base">
                              <BiSolidVideoRecording className="mr-1 mt-1" />
                              <span>Lesson Video</span>
                            </p>
                          )}
                          <p className="flex font-light mb-2 text-[#2D2D2D] text-sm lg:text-base">
                            <RiBallPenFill className="mr-1 mt-1" />
                            <span>Exercises</span>
                          </p>
                          {description && (
                            <p className="font-light text-[#2D2D2D] text-xs lg:text-sm">
                              {description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[#666]">No upcoming lessons</p>
                )}
              </div>
              {/* ----------------------------------------------------------- */}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
