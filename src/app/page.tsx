"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import Button3D from "@/components/ui/Button3D";
import { WrappedSummary } from "@/types/wrapped";
import SlideIntro from "@/components/slides/SlideIntro";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WrappedSummary | null>(null);

  const fetchWrapped = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/wrapped?address=${address}`);
      const json = await res.json();
      if (json.error) { alert(json.error); return; }
      setData(json);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    // We removed 'bg-swirl' because it's now applied to the body globally
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-4">
      
      {/* HEADER */}
      <h1 className="z-10 font-heading text-4xl md:text-6xl text-white mb-8 text-center uppercase tracking-widest drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] text-stroke-2">
        Wrapped On Chain
      </h1>

      {/* CARD */}
      <div className="z-10 w-full max-w-md bg-white border-[3px] border-black rounded-[2rem] shadow-hard p-6 md:p-10 relative">
        
        {!data ? (
          /* START SCREEN */
          <div className="flex flex-col items-center text-center space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Check Your 2024</h2>
              <p className="text-slate-500 font-medium">Connect wallet to see your year.</p>
            </div>
             
             {isConnected ? (
               <div className="w-full space-y-3">
                 <Button3D onClick={fetchWrapped} disabled={loading} variant="brand">
                   {loading ? "Scanning..." : "Generate Wrapped 🚀"}
                 </Button3D>
                 <button onClick={() => disconnect()} className="text-xs font-bold text-slate-400 underline decoration-2 underline-offset-2 hover:text-black">
                   Disconnect {address?.slice(0,6)}...
                 </button>
               </div>
             ) : (
               <Button3D onClick={() => connect({ connector: injected() })} variant="black">
                 Connect Wallet
               </Button3D>
             )}
          </div>
        ) : (
          /* RESULTS SCREEN */
          <div>
            <SlideIntro data={data} />
            <button 
              onClick={() => setData(null)} 
              className="mt-6 w-full text-center text-xs text-slate-400 font-bold hover:text-black uppercase tracking-widest"
            >
               Start Over
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-12 opacity-50 font-heading text-sm">
        Powered by Covalent
      </div>
    </main>
  );
}