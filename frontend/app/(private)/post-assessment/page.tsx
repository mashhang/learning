"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import AssessmentQuiz from "@/app/components/AssessmentQuiz";
import API_URL from "@/lib/getApiUrl";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function PostAssessmentPage() {
  const router = useRouter();
  const { user } = useAuth();

  const searchParams = useSearchParams();
  const lessonId = searchParams.get("id");

  const [lesson, setLesson] = useState<any>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: string;
  }>({});
  const [timedAnswers, setTimedAnswers] = useState<any[]>([]);

  useEffect(() => {
    if (!lessonId || !user?.id) return;

    const fetchPostAssessmentQuestions = async () => {
      try {
        const lessonRes = await fetch(`${API_URL}/api/lessons/${lessonId}`);
        const lessonData = await lessonRes.json();

        const res = await fetch(
          `${API_URL}/api/user/${user.id}/lesson/${lessonId}/questions/post`
        );
        const prioritized = await res.json();

        setLesson({
          ...lessonData,
          questions: prioritized,
        });

        console.log("🧪 Post-assessment prioritized questions:", prioritized);
      } catch (err) {
        console.error("❌ Failed to load post-assessment questions:", err);
      }
    };

    fetchPostAssessmentQuestions();
  }, [lessonId, user]);

  if (!lesson) {
    return <div className="p-10 text-center">Loading assessment...</div>;
  }

  return (
    <AssessmentQuiz
      type="POST"
      lesson={lesson}
      lessonId={lesson.id}
      selectedAnswers={selectedAnswers}
      timedAnswers={timedAnswers}
      setSelectedAnswers={setSelectedAnswers}
      setTimedAnswers={setTimedAnswers}
      score={0}
      correctCount={0}
      incorrectCount={0}
      averageTime={0}
      onFinish={() => {
        router.push("/dashboard"); // or next lesson
      }}
      onClose={() => router.push("/dashboard")}
      onContinue={(lessonId: string) => router.push(`/current/?id=${lessonId}`)}
      questions={lesson.questions}
    />
  );
}
