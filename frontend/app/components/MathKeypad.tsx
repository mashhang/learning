"use client";

import React from "react";

type Props = {
  onInsert: (latex: string) => void;
  onClear?: () => void;
};

export default function MathKeypad({ onInsert, onClear }: Props) {
  const keys = [
    // 50 items (first 5 rows, 10 per row)
    "x",
    "y",
    "x^{\\placeholder{}}",
    "x_{\\placeholder{}}",
    "\\left[\\placeholder{}\\right]",
    "\\left(\\placeholder{}\\right)",
    "7",
    "8",
    "9",
    "\\div",
    ">",
    "<",
    "\\ge",
    "\\le",
    "\\ne",
    "\\left|\\placeholder{}\\right|",
    "4",
    "5",
    "6",
    "\\times",
    "\\sqrt{\\placeholder{}}",
    "\\sqrt[\\placeholder{}]{\\placeholder{}}",
    "x^{2}",
    "x^{\\placeholder{}}",
    "\\log_{\\placeholder{}}\\left(\\placeholder{}\\right)",
    "\\ln\\left(\\placeholder{}\\right)",
    "1",
    "2",
    "3",
    "-",
    "\\pi",
    "\\placeholder{}!",
    "\\sum_{\\placeholder{}}^{\\placeholder{}}",
    "\\prod_{\\placeholder{}}^{\\placeholder{}}",
    "\\lfloor\\placeholder{}\\rfloor",
    "\\lceil\\placeholder{}\\rceil",
    "0",
    ".",
    "=",
    "+",
  ];

  const renderLabel = (value: string) => {
    const labelMap: Record<string, string> = {
      "\\div": "÷",
      "\\times": "×",
      "\\ge": "≥",
      "\\le": "≤",
      "\\ne": "≠",
      "\\sqrt{\\placeholder{}}": "√",
      "\\sqrt[\\placeholder{}]{\\placeholder{}}": "ⁿ√",
      "x^{\\placeholder{}}": "xⁿ",
      "x_{\\placeholder{}}": "xₙ",
      "x^{2}": "x²",
      "\\pi": "π",
      "\\placeholder{}!": "x!",
      "\\sum_{\\placeholder{}}^{\\placeholder{}}": "∑",
      "\\prod_{\\placeholder{}}^{\\placeholder{}}": "∏",
      "\\lfloor\\placeholder{}\\rfloor": "⌊x⌋",
      "\\lceil\\placeholder{}\\rceil": "⌈x⌉",
      "\\leftarrow": "←",
      "\\rightarrow": "→",
      "^{\\circ}": "°",
      "\\infty": "∞",
      "\\left|\\placeholder{}\\right|": "|x|",
      "\\log_{\\placeholder{}}\\left(\\placeholder{}\\right)": "log",
      "\\ln\\left(\\placeholder{}\\right)": "ln",
      "\\left(\\placeholder{}\\right)": "( )",
      "\\left[\\placeholder{}\\right]": "[ ]",
    };
    return labelMap[value] ?? value;
  };

  return (
    <div className="bg-gray-100 rounded shadow text-sm mb-4">
      {/* Top 5 rows */}
      <div className="grid grid-cols-10">
        {keys.map((value, i) => (
          <button
            key={i}
            type="button"
            className="bg-white border hover:bg-blue-100 rounded px-2 py-1 text-center"
            onMouseDown={(e) => {
              e.preventDefault();
              onInsert(value);
            }}
          >
            {renderLabel(value)}
          </button>
        ))}
      </div>

      {/* Final row: Switch to LaTeX, CE, ←, →, OK, Clear */}
      <div className="grid grid-cols-10">
        <button
          className="col-span-1 bg-white border hover:bg-blue-100 rounded px-2 py-1"
          onMouseDown={(e) => {
            e.preventDefault();
            onInsert("\\infty");
          }}
        >
          ∞
        </button>
        <button
          className="col-span-1 bg-white border hover:bg-blue-100 rounded px-2 py-1"
          onMouseDown={(e) => {
            e.preventDefault();
            onInsert("^{\\circ}");
          }}
        >
          °
        </button>
        <button
          className="col-span-4 bg-white border hover:bg-blue-100 rounded px-2 py-1 text-center"
          onMouseDown={(e) => {
            e.preventDefault();
            onInsert("\\text{Switch to LaTeX}");
          }}
        >
          Switch to LaTeX
        </button>
        <button
          className="col-span-1 bg-white border hover:bg-blue-100 rounded px-2 py-1"
          onMouseDown={(e) => {
            e.preventDefault();
            onClear?.();
          }}
        >
          AC
        </button>
        <button
          className="col-span-1 bg-white border hover:bg-blue-100 rounded px-2 py-1"
          onMouseDown={(e) => {
            e.preventDefault();
            onInsert("\\leftarrow");
          }}
        >
          ←
        </button>
        <button
          className="col-span-1 bg-white border hover:bg-blue-100 rounded px-2 py-1"
          onMouseDown={(e) => {
            e.preventDefault();
            onInsert("\\rightarrow");
          }}
        >
          →
        </button>
        <button
          className="col-span-1 bg-[#d54a22] text-white border hover:bg-red-600 rounded px-2 py-1"
          onMouseDown={(e) => {
            e.preventDefault();
            onInsert("\\text{OK}");
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
