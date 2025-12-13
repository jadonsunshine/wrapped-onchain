// src/components/WalletStatus.tsx
'use client';

import { useAppKit } from '@reown/appkit/react';
import { useAccount, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';

export default function WalletStatus() {
  const { open } = useAppKit();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  
  // Hydration fix (prevents Next.js server/client mismatch errors)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // Don't render anything until client loads

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        {/* Network Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
          <div className={`w-2 h-2 rounded-full ${chain?.id === 42220 ? 'bg-[#FCFF52]' : 'bg-blue-600'}`} />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            {chain?.name || "Unknown"}
          </span>
        </div>

        {/* The "Classical Modern" Address Pill */}
        <button 
          onClick={() => open()} // Clicking opens the Reown profile view
          className="group relative flex items-center gap-3 pl-2 pr-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-all hover:border-slate-300"
        >
          {/* Avatar / Jazzicon placeholder */}
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-200 to-slate-400 border border-white shadow-inner" />
          
          <span className="font-mono text-sm font-medium text-slate-700 group-hover:text-black">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </button>
      </div>
    );
  }

  // DISCONNECTED STATE
  return (
    <button 
      onClick={() => open()} 
      className="px-6 py-2.5 bg-black text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-slate-800 transition-transform active:scale-95 shadow-[0px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[2px]"
    >
      Connect Wallet
    </button>
  );
}