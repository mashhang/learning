"use client";

import { useEffect, useState } from "react";
import API_URL from "@/lib/getApiUrl";
import { useSidebar } from "@/app/context/SidebarContext";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type User = {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "USER" | "ADMIN";
};

export default function UsersAdmin() {
  const { isSidebarOpen, sidebarWidth } = useSidebar();
  const [screenWidth, setScreenWidth] = useState(0);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState("");
  const [adminSearch, setAdminSearch] = useState("");
  const [data, setData] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  {
    /* Filter users */
  }
  const studentUsers = users.filter((u) => u.role === "USER");
  const adminUsers = users.filter((u) => u.role === "ADMIN");
  const [loadingImport, setLoadingImport] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      setUsers(data);
      setData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(); // ⬅️ initial fetch
  }, []);

  const exportStudentList = () => {
    const csv = [
      ["Student ID", "Last Name", "First Name", "Email", "Role"],
      ...studentUsers.map((u) => [
        u.studentId,
        u.firstName,
        u.lastName,
        u.email,
        u.role,
      ]),
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

  const exportAdminList = () => {
    const csv = [
      ["Last Name", "First Name", "Email", "Role"],
      ...adminUsers.map((u) => [u.lastName, u.firstName, u.email, u.role]),
    ];

    const blob = new Blob([csv.map((r) => r.join(",")).join("\n")], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "admin_list.csv";
    link.click();
  };

  const downloadUserScores = async (userId: string, studentId: string) => {
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
      link.download = `${studentId}_scores.csv`;

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

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingImport(true); // ✅ Show loader

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim() !== "");
      const [headerLine, ...dataLines] = lines;
      const headers = headerLine.split(",").map((h) => h.trim());

      const users = dataLines.map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const user: Record<string, string> = {};
        headers.forEach((h, i) => (user[h] = values[i]));
        return user;
      });

      try {
        const res = await fetch(`${API_URL}/api/user/import`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ users }),
        });

        const result = await res.json();
        alert(
          `✅ Imported ${result.created} users.\n❌ Skipped ${
            result.skipped
          } existing emails:\n${result.skippedEmails.join("\n")}`
        );
        await fetchUsers();
      } catch (error) {
        console.error(error);
        alert("❌ Error importing users.");
      } finally {
        setLoadingImport(false); // ✅ Hide loader
      }
    };

    reader.readAsText(file);
  };

  const handleAddAdmin = async () => {
    const res = await fetch(`${API_URL}/api/user/create-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(newAdmin),
    });

    const result = await res.json();

    if (res.ok) {
      alert("✅ Admin created!");
      setShowAddModal(false);
      setNewAdmin({
        studentId: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });
      fetchUsers();
    } else {
      alert("❌ " + result.error);
    }
  };

  useEffect(() => {
    // Student filtering
    const filteredStudents = data.filter((entry) => {
      const matchesLastName = entry.lastName
        ?.toLowerCase()
        .includes(studentSearch.toLowerCase());
      const matchesFirstName = entry.firstName
        ?.toLowerCase()
        .includes(studentSearch.toLowerCase());
      const matchesStudentId = entry.studentId
        ?.toLowerCase()
        .includes(studentSearch.toLowerCase());

      return (
        entry.role === "USER" &&
        (matchesLastName || matchesFirstName || matchesStudentId)
      );
    });

    // Admin filtering
    const filteredAdmins = data.filter((entry) => {
      const matchesLastName = entry.lastName
        ?.toLowerCase()
        .includes(adminSearch.toLowerCase());
      const matchesFirstName = entry.firstName
        ?.toLowerCase()
        .includes(adminSearch.toLowerCase());
      const matchesEmail = entry.email
        ?.toLowerCase()
        .includes(adminSearch.toLowerCase());

      return (
        entry.role === "ADMIN" &&
        (matchesLastName || matchesFirstName || matchesEmail)
      );
    });

    setFilteredUsers(filteredStudents);
    setFilteredAdmins(filteredAdmins);
  }, [studentSearch, adminSearch, data]);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`${API_URL}/api/user/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        alert("✅ User deleted!");
        fetchUsers(); // Refresh list
      } else {
        const err = await res.json();
        alert("❌ Failed to delete: " + err.error);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error deleting user.");
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div
      className="transition-all duration-300 ease-in-out h-screen"
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
      <div className="p-8 my-4">
        {loadingImport && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg text-center">
              <p className="text-lg font-medium">Importing users...</p>
              <div className="mt-4 animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto" />
            </div>
          </div>
        )}

        <h1 className="text-2xl font-bold">Manage Users</h1>

        {/* === STUDENT USERS TABLE === */}
        <div className="flex justify-between items-center my-2">
          <h2 className="text-lg font-semibold">Students</h2>
          <input
            type="text"
            placeholder="Search student..."
            className="border px-4 py-2 rounded w-64 text-sm transition"
            onChange={(e) => setStudentSearch(e.target.value)}
          />

          <input
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="text-sm"
          />

          <button
            onClick={exportStudentList}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            Export Student List
          </button>
        </div>
        <div className="h-[300px] max-h-[300px] overflow-y-auto mb-10 border border-gray-300 rounded">
          <table className="bg-white w-full text-sm">
            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr className="border-b border-l">
                <th className="p-2 text-left">Student ID</th>
                <th className="p-2 text-left">Last Name</th>
                <th className="p-2 text-left">First Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-center">Role</th>
                <th className="p-2 text-center w-52">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers
                .filter((u) => u.role === "USER")
                .map((user) => (
                  <tr key={user.id} className="border">
                    <td className="p-2 ">{user.studentId}</td>
                    <td className="p-2 border">{user.lastName}</td>
                    <td className="p-2 border">{user.firstName}</td>
                    <td className="p-2 border">{user.email}</td>
                    <td className="p-2 text-center border">{user.role}</td>
                    <td className="p-2  flex flex-col sm:flex-row gap-2 text-center">
                      <button
                        onClick={() =>
                          downloadUserScores(user.id, user.studentId)
                        }
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
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* === ADMIN USERS TABLE === */}
        <div className="flex justify-between items-center my-2">
          <h2 className="text-lg font-semibold mb-2">Admins</h2>
          <input
            type="text"
            placeholder="Search student..."
            className="border px-4 py-2 rounded w-64 text-sm transition"
            onChange={(e) => setAdminSearch(e.target.value)}
          />

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
          >
            Add Admin
          </button>

          <button
            onClick={exportAdminList}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            Export Admin List
          </button>
        </div>
        <div className="h-[300px] max-h-[300px] overflow-y-auto mb-10 border border-gray-300 rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr className="border-b border-l">
                <th className="p-2 text-left">Last Name</th>
                <th className="p-2 text-left">First Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-center w-20">Role</th>
                <th className="p-2 text-center w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((user) => (
                <tr key={user.id} className="border">
                  <td className="p-2">{user.lastName}</td>
                  <td className="p-2 border">{user.firstName}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 text-center border">{user.role}</td>
                  <td className="p-2 text-center flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => resetUserPassword(user.id)}
                      className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 text-xs"
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Add Admin</h2>
              <div className="space-y-2">
                {[
                  "studentId",
                  "firstName",
                  "lastName",
                  "email",
                  "password",
                ].map((field) => (
                  <input
                    key={field}
                    type={field === "password" ? "password" : "text"}
                    placeholder={
                      {
                        studentId: "Username",
                        firstName: "First Name",
                        lastName: "Last Name",
                        email: "Email Address",
                        password: "Password",
                      }[field as keyof typeof newAdmin]
                    }
                    className="w-full border px-3 py-2 rounded text-sm"
                    value={newAdmin[field as keyof typeof newAdmin]}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, [field]: e.target.value })
                    }
                  />
                ))}
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-600 hover:text-black text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAdmin}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
