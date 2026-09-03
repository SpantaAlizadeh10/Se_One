import { Mic, Headphones, BookOpen, Type, ArrowRight } from "lucide-react";

const skills = [
  {
    name: "Speaking",
    desc: "Pronunciation drills and guided conversation prompts.",
    level: "B1",
    Icon: Mic,
    bg: "bg-[#E4ECFF]",
    text: "text-blue"
  },
  {
    name: "Listening",
    desc: "Short audio clips with comprehension checks.",
    level: "A2",
    Icon: Headphones,
    bg: "bg-sage",
    text: "text-sageDeep"
  },
  {
    name: "Grammar",
    desc: "Targeted exercises on tenses, articles, and structure.",
    level: "B2",
    Icon: BookOpen,
    bg: "bg-goldSoft",
    text: "text-goldDeep"
  },
  {
    name: "Vocabulary",
    desc: "Flashcards and spaced repetition for new words.",
    level: "A1",
    Icon: Type,
    bg: "bg-peach",
    text: "text-peachDeep"
  }
];

export default function SkillGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
      {skills.map((s) => (
        <div
          key={s.name}
          className="bg-white border border-line rounded-md p-5 shadow-card hover:-translate-y-1 transition-transform"
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3.5 ${s.bg} ${s.text}`}>
            <s.Icon size={21} />
          </div>
          <h4 className="text-[15px] font-semibold mb-1">{s.name}</h4>
          <p className="text-[12.5px] text-muted leading-relaxed mb-3.5">{s.desc}</p>
          <div className="flex items-center justify-between">
            <span className={`text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
              {s.level}
            </span>
            <a href="#" className="text-[12px] font-bold text-blue flex items-center gap-1">
              Start <ArrowRight size={12} />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
