"use client";

import { useEffect, useState, useRef } from "react";
import DiagnosticArc from "@/app/components/DiagnosticArc";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

type LessonChartEntry = {
  name: string;
  chapter: string;
  lesson: string;
  percentage: number;
  correct?: number;
  total?: number;
};

interface DiagnosticResultSummaryProps {
  score: number;
  correctCount: number;
  totalCount: number;
  strengths: Record<string, string[]>;
  weaknesses: Record<string, string[]>;
  chartData: LessonChartEntry[];
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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const CustomAnimatedBar = ({
    x,
    y,
    width,
    height,
    index,
    activeIndex,
    setActiveIndex,
    fill,
  }: any) => {
    const isActive = activeIndex === null || activeIndex === index;
    const opacity = isActive ? 1 : 0.3;

    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        opacity={opacity}
        style={{
          transition: "opacity 2s ease-in-out",
          cursor: "pointer",
        }}
        onMouseEnter={() => setActiveIndex(index)}
        onMouseLeave={() => setActiveIndex(null)}
      />
    );
  };

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

  const sortedChartData = [...chartData].sort((a, b) =>
    a.chapter.localeCompare(b.chapter)
  );

  // Group lessons by chapter
  const groupedByChapter = chartData.reduce(
    (acc: Record<string, LessonChartEntry[]>, item) => {
      if (!acc[item.chapter]) acc[item.chapter] = [];
      acc[item.chapter].push(item);
      return acc;
    },
    {}
  );

  // Flatten for chart: use chapter as x-axis and each lesson as its own bar in a group
  const flattenedDataWithGaps: LessonChartEntry[] = [];

  Object.entries(groupedByChapter).forEach(
    ([chapter, lessons], chapterIndex, array) => {
      lessons.forEach((lesson, index) => {
        flattenedDataWithGaps.push({
          ...lesson,
          name: `${chapter} - Lesson ${index + 1}`,
          chapter,
          lesson: lesson.lesson,
          percentage: lesson.percentage,
          correct: lesson.correct, // ✅ new
          total: lesson.total, // ✅ new
        });
      });

      // ➕ Insert a spacer after each chapter (except the last one)
      if (chapterIndex < array.length - 1) {
        flattenedDataWithGaps.push({
          name: `Spacer-${chapterIndex}`,
          chapter: "",
          lesson: "",
          percentage: 0, // no visible bar
        });
      }
    }
  );

  return (
    <div className="space-y-10 bg-[#fef9f4] px-8 py-10 rounded-lg shadow-md text-[#1A3D6D]">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-[#1A3D6D] bg-[#f4ce93] py-2 px-6 rounded-md w-fit mx-auto uppercase tracking-wide">
        Diagnostic Exam Summary
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm border-t border-[#f4ce93] pt-6">
        {/* Arc Chart */}
        <div className="order-1 sm:order-2 flex justify-center">
          <div className="flex flex-col justify-center items-center gap-1">
            <DiagnosticArc
              score={score}
              correctCount={correctCount}
              totalCount={totalCount}
            />
          </div>
        </div>

        {/* Strengths */}
        <div className="order-2 sm:order-1">
          <div className="max-h-[300px] overflow-y-auto pr-2 ">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-center mb-2 bg-[#fef9f4] sticky top-0 z-10">
                Strength
              </h3>
              {Object.entries(strengths).map(([chapter, lessons]) => (
                <div key={chapter} className="mb-3">
                  <p className="font-bold text-[#1A3D6D] text-sm sm:text-base">
                    {chapter}
                  </p>
                  <ul className="ml-4 list-disc text-[#1A3D6D]">
                    {lessons.map((lesson, i) => (
                      <li key={i}>{lesson}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weaknesses */}
        <div className="order-3">
          <div className="max-h-[300px] overflow-y-auto pr-2">
            <h3 className="text-sm sm:text-base font-bold text-center mb-2 bg-[#fef9f4] sticky top-0 z-10">
              Weaknesses
            </h3>
            {Object.entries(weaknesses).map(([chapter, lessons]) => (
              <div key={chapter} className="mb-3">
                <p className="font-bold text-[#1A3D6D] text-sm sm:text-base">
                  {chapter}
                </p>
                <ul className="ml-4 list-disc text-[#1A3D6D]">
                  {lessons.map((lesson, i) => (
                    <li key={i}>{lesson}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[#f4ce93] pt-4">
        <h3 className="text-sm sm:text-base text-center font-bold mb-4 text-[#1A3D6D]">
          Diagnostic Exam Statistics
        </h3>

        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px]">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={flattenedDataWithGaps}
                margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
                barCategoryGap={0}
              >
                <XAxis
                  dataKey="chapter"
                  stroke="#1A3D6D"
                  interval={0}
                  tickFormatter={(value, index) => {
                    const current = flattenedDataWithGaps[index];
                    // Show only first label in a chapter group
                    const isFirst =
                      index === 0 ||
                      flattenedDataWithGaps[index - 1].chapter !==
                        current.chapter;
                    return current.chapter && isFirst ? current.chapter : "";
                  }}
                  tick={{ fontSize: 10 }}
                />

                <YAxis
                  stroke="#1A3D6D"
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  content={({ payload }) => {
                    const first = payload?.[0]?.payload;
                    if (!first || !first.chapter) return null;

                    return (
                      <div className="bg-white  shadow-md border rounded text-sm text-[#1A3D6D]">
                        <div className="font-semibold">
                          {first.chapter} - {first.lesson}
                        </div>
                        {first.correct !== undefined &&
                          first.total !== undefined && (
                            <div>
                              Score: {first.correct} out of {first.total}
                            </div>
                          )}
                        <div>Score (%): {first.percentage}%</div>
                      </div>
                    );
                  }}
                />

                <Legend />
                {/* <Bar
              dataKey="percentage"
              fill="#1A3D6D"
              name="Score (%)"
              radius={[5, 5, 0, 0]}
            /> */}
                <Bar
                  dataKey="percentage"
                  radius={[5, 5, 0, 0]}
                  shape={(props) => {
                    const entry = flattenedDataWithGaps[props.index];
                    const score = entry.percentage;

                    let fill = "#DC2626"; // red
                    if (score >= 80) fill = "#16A34A"; // green
                    else if (score >= 50) fill = "#FACC15"; // yellow

                    return (
                      <CustomAnimatedBar
                        {...props}
                        fill={entry.chapter ? fill : "transparent"}
                        activeIndex={activeIndex}
                        setActiveIndex={setActiveIndex} // ✅ pass setter
                        index={props.index}
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
