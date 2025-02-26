"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/login"); // Redirect unauthorized users
    }
  }, [user, router]);

  if (!user || user.role !== "ADMIN") return null; // Prevent rendering if unauthorized

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p>Welcome, {user.name}!</p>

      <div className="mt-4">
        <Link href="/admin/lessons">
          <button className="bg-blue-500 text-white p-2 rounded">
            Manage Lessons
          </button>
        </Link>
      </div>
    </div>
  );
}
