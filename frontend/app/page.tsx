"use client";

import Image from "next/image";
import { learning, sci, alm, ilt } from "@/public/landingPage";
import DealBG from "@/public/cardDeal/dealbg.svg";
import { FaCheck } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter(); // Initialize useRouter

  const handleSignIn = () => {
    router.push("/login"); // Navigate to the login page
  };

  return (
    <div className="flex justify-center items-start">
      <div className="xl:max-w-[1280px] w-full">
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
        {/* ---------------------------------------------------------- */}
        <div className="mt-20 w-full h-[1px] bg-[#242830]"></div>
        {/* ---------------------------------------------------------- */}
        <section className="w-[100%] sm:py-36 mt-[-50px]">
          <div className="flex flex-row justify-between">
            <div className="w-[310px] text-center flex flex-col">
              <Image
                src={sci}
                alt="Seamless Curriculum Integration"
                className="w-[100px] h-[100px] md:my-0 self-center"
              />

              <h1 className="text-[24px] mt-[20px] font-semibold">
                Seamless Curriculum Integration
              </h1>
              <p className="text-[18px]  text-[#8A94A7]">
                Integrate and adjust curriculums effortlessly with our
                user-friendly tools. Create cohesive and engaging learning
                experiences without the hassle.
              </p>
            </div>

            <div className="w-[310px] text-center flex flex-col">
              <Image
                src={alm}
                alt="Adaptive Learning Modules"
                className="w-[100px] h-[100px] md:my-0 self-center"
              />

              <h1 className="text-[24px] mt-[20px] font-semibold">
                Adaptive Learning Modules
              </h1>
              <p className="text-[18px]  text-[#8A94A7]">
                Customize learning modules to fit individual student needs. Our
                platform adapts in real time, ensuring a personalized education
                journey for every learner.
              </p>
            </div>

            <div className="w-[310px] text-center flex flex-col">
              <Image
                src={ilt}
                alt="Interactive Learning Tools"
                className="w-[100px] h-[100px] md:my-0 self-center"
              />

              <h1 className="text-[24px] mt-[20px] font-semibold">
                Seamless Curriculum Integration
              </h1>
              <p className="text-[18px]  text-[#8A94A7]">
                Engage students with interactive exercises and visual aids that
                adapt to their learning style, making complex mathematical
                concepts easier to understand.
              </p>
            </div>
          </div>
        </section>
        {/* ---------------------------------------------------------- */}
        <div className="mt-[-57px] w-full h-[1px] bg-[#242830]"></div>
        {/* ---------------------------------------------------------- */}
        <section className="w-[100%] sm:py-36 mt-[-50px]">
          <div className="flex flex-col text-center">
            <h1 className="text-[32px] mt-[20px] font-semibold">
              Transform Learning, Tailored for You
            </h1>
            <p className="text-[18px] w-[650px] mx-auto mt-1 text-[#8A94A7]">
              At Mathmath, we&apos;re committed to revolutionizing math
              education with a platform designed to meet individual needs.
              Explore a seamless, adaptive solution for crafting personalized
              lessons, tracking progress, and engaging students with dynamic,
              customized content.
            </p>
          </div>

          <div className="mx-auto mt-10 w-[360px] h-[380px] bg-[#2C3039]">
            <p className="font-semibold text-white pt-14 pb-6 mx-6 border-b-[#8A94A7] border-b-[1px]">
              What you will get
            </p>
            <p className="flex flex-row text-[#8A94A7] pt-4 pb-4 mx-6 border-b-[#8A94A7] border-b-[1px]">
              <FaCheck className="my-auto mr-4 text-[#4BA8CE]" />
              An intuitive tool
            </p>
            <p className="flex flex-row text-[#8A94A7] pt-4 pb-4 mx-6 border-b-[#8A94A7] border-b-[1px]">
              <FaCheck className="my-auto mr-4 text-[#4BA8CE]" />A powerful
              community of learners
            </p>
            <p className="flex flex-row text-[#8A94A7] pt-4 pb-4 mx-6 border-b-[#8A94A7] border-b-[1px]">
              <FaCheck className="my-auto mr-4 text-[#4BA8CE]" />
              Reminders to study
            </p>
            <p className="flex flex-row text-[#8A94A7] pt-4 pb-4 mx-6 border-b-[#8A94A7] border-b-[1px]">
              <FaCheck className="my-auto mr-4 text-[#4BA8CE]" />
              Analytics to track performances
            </p>
          </div>

          <Image
            src={DealBG}
            alt="Background"
            className="absolute w-[50%] h-[50%] mt-[-500px] ml-36 z-[-1]"
          />
        </section>
        {/* ---------------------------------------------------------- */}
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
      </div>
    </div>
  );
}
