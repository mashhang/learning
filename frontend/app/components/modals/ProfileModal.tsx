"use client";

import { useState, useEffect } from "react";

const ProfileModal = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    createdAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/user/${userId}`
        );
        if (!response.ok) {
          throw new Error("User not found");
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        setError("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <p>Loading user data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">My Account</h2>
      <p>
        <strong>Name:</strong> {user?.name}
      </p>
      <p>
        <strong>Email:</strong> {user?.email}
      </p>
      <p>
        <strong>Joined:</strong>{" "}
        {user?.createdAt
          ? new Date(user.createdAt).toLocaleDateString()
          : "N/A"}
      </p>
    </div>
  );
};

export default ProfileModal;
