"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useSidebar } from "@/app/context/SidebarContext";
import { ListFilter } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import API_URL from "@/lib/getApiUrl";
import AnnouncementPreviewModal from "@/app/components/modals/AnnouncementPreviewModal";

type Announcement = {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
};

export default function Announcements() {
  const { token } = useAuth();

  const { isSidebarOpen, sidebarWidth } = useSidebar();
  const [active, setActive] = useState("Unread");
  const [readIds, setReadIds] = useState<string[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`${API_URL}/api/announcement`);
        const data = await res.json();

        // Sort announcements by updatedAt descending
        const sorted = data.sort(
          (a: Announcement, b: Announcement) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setAnnouncements(sorted);
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      }
    };

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const fetchReadAnnouncements = async () => {
      try {
        const res = await fetch(`${API_URL}/api/user-announcements/me`);
        const data = await res.json();
        const ids = data.map((ua: any) => ua.announcementId);
        setReadIds(ids);
      } catch (error) {
        console.error("Failed to load read status:", error);
      }
    };

    fetchReadAnnouncements();
  }, []);

  const filteredAnnouncements = announcements.filter((a) => {
    if (active === "All") return true;
    const isRead = readIds.includes(a.id);
    return active === "Read" ? isRead : !isRead;
  });

  const markAsRead = async (announcementId: string) => {
    if (!token) return;

    try {
      await fetch(
        `${API_URL}/api/user-announcements/${announcementId}/mark-read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 🛠 Instantly update readIds
      setReadIds((prev) => [...prev, announcementId]);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div
        className={`transition-all duration-300 ease-in-out bg-[#ffffff] overflow-hidden w-${sidebarWidth} min-h-[calc(100vh - 64px)]`}
        style={{
          marginLeft: isSidebarOpen ? sidebarWidth : "0",
          width: isSidebarOpen ? `calc(100% - ${sidebarWidth})` : "100%",
        }}
      >
        <div className="pt-[96px] mx-40 mb-6 p-6">
          <h1 className="text-4xl mb-4">Announcements</h1>

          {/* Filter buttons */}
          <div className="flex gap-2">
            {["All", "Unread", "Read"].map((label) => (
              <button
                key={label}
                className={`w-20 px-1 py-1 rounded-2xl text-center transition-all shadow-sm ${
                  active === label
                    ? "bg-[#a3a3a3] text-[#ffffff]"
                    : "bg-[#D9D9D9] text-[#4f4f4f] hover:bg-[#a3a3a3] hover:text-[#ffffff]"
                }`}
                onClick={() => setActive(label)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Announcements list */}
          <div className="mt-10 space-y-10">
            {filteredAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                onClick={() => markAsRead(announcement.id)}
                className="cursor-pointer"
              >
                {/* Admin Info */}
                <div className="ml-2">
                  <p className="text-xl text-[#000000]">
                    {announcement.author || "Admin"}
                  </p>
                  <p className="text-[#474747]">Admin</p>
                </div>

                {/* Announcement Content */}
                <div
                  className="bg-[#D9D9D9] w-full h-auto p-3 rounded-xl shadow-custom mt-2"
                  onClick={() => {
                    setSelectedAnnouncement(announcement);
                    setIsPreviewOpen(true);
                    markAsRead(announcement.id); // (optional: you can move it to after closing if you prefer)
                  }}
                >
                  <div className="mx-12 text-[#2D2D2D] space-y-2">
                    <p className="text-xl font-medium">{announcement.title}</p>
                    <p className="text-justify">{announcement.content}</p>
                  </div>
                </div>

                {/* Timestamp */}
                <p
                  className={`text-sm text-right mr-3 mt-2 ${
                    announcement.createdAt !== announcement.updatedAt
                      ? "italic text-gray-500"
                      : "text-[#474747]"
                  }`}
                >
                  {announcement.createdAt === announcement.updatedAt
                    ? new Date(announcement.createdAt).toLocaleString()
                    : `Updated at ${new Date(
                        announcement.updatedAt
                      ).toLocaleString()}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AnnouncementPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        announcement={selectedAnnouncement}
      />
    </ProtectedRoute>
  );
}
