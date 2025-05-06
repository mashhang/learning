"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import API_URL from "@/lib/getApiUrl";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendResetLink = async () => {
    if (!studentId.trim()) {
      toast.error("Please enter your student ID.");
      return;
    }

    try {
      setIsSending(true);
      // Step 1: Find user by studentId
      const userRes = await fetch(`${API_URL}/api/user`);
      const users = await userRes.json();
      const user = users.find((u: any) => u.studentId === studentId.trim());

      if (!user) {
        toast.error("Student ID not found.");
        return;
      }

      // Step 2: Use user.id in the password reset request
      const res = await fetch(`${API_URL}/api/user/${user.id}/reset-password`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reset email");

      toast.success("Password reset link sent! Please check your email.");

      router.push("/dashboard");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="flex flex-col max-w-[320px] h-screen items-center justify-center mx-auto">
      <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
      <input
        type="text"
        placeholder="Enter your student ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        className="border border-gray-300 rounded px-4 py-2 mb-4 w-full"
      />
      <button
        onClick={handleSendResetLink}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        disabled={isSending}
      >
        {isSending ? "Sending..." : "Send Reset Link"}
      </button>
    </section>
  );
}
