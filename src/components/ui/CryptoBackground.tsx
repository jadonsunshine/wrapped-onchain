"use client";

import React, { useEffect, useState } from "react";
import { 
  SiBitcoin, SiEthereum, SiSolana, SiDogecoin, SiTether, 
  SiXrp, SiCardano, SiPolkadot, SiChainlink,
  SiLitecoin, SiBinance
} from "react-icons/si";

// Manually curated positions
const items = [
  // Top Left Cluster
  { Icon: SiBitcoin, top: "5%", left: "5%", size: 60, rotate: -15, opacity: 0.1 },
  { Icon: SiEthereum, top: "15%", left: "15%", size: 40, rotate: 10, opacity: 0.08 },
  
  // Top Right Cluster
  { Icon: SiSolana, top: "8%", right: "5%", size: 55, rotate: 20, opacity: 0.1 },
  { Icon: SiEthereum, top: "20%", right: "12%", size: 35, rotate: -10, opacity: 0.08 }, // Replaced Uniswap

  // Bottom Left Cluster
  { Icon: SiDogecoin, bottom: "10%", left: "8%", size: 50, rotate: 15, opacity: 0.1 },
  { Icon: SiChainlink, bottom: "25%", left: "5%", size: 30, rotate: -5, opacity: 0.07 },

  // Bottom Right Cluster
  { Icon: SiPolkadot, bottom: "5%", right: "8%", size: 60, rotate: -20, opacity: 0.1 },
  { Icon: SiCardano, bottom: "20%", right: "15%", size: 40, rotate: 10, opacity: 0.08 },

  // Mid-Floating (Subtle)
  { Icon: SiTether, top: "45%", left: "8%", size: 25, rotate: 45, opacity: 0.05 },
  { Icon: SiBinance, top: "50%", right: "5%", size: 25, rotate: -30, opacity: 0.05 },
  { Icon: SiLitecoin, bottom: "40%", right: "10%", size: 30, rotate: 15, opacity: 0.06 },
  { Icon: SiXrp, top: "10%", left: "40%", size: 20, rotate: 60, opacity: 0.04 },
];

export default function CryptoBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {items.map((item, i) => {
        const { Icon, size, rotate, opacity, top, left, right, bottom } = item;
        
        return (
          <div
            key={i}
            className="absolute text-slate-900 mix-blend-overlay transition-all duration-1000 ease-in-out hover:scale-110"
            style={{
              // We explicitly set CSS properties here to fix the TypeScript error
              top: top,
              left: left,
              right: right,
              bottom: bottom,
              opacity: opacity,
              fontSize: `${size}px`,
              transform: `rotate(${rotate}deg)`,
            }}
          >
            <Icon />
          </div>
        );
      })}
    </div>
  );
}