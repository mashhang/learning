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

  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: string;
  }>({});
  const [timedAnswers, setTimedAnswers] = useState<any[]>([]);

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

        const desiredTotal = 15;

        const weakCount = Math.min(10, weakQuestions.length);
        const otherCount = desiredTotal - weakCount;

        let prioritized = [
          ...weakQuestions.slice(0, weakCount),
          ...otherQuestions.slice(0, otherCount),
        ].sort((a, b) => a.difficulty - b.difficulty);

        // 🛠 Pad if less than 15
        if (prioritized.length < desiredTotal) {
          const remaining = lessonData.questions.filter(
            (q: any) => !prioritized.some((p) => p.id === q.id)
          );

          const fill = remaining
            .sort(() => Math.random() - 0.5)
            .slice(0, desiredTotal - prioritized.length);

          prioritized = [...prioritized, ...fill];
        }

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

  // 🚫 Remove this block when deploying to production!
  useEffect(() => {
    const handleDevShortcut = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "D") {
        console.log(
          "🧪 Developer mode: Auto-answering pre-assessment with ~90% score..."
        );

        if (!lesson?.questions?.length) return;

        const total = lesson.questions.length;
        const correctCount = Math.floor(total * 0.9);

        const shuffled = [...lesson.questions].sort(() => Math.random() - 0.5);
        const correctSet = new Set(
          shuffled.slice(0, correctCount).map((q) => q.id)
        );

        const autoAnswers: { [key: string]: string } = {};
        const autoTimed: any[] = [];

        lesson.questions.forEach((q: any) => {
          const correct = correctSet.has(q.id);
          const answer = correct ? q.correctAnswer : getRandomWrongChoice(q);
          autoAnswers[q.id] = answer;
          autoTimed.push({
            questionId: q.id,
            lessonId: lesson.id, // ← use outer lesson.id instead of q.lessonId
            timeTaken: Math.floor(Math.random() * (599 - 10 + 1)) + 10,
            isCorrect: correct,
          });
        });

        // If AssessmentQuiz exposes setters via context or props, use them here
        setSelectedAnswers(autoAnswers);
        setTimedAnswers(autoTimed);
        console.log("✅ Auto-selected answers:", autoAnswers);
        console.log("🕒 Timed answers:", autoTimed);
        alert("🧪 Pre-assessment answered with ~90% accuracy (Dev Shortcut)");
      }
    };

    const getRandomWrongChoice = (question: any): string => {
      const wrongChoices = question.choices.filter(
        (c: string) => c !== question.correctAnswer && c.trim() !== ""
      );
      return wrongChoices[Math.floor(Math.random() * wrongChoices.length)];
    };

    window.addEventListener("keydown", handleDevShortcut);
    return () => window.removeEventListener("keydown", handleDevShortcut);
  }, [lesson]);

  if (!lesson) {
    return <div className="p-10 text-center">Loading pre-assessment...</div>;
  }

  return (
    <AssessmentQuiz
      type="PRE"
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
      onFinish={() => router.push(`/current?id=${lesson.id}`)}
      onClose={() => router.push("/dashboard")}
      onContinue={(lessonId: string) => router.push(`/current/?id=${lessonId}`)}
    />
  );
}
