export interface WrappedSummary {
  wallet: string;
  year: number;
  summary: {
    total_tx: number;
    active_days: number;
    total_gas_usd: string;
    peak_month: string;
  };
  favorites: {
    top_chain: string;
    top_chain_count: number;
  };
  persona: {
    title: string;
    description: string;
    color_theme: string; // e.g., "from-purple-500 to-pink-500"
  };
  // NEW: The RPG Elements
  traits: string[]; // e.g., ["High Volume", "Bridge Hopper", "Diamond Hands"]
  rarity: {
    tier: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Unique';
    percentile: string; // e.g., "Top 1%" or "Top 50%"
  };
}