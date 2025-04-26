"use client";

import React, { useState, useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    id?: string;
    title: string;
    content: string;
  };
  onSaveToServer: (
    data: { title: string; content: string },
    id?: string
  ) => Promise<void>;
};

export default function AnnouncementModal({
  isOpen,
  onClose,
  initialData,
  onSaveToServer,
}: Props) {
  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState(initialData.content);

  useEffect(() => {
    setTitle(initialData.title);
    setContent(initialData.content);
  }, [initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">
          {initialData.id ? "Edit Announcement" : "Post Announcement"}
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            className="border p-2 w-full rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Content"
            className="border p-2 w-full rounded h-32"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={async () => {
              if (!title.trim() || !content.trim()) {
                alert("Please fill in all fields.");
                return;
              }
              await onSaveToServer({ title, content }, initialData.id);
              onClose();
            }}
          >
            {initialData.id ? "Update" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
