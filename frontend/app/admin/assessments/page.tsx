"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type AssessmentEntry = {
  userId: string;
  userName: string;
  lessonTitle: string;
  type: "PRE" | "POST";
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

  useEffect(() => {
    fetch(`${API_URL}/api/assessment/admin/assessments`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setFiltered(data);
      });
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
          <option value="PRE">Pre-Assessment</option>
          <option value="POST">Post-Assessment</option>
        </select>
      </div>

      <table className="w-full text-left border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Student</th>
            <th className="p-2 border">Lesson</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Score</th>
            <th className="p-2 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((entry, idx) => (
            <tr key={idx} className="border-t">
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
