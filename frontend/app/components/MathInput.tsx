"use client";

import React, { useEffect, useRef } from "react";
import "mathlive";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  placeholder?: string;
};

export default function MathInput({
  value,
  onChange,
  onFocus,
  placeholder,
}: Props) {
  const ref = useRef<any>(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;

    // ✅ Set initial value
    el.setValue?.(value || "");

    // ✅ Update handler
    const handleInput = () => {
      const latex = el.getValue?.("latex-expanded") || "";
      onChange(latex);
    };

    el.addEventListener("input", handleInput);

    // ✅ Intercept spacebar
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        el.insert?.("\\,"); // ⬅ thin space in LaTeX
      }
    };

    el.addEventListener("keydown", handleKeyDown);

    return () => {
      el.removeEventListener("input", handleInput);
      el.removeEventListener("keydown", handleKeyDown);
    };
  }, [value, onChange]);

  return (
    <div className="relative ">
      {React.createElement("math-field" as any, {
        ref,
        onFocus,
        placeholder, // native attribute, fallback
        className: "w-full border border p-2 pr-12 rounded bg-white",
        style: {
          // fontSize: "1.125rem",
          fontFamily: '"KaTeX_Main", "Times New Roman", serif',
        },
      })}

      {value === "" && placeholder && (
        <div className="absolute top-2 left-3 text-gray-400 pointer-events-none select-none text-base">
          {placeholder}
        </div>
      )}
    </div>
  );
}
