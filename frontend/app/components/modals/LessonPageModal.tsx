// components/LessonPageModal.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import MathInput from "@/app/components/MathInput";
import MathKeypad from "@/app/components/MathKeypad";

export type LessonPage = {
  content: string;
  media: File | null;
  existingMedia?: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  tempPage: LessonPage;
  setTempPage: (page: LessonPage) => void;
  onSave: () => void;
  editMode?: boolean;
};

export default function LessonPageModal({
  isOpen,
  onClose,
  tempPage,
  setTempPage,
  onSave,
  editMode = false,
}: Props) {
  const [localPage, setLocalPage] = useState<LessonPage>({
    content: "",
    media: null,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [mathMode, setMathMode] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const keypadRef = useRef<HTMLDivElement>(null);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setLocalPage(tempPage);
  }, [tempPage]);

  const handleClickOutside = (e: MouseEvent) => {
    if (keypadRef.current && !keypadRef.current.contains(e.target as Node)) {
      setIsExiting(true);
      setTimeout(() => {
        setIsExiting(false);
        setShowKeypad(false);
      }, 500);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = () => {
    setTempPage(localPage);
    onSave();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 select-none">
          {editMode ? "Edit Lesson Page" : "Add Lesson Page"}
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
            <MathInput
              value={localPage.content}
              onChange={(v) => setLocalPage({ ...localPage, content: v })}
              onFocus={() => setShowKeypad(true)}
              placeholder="Page content (LaTeX supported)"
            />
            {showKeypad && (
              <div
                ref={keypadRef}
                className={`origin-top transition-all ${
                  isExiting ? "animate-keypadExit" : "animate-keypad"
                }`}
              >
                <MathKeypad
                  onInsert={(latex) =>
                    setLocalPage((prev) => ({
                      ...prev,
                      content: prev.content + latex.replace("|", ""),
                    }))
                  }
                  onClear={() =>
                    setLocalPage((prev) => ({ ...prev, content: "" }))
                  }
                />
              </div>
            )}
          </div>
        ) : (
          <textarea
            placeholder="Page content (LaTeX supported)"
            className="w-full border p-2 mb-2 h-48"
            value={localPage.content}
            onChange={(e) =>
              setLocalPage({ ...localPage, content: e.target.value })
            }
          />
        )}

        {localPage.media === null && tempPage.existingMedia && (
          <img
            src={tempPage.existingMedia}
            alt="Preview"
            className="w-32 h-auto mb-4 cursor-pointer border rounded"
            draggable="false"
            onClick={() => setPreviewImage(tempPage.existingMedia!)}
          />
        )}
        <input
          type="file"
          accept="image/*,video/*"
          className="w-full border p-2 mb-4"
          onChange={(e) =>
            setLocalPage({ ...localPage, media: e.target.files?.[0] || null })
          }
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {editMode ? "Update" : "Add"}
          </button>
        </div>
      </div>
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Full Preview"
            className="max-w-[1500px] bg-white max-h-[90vh] border rounded"
            draggable="false"
          />
        </div>
      )}
    </div>
  );
}
