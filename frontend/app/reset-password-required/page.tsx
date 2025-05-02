"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import API_URL from "@/lib/getApiUrl";
import { toast } from "sonner";

export default function ResetPasswordRequiredPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill out both fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/api/user/${user?.id}/update-password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ newPassword }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update password.");
      }

      toast.success("Password updated successfully.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    }
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault(); // Prevent page reload
        handleReset(); // Trigger login
      }}
      className="flex flex-col items-center"
    >
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-2 text-center">
            Reset Your Password
          </h1>
          <p className="text-sm text-gray-600 mb-6 text-center">
            For your account’s security, please create a new password before
            continuing.
          </p>

          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full mb-3 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full mb-6 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handleReset}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition"
          >
            Submit
          </button>
        </div>
      </div>
    </form>
  );
}
