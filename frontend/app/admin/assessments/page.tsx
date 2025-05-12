"use client";

import { useEffect, useState } from "react";

import API_URL from "@/lib/getApiUrl";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type AssessmentEntry = {
  userId: string;
  studentId: string;
  userName: string;
  lastName: string;
  firstName: string;
  userEmail: string;
  lessonTitle: string;
  type: "PRE" | "POST" | "DIAGNOSTIC";
  score: number;
  correct: number;
  total: number;
  createdAt: string;
};

export default function AssessmentHistoryPage() {
  const [data, setData] = useState<AssessmentEntry[]>([]);
  const [filtered, setFiltered] = useState<AssessmentEntry[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [timerMinutes, setTimerMinutes] = useState<number>(60);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch(`${API_URL}/api/settings/diagnostic-timer`)
      .then((res) => res.json())
      .then((data) => setTimerMinutes(data.diagnosticTimerMinutes))
      .catch(console.error);
  }, []);

  useEffect(() => {
    async function fetchData() {
      const [assessmentRes, diagnosticRes] = await Promise.all([
        fetch(
          `${API_URL}/api/assessment/admin/assessments?page=${page}&limit=20`
        ),
        fetch(`${API_URL}/api/diagnostic/admin/diagnostic-results`),
      ]);

      const assessmentJson = await assessmentRes.json();
      const diagnosticJson = await diagnosticRes.json();

      const assessmentData = assessmentJson.results;
      const diagnosticData = diagnosticJson;

      if (!Array.isArray(assessmentData) || !Array.isArray(diagnosticData)) {
        console.error("Invalid assessment or diagnostic data", {
          assessmentData,
          diagnosticData,
        });
        return;
      }

      setData(assessmentData); // already paginated by backend
      setFiltered(assessmentData);
      setTotalPages(assessmentJson.totalPages || 1);
    }

    fetchData();
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter]);

  useEffect(() => {
    let result = [...data];
    if (search) {
      result = result.filter((entry) => {
        const matchesLastName = entry.lastName
          ?.toLowerCase()
          .includes(search.toLowerCase());
        const matchesFirstName = entry.firstName
          ?.toLowerCase()
          .includes(search.toLowerCase());
        const matchesStudentId = entry.studentId
          ?.toLowerCase()
          .includes(search.toLowerCase());

        return matchesLastName || matchesFirstName || matchesStudentId;
      });
    }
    if (typeFilter !== "ALL") {
      result = result.filter((entry) => entry.type === typeFilter);
    }
    setFiltered(result);
  }, [search, typeFilter, data]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Assessment History</h1>

      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search student..."
          className="border px-4 py-2 rounded w-64"
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border px-4 py-2 rounded"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All Types</option>
          <option value="DIAGNOSTIC">Diagnostic Exam</option>
          <option value="PRE">Pre-Assessment</option>
          <option value="POST">Post-Assessment</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="font-semibold mr-2">
          Diagnostic Exam Timer (minutes):
        </label>
        <input
          type="number"
          value={timerMinutes}
          onChange={(e) => setTimerMinutes(Number(e.target.value))}
          className="border px-2 py-1 rounded w-24 mr-2"
        />
        <button
          onClick={async () => {
            await fetch(`${API_URL}/api/settings/diagnostic-timer`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ diagnosticTimerMinutes: timerMinutes }),
            });
            alert("Timer updated!");
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
        >
          Save
        </button>
      </div>

      <table className="w-full text-left border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Student ID</th>
            <th className="p-2 border">Student</th>
            <th className="p-2 border">Lesson</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Score</th>
            <th className="p-2 border">Date Taken</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((entry, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2">{entry.studentId}</td>
              {/* <td className="p-2">{entry.userEmail?.split("@")[0] || "-"}</td> */}
              <td className="p-2">
                {entry.lastName}, {entry.firstName}
                {/* {entry.userName} */}
              </td>
              <td className="p-2">{entry.lessonTitle}</td>
              <td className="p-2">{entry.type}</td>
              <td className="p-2">
                {entry.score}% ({entry.correct}/{entry.total})
              </td>
              <td className="p-2">
                {new Date(entry.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-500 mt-4 italic">No assessment data found.</p>
      )}
    </div>
  );
}
