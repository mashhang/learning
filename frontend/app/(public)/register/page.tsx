"use client";

import { useState } from "react";
import Image from "next/image";
import Logo from "../../../public/logo.png";
import { useRouter } from "next/navigation";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    const res = await fetch("http://localhost:5001/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    alert(data.message);

    router.push("/login");
  };

  const handleRedirectToLogin = () => {
    router.push("/login");
  };

  return (
    // <div className="max-w-md mx-auto p-4">
    //   <h2 className="text-xl font-bold">Register</h2>
    //   <input
    //     className="block w-full p-2 border"
    //     placeholder="Name"
    //     onChange={(e) => setName(e.target.value)}
    //   />
    //   <input
    //     className="block w-full p-2 border mt-2"
    //     placeholder="Email"
    //     onChange={(e) => setEmail(e.target.value)}
    //   />
    //   <input
    //     className="block w-full p-2 border mt-2"
    //     type="password"
    //     placeholder="Password"
    //     onChange={(e) => setPassword(e.target.value)}
    //   />
    //   <button
    //     className="w-full bg-blue-500 text-white p-2 mt-3"
    //     onClick={handleRegister}
    //   >
    //     Register
    //   </button>
    // </div>

    <section className="flex flex-col max-w-[265px] h-screen items-center justify-center mx-auto my-auto">
      <div>
        <Image src={Logo} alt="logo" width={200} height={200} />
        <h1 className="text-center font-semibold text-[24px] mt-4">Sign Up</h1>
      </div>

      <input
        type="name"
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
        className="border-black border-[1px] rounded-xl text-[18px] py-2 px-2 mt-8 mb-5"
      />

      <input
        type="email"
        placeholder="Email Address"
        onChange={(e) => setEmail(e.target.value)}
        className="border-black border-[1px] rounded-xl text-[18px] py-2 px-2 mb-5"
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        className="border-black border-[1px] rounded-xl text-[18px] py-2 px-2 mb-8"
      />

      <button
        className="py-[10px] w-[264px] bg-[#30608E] text-white rounded-xl"
        onClick={handleRegister}
      >
        SIGN UP
      </button>

      <p className="text-[#A8A8A8] m-3 text-[12px]">
        By signing up you agree to our API Terms of Service and Privacy Policy.
      </p>

      <div className="w-full h-[1px] bg-[#D6D6D6]"></div>

      <p
        onClick={handleRedirectToLogin}
        className="text-[12px] mt-3 cursor-pointer text-[#5B5B5B]"
      >
        Back to Login
      </p>
    </section>
  );
}
