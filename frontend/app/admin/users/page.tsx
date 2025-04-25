"use client";

import { useEffect, useState } from "react";
import API_URL from "@/lib/getApiUrl";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type User = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  {
    /* Filter users */
  }
  const studentUsers = users.filter((u) => u.role === "USER");
  const adminUsers = users.filter((u) => u.role === "ADMIN");

  useEffect(() => {
    fetch(`${API_URL}/api/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ Send token
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      });
  }, []);

  const exportStudentList = () => {
    const csv = [
      ["Name", "Email", "Role"],
      ...studentUsers.map((u) => [u.name, u.email, u.role]),
    ];

    const blob = new Blob([csv.map((r) => r.join(",")).join("\n")], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student_list.csv";
    link.click();
  };

  const downloadUserScores = async (userId: string, userName: string) => {
    try {
      // Fetch PRE/POST scores
      const prePostRes = await fetch(
        `${API_URL}/api/assessment/admin/assessments?userId=${userId}`
      );
      const prePost = await prePostRes.json();

      // Fetch Diagnostic scores
      const diagnosticRes = await fetch(
        `${API_URL}/api/diagnostic/results?userId=${userId}`
      );
      const diagnostic = await diagnosticRes.json();

      // Combine and label entries
      const allResults = [
        ...diagnostic.map((d: any) => ({
          ...d,
          type: "DIAGNOSTIC",
        })),
        ...prePost,
      ];

      // ✅ Sort by chapterTitle then lessonTitle
      allResults.sort((a, b) => {
        if (a.chapterTitle < b.chapterTitle) return -1;
        if (a.chapterTitle > b.chapterTitle) return 1;
        return a.lessonTitle.localeCompare(b.lessonTitle);
      });

      // Build CSV
      const csv = [
        ["Chapter", "Lesson", "Type", "Correct", "Total", "Score (%)"],
        ...allResults.map((d) => [
          d.chapterTitle || "Unassigned",
          d.lessonTitle,
          d.type,
          d.correct,
          d.total,
          d.score,
        ]),
      ];

      const blob = new Blob([csv.map((r) => r.join(",")).join("\n")], {
        type: "text/csv",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      const emailPrefix =
        users.find((u) => u.id === userId)?.email.split("@")[0] || "user";
      link.download = `${emailPrefix}_scores.csv`;

      link.click();
    } catch (err) {
      console.error("❌ Error downloading scores:", err);
      alert("Failed to download user scores.");
    }
  };

  const resetUserPassword = async (userId: string) => {
    const res = await fetch(`${API_URL}/api/user/${userId}/reset-password`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (res.ok) {
      alert("✅ Reset email sent!");
    } else {
      const err = await res.json();
      alert("❌ Failed: " + err.error);
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="m-4">
      <h1 className="text-2xl font-bold">Manage Users</h1>

      {/* === STUDENT USERS TABLE === */}
      <div className="flex justify-between items-center my-2">
        <h2 className="text-lg font-semibold">Students</h2>
        <button
          onClick={exportStudentList}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          Export Student List
        </button>
      </div>
      <table className="w-full border text-sm mb-10">
        <thead>
          <tr className="border-b bg-gray-200">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {studentUsers.map((user) => (
            <tr key={user.id} className="border">
              <td className="p-2 border">{user.name}</td>
              <td className="p-2 border">{user.email}</td>
              <td className="p-2 border">{user.role}</td>
              <td className="p-2 border flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => downloadUserScores(user.id, user.name)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs"
                >
                  Download Scores
                </button>
                <button
                  onClick={() => resetUserPassword(user.id)}
                  className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 text-xs"
                >
                  Reset Password
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* === ADMIN USERS TABLE === */}
      <h2 className="text-lg font-semibold mb-2">Admins</h2>
      <table className="w-full border text-sm">
        <thead>
          <tr className="border-b bg-gray-200">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
          </tr>
        </thead>
        <tbody>
          {adminUsers.map((user) => (
            <tr key={user.id} className="border">
              <td className="p-2 border">{user.name}</td>
              <td className="p-2 border">{user.email}</td>
              <td className="p-2 border">{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
