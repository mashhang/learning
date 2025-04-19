"use client";

import { useEffect, useState } from "react";
import DiagnosticArc from "@/app/components/DiagnosticArc";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DiagnosticResultSummaryProps {
  score: number;
  correctCount: number;
  totalCount: number;
  strengths: Record<string, string[]>;
  weaknesses: Record<string, string[]>;
  chartData: { name: string; strength: number; weakness: number }[];
}

export default function DiagnosticResultSummary({
  score,
  correctCount,
  totalCount,
  strengths,
  weaknesses,
  chartData,
}: DiagnosticResultSummaryProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedCorrect, setAnimatedCorrect] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    setAnimatedScore(0);
    setAnimatedCorrect(0);

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setAnimatedScore(Math.round(score * eased));
      setAnimatedCorrect(Math.round(correctCount * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [score, correctCount]);

  return (
    <div className="space-y-10 bg-[#fef9f4] px-8 py-10 rounded-lg shadow-md text-[#1A3D6D]">
      <h2 className="text-3xl font-bold text-center text-[#1A3D6D] bg-[#f4ce93] py-2 px-6 rounded-md w-fit mx-auto uppercase tracking-wide">
        Diagnostic Exam Summary
      </h2>

      <div className="grid grid-cols-3 gap-6 text-sm border-t border-[#f4ce93] pt-6">
        {/* Strengths */}
        <div>
          <h3 className="font-bold text-center mb-2">Strength</h3>
          {Object.entries(strengths).map(([chapter, lessons]) => (
            <div key={chapter} className="mb-3">
              <p className="font-bold text-[#1A3D6D]">{chapter}</p>
              <ul className="ml-4 list-disc text-[#1A3D6D]">
                {lessons.map((lesson, i) => (
                  <li key={i}>{lesson}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Arc Chart */}
        <div className="flex flex-col justify-center items-center gap-1">
          <DiagnosticArc
            score={score}
            correctCount={correctCount}
            totalCount={totalCount}
          />
        </div>

        {/* Weaknesses */}
        <div>
          <h3 className="font-bold text-center mb-2">Weaknesses</h3>
          {Object.entries(weaknesses).map(([chapter, lessons]) => (
            <div key={chapter} className="mb-3">
              <p className="font-bold text-[#1A3D6D]">{chapter}</p>
              <ul className="ml-4 list-disc text-[#1A3D6D]">
                {lessons.map((lesson, i) => (
                  <li key={i}>{lesson}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#f4ce93] pt-4">
        <h3 className="text-center font-bold mb-4 text-[#1A3D6D]">
          Diagnostic Exam Statistics
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" stroke="#1A3D6D" />
            <YAxis stroke="#1A3D6D" />
            <Tooltip />
            <Legend />
            <Bar dataKey="strength" fill="#1A3D6D" name="Strength" />
            <Bar dataKey="weakness" fill="#f4ce93" name="Weakness" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
