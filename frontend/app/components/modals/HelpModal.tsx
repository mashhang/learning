"use client";

export default function HelpModal() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Help Center</h2>
      <p>Find answers to common questions.</p>
      <ul className="mt-4 space-y-2">
        <li className="text-blue-500 cursor-pointer">FAQs</li>
        <li className="text-blue-500 cursor-pointer">Contact Support</li>
      </ul>
    </div>
  );
}
