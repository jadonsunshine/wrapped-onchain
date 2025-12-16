"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { WrappedData } from "@/types/wrapped";
import Button3D from "@/components/ui/Button3D";
import MintButton from "@/components/MintButton";
import WrappedCard from "@/components/WrappedCard";
import { 
  ArrowRightIcon, 
  ArrowLeftIcon, 
  FireIcon, 
  GlobeAmericasIcon,
  BoltIcon,
  CalendarIcon,
  StarIcon,
  FingerPrintIcon
} from "@heroicons/react/24/solid";

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    filter: "blur(4px)"
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: "circOut" }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    filter: "blur(4px)",
    transition: { duration: 0.3, ease: "circIn" }
  })
};

function Counter({ value, prefix = "" }: { value: number | string, prefix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="inline-block"
    >
      {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
    </motion.span>
  );
}

export default function StoryCarousel({ data, onReveal }: { data: WrappedData, onReveal: (isRevealed: boolean) => void }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const TOTAL_SLIDES = 12;

  useEffect(() => {
    onReveal(index === 11);
  }, [index, onReveal]);

  const nextSlide = () => {
    if (index < TOTAL_SLIDES - 1) {
      setDirection(1);
      setIndex(index + 1);
    }
  };

  const prevSlide = () => {
    if (index > 0) {
      setDirection(-1);
      setIndex(index - 1);
    }
  };

  const renderContent = () => {
    switch (index) {
      case 0: // INTRO
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-[#B1E4E3]/30 rounded-full blur-xl animate-pulse" />
              <FingerPrintIcon className="w-24 h-24 text-slate-900 relative z-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-logo uppercase text-slate-900 mb-2">
                ACCESS GRANTED
              </h1>
              <p className="text-slate-500 font-mono text-xs tracking-[0.2em] uppercase">
                Analyzing Chain History...
              </p>
            </div>
          </div>
        );
      
      case 1: // CHAIN
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <GlobeAmericasIcon className="w-20 h-20 text-[#B1E4E3]" />
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Primary Jurisdiction</p>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 uppercase">
                {data.favorites.top_chain}
              </h2>
            </div>
          </div>
        );

      case 2: // TX COUNT
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Interactions</p>
            <div className="text-[5rem] md:text-[7rem] leading-none font-logo text-slate-900">
              <Counter value={data.summary.total_tx} />
            </div>
            <p className="text-sm text-slate-500 font-medium max-w-[200px]">
              Transactions signed in 2025.
            </p>
          </div>
        );

      case 3: // GAS
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <FireIcon className="w-20 h-20 text-orange-500 animate-bounce" />
            <div>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900">
                <Counter value={data.summary.total_gas_usd} prefix="$" />
              </h2>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-2">Burnt in Gas</p>
            </div>
          </div>
        );

      case 4: // DAYS
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
             <CalendarIcon className="w-20 h-20 text-indigo-500" />
             <h2 className="text-6xl font-black text-slate-900">
               <Counter value={data.summary.active_days} />
             </h2>
             <p className="text-xl font-bold uppercase text-slate-400">Days Active</p>
          </div>
        );

      case 5: // PEAK MONTH
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">Peak Performance</div>
            <h2 className="text-5xl md:text-6xl font-logo text-[#B1E4E3] text-stroke-sm uppercase">
              {data.summary.peak_month}
            </h2>
            <p className="text-slate-600 font-medium text-sm">
              Your most active month.
            </p>
          </div>
        );

      case 6: // ACTIVE DAY
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <BoltIcon className="w-20 h-20 text-yellow-400" />
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">The Grind Day</p>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase">
                {data.summary.active_day_date}
              </h2>
            </div>
          </div>
        );

      case 7: // RARITY CALC
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <StarIcon className="w-24 h-24 text-slate-300 animate-spin-slow" />
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">CALCULATING RARITY...</h2>
          </div>
        );

      case 8: // TRAIT 1
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Trait Acquired</p>
            <div className="px-8 py-4 bg-black text-white text-xl md:text-2xl font-bold uppercase rounded-xl shadow-[8px_8px_0px_#B1E4E3] -rotate-2">
              #{data.traits[0] || "Normie"}
            </div>
          </div>
        );

      case 9: // TRAIT 2
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
             <p className="text-xs font-black uppercase tracking-widest text-slate-400">Trait Acquired</p>
            <div className="px-8 py-4 bg-white border-4 border-black text-black text-xl md:text-2xl font-bold uppercase rounded-xl shadow-[8px_8px_0px_#000] rotate-3">
              #{data.traits[1] || "NPC"}
            </div>
          </div>
        );

      case 10: // IDENTITY
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Your 2025 Identity</p>
            <motion.h1 
              initial={{ scale: 2, opacity: 0, filter: "blur(10px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              className={`text-5xl md:text-7xl font-logo uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r ${data.persona.color_theme}`}
            >
              {data.persona.title}
            </motion.h1>
             <p className="text-lg font-medium text-slate-600 italic">"{data.persona.description}"</p>
          </div>
        );

      case 11: // REVEAL (Render Card directly)
        return (
          <div className="flex flex-col items-center justify-center h-full w-full">
             <div className="w-full max-w-[90vw] md:max-w-md">
                <WrappedCard data={data} />
             </div>
             <p className="text-[10px] text-white/50 uppercase tracking-widest mt-8 animate-pulse font-bold">
               Identity Secured • Covalent
             </p>
          </div>
        );
      
      default: return null;
    }
  };

  return (
    <div className={`w-full h-full flex flex-col p-6 md:p-8 transition-colors duration-700 ${index === 11 ? "bg-transparent" : "bg-transparent"}`}>
      
      {/* 1. PROGRESS BAR (Top) */}
      <div className={`flex gap-1.5 w-full mb-6 shrink-0 ${index === 11 ? "opacity-0" : "opacity-100"} transition-opacity duration-500`}>
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
              i <= index ? 'bg-slate-900' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* 2. CONTENT AREA (Middle - Flex Grow) - SIMPLIFIED */}
      <div className="flex-1 relative w-full">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center px-4"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. NAVIGATION (Bottom - Shrink 0) */}
      {/* Hidden on Reveal Slide (11) */}
      <div className={`w-full flex items-center justify-between gap-4 mt-6 shrink-0 ${index === 11 ? "hidden" : "flex"}`}>
        <button 
          onClick={prevSlide}
          disabled={index === 0}
          className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
        >
          <ArrowLeftIcon className="w-5 h-5 text-slate-400" />
        </button>

        <div className="flex-grow max-w-[200px]">
           <Button3D onClick={nextSlide} variant={index === 10 ? "brand" : "black"}>
              <span className="flex items-center justify-center gap-2 text-sm font-bold">
                 {index === 0 ? "START" : index === 10 ? "REVEAL" : "NEXT"} 
                 <ArrowRightIcon className="w-4 h-4" />
              </span>
            </Button3D>
        </div>
        
        {/* Spacer to balance the flex layout */}
        <div className="w-12" />
      </div>

      {/* 4. MINT BUTTON (Floating for Slide 11) */}
      {index === 11 && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="w-full max-w-xs mx-auto mt-8 shrink-0 z-50"
        >
           <MintButton data={data} />
           <button 
              onClick={() => { setIndex(0); onReveal(false); }}
              className="w-full text-center text-[10px] text-white/40 mt-4 hover:text-white uppercase tracking-widest"
           >
             Replay Story
           </button>
        </motion.div>
      )}

    </div>
  );
}