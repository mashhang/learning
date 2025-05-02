"use client";

import React, { useRef, useEffect } from "react";
import "mathlive";

type Props = {
  value: string;
};

export default function MathPreview({ value }: Props) {
  const ref = useRef<any>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    el.setValue?.(value || "");
    el.tabIndex = -1;

    // Block Ctrl+A inside shadow root
    const shadow = el.shadowRoot;
    if (shadow) {
      shadow.addEventListener("keydown", (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "a") {
          e.preventDefault();
        }
      });
    }
  }, [value]);

  return (
    <div className="pointer-events-none select-none">
      {React.createElement("math-field" as any, {
        ref,
        readOnly: true,
        virtualKeyboardPolicy: "manual",
        className: "math-preview-field",
      })}

      <style jsx global>{`
        math-field.math-preview-field {
          border: none !important;
          outline: none !important;
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
          caret-color: transparent;
          pointer-events: none !important;
          user-select: none !important;
          display: block;
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;
          width: 100%;

          font-size: 0.8rem;

          @media (min-width: 640px) {
            font-size: 1rem;
          }

          @media (min-width: 1024px) {
            font-size: 1.25rem;
          }
        }

        math-field.math-preview-field * {
          user-select: none !important;
        }

        math-field.math-preview-field:focus {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
}
