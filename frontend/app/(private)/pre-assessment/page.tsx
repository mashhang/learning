"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AssessmentQuiz from "@/app/components/AssessmentQuiz";
import API_URL from "@/lib/getApiUrl";
import { useAuth } from "@/app/context/AuthContext";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function PreAssessmentPage() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("id");
  const router = useRouter();

  const [lesson, setLesson] = useState<any>(null);
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (!lessonId) return;

    const fetchPrioritizedLesson = async () => {
      try {
        const lessonRes = await fetch(`${API_URL}/api/lessons/${lessonId}`);
        const lessonData = await lessonRes.json();

        const difficultyRes = await fetch(
          `${API_URL}/api/user/${userId}/lesson/${lessonId}/questions/difficulty`
        );
        const difficultyData = await difficultyRes.json(); // [{ questionId, averageScore }]

        const difficultyMap = new Map(
          difficultyData.map((entry: any) => [
            entry.questionId,
            entry.averageScore,
          ])
        );

        // Inject difficulty into lessonData.questions
        lessonData.questions.forEach((q: any) => {
          q.difficulty = difficultyMap.get(q.id) ?? 0;
        });

        let weakSkillTags: string[] = [];

        if (userId) {
          const skillRes = await fetch(
            `${API_URL}/api/user/${userId}/skills/${lessonId}`
          );
          weakSkillTags = await skillRes.json();
        }

        // 🧠 Prioritize questions
        const weakQuestions = lessonData.questions.filter((q: any) =>
          weakSkillTags.includes(q.skillTag)
        );

        const otherQuestions = lessonData.questions.filter(
          (q: any) => !weakSkillTags.includes(q.skillTag)
        );

        const prioritized = [
          ...weakQuestions.slice(0, 10),
          ...otherQuestions.slice(0, 5),
        ]
          .slice(0, 15)
          .sort((a, b) => a.difficulty - b.difficulty); // ✅ easiest first

        setLesson({
          ...lessonData,
          questions: prioritized,
        });

        console.log("🧠 Prioritized questions:", prioritized);
        console.log("🧠 Weak skillTags from diagnostic:", weakSkillTags);
        console.log("✅ Questions being used for pre-assessment:", prioritized);
      } catch (err) {
        console.error("❌ Failed to load prioritized lesson:", err);
      }
    };

    fetchPrioritizedLesson();
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
