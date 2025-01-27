import React from "react";
import { useRouter } from "next/navigation"; // Import useRouter

const GetStarted = () => {
  const router = useRouter(); // Initialize useRouter

  const handleSignIn = () => {
    router.push("/login"); // Navigate to the login page
  };

  return (
    <>
      {/* <div className="w-[1200px] sm:py-36 pb-28 bg-[#15181D]">
        <h1 className="text-white font-bold text-[32px]">
          Ready to start learning?
        </h1>
      </div> */}
      <section className="flex flex-row items-center justify-between px-20 mb-40 w-full bg-[#15181D] h-[150px]">
        <h1 className=" text-white font-bold text-[32px] ">
          Ready to start learning?
        </h1>

        <div className="">
          <button
            className=" py-2 px-12 bg-[#30608E] text-white rounded-sm "
            onClick={handleSignIn}
          >
            SIGN IN
          </button>
        </div>
      </section>
    </>
  );
};

export default GetStarted;
