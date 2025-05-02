"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import API_URL from "@/lib/getApiUrl";
import { UserGroupIcon, BookOpenIcon } from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalLessons, setTotalLessons] = useState<number | null>(null);

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
        setTotalUsers(users.length);

        const lessonRes = await fetch(`${API_URL}/api/lessons`);
        const lessons = await lessonRes.json();
        setTotalLessons(lessons.length);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    }

    fetchStats();
  }, []);

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Admin Dashboard Overview</h1>
      <p className="mb-6">Welcome, {user.lastName}!</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow-md border border-gray-200 rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <UserGroupIcon className="h-5 w-5 text-blue-600" />
            Total Users
          </div>
          <div className="text-3xl font-bold text-blue-700">
            {totalUsers !== null ? totalUsers : "Loading..."}
          </div>
          <div className="text-xs text-gray-400">
            Includes admins and students
          </div>
        </div>

        <div className="bg-white shadow-md border border-gray-200 rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BookOpenIcon className="h-5 w-5 text-green-600" />
            Total Lessons
          </div>
          <div className="text-3xl font-bold text-green-600">
            {totalLessons !== null ? totalLessons : "Loading..."}
          </div>
          <div className="text-xs text-gray-400">Total lessons created</div>
        </div>
      </div>
    </div>
  );
}
