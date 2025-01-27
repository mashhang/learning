import React from "react";
import DealBG from "..///../assets/cardDeal/dealbg.svg";
import { FaCheck } from "react-icons/fa";
import Image from "next/image";

const cardDeal = () => {
  return (
    <>
      <section className="w-[100%] sm:py-36 mt-[-50px]">
        <div className="flex flex-col text-center">
          <h1 className="text-[32px] mt-[20px] font-semibold">
            Transform Learning, Tailored for You
          </h1>
          <p className="text-[18px] w-[650px] mx-auto mt-1 text-[#8A94A7]">
            At Mathmath, we're committed to revolutionizing math education with
            a platform designed to meet individual needs. Explore a seamless,
            adaptive solution for crafting personalized lessons, tracking
            progress, and engaging students with dynamic, customized content.
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
    </>
  );
};

export default cardDeal;
