import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Button3DProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "brand" | "black";
  size?: "sm" | "md";
}


export default function Button3D({ 
  className, 
  variant = "brand", 
  size = "md" ,
  children, 
  ...props 
}: Button3DProps) {

    const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };
  return (
    <button 
      className={cn(
        "relative w-full px-8 py-4 rounded-full font-black text-lg uppercase tracking-widest transition-all border-[3px] border-black font-retro",
        "shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[0px_6px_0px_0px_rgba(0,0,0,1)]",
        "active:translate-y-[2px] active:shadow-none",
        variant === "brand" ? "bg-[#B1E4E3] text-black" : "bg-black text-white hover:bg-zinc-800",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}