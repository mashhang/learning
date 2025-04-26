"use client";

import { useEffect, useState } from "react";
import AnnouncementModal from "@/app/components/modals/AnnouncementModal"; // ✅ New Modal Component
import API_URL from "@/lib/getApiUrl";
import { Trash2, Pencil } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";
import DeleteAnnouncementButton from "@/components/DeleteAnnouncementButton";

type Announcement = {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminAnnouncements() {
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);

  // Fetch all announcements
  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${API_URL}/api/announcement`);
      const data = await res.json();
      setAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Handle save (for both add and edit)
  const handleSave = async (
    data: { title: string; content: string },
    id?: string
  ) => {
    try {
      if (!user) {
        throw new Error("User not found.");
      }

      const payload = {
        title: data.title,
        content: data.content,
        author: user.name, // ✅ Auto-set admin's name
      };

      const method = id ? "PUT" : "POST";
      const url = id
        ? `${API_URL}/api/announcement/${id}`
        : `${API_URL}/api/announcement`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save announcement");
      }

      await fetchAnnouncements();
      toast.success(id ? "Announcement updated!" : "Announcement posted!");
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast.error("Failed to save announcement.");
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this announcement?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/announcement/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete announcement");
      }

      await fetchAnnouncements();
      toast.success("Announcement deleted!");
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Failed to delete announcement.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Announcements</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEditingAnnouncement(null); // not editing, new add
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow-sm"
        >
          Post Announcement
        </button>
      </div>

      {/* Announcements Table */}
      <table className="w-full border border-collapse">
        <thead>
          <tr className="border bg-gray-200">
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Author</th>
            <th className="p-2 text-left">Posted At</th>
            <th className="p-2 text-left">Updated At</th>
            <th className="p-2 text-left">Content</th>
            <th className="p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map((announcement) => (
            <tr
              key={announcement.id}
              className="border hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setEditingAnnouncement(announcement);
                setIsModalOpen(true);
              }}
            >
              <td className="p-2 border">{announcement.title}</td>
              <td className="p-2 border">{announcement.author || "Admin"}</td>
              <td className="p-2 border">
                {new Date(announcement.createdAt).toLocaleString()}
              </td>
              <td className="p-2 border">
                {announcement.createdAt === announcement.updatedAt ? (
                  <span className="text-gray-400">-</span> // ✅ gray text for dash
                ) : (
                  new Date(announcement.updatedAt).toLocaleString()
                )}
              </td>
              <td className="p-2 border max-w-[300px] truncate">
                {announcement.content}
              </td>
              <td
                className="p-2 text-center border"
                onClick={(e) => e.stopPropagation()} // ✅ prevent click from affecting the whole row
              >
                <DeleteAnnouncementButton
                  announcement={announcement}
                  refreshAnnouncements={fetchAnnouncements}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={{
          id: editingAnnouncement?.id,
          title: editingAnnouncement?.title || "",
          content: editingAnnouncement?.content || "",
        }}
        onSaveToServer={handleSave}
      />
    </div>
  );
}
