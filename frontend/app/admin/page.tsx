"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import API_URL from "@/lib/getApiUrl";
import { UserGroupIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { useSidebar } from "@/app/context/SidebarContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { isSidebarOpen, sidebarWidth } = useSidebar();
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setScreenWidth(window.innerWidth);
      const handleResize = () => setScreenWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [adminCount, setAdminCount] = useState<number | null>(null);
  const [totalLessons, setTotalLessons] = useState<number | null>(null);
  const [lessonStats, setLessonStats] = useState<any[]>([]);
  const [diagnosticStats, setDiagnosticStats] = useState<{
    count: number;
    average: number;
  } | null>(null);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const userRes = await fetch(`${API_URL}/api/user`);
        const users = await userRes.json();
        const students = users.filter((u: any) => u.role === "USER");
        const admins = users.filter((u: any) => u.role === "ADMIN");
        setStudentCount(students.length);
        setAdminCount(admins.length);

        const lessonRes = await fetch(`${API_URL}/api/lessons`);
        const lessons = await lessonRes.json();
        setTotalLessons(lessons.length);

        // Fetch lesson engagement stats
        const engagementRes = await fetch(
          `${API_URL}/api/admin/lesson-engagement`
        );
        const engagementData = await engagementRes.json();
        setLessonStats(engagementData);

        // Fetch diagnostic stats
        const diagnosticRes = await fetch(
          `${API_URL}/api/diagnostic/admin/diagnostic-summary`
        );
        const diagnosticData = await diagnosticRes.json();
        setDiagnosticStats(diagnosticData);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    }

    fetchStats();
  }, []);

  const groupedLessons = lessonStats.reduce((acc: any, lesson) => {
    const key = lesson.chapterTitle || "Uncategorized";
    if (!acc[key]) acc[key] = [];
    acc[key].push(lesson);
    return acc;
  }, {});

  // Sort chapters alphabetically or by chapterOrder if available
  const sortedChapters = Object.keys(groupedLessons).sort((a, b) => {
    const getOrder = (title: string) => {
      const chapter = lessonStats.find((l) => l.chapterTitle === title);
      return chapter?.chapterOrder ?? 999;
    };
    return getOrder(a) - getOrder(b);
  });

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div
      className="transition-all duration-300 ease-in-out min-h-screen overflow-auto"
      style={{
        marginLeft:
          typeof window !== "undefined" &&
          window.innerWidth >= 768 &&
          isSidebarOpen
            ? "224px" // Tailwind's w-56 (14rem)
            : "0",
        width:
          typeof window !== "undefined" &&
          window.innerWidth >= 768 &&
          isSidebarOpen
            ? "calc(100% - 224px)"
            : "100%",
      }}
    >
      <div className="p-8 w-full my-4 mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard</h1>
        <p className="text-gray-600 mb-6 text-sm">
          Welcome back, {user.lastName}!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl shadow flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <UserGroupIcon className="h-5 w-5" />
              Students
            </div>
            <div className="text-3xl font-extrabold text-blue-900">
              {studentCount !== null ? studentCount : "..."}
            </div>
            <p className="text-xs text-blue-500">Registered learners</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 p-5 rounded-2xl shadow flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-purple-700">
              <UserGroupIcon className="h-5 w-5" />
              Admins
            </div>
            <div className="text-3xl font-extrabold text-purple-900">
              {adminCount !== null ? adminCount : "..."}
            </div>
            <p className="text-xs text-purple-500">System managers</p>
          </div>

          <div className="bg-green-50 border border-green-200 p-5 rounded-2xl shadow flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <BookOpenIcon className="h-5 w-5" />
              Total Lessons
            </div>
            <div className="text-3xl font-extrabold text-green-900">
              {totalLessons !== null ? totalLessons : "..."}
            </div>
            <p className="text-xs text-green-500">
              All lessons currently available
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl shadow flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-yellow-700">
              <BookOpenIcon className="h-5 w-5" />
              Diagnostic Summary
            </div>
            <div className="text-sm text-yellow-800">
              {diagnosticStats ? (
                <>
                  <p className="text-lg font-semibold">
                    {diagnosticStats.count} students
                  </p>
                  <p className="text-xs">
                    Avg Score: {diagnosticStats.average}%
                  </p>
                </>
              ) : (
                "Loading..."
              )}
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-700 mt-10 mb-4">
          Lesson Engagement Overview
        </h2>
        <div className="bg-white overflow-x-auto rounded-xl shadow border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Lesson</th>
                <th className="p-3 text-center">Completed</th>
                <th className="p-3 text-center">Pre-Taken</th>
                <th className="p-3 text-center">Post-Taken</th>
                <th className="p-3 text-center">Avg Pre</th>
                <th className="p-3 text-center">Avg Post</th>
              </tr>
            </thead>
            <tbody>
              {sortedChapters.map((chapter) => (
                <>
                  <tr
                    key={chapter}
                    className="bg-gray-50 font-semibold text-gray-700"
                  >
                    <td className="p-3" colSpan={6}>
                      {chapter}
                    </td>
                  </tr>
                  {groupedLessons[chapter]
                    .sort((a, b) => a.order - b.order)
                    .map((lesson) => (
                      <tr key={lesson.id} className="border-t">
                        <td className="p-3 font-medium text-gray-800">
                          {lesson.title}
                        </td>
                        <td className="p-3 text-center">
                          {lesson.completedCount}
                        </td>
                        <td className="p-3 text-center">{lesson.preCount}</td>
                        <td className="p-3 text-center">{lesson.postCount}</td>
                        <td className="p-3 text-center">
                          {lesson.avgPreScore ?? "—"}%
                        </td>
                        <td className="p-3 text-center">
                          {lesson.avgPostScore ?? "—"}%
                        </td>
                      </tr>
                    ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
