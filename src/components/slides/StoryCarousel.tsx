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
  DocumentCheckIcon,
  CpuChipIcon,
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

  const TOTAL_SLIDES = 9;

  useEffect(() => {
    onReveal(index === 8);
  }, [index, onReveal]);

  // Auto-advance calculation slide
  useEffect(() => {
    if (index === 5) {
      const timer = setTimeout(() => {
        nextSlide();
      }, 2500); 
      return () => clearTimeout(timer);
    }
  }, [index]);

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
      case 0: // INTRO (3D CUBE SCAN)
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Cube Corners */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-slate-900" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-slate-900" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-slate-900" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-slate-900" />
              
              <FingerPrintIcon className="w-24 h-24 text-slate-900/80" />
              
              {/* Scan Line */}
              <motion.div 
                initial={{ top: "10%" }}
                animate={{ top: "90%" }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                className="absolute left-4 right-4 h-1 bg-[#B1E4E3] shadow-[0_0_15px_#B1E4E3] z-10 opacity-90"
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-logo uppercase text-slate-900 mb-2 tracking-wide">
                BIOMETRIC SCAN COMPLETE
              </h1>
              <p className="text-slate-500 font-mono text-xs tracking-[0.2em] uppercase animate-pulse">
                UNLOCKING LEDGER...
              </p>
            </div>
          </div>
        );
      
      case 1: // HOME
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <GlobeAmericasIcon className="w-20 h-20 text-[#B1E4E3] drop-shadow-md" />
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Primary Jurisdiction</p>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 uppercase">
                {data.favorites.top_chain}
              </h2>
            </div>
          </div>
        );

      case 2: // VOLUME (Receipt)
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <DocumentCheckIcon className="w-20 h-20 text-slate-900" />
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">THE HUSTLE</p>
              <div className="text-[5rem] md:text-[7rem] leading-none font-logo text-slate-900">
                <Counter value={data.summary.total_tx} />
              </div>
            </div>
            <p className="text-sm text-slate-600 font-medium max-w-[250px] italic">
              "You didn't just watch. You flooded the mempool."
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
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-2">FUEL FOR THE FIRE</p>
            </div>
            <p className="text-sm text-slate-600 font-medium max-w-[250px] italic">
              "Validators love you. Your wallet... maybe less so."
            </p>
          </div>
        );

      case 4: // PEAK (Merged Month + Day)
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <BoltIcon className="w-20 h-20 text-yellow-400" />
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">THE GOD MODE</p>
              <div className="flex flex-col items-center">
                <h2 className="text-5xl md:text-6xl font-logo text-[#B1E4E3] text-stroke-sm uppercase leading-none">
                  {data.summary.peak_month}
                </h2>
                <div className="h-1 w-20 bg-slate-900 my-4 rounded-full" />
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest">
                  {data.summary.active_day_date.split(' ').slice(0, 2).join(' ')}
                </h3>
              </div>
            </div>
            <p className="text-sm text-slate-600 font-medium max-w-[250px] italic">
              "History was made on this date."
            </p>
          </div>
        );

      case 5: // CALCULATING
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <CpuChipIcon className="w-24 h-24 text-slate-300 animate-spin" />
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 animate-pulse">PROCESSING DATA...</h2>
          </div>
        );

      case 6: // TRAITS
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 w-full">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">YOUR DNA</p>
            <div className="flex flex-col gap-4 w-full items-center">
              <motion.div 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="px-8 py-4 bg-black text-white text-xl md:text-2xl font-bold uppercase rounded-xl shadow-[6px_6px_0px_#B1E4E3] -rotate-1"
              >
                #{data.traits[0] || "Normie"}
              </motion.div>
              <motion.div 
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="px-8 py-4 bg-white border-4 border-black text-black text-xl md:text-2xl font-bold uppercase rounded-xl shadow-[6px_6px_0px_#000] rotate-1"
              >
                #{data.traits[1] || "NPC"}
              </motion.div>
            </div>
            <p className="text-sm text-slate-600 font-medium max-w-[250px] italic mt-4">
              "Your distinct onchain signature."
            </p>
          </div>
        );

      case 7: // IDENTITY
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">THE VERDICT</p>
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

      case 8: // REVEAL
        return (
          <div className="flex flex-col items-center justify-center h-full w-full">
             <div className="w-full max-w-[90vw] md:max-w-md mb-20"> 
                <WrappedCard data={data} />
             </div>
          </div>
        );
      
      default: return null;
    }
  };

  return (
    <div className={`w-full h-full flex flex-col p-6 md:p-8 transition-colors duration-700 ${index === 8 ? "bg-transparent" : "bg-transparent"}`}>
      
      {/* 1. PROGRESS BAR */}
      <div className={`flex gap-1.5 w-full mb-6 shrink-0 ${index === 8 ? "opacity-0" : "opacity-100"} transition-opacity duration-500`}>
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
              i <= index ? 'bg-slate-900' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* 2. CONTENT AREA */}
      <div className="flex-grow relative w-full flex items-center justify-center">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full absolute inset-0 flex items-center justify-center px-4"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. NAVIGATION (Buttons updated to match 'Input' style: Black, Bold, Shadow) */}
      <div className={`w-full flex items-center justify-between gap-4 mt-6 shrink-0 ${index === 8 || index === 5 ? "hidden" : "flex"}`}>
        <button 
          onClick={prevSlide}
          disabled={index === 0}
          // Updated to 'Classic' style
          className="w-12 h-12 rounded-full border-2 border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
        >
          <ArrowLeftIcon className="w-5 h-5 text-black" />
        </button>

        <div className="flex-grow max-w-[200px]">
           {/* Reusing Button3D style logic explicitly here if needed, or rely on component */}
           <Button3D onClick={nextSlide} variant={index === 7 ? "brand" : "black"}>
              <span className="flex items-center justify-center gap-2 text-sm font-bold">
                 {index === 0 ? "START" : index === 7 ? "REVEAL" : "NEXT"} 
                 <ArrowRightIcon className="w-4 h-4" />
              </span>
            </Button3D>
        </div>
        
        <div className="w-12" />
      </div>

      {/* 4. MINT BUTTON */}
      {index === 8 && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-0 right-0 w-full max-w-xs mx-auto z-50 px-4"
        >
           <MintButton data={data} />
           <button 
              onClick={() => { setIndex(0); onReveal(false); }}
              className="w-full text-center text-[10px] text-white/60 mt-4 hover:text-white uppercase tracking-widest font-bold"
           >
             Replay Story
           </button>
        </motion.div>
      )}

    </div>
  );
}