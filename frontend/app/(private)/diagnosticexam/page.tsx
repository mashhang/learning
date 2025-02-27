"use client";

import { useState, useEffect } from "react";

type Question = {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: string;
};

type Lesson = {
  id: string;
  title: string;
  content: string;
  questions: Question[];
};

export default function DiagnosticExam() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: string | null;
  }>({});

  useEffect(() => {
    fetch("http://localhost:5001/api/lessons") // ✅ Fetch all lessons with questions
      .then((res) => res.json())
      .then((data) => setLessons(data))
      .catch((error) => console.error("Error fetching lessons:", error));
  }, []);

  if (lessons.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-10">Loading questions...</p>
    );
  }

  // ✅ Handle Answer Selection
  const handleAnswerClick = (questionId: string, choice: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: choice }));
  };

  return (
    <div className="pt-[96px] px-10">
      <div className="text-[#30608E] text-center mt-[50px]">
        <h1 className="text-3xl font-bold">Diagnostic Exam</h1>
      </div>

      {/* ✅ Stacked Layout (Vertical) */}
      <div className="mt-[50px] flex flex-col gap-10">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="w-full">
            {/* ✅ Keep Lesson Title Left-Aligned */}
            <h2 className="text-2xl font-bold text-[#30608E] mb-4 ml-[470px]">
              {lesson.title}
            </h2>

            {/* ✅ Center the Question Box */}
            <div className="flex flex-col items-center gap-6">
              {lesson.questions.map((question, qIndex) => (
                <div
                  key={question.id}
                  className="bg-[#30608E] text-white p-6 rounded-lg w-[50%]"
                >
                  {/* Header */}
                  <div className="text-left text-sm font-semibold">
                    Question {qIndex + 1}
                  </div>

                  {/* Question Text */}
                  <p className="mt-4 text-xl">{question.question}</p>
                  <p className="mt-2 text-md">Choose the correct answer.</p>

                  {/* Answer Choices */}
                  <div className="mt-4 flex flex-col gap-2">
                    {question.choices.map((choice, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerClick(question.id, choice)}
                        className={`w-full border border-[#C5C5C5] py-3 px-4 rounded-md text-left transition
                          ${
                            selectedAnswers[question.id] === choice
                              ? "bg-white text-[#30608E] font-bold"
                              : "bg-transparent text-white"
                          }
                          hover:bg-white hover:text-[#30608E]`}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
