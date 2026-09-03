import StreakBanner from "@/components/practice/StreakBanner";
import SkillGrid from "@/components/practice/SkillGrid";
import PracticeList from "@/components/practice/PracticeList";

export default function PracticePage() {
  return (
    <div>
      <p className="text-muted text-[14px] -mt-2 mb-6">Short daily drills to keep every skill sharp.</p>

      <StreakBanner />

      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-[21px] font-semibold relative inline-block after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1.5 after:h-[3px] after:bg-gold after:rounded">
          Skill Areas
        </h2>
      </div>
      <SkillGrid />

      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-[21px] font-semibold relative inline-block after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1.5 after:h-[3px] after:bg-gold after:rounded">
          Recommended for you
        </h2>
        <a href="#" className="text-[13px] font-semibold text-blue">
          See all exercises
        </a>
      </div>
      <PracticeList />
    </div>
  );
}
