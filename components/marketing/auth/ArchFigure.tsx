import { ReactNode } from "react";

export default function ArchFigure({
  tone = "gray",
  children,
}: {
  tone?: "gray" | "warm";
  children?: ReactNode;
}) {
  const bg =
    tone === "warm"
      ? "linear-gradient(180deg,#E0AE7E,#F0D2B0)"
      : "linear-gradient(180deg,#9A9EA6,#C4C7CD)";
  const body = tone === "warm" ? "#B97A46" : "#3A3F4B";

  return (
    <div
      className="relative h-[320px] lg:h-[min(78vh,640px)] flex items-end justify-center overflow-hidden"
      style={{
        background: bg,
        borderRadius: "50% 50% 22px 22px / 34% 34% 0 0",
      }}
    >
      <div className="relative w-[78%] max-w-[360px] flex flex-col items-center">
        <div
          className="w-[130px] h-[130px] sm:w-[150px] sm:h-[150px] rounded-full flex items-center justify-center relative z-20 -mb-6 overflow-hidden"
          style={{ background: "#F4CBAE" }}
        >
          <svg
            width="70"
            height="70"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3A3F4B"
            strokeWidth="1.6"
          >
            <circle cx="8.5" cy="12" r="3.2" />
            <circle cx="15.5" cy="12" r="3.2" />
            <path d="M11.7 12h.6M5.3 12H4M20 12h-1.3" />
          </svg>
        </div>

        {children && (
          <div className="w-full flex items-center justify-center -mt-8 z-20 pointer-events-none">
            {children}
          </div>
        )}
        <div
          className="w-full h-[190px] sm:h-[220px] rounded-t-[60px] relative z-10"
          style={{ background: body }}
        />
        <div
          className="absolute bottom-[22px] sm:bottom-[26px] left-1/2 -translate-x-1/2 w-[160px] sm:w-[190px] h-[100px] sm:h-[120px] rounded-t-[10px] rounded-b-[4px] z-30"
          style={{
            background: "#D8D9DC",
            boxShadow: "0 -4px 10px rgba(0,0,0,0.12)",
          }}
        />
      </div>
    </div>
  );
}
