"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { InlineMath } from "react-katex";

type ExampleExercise = {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  skillTag?: string;
};

export default function ExampleExerciseManager() {
  const params = useParams();
  const lessonId = params.id as string;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/exercises/${lessonId}`)
      .then((res) => res.json())
      .then((data) =>
        setExercises(
          data.map((ex) => ({
            ...ex,
            explanation: ex.explanation ?? "", // ✅ ensures no null
          }))
        )
      );
  }, [lessonId]);

  const [exercises, setExercises] = useState([
    {
      question: "",
      choices: ["", "", "", ""],
      correctAnswer: "",
      difficulty: "EASY",
      skillTag: "",
      explanation: "",
    },
  ]);

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        question: "",
        choices: ["", "", "", ""],
        correctAnswer: "",
        difficulty: "EASY",
        skillTag: "",
        explanation: "",
      },
    ]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...exercises];
    (updated[index] as any)[field] = value;
    setExercises(updated);
  };

  const handleChoiceChange = (
    index: number,
    choiceIndex: number,
    value: string
  ) => {
    const updated = [...exercises];
    updated[index].choices[choiceIndex] = value;
    setExercises(updated);
  };

  const handleSubmitExercises = async () => {
    await fetch(`${API_URL}/api/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercises, lessonId }),
    });
    alert("Exercises updated!");
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-[#30608E] mb-2">
        Example Exercises
      </h2>
      <p className="text-sm text-gray-600 mb-2">
        Total Exercises: {exercises.length}
      </p>

      {exercises.map((exercise, index) => (
        <div key={index} className="border p-4 rounded mb-4">
          <p className="font-medium text-gray-700 mb-2">Exercise {index + 1}</p>

          {/* Question input */}

          <input
            type="text"
            placeholder="Question"
            value={exercise.question}
            onChange={(e) =>
              handleExerciseChange(index, "question", e.target.value)
            }
            className="w-full border px-3 py-2 "
          />
          <div className="bg-gray-100 p-2 rounded break-words mb-2">
            <InlineMath>{exercise.question}</InlineMath>
          </div>

          {/* Choices */}
          {exercise.choices.map((choice, cIndex) => (
            <div key={cIndex} className="mb-2">
              <input
                key={cIndex}
                type="text"
                placeholder={`Choice ${cIndex + 1}`}
                value={choice}
                onChange={(e) =>
                  handleChoiceChange(index, cIndex, e.target.value)
                }
                className="w-full border px-3 py-2"
              />
              <div className="bg-gray-100 p-2 rounded break-words mb-2">
                <InlineMath>{choice}</InlineMath>
              </div>
            </div>
          ))}

          {/* Correct Answer */}
          <input
            type="text"
            placeholder="Correct Answer"
            value={exercise.correctAnswer}
            onChange={(e) =>
              handleExerciseChange(index, "correctAnswer", e.target.value)
            }
            className="w-full border px-3 py-2"
          />
          <div className="bg-gray-100 p-2 rounded break-words mb-2">
            <InlineMath>{exercise.correctAnswer}</InlineMath>
          </div>

          {/* Explanation input */}
          <textarea
            placeholder="Explanation (shown after answering)"
            value={exercise.explanation}
            onChange={(e) =>
              handleExerciseChange(index, "explanation", e.target.value)
            }
            className="w-full border px-3 py-2"
          ></textarea>
          <div className="bg-gray-100 p-2 rounded break-words mb-2">
            <InlineMath>{exercise.explanation}</InlineMath>
          </div>

          {/* Skill Tag */}
          <input
            type="text"
            placeholder="Skill Tag (e.g., mapping, domain, etc.)"
            value={exercise.skillTag}
            onChange={(e) =>
              handleExerciseChange(index, "skillTag", e.target.value)
            }
            className="w-full border px-3 py-2 mb-2"
          />

          {/* Difficulty */}
          <select
            value={exercise.difficulty}
            onChange={(e) =>
              handleExerciseChange(index, "difficulty", e.target.value)
            }
            className="w-full border px-3 py-2 mb-2"
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>

          <button
            type="button"
            onClick={() => removeExercise(index)}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded shadow mt-1"
          >
            Remove Exercise
          </button>
        </div>
      ))}

      {/* ✅ Add More */}
      <button
        type="button"
        onClick={addExercise}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2"
      >
        + Add Exercise
      </button>

      {/* ✅ Submit Exercises */}
      <button
        type="button"
        onClick={handleSubmitExercises}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Update Exercises
      </button>
    </div>
  );
}
