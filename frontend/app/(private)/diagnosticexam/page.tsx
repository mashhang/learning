"use client";

export default function DiagnosticExam() {
  return (
    <div className="pt-[96px]">
      <div className="text-[#30608E] text-center mt-[50px]">
        <h1 className="text-3xl">0/20</h1>
        <h2 className="text-[20px]">Mathematics Diagnostic Center</h2>
      </div>

      <div className="flex justify-center items-center mt-[50px]">
        <div className="w-[900px] bg-[#30608E] text-white p-8 rounded-lg">
          {/* Header Section */}
          <div className="flex justify-between text-sm">
            <p className="font-semibold text-lg">FUNCTIONS</p>
            <p>1 of 20</p>
          </div>

          {/* Question */}
          <p className="mt-6 text-xl">
            What does "blah blah blah" mean to you?
          </p>
          <p className="mt-4 text-md">Choose the correct answer.</p>

          {/* Answer Choices */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              "It's just filler words.",
              "It's a way to dismiss unnecessary details.",
              "It represents unclear information.",
              "It has no particular meaning.",
            ].map((option, index) => (
              <button
                key={index}
                className="w-full border border-[#C5C5C5] py-3 px-4 rounded-md text-white text-left hover:bg-white hover:text-[#30608E] transition"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
