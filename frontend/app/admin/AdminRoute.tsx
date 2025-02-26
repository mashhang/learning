"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    if (user === null) {
      setLoading(true); // Still loading, don't redirect yet
    } else {
      setLoading(false); // Finished loading
      if (user.role !== "ADMIN") {
        router.push("/login");
      }
    }
  }, [user, router]);

  if (loading) return <p>Loading...</p>; // Show a loading state until user is retrieved

  if (!user || user.role !== "ADMIN") return null; // Prevent rendering if unauthorized

  return <>{children}</>;
}
