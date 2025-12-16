"use client";

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { WrappedData } from '@/types/wrapped'; // Ensure you have this type defined or import from page
import { RARITY_CONFIG, RarityTier } from '@/utils/rarityStyles';

export default function WrappedCard({ data }: { data: WrappedData }) {
  // 1. Rarity Styles
  // Default to Common if tier not found
  const tier = (data.rarity.tier in RARITY_CONFIG ? data.rarity.tier : 'Common') as RarityTier;
  const styles = RARITY_CONFIG[tier];

  // 2. 3D Tilt Logic
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);
  
  // Holo Shine Effect moves opposite to mouse
  const sheenX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const sheenY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto perspective-1000 group">
      
      {/* A. THERMAL RECEIPT (Slides out from bottom/right) */}
      <motion.div 
        initial={{ y: 0, rotate: 0 }}
        animate={{ y: 20, rotate: 5, x: 20 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute -right-4 -bottom-12 w-48 bg-white text-black p-4 font-mono text-[10px] uppercase leading-tight shadow-xl z-0 transform origin-top-left"
        style={{ 
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 95%, 0 0)", // Jagged bottom hint
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 19px, #00000010 20px)" 
        }}
      >
        <div className="border-b-2 border-black border-dashed mb-2 pb-1 text-center font-black text-xs">
          OFFICIAL RECORD
        </div>
        <div className="flex justify-between"><span>YEAR</span><span>2025</span></div>
        <div className="flex justify-between"><span>TX COUNT</span><span>{data.summary.total_tx}</span></div>
        <div className="flex justify-between"><span>GAS(USD)</span><span>${data.summary.total_gas_usd}</span></div>
        <div className="flex justify-between"><span>PEAK</span><span>{data.summary.peak_month}</span></div>
        <div className="flex justify-between"><span>CHAIN</span><span>{data.favorites.top_chain}</span></div>
        <div className="mt-2 pt-2 border-t-2 border-black border-dashed text-center opacity-50">
          VERIFIED ONCHAIN
        </div>
      </motion.div>

      {/* B. THE 3D CARD */}
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`relative z-10 w-full aspect-[3/4] rounded-2xl border-[3px] ${styles.border} ${styles.bg} shadow-2xl ${styles.glow} overflow-hidden flex flex-col`}
      >
        {/* -- HOLO FOIL OVERLAY -- */}
        <motion.div 
          style={{ 
            background: `linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.0) 60%, transparent 100%)`,
            backgroundPositionX: sheenX,
            backgroundPositionY: sheenY,
            backgroundSize: "200% 200%"
          }}
          className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay opacity-70"
        />

        {/* -- CARD HEADER (Top %) -- */}
        <div className="p-4 flex justify-between items-start z-10">
          <div className="bg-black/50 backdrop-blur-md border border-white/20 px-2 py-1 rounded text-[10px] font-bold text-white tracking-widest">
            2025
          </div>
          <div className={`rotate-3 px-2 py-1 rounded border ${styles.border} bg-white text-black text-xs font-black shadow-lg uppercase`}>
            {data.rarity.percentile}
          </div>
        </div>

        {/* -- CARD HERO (Avatar/Title) -- */}
        <div className="flex-grow flex flex-col items-center justify-center text-center z-10 p-4">
          {/* Rarity Orb Background */}
          <div className={`absolute w-48 h-48 rounded-full blur-[60px] opacity-50 bg-gradient-to-tr ${styles.gradient}`} />
          
          <h2 className={`relative text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-sm`}>
            {data.persona.title}
          </h2>
          <p className={`relative mt-2 text-xs font-bold uppercase tracking-widest ${styles.text} opacity-80`}>
            {data.rarity.tier} CLASS
          </p>
          <div className="relative mt-4 w-12 h-1 bg-white/20 rounded-full" />
          <p className="relative mt-4 text-sm font-medium text-white/80 italic px-4">
            "{data.persona.description}"
          </p>
        </div>

        {/* -- TRAIT DECK (Chips) -- */}
        <div className="relative z-10 p-4 bg-black/40 backdrop-blur-sm border-t border-white/10">
          <p className="text-[9px] uppercase tracking-widest text-white/40 mb-2">Equipped Traits</p>
          <div className="flex flex-wrap gap-2">
            {data.traits.map((trait, i) => (
              <span 
                key={i} 
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase border border-white/10 bg-white/5 text-white shadow-sm`}
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

      </motion.div>
    </div>
  );
}