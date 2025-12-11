import { cn } from "@/lib/utils";

export default function Stepper({ step }: { step: number }) {
  const steps = [
    { num: 1, label: "CONNECT" },
    { num: 2, label: "GENERATE" },
    { num: 3, label: "MINT" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 mb-8">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full border-2 transition-all",
            step >= s.num 
              ? "bg-white border-black text-black shadow-[2px_2px_0px_0px_#000]" 
              : "bg-white/40 border-slate-400 text-slate-400"
          )}>
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
              step >= s.num ? "bg-[#B1E4E3] border border-black" : "bg-slate-200"
            )}>
              {s.num}
            </div>
            {/* Use font-retro */}
            <span className="text-[10px] md:text-xs font-bold font-retro tracking-wider">
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
             <div className="w-4 h-[2px] bg-slate-400 mx-1 md:mx-2 opacity-50" />
          )}
        </div>
      ))}
    </div>
  );
}