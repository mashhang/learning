"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import API_URL from "@/lib/getApiUrl";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState<"Weak" | "Medium" | "Strong">(
    "Weak"
  );
  const [loading, setLoading] = useState(false);

  // 🔍 Password strength checker
  useEffect(() => {
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    if (password.length >= 12 && hasUpper && hasNumber && hasSpecial) {
      setStrength("Strong");
    } else if (password.length >= 8 && (hasUpper || hasNumber || hasSpecial)) {
      setStrength("Medium");
    } else {
      setStrength("Weak");
    }
  }, [password]);

  const handleReset = async () => {
    if (password !== confirmPassword) {
      toast.error("❌ Passwords do not match.");
      return;
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':\"\\|,.<>/?]/.test(password);

    if (password.length < 8 || !hasUpper || !hasNumber || !hasSpecial) {
      toast.error(
        "❌ Password must be at least 8 characters and include an uppercase letter, number, and special character."
      );
      return;
    }

    setLoading(true);

    const res = await fetch(`${API_URL}/api/user/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("✅ Password reset successfully!");
      setTimeout(() => router.push("/login"), 2000);
    } else {
      toast.error("❌ " + data.error);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>

      <div className="mb-4 relative">
        <input
          type={showPassword ? "text" : "password"}
          className="w-full border p-2 pr-10 rounded"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <span
          className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-sm text-gray-500"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? "🙈" : "👁"}
        </span>
      </div>

      <input
        type={showPassword ? "text" : "password"}
        className="w-full border p-2 rounded mb-2"
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      {/* Password strength meter */}
      <div className="mb-4">
        <div
          className={`h-2 rounded-full ${
            strength === "Weak"
              ? "bg-red-400 w-1/3"
              : strength === "Medium"
              ? "bg-yellow-400 w-2/3"
              : "bg-green-500 w-full"
          }`}
        ></div>
        <p className="text-xs mt-1 text-gray-500">Strength: {strength}</p>
      </div>

      <ul className="text-xs text-gray-500 mb-4 ml-1 list-disc list-inside">
        <li>Minimum 8 characters</li>
        <li>At least 1 uppercase letter</li>
        <li>At least 1 number</li>
        <li>At least 1 special character</li>
      </ul>

      <button
        onClick={handleReset}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </div>
  );
}
