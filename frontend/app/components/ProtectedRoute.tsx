"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role === "ADMIN") {
        // 👈 Prevent admin from accessing user-only pages
        router.push("/admin");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <p className="text-center mt-20 text-lg text-gray-500">Loading...</p>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
