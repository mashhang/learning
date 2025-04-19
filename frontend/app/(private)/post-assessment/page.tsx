"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AssessmentQuiz from "@/app/components/AssessmentQuiz";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PostAssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("id");

  const [lesson, setLesson] = useState<any>(null);

  useEffect(() => {
    if (!lessonId) return;
    fetch(`${API_URL}/api/lessons/${lessonId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("🧪 Loaded lesson with questions:", data); // ✅ Add this
        setLesson(data);
      });
  }, [lessonId]);

  if (!lesson) {
    return <div className="p-10 text-center">Loading assessment...</div>;
  }

  return (
    <AssessmentQuiz
      type="POST"
      lesson={lesson}
      onFinish={() => {
        router.push("/dashboard"); // or next lesson
      }}
    />
  );
}
