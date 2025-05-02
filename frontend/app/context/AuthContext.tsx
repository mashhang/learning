"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  studentId: string;
  lastName: string;
  firstName: string;
  email: string;
  role: "USER" | "ADMIN";
  mustResetPassword: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token" || event.key === "user") {
        const newToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!newToken || !storedUser) {
          setUser(null);
          setToken(null);
          router.push("/login");
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(newToken);

        // ✅ Redirect only if on auth or landing page
        const pathname = window.location.pathname;
        if (
          pathname === "/" ||
          pathname === "/login" ||
          pathname === "/register"
        ) {
          const destination =
            parsedUser.role === "ADMIN" ? "/admin" : "/dashboard";
          router.push(destination);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setIsLoading(false); // ✅ Allow layout to render
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData);
    setToken(token);
    router.push(userData.role === "ADMIN" ? "/admin" : "/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
