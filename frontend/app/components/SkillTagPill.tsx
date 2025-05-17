import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

export function isMath(text: string) {
  return /[-+*/^\\[\\]()∞\\infty]/.test(text);
}

export default function SkillTagPill({
  skill,
  variant = "default",
}: {
  skill: string;
  variant?: "default" | "yellow" | "blue";
}) {
  const colors = {
    default: "bg-gray-100 text-gray-800",
    yellow: "bg-yellow-100 text-yellow-800",
    blue: "bg-blue-100 text-blue-800",
  };

  const className = `inline-block text-xs font-medium mr-1 mb-1 px-2.5 py-0.5 rounded ${colors[variant]}`;

  return (
    <span className={className}>
      {isMath(skill) ? (
        <InlineMath>{skill.replace(/\\\\/g, "\\")}</InlineMath>
      ) : (
        skill
      )}
    </span>
  );
}
