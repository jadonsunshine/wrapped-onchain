"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WrappedCard from "@/components/WrappedCard"; // Import the new Card
import { WrappedData } from "@/types/wrapped"; // Or define interface locally
import Button3D from "@/components/ui/Button3D";
import { ArrowRightIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

export default function Carousel({ data }: { data: WrappedData }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Define the slides based on the "Story"
  const slides = [
    // SLIDE 1: VOLUME
    {
      id: "volume",
      content: (
        <div className="text-center space-y-4">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Year in Review</div>
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
            {data.summary.total_tx}
          </h2>
          <p className="text-xl font-medium text-slate-600">Transactions Signed</p>
          <div className="w-16 h-1 bg-[#B1E4E3] mx-auto rounded-full mt-4" />
        </div>
      )
    },
    // SLIDE 2: GAS & CHAIN
    {
      id: "gas",
      content: (
        <div className="text-center space-y-6">
          <div>
            <div className="text-6xl">🔥</div>
            <h2 className="text-4xl font-black text-slate-900 mt-2">${data.summary.total_gas_usd}</h2>
            <p className="text-sm font-bold text-slate-400 uppercase">Burned in Gas</p>
          </div>
          <div className="pt-6 border-t border-slate-100">
            <p className="text-lg text-slate-600">You pledged allegiance to</p>
            <h3 className="text-3xl font-black text-[#B1E4E3] uppercase drop-shadow-sm text-stroke-sm">
              {data.favorites.top_chain}
            </h3>
          </div>
        </div>
      )
    },
    // SLIDE 3: TIME
    {
      id: "time",
      content: (
        <div className="text-center space-y-4">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Peak Performance</div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase">
            {data.summary.peak_month}
          </h2>
          <p className="text-lg text-slate-600">Was your wildest month.</p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4 mx-auto max-w-[200px]">
            <p className="text-xs text-slate-400 uppercase">Busiest Day</p>
            <p className="text-sm font-bold text-slate-900">{data.summary.active_day_date}</p>
          </div>
        </div>
      )
    },
    // SLIDE 4: THE REVEAL (The Card)
    {
      id: "reveal",
      content: <WrappedCard data={data} /> // The Loot Box Card
    }
  ];

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center">
      
      {/* SLIDE CONTENT AREA */}
      <div className="w-full flex-grow flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[currentIndex].id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
          >
            {slides[currentIndex].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* NAVIGATION CONTROLS */}
      <div className="w-full px-8 pb-8 flex flex-col items-center gap-4">
        
        {/* Progress Dots */}
        <div className="flex gap-2 mb-2">
          {slides.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-8 bg-slate-900" : "w-2 bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        {!isLastSlide ? (
          <Button3D onClick={nextSlide} variant="black" className="w-full max-w-xs">
            <span className="flex items-center justify-center gap-2">
              NEXT <ArrowRightIcon className="w-4 h-4" />
            </span>
          </Button3D>
        ) : (
          <Button3D variant="brand" className="w-full max-w-xs">
            <span className="flex items-center justify-center gap-2">
              <ArrowPathIcon className="w-4 h-4" /> MINT AS NFT (Coming Soon)
            </span>
          </Button3D>
        )}
      </div>
    </div>
  );
}