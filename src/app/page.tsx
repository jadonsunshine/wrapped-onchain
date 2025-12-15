"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import Button3D from "@/components/ui/Button3D";
import { WrappedData } from "@/types/wrapped"; 
import StoryCarousel from "@/components/slides/StoryCarousel"; // <--- NEW COMPONENT
import Stepper from "@/components/ui/Stepper";
import CryptoBackground from "@/components/ui/CryptoBackground";
import { 
  WalletIcon, 
  SparklesIcon, 
  ArrowPathIcon, 
  PowerIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/solid";
import WalletStatus from "@/components/WalletStatus";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  const [loading, setLoading] = useState(false);
  const [manualAddress, setManualAddress] = useState(""); 
  const [data, setData] = useState<WrappedData | null>(null);

  const currentStep = data ? 3 : isConnected ? 2 : 1;

  const fetchWrapped = async (targetAddress?: string) => {
    const activeAddress = targetAddress || address;
    
    if (!activeAddress) return;
    if (!activeAddress.startsWith("0x")) {
      alert("Please enter a valid 0x address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/wrapped?address=${activeAddress}`);
      const json = await res.json();
      if (json.error) { alert(json.error); return; }
      setData(json);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen w-full flex flex-col relative overflow-hidden font-sans">
      
      {/* 1. BACKGROUND LAYER */}
      <CryptoBackground />

      {/* 2. FIXED HEADER */}
      <header className="fixed top-0 left-0 w-full flex justify-center z-50 pt-4 pb-6 bg-gradient-to-b from-[#B1E4E3] to-transparent pointer-events-none">
        <h1 className="font-logo text-2xl md:text-5xl text-center leading-[0.85] uppercase drop-shadow-md pointer-events-auto flex flex-col items-center">
          <span className="text-white text-stroke-sm tracking-wide block">
            WRAPPED
          </span>
          <span className="text-[#B1E4E3] text-stroke-sm tracking-wide block">
            ONCHAIN
          </span>
        </h1>
      </header>

      {/* WALLET STATUS AREA */}
      <div className="absolute top-6 right-6 z-50 pointer-events-auto">
        <div className="hidden md:block">
          <WalletStatus />
        </div>
        <button
          onClick={() => isConnected ? disconnect() : connect({ connector: injected() })}
          className="md:hidden bg-white p-2 rounded-full border-2 border-black shadow-[2px_2px_0px_#000] active:translate-y-1 transition-all hover:bg-slate-50"
          aria-label={isConnected ? "Disconnect Wallet" : "Connect Wallet"}
        >
          <WalletIcon className="w-6 h-6 text-slate-900" />
        </button>
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="flex-grow flex flex-col items-center justify-center w-full px-4 pt-32 pb-12 z-10">
        
        {/* STEPPER */}
        <div className="mb-10 scale-90 md:scale-100">
           <Stepper step={currentStep} />
        </div>

        {/* MAIN CONTAINER */}
        <div className={`z-10 w-full max-w-lg transition-all duration-500 ${!data ? 'bg-white rounded-[3rem] shadow-[var(--shadow-deep)]' : 'bg-transparent'}`}>
          
          <div className="relative z-10">
            
            {!data ? (
              /* --- INPUT SCREEN (Standard) --- */
              <div className="p-8 md:p-12 flex flex-col justify-center items-center text-center space-y-8 min-h-[500px] relative overflow-hidden">
                <div className="absolute inset-0 magicpattern opacity-50 pointer-events-none" />
                
                <div className="space-y-3 z-10">
                  <h2 className="text-3xl md:text-4xl font-logo text-slate-900 leading-tight uppercase">
                    CHECK YOUR 2025<br/>
                    <span className="text-[#B1E4E3]">ONCHAIN ACTIVITY</span>
                  </h2>
                  <p className="text-slate-500 font-medium text-lg px-6 leading-relaxed">
                    Connect wallet to see your year.
                  </p>
                </div>
                 
                 {isConnected ? (
                   /* CONNECTED STATE */
                   <div className="w-full max-w-xs space-y-4 flex flex-col items-center z-10">
                     <Button3D onClick={() => fetchWrapped()} disabled={loading} variant="brand">
                       {loading ? (
                         <span className="flex items-center gap-2 justify-center">
                           <ArrowPathIcon className="w-5 h-5 animate-spin" /> SCANNING...
                         </span>
                       ) : (
                         <span className="flex items-center gap-2 justify-center">
                           <SparklesIcon className="w-5 h-5" /> GENERATE WRAPPED
                         </span>
                       )}
                     </Button3D>
                     
                     <button 
                       onClick={() => disconnect()} 
                       className="w-full group flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest mt-4 transition-colors"
                     >
                       <PowerIcon className="w-4 h-4 group-hover:text-red-500" />
                       Disconnect
                     </button>
                   </div>
                 ) : (
                   /* DISCONNECTED STATE */
                   <div className="w-full max-w-xs flex flex-col items-center gap-4 z-10">
                     <Button3D onClick={() => connect({ connector: injected() })} variant="black">
                       <span className="flex items-center gap-2 justify-center">
                         <WalletIcon className="w-5 h-5 text-white" /> CONNECT WALLET
                       </span>
                     </Button3D>

                     <div className="flex items-center w-full gap-2">
                        <div className="h-px bg-slate-200 flex-1" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">OR PASTE ADDRESS</span>
                        <div className="h-px bg-slate-200 flex-1" />
                     </div>

                     <div className="w-full flex gap-2">
                        <input 
                          type="text" 
                          placeholder="0x..." 
                          value={manualAddress}
                          onChange={(e) => setManualAddress(e.target.value)}
                          className="flex-grow bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#B1E4E3] transition-colors"
                        />
                        <button 
                          onClick={() => fetchWrapped(manualAddress)}
                          disabled={!manualAddress || loading}
                          className="bg-slate-900 text-white rounded-xl px-4 hover:bg-[#B1E4E3] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <MagnifyingGlassIcon className="w-5 h-5" />}
                        </button>
                     </div>

                     <div className="flex items-center gap-2 text-slate-400 mt-2">
                        <ShieldCheckIcon className="w-4 h-4 text-[#B1E4E3]" />
                        <span className="text-[10px] font-bold tracking-wide uppercase">Read-Only Secure Connection</span>
                     </div>
                   </div>
                 )}
              </div>
            ) : (
              /* --- STORY RESULTS SCREEN --- */
              /* The StoryCarousel handles its own background/card styling now */
              <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500 w-full">
                <div className="w-full bg-white rounded-[3rem] overflow-hidden shadow-2xl min-h-[600px]">
                   <StoryCarousel data={data} />
                </div>
                
                <button 
                  onClick={() => { setData(null); setManualAddress(""); }} 
                  className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 uppercase tracking-widest transition-colors border-b-2 border-transparent hover:border-slate-900 mt-2"
                >
                   <ArrowPathIcon className="w-4 h-4" /> Start Over
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="absolute bottom-4 w-full text-center opacity-30 font-logo text-[10px] tracking-[0.2em] pointer-events-none">
        POWERED BY COVALENT
      </footer>
    </main>
  );
}