export interface WrappedData {
  wallet: string;
  year: number;
  summary: {
    total_tx: number;
    active_days: number;
    active_day_date: string;
    active_label: string;
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
    color_theme: string;
  };
  traits: string[];
  rarity: {
    tier: string;
    percentile: string;
  };
}