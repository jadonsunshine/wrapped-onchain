"use client";

import { useState } from "react";
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
  StarIcon
} from "@heroicons/react/24/solid";

// --- FIXED VARIANTS TYPE ---
const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    scale: 0.9,
    filter: "blur(10px)"
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: "easeOut" } // Changed to standard 'easeOut' to be safe
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    scale: 1.1,
    filter: "blur(10px)",
    transition: { duration: 0.3, ease: "easeIn" }
  })
};

function Counter({ value, prefix = "" }: { value: number | string, prefix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="inline-block"
    >
      {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
    </motion.span>
  );
}

export default function StoryCarousel({ data }: { data: WrappedData }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const TOTAL_SLIDES = 12;

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

  const getBackgroundClass = () => {
    if (index === 11) return "bg-slate-950"; // Dark for card reveal
    if (index > 7) return "bg-slate-50"; 
    return "bg-white"; 
  };

  const renderContent = () => {
    switch (index) {
      // --- ACT 1: THE CONTEXT ---
      case 0:
        return (
          <div className="text-center space-y-6">
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} 
              className="w-20 h-20 bg-black text-white rounded-full mx-auto flex items-center justify-center text-3xl font-black"
            >
              25
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-logo uppercase leading-none text-slate-900">
              PROTOCOL<br/>INITIATED
            </h1>
            <p className="text-xl text-slate-500 font-medium">The blockchain remembers everything.</p>
          </div>
        );
      
      case 1:
        return (
          <div className="text-center space-y-8">
            <GlobeAmericasIcon className="w-24 h-24 text-[#B1E4E3] mx-auto drop-shadow-md" />
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Your Home Base</p>
              <h2 className="text-6xl font-black text-slate-900 uppercase tracking-tighter">
                {data.favorites.top_chain}
              </h2>
            </div>
            <div className="bg-slate-100 inline-block px-6 py-2 rounded-full font-bold text-slate-600">
              CITIZENSHIP VERIFIED
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-center space-y-6">
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Total Interactions</p>
            <div className="text-[6rem] leading-none font-logo text-slate-900">
              <Counter value={data.summary.total_tx} />
            </div>
            <p className="text-lg text-slate-500 font-medium max-w-xs mx-auto">
              Every click, swap, and mint added to your legacy.
            </p>
          </div>
        );

      // --- ACT 2: THE GRIND ---
      case 3:
        return (
          <div className="text-center space-y-8">
            <FireIcon className="w-24 h-24 text-orange-500 mx-auto animate-bounce" />
            <div>
              <h2 className="text-6xl font-black text-slate-900">
                <Counter value={data.summary.total_gas_usd} prefix="$" />
              </h2>
              <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mt-2">Burnt in Gas</p>
            </div>
            <p className="text-slate-500 italic">"Small price for glory."</p>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
             <CalendarIcon className="w-20 h-20 text-indigo-500 mx-auto" />
             <h2 className="text-6xl font-black text-slate-900">
               <Counter value={data.summary.active_days} />
             </h2>
             <p className="text-xl font-bold uppercase text-slate-400">Days Active</p>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-8">
            <div className="text-sm font-bold uppercase tracking-widest text-slate-400">Peak Performance</div>
            <h2 className="text-6xl font-logo text-[#B1E4E3] text-stroke-sm uppercase">
              {data.summary.peak_month}
            </h2>
            <p className="text-slate-600 font-medium">
              You were unstoppable this month.
            </p>
          </div>
        );

      case 6:
        return (
          <div className="text-center space-y-8">
            <BoltIcon className="w-20 h-20 text-yellow-400 mx-auto" />
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">The Grind Day</p>
              <h2 className="text-4xl font-black text-slate-900 uppercase">
                {data.summary.active_day_date}
              </h2>
            </div>
            <p className="text-slate-500">You didn't sleep that day.</p>
          </div>
        );

      // --- ACT 3: THE IDENTITY ---
      case 7:
        return (
          <div className="text-center space-y-8">
            <StarIcon className="w-24 h-24 text-slate-300 mx-auto animate-spin" />
            <h2 className="text-4xl font-black text-slate-900">CALCULATING RARITY...</h2>
          </div>
        );

      case 8:
        return (
          <div className="text-center space-y-8">
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Trait Acquired</p>
            <div className="inline-block px-8 py-4 bg-black text-white text-2xl font-bold uppercase rounded-xl shadow-xl transform -rotate-2">
              #{data.traits[0] || "Normie"}
            </div>
          </div>
        );

      case 9:
        return (
          <div className="text-center space-y-8">
             <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Trait Acquired</p>
            <div className="inline-block px-8 py-4 bg-white border-4 border-black text-black text-2xl font-bold uppercase rounded-xl shadow-xl transform rotate-3">
              #{data.traits[1] || "NPC"}
            </div>
          </div>
        );

      case 10: // THE TITLE REVEAL
        return (
          <div className="text-center space-y-4">
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Your 2025 Identity</p>
            <motion.h1 
              initial={{ scale: 3, opacity: 0, filter: "blur(20px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ type: "spring", bounce: 0.5 }}
              className={`text-5xl md:text-7xl font-logo uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r ${data.persona.color_theme}`}
            >
              {data.persona.title}
            </motion.h1>
             <p className="text-xl font-medium text-slate-600 italic">"{data.persona.description}"</p>
          </div>
        );

      // --- ACT 4: THE PAYLOAD ---
      case 11:
        return (
          <div className="w-full flex flex-col items-center">
             <WrappedCard data={data} />
             <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-8 animate-pulse">
               Identity Secured on Covalent Network
             </p>
          </div>
        );
      
      default: return null;
    }
  };

  return (
    <div className={`w-full h-full flex flex-col justify-between min-h-[600px] transition-colors duration-700 ${getBackgroundClass()}`}>
      
      {/* 1. PROGRESS BAR */}
      <div className="w-full h-2 bg-slate-100">
        <motion.div 
          className="h-full bg-slate-900"
          initial={{ width: 0 }}
          animate={{ width: `${((index + 1) / TOTAL_SLIDES) * 100}%` }}
        />
      </div>

      {/* 2. THE STAGE */}
      <div className="flex-grow flex items-center justify-center p-4 overflow-hidden relative">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full max-w-2xl absolute"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. THE CONTROLS */}
      <div className="w-full max-w-md mx-auto px-6 pb-12 flex items-center justify-between gap-4">
        
        {/* BACK BUTTON */}
        <button 
          onClick={prevSlide}
          disabled={index === 0}
          className={`w-14 h-14 rounded-full border-2 border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-0`}
        >
          <ArrowLeftIcon className="w-6 h-6 text-slate-400" />
        </button>

        {/* ACTION BUTTON */}
        <div className="flex-grow">
          {index === TOTAL_SLIDES - 1 ? (
            <MintButton data={data} />
          ) : (
            <Button3D onClick={nextSlide} variant={index === 10 ? "brand" : "black"}>
              <span className="flex items-center justify-center gap-2">
                 {index === 0 ? "START REVEAL" : index === 10 ? "SEE CARD" : "NEXT"} 
                 <ArrowRightIcon className="w-5 h-5" />
              </span>
            </Button3D>
          )}
        </div>

      </div>

    </div>
  );
}