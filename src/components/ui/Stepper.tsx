import { cn } from "@/lib/utils";
import { LinkIcon, SparklesIcon, IdentificationIcon } from "@heroicons/react/24/solid";

export default function Stepper({ step }: { step: number }) {
  const steps = [
    { num: 1, label: "CONNECT", icon: LinkIcon },
    { num: 2, label: "GENERATE", icon: SparklesIcon },
    { num: 3, label: "MINT", icon: IdentificationIcon },
  ];

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 w-full">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const isActive = step >= s.num;
        
        return (
          <div key={s.num} className="flex items-center">
            <div className={cn(
              "flex items-center gap-3 px-2 py-2 md:px-5 md:py-3 rounded-full border-2 transition-all duration-300",
              isActive 
                ? "bg-white border-black text-black shadow-[2px_2px_0px_0px_#000] -translate-y-0.5" 
                : "bg-white/40 border-slate-300 text-slate-400"
            )}>
              {/* Icon Circle - Now w-8/h-8 on mobile (32px) for better visibility */}
              <div className={cn(
                "w-8 h-8 md:w-8 md:h-8 rounded-full flex items-center justify-center border transition-colors",
                isActive ? "bg-[#B1E4E3] border-black" : "bg-slate-200 border-transparent"
              )}>
                {isActive ? (
                  <Icon className="w-4 h-4 text-black" />
                ) : (
                  <span className="text-xs font-bold">{s.num}</span>
                )}
              </div>
              
              {/* Label - Hidden on Mobile, Visible on Desktop */}
              <span className={cn(
                "hidden md:inline text-xs font-bold font-logo tracking-wider",
                isActive ? "text-black" : "text-slate-400"
              )}>
                {s.label}
              </span>
            </div>
            
            {/* Connector Line */}
            {i < steps.length - 1 && (
               <div className={cn(
                 "w-4 md:w-8 h-[2px] mx-1 md:mx-2 transition-colors duration-300",
                 step > s.num ? "bg-black" : "bg-slate-300/50"
               )} />
            )}
          </div>
        );
      })}
    </div>
  );
}