"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AssessmentQuiz from "@/app/components/AssessmentQuiz";
import API_URL from "@/lib/getApiUrl";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function PreAssessmentPage() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("id");
  const router = useRouter();

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
    return <div className="p-10 text-center">Loading pre-assessment...</div>;
  }

  return (
    <AssessmentQuiz
      type="PRE"
      lesson={lesson}
      onFinish={() => {
        // 👈 After finishing pre-assessment, go to the lesson
        router.push(`/current?id=${lesson.id}`);
      }}
    />
  );
}
