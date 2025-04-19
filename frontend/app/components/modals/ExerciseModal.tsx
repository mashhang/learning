"use client";

import React, { useState, useEffect, useRef } from "react";
import MathKeypad from "@/app/components/MathKeypad";
import MathInput from "@/app/components/MathInput";

type ExampleExercise = {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  skillTag?: string;
  explanation: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  editIndex: number | null;
  initialData: {
    question: string;
    choices: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    skillTag: string;
  };
  onSaveToServer: (
    data: {
      question: string;
      choices: string[];
      correctAnswer: string;
      explanation: string;
      difficulty: "EASY" | "MEDIUM" | "HARD";
      skillTag: string;
    },
    index: number | null
  ) => Promise<void>;
};

export default function ExerciseModal({
  isOpen,
  onClose,
  editIndex,
  initialData,
  onSaveToServer,
}: Props) {
  const [mathMode, setMathMode] = useState(false); // default: math rendering
  const keypadRef = useRef<HTMLDivElement>(null);
  const [showKeypad, setShowKeypad] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [latexMode, setLatexMode] = useState(false); // ⬅️ new: toggles raw LaTeX input view
  const [rawInputMode, setRawInputMode] = useState<{
    question: boolean;
    choices: boolean[];
    answer: boolean;
    explanation: boolean;
  }>({
    question: false,
    choices: [false, false, false, false],
    answer: false,
    explanation: false,
  });

  const [question, setQuestion] = useState(initialData.question);
  const [choices, setChoices] = useState(initialData.choices);
  const [correctAnswer, setCorrectAnswer] = useState(initialData.correctAnswer);
  const [explanation, setExplanation] = useState(initialData.explanation);
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">(
    "EASY"
  );
  const [skillTag, setSkillTag] = useState("");

  const [focusedField, setFocusedField] = useState<{
    type: "question" | "choice" | "answer" | "explanation";
    index?: number;
  } | null>(null);

  const handleInsertLatex = (latex: string) => {
    if (!focusedField) return;

    const insertWithCursor = (prev: string) => {
      const cursorIndex = latex.indexOf("|");
      if (cursorIndex === -1) return prev + latex;

      const before = latex.slice(0, cursorIndex);
      const after = latex.slice(cursorIndex + 1);
      return prev + before + after; // you can add caret positioning later if needed
    };

    if (focusedField.type === "question") {
      setQuestion((prev) => insertWithCursor(prev));
    } else if (
      focusedField.type === "choice" &&
      focusedField.index !== undefined
    ) {
      setChoices((prev) => {
        const updated = [...prev];
        updated[focusedField.index!] = insertWithCursor(
          updated[focusedField.index!] || ""
        );
        return updated;
      });
    } else if (focusedField.type === "answer") {
      setCorrectAnswer((prev) => insertWithCursor(prev));
    } else if (focusedField.type === "explanation") {
      setExplanation((prev) => insertWithCursor(prev));
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (keypadRef.current && !keypadRef.current.contains(e.target as Node)) {
      setIsExiting(true); // ✅ play exit animation
      setTimeout(() => {
        setIsExiting(false); // ✅ stop exit flag after animation
        setShowKeypad(false); // ✅ unmount AFTER animation ends
        setFocusedField(null); // optional
      }, 500); // ⏱ should match your `animate-keypadExit` duration (in Tailwind config)
    }
  };

  useEffect(() => {
    setQuestion(initialData.question);
    setChoices(initialData.choices);
    setCorrectAnswer(initialData.correctAnswer);
    setExplanation(initialData.explanation);
    setDifficulty(initialData.difficulty || "EASY");
    setSkillTag(initialData.skillTag ?? "");
  }, [initialData]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
      <div className="bg-white p-6 rounded w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {editIndex !== null ? "Edit Exercise" : "Add Exercise"}
        </h2>

        <div className="flex items-center justify-between mb-2">
          <label className="font-medium">Math Mode</label>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only"
              checked={mathMode}
              onChange={() => setMathMode(!mathMode)}
            />
            <div className="w-10 h-5 bg-gray-300 rounded-full shadow-inner relative">
              <div
                className={`w-5 h-5 bg-blue-500 rounded-full shadow transform duration-300 ease-in-out ${
                  mathMode ? "translate-x-full" : ""
                }`}
              ></div>
            </div>
          </label>
        </div>

        {mathMode ? (
          <div className="relative">
            {latexMode ? (
              <input
                type="text"
                className="w-full border p-2 pr-10" // pr-10 = space for fx button
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            ) : (
              <MathInput
                value={question}
                onFocus={() => {
                  setFocusedField({ type: "question" });
                  setShowKeypad(true);
                }}
                onChange={(v) => setQuestion(v)}
                placeholder="Enter Question"
              />
            )}

            {latexMode && (
              <button
                onClick={() => {
                  setLatexMode(false);
                  setShowKeypad(true);
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
              >
                fx
              </button>
            )}

            {!latexMode &&
              focusedField?.type === "question" &&
              (showKeypad || isExiting) && (
                <div
                  ref={keypadRef}
                  className={`origin-top transition-all ${
                    isExiting ? "animate-keypadExit" : "animate-keypad"
                  }`}
                >
                  <MathKeypad
                    onInsert={(latex) => {
                      if (latex === "\\text{Switch to LaTeX}") {
                        setLatexMode(true); // ✅ Switch view
                        setShowKeypad(false); // ✅ Hide keypad
                      } else {
                        handleInsertLatex(latex);
                      }
                    }}
                    onClear={() => setQuestion("")}
                  />
                </div>
              )}
          </div>
        ) : (
          <input
            type="text"
            placeholder="Question"
            className="w-full border p-2 mb-2"
            value={question}
            onFocus={() => setFocusedField({ type: "question" })}
            onChange={(e) => setQuestion(e.target.value)}
          />
        )}

        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="relative">
            {mathMode ? (
              rawInputMode.choices[i] ? (
                <>
                  <input
                    type="text"
                    className="w-full border p-2 pr-10"
                    value={choices[i] || ""}
                    onChange={(e) => {
                      const updated = [...choices];
                      updated[i] = e.target.value;
                      setChoices(updated);
                    }}
                  />
                  <button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                    onClick={() => {
                      const updated = [...rawInputMode.choices];
                      updated[i] = false;
                      setRawInputMode((prev) => ({
                        ...prev,
                        choices: updated,
                      }));
                      setShowKeypad(true);
                      setFocusedField({ type: "choice", index: i });
                    }}
                  >
                    fx
                  </button>
                </>
              ) : (
                <>
                  <MathInput
                    value={choices[i] || ""}
                    onFocus={() => {
                      setFocusedField({ type: "choice", index: i });
                      setShowKeypad(true);
                    }}
                    onChange={(v) => {
                      const updated = [...choices];
                      updated[i] = v;
                      setChoices(updated);
                    }}
                    placeholder={`Choice ${i + 1}`}
                  />
                  {focusedField?.type === "choice" &&
                    focusedField.index === i &&
                    (showKeypad || isExiting) && (
                      <div
                        ref={keypadRef}
                        className={`origin-top transition-all ${
                          isExiting ? "animate-keypadExit" : "animate-keypad"
                        }`}
                      >
                        <MathKeypad
                          onInsert={(latex) => {
                            if (latex === "\\text{Switch to LaTeX}") {
                              const updated = [...rawInputMode.choices];
                              updated[i] = true;
                              setRawInputMode((prev) => ({
                                ...prev,
                                choices: updated,
                              }));
                              setShowKeypad(false);
                            } else {
                              handleInsertLatex(latex);
                            }
                          }}
                          onClear={() => {
                            const updated = [...choices];
                            updated[i] = "";
                            setChoices(updated);
                          }}
                        />
                      </div>
                    )}
                </>
              )
            ) : (
              <input
                type="text"
                placeholder={`Choice ${i + 1}`}
                className="w-full border p-2 mb-2"
                value={choices[i] || ""}
                onFocus={() => setFocusedField({ type: "choice", index: i })}
                onChange={(e) => {
                  const updated = [...choices];
                  updated[i] = e.target.value;
                  setChoices(updated);
                }}
              />
            )}
          </div>
        ))}

        {mathMode ? (
          <div className="relative">
            {rawInputMode.answer ? (
              <>
                <input
                  type="text"
                  className="w-full border p-2 pr-10"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                />
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                  onClick={() => {
                    setRawInputMode((prev) => ({ ...prev, answer: false }));
                    setShowKeypad(true);
                    setFocusedField({ type: "answer" });
                  }}
                >
                  fx
                </button>
              </>
            ) : (
              <>
                <MathInput
                  value={correctAnswer}
                  onFocus={() => {
                    setFocusedField({ type: "answer" });
                    setShowKeypad(true);
                  }}
                  onChange={(v) => setCorrectAnswer(v)}
                  placeholder="Correct Answer"
                />
                {focusedField?.type === "answer" &&
                  (showKeypad || isExiting) && (
                    <div
                      ref={keypadRef}
                      className={`origin-top transition-all ${
                        isExiting ? "animate-keypadExit" : "animate-keypad"
                      }`}
                    >
                      <MathKeypad
                        onInsert={(latex) => {
                          if (latex === "\\text{Switch to LaTeX}") {
                            setRawInputMode((prev) => ({
                              ...prev,
                              answer: true,
                            }));
                            setShowKeypad(false);
                          } else {
                            handleInsertLatex(latex);
                          }
                        }}
                        onClear={() => setCorrectAnswer("")}
                      />
                    </div>
                  )}
              </>
            )}
          </div>
        ) : (
          <input
            type="text"
            placeholder="Correct Answer"
            className="w-full border p-2 mb-4"
            value={correctAnswer}
            onFocus={() => setFocusedField({ type: "answer" })}
            onChange={(e) => setCorrectAnswer(e.target.value)}
          />
        )}

        <div className="mb-4">
          <label className="block font-medium mb-1">Explanation</label>
          {mathMode ? (
            rawInputMode.explanation ? (
              <>
                <textarea
                  placeholder="Explain why the correct answer is right..."
                  className="w-full border p-2 pr-10 rounded"
                  rows={4}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                />
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                  onClick={() =>
                    setRawInputMode((prev) => ({ ...prev, explanation: false }))
                  }
                >
                  fx
                </button>
              </>
            ) : (
              <>
                <MathInput
                  value={explanation}
                  onFocus={() => {
                    setFocusedField({ type: "explanation" });
                    setShowKeypad(true);
                  }}
                  onChange={(v) => setExplanation(v)}
                  placeholder="Explanation"
                />
                {focusedField?.type === "explanation" &&
                  (showKeypad || isExiting) && (
                    <div
                      ref={keypadRef}
                      className={`origin-top transition-all ${
                        isExiting ? "animate-keypadExit" : "animate-keypad"
                      }`}
                    >
                      <MathKeypad
                        onInsert={(latex) => {
                          if (latex === "\\text{Switch to LaTeX}") {
                            setRawInputMode((prev) => ({
                              ...prev,
                              explanation: true,
                            }));
                            setShowKeypad(false);
                          } else {
                            handleInsertLatex(latex);
                          }
                        }}
                        onClear={() => setExplanation("")}
                      />
                    </div>
                  )}
              </>
            )
          ) : (
            <textarea
              placeholder="Explain why the correct answer is right..."
              className="w-full border p-2 rounded"
              rows={4}
              value={explanation}
              onFocus={() => setFocusedField({ type: "explanation" })}
              onChange={(e) => setExplanation(e.target.value)}
            />
          )}
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Skill Tag</label>
          <input
            type="text"
            placeholder="e.g. domain, vertical-line-test, etc."
            className="w-full border p-2 rounded"
            value={skillTag}
            onChange={(e) => setSkillTag(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Difficulty</label>
          <select
            className="w-full border p-2 rounded"
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value as "EASY" | "MEDIUM" | "HARD")
            }
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={async () => {
              await onSaveToServer(
                {
                  question,
                  choices,
                  correctAnswer,
                  explanation,
                  difficulty,
                  skillTag,
                },
                editIndex
              );
              onClose(); // ✅ Close the modal after saving
            }}
          >
            {editIndex !== null ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
