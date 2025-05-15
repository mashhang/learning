import React, { useState } from "react";

type LessonChartEntry = {
  name: string;
  chapter: string;
  lesson: string;
  percentage: number;
  correct?: number;
  total?: number;
};

export default function RedesignedDiagnosticSummary({
  user,
  exam,
  score,
  requiredScore,
  chartData,
}) {
  const outcome = score >= requiredScore ? "✔️ Pass" : "❌ Fail";
  const outcomeColor =
    score >= requiredScore ? "text-green-600" : "text-red-600";

  const [expandedChapters, setExpandedChapters] = useState<
    Record<string, boolean>
  >({});

  const lessonObjectives: Record<string, string> = {
    "Lesson 1: Functions and Relations":
      "Understand the definition and representation of functions and relations.",
    "Lesson 2: Domain and Range of Function":
      "Identify the domain and range of various types of functions from equations, graphs, and mappings.",
    "Lesson 3: Operations on Functions":
      "Perform addition, subtraction, multiplication, and division of functions.",
    "Lesson 4: Evaluation on functions":
      "Evaluate functions for specific input values using substitution.",
    "Lesson 1: Rational Functions":
      "Define, simplify, and graph rational functions including asymptotes.",
    "Lesson 2: Rational Equations":
      "Solve equations involving rational expressions and identify extraneous solutions.",
    "Lesson 3: Rational Inequalities":
      "Solve inequalities with rational expressions and express solutions in interval notation.",
    "Lesson 1: Inverse Functions":
      "Find and verify inverse functions algebraically and graphically.",
    "Lesson 2: Exponential Function":
      "Interpret and analyze exponential functions and their graphs.",
    "Lesson 3: Exponential Equations":
      "Solve exponential equations using logarithms.",
    "Lesson 4: Exponential Inequalities":
      "Solve inequalities involving exponential functions.",
    "Lesson 5: Logarithmic Functions":
      "Understand logarithms, their properties, and solve logarithmic equations.",
    "Lesson 1: Simple and Compound Interests":
      "Calculate interest and amount using simple and compound interest formulas.",
    "Lesson 2: Simple and General Annuities":
      "Compute present and future values of ordinary and general annuities.",
    "Lesson 3: Stock and Bonds":
      "Understand the basic concepts of stock and bond investment and compute returns.",
    "Lesson 4: Business and Consumer Loans":
      "Analyze types of loans and calculate monthly amortizations.",
    "Lesson 1: Logical Preposition":
      "Distinguish between simple and compound propositions and determine truth values.",
    "Lesson 2: Methods of Proof":
      "Apply different methods of mathematical proof including direct, indirect, and contradiction.",
  };

  const groupedData = chartData
    .sort((a, b) => {
      const chapterA = parseInt(a.chapter.replace(/\D/g, ""), 10);
      const chapterB = parseInt(b.chapter.replace(/\D/g, ""), 10);
      if (chapterA !== chapterB) return chapterA - chapterB;

      const lessonA = parseInt(a.lesson.replace(/\D/g, ""), 10);
      const lessonB = parseInt(b.lesson.replace(/\D/g, ""), 10);
      return lessonA - lessonB;
    })
    .reduce((acc, entry) => {
      if (!acc[entry.chapter]) acc[entry.chapter] = [];
      acc[entry.chapter].push(entry);
      return acc;
    }, {} as Record<string, LessonChartEntry[]>);

  const toggleChapter = (chapter: string) => {
    setExpandedChapters((prev) => ({ ...prev, [chapter]: !prev[chapter] }));
  };

  return (
    <div className="bg-white shadow-lg p-8 rounded-xl max-w-4xl mx-auto text-[#1A3D6D]">
      <h2 className="text-center text-2xl font-bold mb-6 border-b pb-2 uppercase">
        Exam Score Report
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-8">
        <div>
          <h3 className="font-semibold mb-2">Candidate</h3>
          <p>Name: {user.fullName}</p>
          <p>Email: {user.email}</p>
          <p>ID: {user.id}</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Exam</h3>
          <p>Title: {exam.title}</p>
          <p>Reference #: {exam.reference}</p>
          <p>Date: {exam.date}</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-semibold mb-2">Results</h3>
        <div className="relative bg-gray-100 h-6 rounded">
          <div className="absolute top-0 left-[70%] h-full w-0.5 bg-black" />
          <div
            className="bg-blue-600 h-full rounded-l"
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Required: {requiredScore}% &nbsp;|&nbsp; Your Score: {score}%
        </p>
      </div>

      <div className="mb-8">
        <div className="flex flex-row justify-between mx-2">
          <h3 className="font-semibold mb-2">Section Analysis</h3>
          <span className="font-semibold mb-2">Score</span>
        </div>
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            {/* <tr>
              <th className="p-2 text-left">Chapter</th>
              <th className="p-2 text-right">Score</th>
            </tr> */}
          </thead>
          <tbody>
            {Object.entries(groupedData).map(([chapter, lessons]) => {
              const typedLessons = lessons as LessonChartEntry[];
              return (
                <React.Fragment key={chapter}>
                  <tr
                    className="bg-gray-100 cursor-pointer"
                    onClick={() => toggleChapter(chapter)}
                  >
                    <td colSpan={2} className="p-2 font-bold text-[#1A3D6D]">
                      {chapter} {expandedChapters[chapter] ? "▲" : "▼"}
                    </td>
                  </tr>
                  {expandedChapters[chapter] &&
                    typedLessons.map((entry, index) => (
                      <tr key={`${chapter}-${index}`} className="border-t">
                        <td className="p-2">
                          <div>
                            <p className="font-medium">{entry.lesson}</p>
                            {lessonObjectives[entry.lesson] && (
                              <p className="text-xs text-gray-500 mt-1">
                                {lessonObjectives[entry.lesson]}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-2 text-right">{entry.percentage}%</td>
                      </tr>
                    ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center bg-gray-50 p-4 rounded border">
        <div>
          <h4 className="font-semibold">Final Score</h4>
          {/* <p>Required: {requiredScore}%</p> */}
          <p className="text-xl">Your Score: {score}%</p>
        </div>
        <div className={`text-3xl font-bold ${outcomeColor}`}>{outcome}</div>
      </div>
    </div>
  );
}
