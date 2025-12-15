import { NextResponse } from 'next/server';
import { classifyTransaction, ContractCategory } from '@/utils/classifier';

// -----------------------------------------------------------------------------
// 1. CONFIGURATION
// -----------------------------------------------------------------------------
const MAX_EXECUTION_TIME_MS = 8500; 
const PAGE_SIZE = 100;

const SUPPORTED_CHAINS = [
  { name: "base-mainnet", id: 8453, label: "Base", tier: 1 },
  { name: "eth-mainnet", id: 1, label: "Ethereum", tier: 1 },
  { name: "matic-mainnet", id: 137, label: "Polygon", tier: 1, filterSpam: true },
  { name: "optimism-mainnet", id: 10, label: "Optimism", tier: 1 },
  { name: "arbitrum-mainnet", id: 42161, label: "Arbitrum", tier: 1 },
  { name: "bsc-mainnet", id: 56, label: "BSC", tier: 2, filterSpam: true },
  { name: "avalanche-mainnet", id: 43114, label: "Avalanche", tier: 2 }
];

const MIN_GAS_ESTIMATE: Record<string, number> = {
  "eth-mainnet": 2.50, "base-mainnet": 0.0001, "optimism-mainnet": 0.0001,
  "arbitrum-mainnet": 0.0001, "matic-mainnet": 0.001, "bsc-mainnet": 0.03, "avalanche-mainnet": 0.05
};

function getAverageTokenPrice(chainId: number): number {
  switch (chainId) {
    case 1: return 3500; case 8453: return 3500; case 10: return 3500; case 42161: return 3500; 
    case 56: return 600; case 137: return 1.00; case 43114: return 40; default: return 0;
  }
}

// -----------------------------------------------------------------------------
// 2. WORKER A: SUMMARY (Trusted ONLY for "Peak Month")
// -----------------------------------------------------------------------------
async function fetchChainSummary(chain: any, address: string, apiKey: string) {
  const url = `https://api.covalenthq.com/v1/${chain.name}/address/${address}/transactions_summary/?key=${apiKey}&quote-currency=USD`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    return { chain, items: json.data?.items || [] };
  } catch (err) { return { chain, items: [] }; }
}

// -----------------------------------------------------------------------------
// 3. WORKER B: LOOP (Trusted for "Tx Count", "Gas", "Active Day", "Persona")
// -----------------------------------------------------------------------------
async function fetchChainLoop(chain: any, address: string, apiKey: string, startTime: number) {
  let page = 0;
  let hasMore = true;
  
  const chainStats = {
    txCount: 0,
    gasUsd: 0,
    activityByDay: {} as Record<string, number>,
    categories: { DEX: 0, BRIDGE: 0, AGGREGATOR: 0, NFT: 0, INTERACTION: 0 } as Record<ContractCategory, number>
  };

  while (hasMore) {
    if (Date.now() - startTime > MAX_EXECUTION_TIME_MS) break;

    const url = `https://api.covalenthq.com/v1/${chain.name}/address/${address}/transactions_v3/?key=${apiKey}&quote-currency=USD&page-size=${PAGE_SIZE}&page-number=${page}&no-logs=true`;
    
    try {
      const res = await fetch(url);
      const json = await res.json();
      const items = json.data?.items || [];

      if (items.length === 0) { hasMore = false; break; }

      items.forEach((tx: any) => {
        if (!tx.block_signed_at?.startsWith("2025")) { hasMore = false; return; }

        // --- SPAM FILTERING (The Cleaner) ---
        if (!tx.successful) return;
        const hasLogs = tx.log_events && tx.log_events.length > 0;
        const isSpam = chain.filterSpam && (tx.value === "0" && tx.gas_spent < 21000 && !hasLogs);
        if (isSpam) return; 

        // --- AGGREGATE CLEAN DATA ---
        chainStats.txCount++;
        
        // Accurate Gas Calculation
        if (tx.gas_quote) {
           chainStats.gasUsd += tx.gas_quote;
        } else if (tx.gas_spent && tx.gas_price) {
           const tokenPrice = getAverageTokenPrice(chain.id);
           chainStats.gasUsd += (Number(tx.gas_spent) * Number(tx.gas_price) * tokenPrice) / 1e18;
        } else {
           chainStats.gasUsd += (MIN_GAS_ESTIMATE[chain.name] || 0.0001);
        }

        // Active Day Tracking
        const dateObj = new Date(tx.block_signed_at);
        const dayKey = dateObj.toISOString().split('T')[0]; 
        chainStats.activityByDay[dayKey] = (chainStats.activityByDay[dayKey] || 0) + 1;

        // Classification
        const info = classifyTransaction({ ...tx, chain_id: chain.id });
        chainStats.categories[info.category]++;
      });
      page++;
    } catch (err) { break; }
  }
  return { chain, stats: chainStats };
}

// -----------------------------------------------------------------------------
// 4. MAIN API ROUTE
// -----------------------------------------------------------------------------
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const apiKey = process.env.COVALENT_API_KEY;

  if (!address || !apiKey) return NextResponse.json({ error: 'Missing Data' }, { status: 400 });

  const startTime = Date.now();

  try {
    // A. FETCH BOTH STREAMS (Summary & Loop)
    const [summaryResults, loopResults] = await Promise.all([
      Promise.all(SUPPORTED_CHAINS.map(c => fetchChainSummary(c, address, apiKey))),
      Promise.all(SUPPORTED_CHAINS.map(c => fetchChainLoop(c, address, apiKey, startTime)))
    ]);

    // B. AGGREGATE "CLEAN" METRICS (From Loop)
    // We strictly use Loop data for Totals to ensure spam is gone (~680 count)
    let cleanTotalTx = 0;
    let cleanTotalGas = 0;
    const globalDayCounts: Record<string, number> = {};
    const globalCategories: Record<ContractCategory, number> = { DEX: 0, BRIDGE: 0, AGGREGATOR: 0, NFT: 0, INTERACTION: 0 };
    const chainCounts: Record<string, number> = {};
    let activeChains = 0;

    loopResults.forEach(({ chain, stats }) => {
      cleanTotalTx += stats.txCount;
      cleanTotalGas += stats.gasUsd;
      chainCounts[chain.label] = stats.txCount;
      if (stats.txCount > 0) activeChains++;

      Object.keys(stats.categories).forEach(k => {
        globalCategories[k as ContractCategory] += stats.categories[k as ContractCategory];
      });
      Object.entries(stats.activityByDay).forEach(([day, count]) => {
        globalDayCounts[day] = (globalDayCounts[day] || 0) + (count as number);
      });
    });

    // C. AGGREGATE "PEAK MONTH" (From Summary)
    // We strictly use Summary for Peak Month to see the whole year (e.g. May)
    const globalMonthCounts: Record<string, number> = {};
    
    summaryResults.forEach(({ items }: any) => {
      items.forEach((bucket: any) => {
        if (!bucket.latest_transaction?.block_signed_at?.startsWith("2025")) return;
        const count = bucket.total_count || 0;
        const date = new Date(bucket.latest_transaction.block_signed_at);
        const month = date.toLocaleString('default', { month: 'long' });
        globalMonthCounts[month] = (globalMonthCounts[month] || 0) + count;
      });
    });

    // D. CALCULATE FINAL METRICS
    
    // 1. Most Active Day (from Sample) -> e.g. "15 AUGUST 2025"
    const [bestDayKey, bestDayCount] = Object.entries(globalDayCounts).sort((a,b) => b[1] - a[1])[0] || ["", 0];
    let activeDayLabel = "N/A";
    if (bestDayKey) {
        const d = new Date(bestDayKey);
        activeDayLabel = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
    }

    // 2. Peak Month (from Full History) -> e.g. "MAY"
    const [peakMonth, _] = Object.entries(globalMonthCounts).sort((a,b) => b[1] - a[1])[0] || ["December", 0];
    
    // 3. Top Chain
    const [topChainName, topChainCount] = Object.entries(chainCounts).sort((a,b) => b[1] - a[1])[0] || ["None", 0];

    // E. PERSONA & RARITY (Using Clean Totals)
    let title = "THE TOURIST";
    let desc = "Just passing through.";
    let theme = "from-slate-400 to-slate-600";
    let rarityTier: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Unique' = 'Common';
    let percentile = "Top 50%";

    if (cleanTotalTx > 1000) { rarityTier = 'Legendary'; percentile = "Top 1%"; }
    else if (cleanTotalTx > 500) { rarityTier = 'Epic'; percentile = "Top 5%"; }
    else if (cleanTotalTx > 100) { rarityTier = 'Rare'; percentile = "Top 15%"; }
    else if (cleanTotalTx > 20) { rarityTier = 'Uncommon'; percentile = "Top 30%"; }
    if (cleanTotalGas > 1000) { rarityTier = 'Epic'; percentile = "Top 5% (Gas)"; }

    if (activeChains >= 5 && cleanTotalTx > 500) { rarityTier = 'Unique'; percentile = "The Polyglot"; }

    const dominance = cleanTotalTx > 0 ? (topChainCount / cleanTotalTx) : 0;
    
    // Persona Logic
    if (dominance > 0.90 && cleanTotalTx > 50) {
       if (topChainName === "Base") { title = "BASED GOD"; desc = "You live on the blue chain. Brian is proud."; theme = "from-blue-500 to-blue-700"; }
       else if (topChainName === "Ethereum") { title = "ETH MAXI"; desc = "L2s? Never heard of them."; theme = "from-slate-800 to-gray-900"; }
       else if (topChainName === "Arbitrum") { title = "ARBINAUT"; desc = "Scaling Ethereum."; theme = "from-blue-400 to-cyan-600"; }
       else if (topChainName === "Optimism") { title = "THE OPTIMIST"; desc = "Superchain believer."; theme = "from-red-500 to-rose-600"; }
       else if (topChainName === "Polygon") { title = "MATIC MARINE"; desc = "Efficient and purple."; theme = "from-purple-600 to-indigo-700"; }
       else if (topChainName === "BSC") { title = "BSC BARON"; desc = "High volume retail zone."; theme = "from-yellow-400 to-yellow-600"; }
       else if (topChainName === "Avalanche") { title = "AVAX APEX"; desc = "Subnet scaler."; theme = "from-red-600 to-red-800"; }
       else { title = "THE LOYALIST"; desc = `You are 90% committed to ${topChainName}.`; }
    } 
    else if (rarityTier === 'Unique') { title = "THE CHOSEN ONE"; desc = "Transcended chains."; theme = "from-indigo-500 via-purple-500 to-pink-500"; }
    else if (rarityTier === 'Legendary') { title = "THE WHALE"; desc = "Market mover."; theme = "from-yellow-400 to-orange-500"; }
    else if (globalCategories['DEX'] > 20) { title = "THE DEGEN"; desc = "Yield is forever."; theme = "from-green-400 to-emerald-600"; }
    else if (globalCategories['BRIDGE'] > 5) { title = "THE NOMAD"; desc = "Home is wherever the yield is."; theme = "from-blue-400 to-cyan-500"; }
    else if (globalCategories['NFT'] > 10) { title = "THE COLLECTOR"; desc = "JPEGs > Liquidity."; theme = "from-pink-500 to-rose-500"; }
    else if (rarityTier === 'Epic') { title = "THE OPERATOR"; desc = "High impact."; theme = "from-purple-500 to-pink-600"; }

    const traits: string[] = [];
    if (cleanTotalTx > 500) traits.push("High Volume");
    if (activeChains >= 4) traits.push("Chain Loyalist");
    if (globalCategories['BRIDGE'] > 2) traits.push("Bridge Hopper");
    if (globalCategories['DEX'] > 10) traits.push("DeFi Native");
    if (globalCategories['NFT'] > 5) traits.push("JPEG Collector");
    if (dominance > 0.9) traits.push(`${topChainName} Maxi`);

    return NextResponse.json({
      wallet: address,
      year: 2025,
      summary: {
        total_tx: cleanTotalTx, // RETURNS ~680 (Clean)
        active_days: bestDayCount, 
        active_day_date: activeDayLabel, 
        active_label: "Most Active Day",
        total_gas_usd: cleanTotalGas.toFixed(2), // RETURNS Clean Gas
        peak_month: peakMonth // RETURNS "May" (True History)
      },
      favorites: {
        top_chain: topChainName,
        top_chain_count: topChainCount
      },
      persona: { title, description: desc, color_theme: theme },
      traits: traits.slice(0, 4),
      rarity: { tier: rarityTier, percentile }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Fetch Failed' }, { status: 500 });
  }
}