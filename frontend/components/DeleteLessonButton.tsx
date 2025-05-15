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

type DeleteLessonButtonProps = {
  lesson: { id: string; title: string };
  token: string | null; // ← allow null
  setLessons: (update: (prev: any[]) => any[]) => void;
};

export default function DeleteLessonButton({
  lesson,
  token,
  setLessons,
}: DeleteLessonButtonProps) {
  const handleDelete = async () => {
    if (!token) {
      toast.error("Missing token. Please log in again.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/lessons/${lesson.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setLessons((prev) => prev.filter((l) => l.id !== lesson.id));
        toast.success("Lesson deleted successfully.");
      } else {
        toast.error("Failed to delete lesson.");
      }
    } catch (err) {
      toast.error("Error occurred during deletion.");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="text-red-400 hover:text-red-700 transition"
          title="Delete"
        >
          <Trash2 size={24} />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this lesson?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove <strong>{lesson.title}</strong> from
            your lessons. This action cannot be undone.
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
