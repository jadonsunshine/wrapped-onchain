import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Button3DProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "brand" | "black";
}

export default function Button3D({ 
  className, 
  variant = "brand", 
  children, 
  ...props 
}: Button3DProps) {
  return (
    <button 
      className={cn(
        // Base styles
        "relative w-full px-6 py-4 rounded-xl font-bold text-xl uppercase tracking-widest transition-all border-[3px] border-black font-heading",
        
        // Shadow logic using our new v4 theme classes
        "shadow-hard hover:translate-y-[-2px] hover:shadow-hard-hover",
        "active:translate-y-[2px] active:shadow-none",
        
        // Color variants
        variant === "brand" ? "bg-brand text-black" : "bg-black text-white hover:bg-zinc-800",
        
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}