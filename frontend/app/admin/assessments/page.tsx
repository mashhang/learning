"use client";

import { useEffect, useState } from "react";

import API_URL from "@/lib/getApiUrl";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type AssessmentEntry = {
  userId: string;
  userName: string;
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

  useEffect(() => {
    fetch(`${API_URL}/api/settings/diagnostic-timer`)
      .then((res) => res.json())
      .then((data) => setTimerMinutes(data.diagnosticTimerMinutes))
      .catch(console.error);
  }, []);

  useEffect(() => {
    async function fetchData() {
      const [assessmentRes, diagnosticRes] = await Promise.all([
        fetch(`${API_URL}/api/assessment/admin/assessments`),
        fetch(`${API_URL}/api/diagnostic/admin/diagnostic-results`),
      ]);

      const assessmentData = await assessmentRes.json();
      const diagnosticData = await diagnosticRes.json();

      const combined = [...assessmentData, ...diagnosticData];

      setData(combined);
      setFiltered(combined);
    }

    fetchData();
  }, []);

  useEffect(() => {
    let result = [...data];
    if (search) {
      result = result.filter((entry) =>
        entry.userName.toLowerCase().includes(search.toLowerCase())
      );
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
              <td className="p-2">{entry.userEmail?.split("@")[0] || "-"}</td>
              <td className="p-2">{entry.userName}</td>
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

      {filtered.length === 0 && (
        <p className="text-gray-500 mt-4 italic">No assessment data found.</p>
      )}
    </div>
  );
}
