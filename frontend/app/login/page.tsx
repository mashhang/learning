"use client";
// wd
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";
import { toast } from "sonner";
import Logo from "../../public/logo.png";
import API_URL from "@/lib/getApiUrl";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const { user, isLoading } = useAuth(); // 👈 Get auth state
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const destination = user.role === "ADMIN" ? "/admin" : "/dashboard";
      router.push(destination);
    }
  }, [user, isLoading, router]);

  // Optional: prevent flicker
  if (isLoading || user) return null;

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        // ✅ Use API_URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      login(data.user, data.token);

      toast.success("Login successful!");
    } catch (error) {
      console.error("Login Error:", error);
      toast.error((error as Error).message || "Something went wrong");
    }
  };

  const handleRedirectToRegister = () => {
    router.push("/register");
  };

  return (
    <section className="flex flex-col max-w-[265px] h-screen items-center justify-center mx-auto my-auto">
      <div>
        <Image src={Logo} alt="logo" width={200} height={200} />
        <h1 className="text-center font-semibold text-[24px] mt-4">Sign in</h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault(); // Prevent page reload
          handleLogin(); // Trigger login
        }}
        className="flex flex-col items-center"
      >
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            const email = e.target.value;
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email === "") {
              setEmail(email); // ✅ Only update state if it's a valid email
            }
          }}
          className="border-black border-[1px] rounded-xl text-[18px] py-2 px-2 mt-16 mb-5"
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-black border-[1px] rounded-xl text-[18px] py-2 px-2 mb-12"
        />

        <button
          className="py-[10px] w-[264px] bg-[#30608E] text-white rounded-xl"
          type="submit"
        >
          SIGN IN
        </button>

        <div className="mt-[25px] w-full h-[1px] bg-[#D6D6D6]"></div>

        <p className="text-[#A8A8A8] my-3">Don’t have an account?</p>
      </form>
      <button
        className="py-[10px] w-[264px] border-black border-[1px] text-[#515151] rounded-xl"
        onClick={handleRedirectToRegister} // Add onClick event
      >
        Create New Account
      </button>
    </section>
  );
}
