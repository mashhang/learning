import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { learning } from "../../../public/assets/landingPage";

const LandingPage = () => {
  const router = useRouter(); // Initialize useRouter

  const handleSignIn = () => {
    router.push("/login"); // Navigate to the login page
  };

  return (
    <>
      <section className="flex md:flex-row flex-col sm:py-36 py-6 mx-10">
        <div className="flex justify-center flex-1 flex-col">
          <div>
            <h1 className="flex-1 text-[52px] font-[700] leading-tight">
              Your pace, your <br />
              math.
            </h1>
          </div>

          <p className="font-[400] text-[18px] mt-3 max-w-[690px] text-[#8A94A7]">
            Our adaptive system ensures you receive the right level of
            challenge, helping you grow and master math concepts efficiently.
          </p>
        </div>

        <div>
          <Image
            src={learning}
            alt="Learning"
            className="w-[100%] h-[100%] relative md:my-0 my-10"
          />
        </div>
      </section>

      <div className="mt-[-13rem] ml-[2.5rem]">
        <button
          className="py-2 px-12 bg-[#30608E] text-white rounded-sm"
          onClick={handleSignIn} // Add onClick event
        >
          SIGN IN
        </button>
      </div>
    </>
  );
};

export default LandingPage;
