// DiagnosticArc.tsx
"use client";

import { useEffect, useState } from "react";

interface DiagnosticArcProps {
  score: number; // percent 0–100
  correctCount: number;
  totalCount: number;
}

export default function DiagnosticArc({
  score,
  correctCount,
  totalCount,
}: DiagnosticArcProps) {
  const radius = 100;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedCorrect, setAnimatedCorrect] = useState(0);

  useEffect(() => {
    let start: number;
    const duration = 1500;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      setAnimatedScore(Math.round(score * eased));
      setAnimatedCorrect(Math.round(correctCount * eased));

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [score, correctCount]);

  const arcOffset = circumference * (1 - animatedScore / 100);

  //   className="absolute top-[-200px] left-0"
  return (
    <div className="relative flex flex-col items-center">
      <p className="text-sm italic text-[#1A3D6D] absolute top-[-25px]">
        overall score
      </p>
      <div className="relative w-[250px] h-[250px]">
        <svg
          width="250"
          height="250"
          viewBox="0 0 250 250"
          className="absolute  left-0"
        >
          {/* Outer Background Ring */}
          <circle
            cx="125"
            cy="125"
            r={radius}
            stroke="#f4ce93"
            strokeWidth={12}
            fill="none"
          />
          {/* Foreground Arc */}
          <circle
            cx="125"
            cy="125"
            r={radius}
            stroke="#1A3D6D"
            strokeWidth={24}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={arcOffset}
            strokeLinecap="round"
            transform="rotate(-90 125 125)"
          />
          {/* Inner Blue Circle */}
          <circle
            cx="125"
            cy="125"
            r={radius - strokeWidth - 5}
            fill="#1A3D6D"
          />
        </svg>

        {/* Inner Text */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-2xl font-bold text-[#fef9f4]">
            {animatedScore}%
          </div>
          <div className="text-sm text-[#fef9f4]">
            {animatedCorrect} / {totalCount}
          </div>
        </div>
      </div>
    </div>
  );
}
