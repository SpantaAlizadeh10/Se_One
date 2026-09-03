import { Award, ArrowRight } from "lucide-react";

export default function MilestoneBanner() {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const progress = 0.75; // 4 of 5 documents

  return (
    <div className="bg-gradient-to-br from-peach to-[#FCF3E7] rounded-lg px-5 py-6 sm:px-8 sm:py-7 mb-7 shadow-card grid grid-cols-1 md:grid-cols-[1.3fr_auto_1fr] items-center gap-5">
      <div>
        <div className="w-[38px] h-[38px] rounded-full bg-ink flex items-center justify-center text-gold mb-3.5">
          <Award size={18} />
        </div>
        <h3 className="font-serif text-[24px] font-semibold leading-tight mb-2">Next milestone</h3>
        <p className="text-ink70 text-[14.5px] max-w-[340px] mb-4">
          Upload 1 more document to raise your earnings potential and unlock the next tier.
        </p>
        <button className="inline-flex items-center gap-2 bg-ink text-white px-5 py-3 rounded-[11px] text-[13.5px] font-semibold hover:bg-blueDeep hover:-translate-y-px transition-all">
          Continue learning
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="w-[112px] h-[112px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff_0%,#F3E4C2_70%)] flex items-center justify-center ring-1 ring-inset ring-gold/25 mx-auto">
        <svg width="96" height="96" viewBox="0 0 112 112" className="-rotate-90">
          <circle cx="56" cy="56" r={radius} fill="none" stroke="#fff" strokeWidth="9" />
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke="#A67A1E"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
        </svg>
      </div>

      <div className="bg-white rounded-md p-5 h-full flex flex-col justify-center border border-gold/20">
        <div className="font-serif text-[30px] font-semibold text-ink">4 / 5</div>
        <div className="text-[12px] text-muted mt-0.5">Documents uploaded</div>
        <div className="mt-3.5 pt-3.5 border-t border-dashed border-line text-[12.5px] font-semibold text-sageDeep flex items-center gap-1.5">
          <ArrowRight size={13} />
          +$49 on next upload
        </div>
      </div>
    </div>
  );
}
