"use client";

import React from "react";
import Logo from "../assets/logo.png";
import Image from "next/image";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter(); // Initialize useRouter

  const login = () => {
    router.push("/main"); // Navigate to the login page
  };

  return (
    <>
      <section className="flex flex-col max-w-[265px] h-screen items-center justify-center mx-auto my-auto">
        <div>
          <Image src={Logo} alt="logo" width={200} height={200} />
          <h1 className="text-center font-semibold text-[24px] mt-4">
            Sign in
          </h1>
        </div>

        <input
          type="text"
          placeholder="enter your email"
          className="border-black border-[1px] rounded-xl text-[18px] py-2 px-2 mt-16 mb-5"
        />
        <input
          type="password"
          placeholder="enter your password"
          className="border-black border-[1px] rounded-xl text-[18px] py-2 px-2 mb-12"
        />

        <button
          className="py-[10px] w-[264px] bg-[#30608E] text-white rounded-xl"
          onClick={login}
          // onClick={handleSignIn} // Add onClick event
        >
          SIGN IN
        </button>

        <div className="mt-[25px] w-full h-[1px] bg-[#D6D6D6]"></div>

        <p className="text-[#A8A8A8] my-3">Don’t have an account?</p>

        <button
          className="py-[10px] w-[264px] border-black border-[1px] text-[#515151] rounded-xl"

          // onClick={handleSignIn} // Add onClick event
        >
          Create New Account
        </button>
      </section>
    </>
  );
};

export default page;
