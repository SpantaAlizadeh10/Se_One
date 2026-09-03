import Image from "next/image";

export default function LoginHeroStrip() {
  return (
    <div className="relative h-[190px] sm:h-[220px] flex items-end justify-center gap-2 mb-2">
      {/* dark badge panel behind the figures */}
      <div
        className="absolute end-0 top-0 w-[120px] sm:w-[150px] h-full bg-ink rounded-t-[70px] flex items-start justify-center pt-6"
        aria-hidden="true"
      >
        <span
          className="text-white font-serif font-bold text-[15px] tracking-[0.15em]"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          SE ONE
        </span>
      </div>

      {/* replacement image */}
      <div className="relative z-10 flex items-end gap-3 pb-1">
        <div className="w-[220px] sm:w-[300px]">
          <Image
            src="/images/A.png"
            alt="Login illustration"
            width={600}
            height={600}
            className="w-full h-auto object-contain rounded-lg shadow-sm"
            sizes="(max-width: 640px) 220px, 300px"
          />
        </div>
      </div>
    </div>
  );
}
