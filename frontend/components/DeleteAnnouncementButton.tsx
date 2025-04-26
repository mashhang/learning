"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import API_URL from "@/lib/getApiUrl";

type DeleteAnnouncementButtonProps = {
  announcement: { id: string; title: string };
  refreshAnnouncements: () => void;
};

export default function DeleteAnnouncementButton({
  announcement,
  refreshAnnouncements,
}: DeleteAnnouncementButtonProps) {
  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/announcement/${announcement.id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        toast.success("✅ Announcement deleted!");
        refreshAnnouncements(); // Refresh table
      } else {
        toast.error("❌ Failed to delete announcement.");
      }
    } catch (err) {
      toast.error("❌ Error occurred during deletion.");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="text-red-500 hover:text-red-700 transition"
          title="Delete"
          onClick={(e) => e.stopPropagation()} // Prevent row click from triggering edit
        >
          <Trash2 size={24} />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this announcement?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove <strong>{announcement.title}</strong>{" "}
            from announcements. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
