import React from "react";
import Image from "next/image";
import { sci, alm, ilt } from "../../../public/assets/landingPage";

const offer = () => {
  return (
    <>
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
    </>
  );
};

export default offer;
