export const RARITY_CONFIG = {
  Common: {
    border: "border-slate-400",
    bg: "bg-slate-900",
    glow: "shadow-slate-500/50",
    text: "text-slate-200",
    gradient: "from-slate-700 via-slate-500 to-slate-800"
  },
  Uncommon: {
    border: "border-emerald-400",
    bg: "bg-emerald-950",
    glow: "shadow-emerald-500/50",
    text: "text-emerald-200",
    gradient: "from-emerald-600 via-green-400 to-emerald-800"
  },
  Rare: {
    border: "border-blue-400",
    bg: "bg-blue-950",
    glow: "shadow-blue-500/50",
    text: "text-blue-200",
    gradient: "from-blue-600 via-cyan-400 to-blue-800"
  },
  Epic: {
    border: "border-purple-400",
    bg: "bg-purple-950",
    glow: "shadow-purple-500/50",
    text: "text-purple-200",
    gradient: "from-purple-600 via-fuchsia-400 to-purple-800"
  },
  Legendary: {
    border: "border-yellow-400",
    bg: "bg-yellow-950",
    glow: "shadow-yellow-500/50",
    text: "text-yellow-200",
    gradient: "from-yellow-500 via-amber-300 to-yellow-700"
  },
  Unique: {
    border: "border-white",
    bg: "bg-black",
    glow: "shadow-white/50",
    text: "text-white",
    // Iridescent foil effect
    gradient: "from-pink-500 via-indigo-500 to-cyan-500" 
  }
};

export type RarityTier = keyof typeof RARITY_CONFIG;