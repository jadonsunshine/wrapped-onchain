"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import Button3D from "@/components/ui/Button3D";
import { WrappedData } from "@/types/wrapped"; 
import StoryCarousel from "@/components/slides/StoryCarousel"; 
import Stepper from "@/components/ui/Stepper";
import CryptoBackground from "@/components/ui/CryptoBackground";
import { 
  WalletIcon, 
  SparklesIcon, 
  ArrowPathIcon, 
  PowerIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  ShareIcon
} from "@heroicons/react/24/solid";
import WalletStatus from "@/components/WalletStatus";

export default function Home() {
  const { address: connectedAddress, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  // State management
  const [targetAddress, setTargetAddress] = useState<string | null>(null); // Address being analyzed
  const [manualAddress, setManualAddress] = useState(""); 
  const [readyToGenerate, setReadyToGenerate] = useState(false); // Show generate screen
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WrappedData | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [scanText, setScanText] = useState("GENERATE WRAPPED");

  // Helper to truncate address
  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 7)}*******${addr.slice(-5)}`;
  };

  const currentStep = data ? 3 : readyToGenerate ? 2 : 1;

  const cycleScanText = () => {
    const phases = [
      "SCANNING ETHEREUM...", 
      "SCANNING BASE...", 
      "SCANNING OPTIMISM...", 
      "SCANNING ARBITRUM...",
      "SCANNING POLYGON...",
      "SCANNING AVALANCHE...",
      "CALCULATING GAS...", 
      "ANALYZING TRAITS..."
    ];
    let i = 0;
    return setInterval(() => {
      setScanText(phases[i]);
      i = (i + 1) % phases.length;
    }, 1000); 
  };

  // Handle wallet connection
  const handleConnect = () => {
    connect({ connector: injected() });
  };

  // Handle setting target address (from wallet or manual input)
  const handleSetAddress = (addr: string) => {
    if (!addr.startsWith("0x") || addr.length !== 42) {
      setError("Please enter a valid Ethereum address (0x...)");
      return;
    }
    setError(null);
    setTargetAddress(addr);
    setReadyToGenerate(true);
    setManualAddress(""); // Clear input
  };

  // Fetch wrapped data
  const fetchWrapped = async () => {
    const activeAddress = targetAddress || connectedAddress;
    if (!activeAddress) return;

    setLoading(true);
    setError(null);
    const interval = cycleScanText(); 

    try {
      const res = await fetch(`/api/wrapped?address=${activeAddress}`);
      const json = await res.json();
      
      if (json.error) { 
        setError(json.error);
        setLoading(false);
        clearInterval(interval);
        setScanText("GENERATE WRAPPED");
        return;
      }

      // Check if wallet has no activity
      if (json.summary.total_tx === 0) {
        setError("No onchain activity found for this address in 2025. Try another wallet!");
        setLoading(false);
        clearInterval(interval);
        setScanText("GENERATE WRAPPED");
        return;
      }

      setData(json);
      setIsRevealed(false);
    } catch (err) { 
      console.error(err);
      setError("Failed to fetch data. Please try again.");
    } finally { 
      setLoading(false); 
      clearInterval(interval); 
      setScanText("GENERATE WRAPPED"); 
    }
  };

  // Reset everything
  const handleBackToHome = () => {
    setData(null);
    setTargetAddress(null);
    setReadyToGenerate(false);
    setIsRevealed(false);
    setError(null);
    setManualAddress("");
  };

  // Auto-set target address when wallet connects
  useEffect(() => {
    if (isConnected && connectedAddress && !targetAddress) {
      setTargetAddress(connectedAddress);
      setReadyToGenerate(true);
    }
  }, [isConnected, connectedAddress, targetAddress]);

  return (
    <main className="min-h-screen w-full flex flex-col relative overflow-hidden font-sans">
      
      {/* 1. BACKGROUND */}
      <CryptoBackground />
      <div className={`fixed inset-0 bg-slate-950 transition-opacity duration-1000 pointer-events-none z-0 ${isRevealed ? 'opacity-95' : 'opacity-0'}`} />

      {/* 2. HEADER */}
      <header className={`fixed top-0 left-0 w-full flex justify-center z-50 pt-4 pb-6 transition-all duration-500 ${isRevealed ? 'opacity-0 -translate-y-20' : 'opacity-100'}`}>
        <h1 className="font-logo text-2xl md:text-5xl text-center leading-[0.85] uppercase drop-shadow-md pointer-events-auto flex flex-col items-center">
          <span className="text-white text-stroke-sm tracking-wide block">WRAPPED</span>
          <span className="text-[#B1E4E3] text-stroke-sm tracking-wide block">ONCHAIN</span>
        </h1>
      </header>

      {/* WALLET STATUS (Always visible) */}
      <div className="absolute top-6 right-6 z-50">
        <div className="hidden md:block"><WalletStatus /></div>
        <button
          onClick={() => isConnected ? disconnect() : handleConnect()}
          className="md:hidden bg-white p-2 rounded-full border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-y-0.5 transition-all"
        >
          <WalletIcon className="w-6 h-6 text-slate-900" />
        </button>
      </div>

      {/* BACK TO HOME BUTTON (visible during carousel) */}
      {data && (
        <button
          onClick={handleBackToHome}
          className={`fixed top-6 left-6 z-50 bg-white p-3 rounded-full border-2 border-black shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-y-0.5 transition-all ${isRevealed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <HomeIcon className="w-5 h-5 text-slate-900" />
        </button>
      )}

      {/* 3. MAIN CONTENT */}
      <div className="flex-grow flex flex-col items-center justify-center w-full px-4 pt-10 pb-12 z-10">
        
        {/* STEPPER */}
        <div className={`mb-10 scale-90 md:scale-100 transition-opacity duration-500 ${isRevealed ? 'opacity-0' : 'opacity-100'}`}>
           <Stepper step={currentStep} />
        </div>

        {/* CONTAINER LOGIC */}
        <div className={`
          z-10 w-full transition-all duration-700 ease-in-out relative
          ${!readyToGenerate ? 'max-w-lg bg-white rounded-[3rem] shadow-[var(--shadow-deep)] min-h-[500px]' : ''}
          ${readyToGenerate && !data ? 'max-w-lg bg-white rounded-[3rem] shadow-[var(--shadow-deep)] min-h-[500px]' : ''}
          ${data && !isRevealed ? 'max-w-lg bg-white rounded-[3rem] shadow-[var(--shadow-deep)] h-[600px] overflow-hidden' : ''}
          ${isRevealed ? 'max-w-4xl bg-transparent h-[600px] overflow-visible' : ''} 
        `}>
          
          <div className="relative z-10 h-full">
            
            {/* SCREEN 1: INITIAL INPUT */}
            {!readyToGenerate && (
              <div className="p-8 md:p-12 h-full flex flex-col justify-center items-center text-center space-y-8 relative overflow-hidden">
                {/* FIXED: Added background-size and background-position */}
                <div className="absolute inset-0 magicpattern opacity-50 pointer-events-none" style={{ backgroundSize: 'cover', backgroundPosition: 'center' }} />
                
                <div className="space-y-3 z-10">
                  <h2 className="text-3xl md:text-4xl font-logo text-slate-900 leading-tight uppercase">
                    CHECK YOUR 2025<br/><span className="text-[#B1E4E3]">ONCHAIN ACTIVITY</span>
                  </h2>
                  <p className="text-slate-500 font-medium text-lg px-6 leading-relaxed">Connect wallet or paste address.</p>
                </div>
                 
                <div className="w-full max-w-xs flex flex-col items-center gap-4 z-10">
                  <Button3D onClick={handleConnect} variant="black">
                    <span className="flex gap-2"><WalletIcon className="w-5 h-5 text-white" /> CONNECT WALLET</span>
                  </Button3D>
                  
                  <div className="flex items-center w-full gap-2">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span className="text-[10px] font-bold text-slate-400">OR PASTE</span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>
                  
                  <div className="w-full flex gap-2">
                    <input 
                      type="text" 
                      placeholder="0x..." 
                      value={manualAddress} 
                      onChange={(e) => setManualAddress(e.target.value)} 
                      className="flex-grow bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#B1E4E3] focus:outline-none transition-colors" 
                    />
                    <button 
                      onClick={() => handleSetAddress(manualAddress)} 
                      disabled={!manualAddress}
                      className="bg-slate-900 text-white rounded-xl px-4 hover:bg-[#B1E4E3] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MagnifyingGlassIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {error && (
                    <p className="text-red-500 text-xs font-bold">{error}</p>
                  )}
                  
                  <div className="flex items-center gap-2 text-slate-400 mt-2">
                    <ShieldCheckIcon className="w-4 h-4 text-[#B1E4E3]" />
                    <span className="text-[10px] font-bold tracking-wide uppercase">Read-Only Secure Connection</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 2: GENERATE SCREEN */}
            {readyToGenerate && !data && (
              <div className="p-8 md:p-12 h-full flex flex-col justify-center items-center text-center space-y-8 relative overflow-hidden">
                <div className="absolute inset-0 magicpattern opacity-50 pointer-events-none" style={{ backgroundSize: 'cover', backgroundPosition: 'center' }} />
                
                <div className="space-y-4 z-10">
                  <div className="w-16 h-16 mx-auto bg-[#B1E4E3] rounded-full flex items-center justify-center">
                    <WalletIcon className="w-8 h-8 text-slate-900" />
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-logo text-slate-900 leading-tight uppercase">
                    ANALYZING ADDRESS
                  </h2>
                  
                  <p className="text-slate-600 font-mono text-sm">
                    {truncateAddress(targetAddress || "")}
                  </p>
                  
                  <p className="text-slate-500 text-sm px-4">
                    {isConnected && targetAddress === connectedAddress 
                      ? "Connected wallet detected. Ready to generate your 2025 Wrapped!"
                      : "Pasted address detected. Ready to view their 2025 Wrapped!"}
                  </p>
                </div>
                 
                <div className="w-full max-w-xs space-y-4 flex flex-col items-center z-10">
                  <Button3D onClick={fetchWrapped} disabled={loading} variant="brand">
                    {loading ? (
                      <span className="flex items-center gap-2 justify-center text-xs font-bold uppercase">
                        <ArrowPathIcon className="w-4 h-4 animate-spin" /> {scanText}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 justify-center">
                        <SparklesIcon className="w-5 h-5" /> GENERATE WRAPPED
                      </span>
                    )}
                  </Button3D>
                  
                  {error && (
                    <p className="text-red-500 text-xs font-bold">{error}</p>
                  )}
                  
                  <button 
                    onClick={handleBackToHome}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                  >
                    ← Back
                  </button>
                  
                  {!isConnected && (
                    <div className="pt-4 border-t border-slate-200 w-full">
                      <p className="text-[10px] text-slate-400 mb-2">Want to connect your wallet?</p>
                      <Button3D onClick={handleConnect} variant="black" size="sm">
                        <span className="flex gap-2 text-xs"><WalletIcon className="w-4 h-4" /> CONNECT WALLET</span>
                      </Button3D>
                    </div>
                  )}
                  
                  {isConnected && targetAddress !== connectedAddress && (
                    <button 
                      onClick={() => disconnect()} 
                      className="group flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                    >
                      <PowerIcon className="w-4 h-4 group-hover:text-red-500" />
                      Disconnect Wallet
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* SCREEN 3: STORY CAROUSEL */}
            {data && (
              <div className="relative w-full h-full">
                {!isRevealed && (
                  <div 
                    className="absolute inset-0 magicpattern opacity-30 pointer-events-none z-0" 
                    style={{ backgroundSize: 'cover', backgroundPosition: 'center' }}
                  />
                )}
                
                <div className="h-full">
                  <StoryCarousel 
                    data={data} 
                    onReveal={(val) => setIsRevealed(val)} 
                  />
                </div>
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