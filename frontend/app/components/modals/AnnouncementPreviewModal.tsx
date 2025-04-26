"use client";

import React from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  announcement: {
    id: string;
    title: string;
    content: string;
    author: string;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export default function AnnouncementPreviewModal({
  isOpen,
  onClose,
  announcement,
}: Props) {
  if (!isOpen || !announcement) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mx-4 relative animate-zoom">
        {/* Close button */}
        <button
          className="absolute top-2 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Modal Content */}
        <h2 className="text-2xl font-bold mb-2">{announcement.title}</h2>
        <p className="text-gray-500 text-sm mb-1">
          {announcement.createdAt === announcement.updatedAt
            ? `Posted at ${new Date(announcement.createdAt).toLocaleString()}`
            : `Updated at ${new Date(announcement.updatedAt).toLocaleString()}`}
        </p>
        <p className="text-gray-500 text-sm mb-4">
          By {announcement.author || "Admin"}
        </p>

        <div className="text-gray-700 whitespace-pre-line leading-relaxed text-justify">
          {announcement.content}
        </div>
      </div>
    </div>
  );
}
