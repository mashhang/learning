"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex">
      <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <nav className="mt-4">
          <ul>
            <li className="mb-2">
              <a href="/admin">Dashboard</a>
            </li>
            <li className="mb-2">
              <a href="/admin/chapters">Chapters</a>
            </li>
            <li className="mb-2">
              <a href="/admin/lessons">Lessons</a>
            </li>
            <li className="mb-4">
              <a href="/admin/users">Users</a>
            </li>
          </ul>
        </nav>

        {/* ✅ Logout Button */}
        <button
          onClick={logout}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md mt-6"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
