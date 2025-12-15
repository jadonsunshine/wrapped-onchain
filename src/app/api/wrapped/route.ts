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

// UPDATED: More realistic 2025 L2 Gas Prices (Cost per Tx in USD)
const MIN_GAS_ESTIMATE: Record<string, number> = {
  "eth-mainnet": 2.50,      // Expensive
  "avalanche-mainnet": 0.05,// Medium
  "bsc-mainnet": 0.03,      // Cheap
  "matic-mainnet": 0.001,   // Very Cheap
  "base-mainnet": 0.0001,   // Dirt Cheap (Blob era)
  "optimism-mainnet": 0.0001,
  "arbitrum-mainnet": 0.0001
};

// -----------------------------------------------------------------------------
// 2. HELPER: THE TIME-SAFE FETCHER
// -----------------------------------------------------------------------------
async function fetchChainLoop(chain: any, address: string, apiKey: string, startTime: number) {
  let page = 0;
  let hasMore = true;
  
  const chainStats = {
    txCount: 0,
    gasUsd: 0,
    activityByDay: {} as Record<string, number>,
    activityByMonth: {} as Record<string, number>,
    categories: { DEX: 0, BRIDGE: 0, AGGREGATOR: 0, NFT: 0, INTERACTION: 0 } as Record<ContractCategory, number>
  };

  while (hasMore) {
    if (Date.now() - startTime > MAX_EXECUTION_TIME_MS) {
      console.log(`[${chain.label}] Time limit. Stopping.`);
      break;
    }

    const url = `https://api.covalenthq.com/v1/${chain.name}/address/${address}/transactions_v3/?key=${apiKey}&quote-currency=USD&page-size=${PAGE_SIZE}&page-number=${page}&no-logs=true`;
    
    try {
      const res = await fetch(url);
      const json = await res.json();
      const items = json.data?.items || [];

      if (items.length === 0) {
        hasMore = false;
        break;
      }

      items.forEach((tx: any) => {
        if (!tx.block_signed_at?.startsWith("2025")) {
          hasMore = false; 
          return;
        }

        // --- UPDATED SPAM SIEVE ---
        // If it failed -> Spam
        if (!tx.successful) return;

        // If it has NO value, NO logs, and Low Gas -> Spam (Empty call)
        // But if it has logs (log_events), it's a real interaction!
        const hasLogs = tx.log_events && tx.log_events.length > 0;
        const isSpam = chain.filterSpam && (tx.value === "0" && tx.gas_spent < 21000 && !hasLogs);
        
        if (isSpam) return; 

        // --- AGGREGATE ---
        chainStats.txCount++;
        
        // Gas: Prefer Quote > Fallback
        if (tx.gas_quote) chainStats.gasUsd += tx.gas_quote;
        else if (tx.gas_spent) {
           chainStats.gasUsd += (MIN_GAS_ESTIMATE[chain.name] || 0.0001);
        }

        // Time
        const dateObj = new Date(tx.block_signed_at);
        const dayKey = dateObj.toISOString().split('T')[0]; 
        const monthKey = dateObj.toLocaleString('default', { month: 'long' });
        
        chainStats.activityByDay[dayKey] = (chainStats.activityByDay[dayKey] || 0) + 1;
        chainStats.activityByMonth[monthKey] = (chainStats.activityByMonth[monthKey] || 0) + 1;

        // Classify
        const info = classifyTransaction({ ...tx, chain_id: chain.id });
        chainStats.categories[info.category]++;
      });

      page++;

    } catch (err) {
      break; 
    }
  }

  return { chain, stats: chainStats };
}

// -----------------------------------------------------------------------------
// 3. MAIN API ROUTE
// -----------------------------------------------------------------------------
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const apiKey = process.env.COVALENT_API_KEY;

  if (!address || !apiKey) return NextResponse.json({ error: 'Missing Data' }, { status: 400 });

  const startTime = Date.now();

  try {
    const promises = SUPPORTED_CHAINS.map(chain => fetchChainLoop(chain, address, apiKey, startTime));
    const results = await Promise.all(promises);

    // AGGREGATION
    let totalTx = 0;
    let totalGasUsd = 0;
    const globalDayCounts: Record<string, number> = {};
    const globalMonthCounts: Record<string, number> = {};
    const globalCategories: Record<ContractCategory, number> = { DEX: 0, BRIDGE: 0, AGGREGATOR: 0, NFT: 0, INTERACTION: 0 };
    const chainCounts: Record<string, number> = {};
    let activeChains = 0;

    results.forEach(({ chain, stats }) => {
      totalTx += stats.txCount;
      totalGasUsd += stats.gasUsd;
      chainCounts[chain.label] = stats.txCount;
      if (stats.txCount > 0) activeChains++;

      Object.keys(stats.categories).forEach(k => {
        globalCategories[k as ContractCategory] += stats.categories[k as ContractCategory];
      });
      Object.entries(stats.activityByDay).forEach(([day, count]) => {
        globalDayCounts[day] = (globalDayCounts[day] || 0) + (count as number);
      });
      Object.entries(stats.activityByMonth).forEach(([month, count]) => {
        globalMonthCounts[month] = (globalMonthCounts[month] || 0) + (count as number);
      });
    });

    // METRICS
    const [bestDayKey, bestDayCount] = Object.entries(globalDayCounts).sort((a,b) => b[1] - a[1])[0] || ["", 0];
    let activeDayLabel = "N/A";
    if (bestDayKey) {
        const d = new Date(bestDayKey);
        activeDayLabel = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
    }

    const [peakMonth, _] = Object.entries(globalMonthCounts).sort((a,b) => b[1] - a[1])[0] || ["December", 0];
    const [topChainName, topChainCount] = Object.entries(chainCounts).sort((a,b) => b[1] - a[1])[0] || ["None", 0];

    // -------------------------------------------------------------------------
    // THE PERSONA ENGINE (Expanded Tree)
    // -------------------------------------------------------------------------

    let title = "THE TOURIST";
    let desc = "Just passing through.";
    let theme = "from-slate-400 to-slate-600";
    let rarityTier: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Unique' = 'Common';
    let percentile = "Top 50%";

    // 1. Calculate Base Rarity
    if (totalTx > 1000) { rarityTier = 'Legendary'; percentile = "Top 1%"; }
    else if (totalTx > 500) { rarityTier = 'Epic'; percentile = "Top 5%"; }
    else if (totalTx > 100) { rarityTier = 'Rare'; percentile = "Top 15%"; }
    else if (totalTx > 20) { rarityTier = 'Uncommon'; percentile = "Top 30%"; }
    if (totalGasUsd > 1000) { rarityTier = 'Epic'; percentile = "Top 5% (Gas)"; }

    // 2. Check for "Unique" Status (Polyglot)
    if (activeChains >= 5 && totalTx > 500) {
        rarityTier = 'Unique';
        percentile = "The Polyglot";
    }

    // 3. Assign Persona (Priority Order)
    
    // A. The "Chain Loyalist" Check (>90% on one chain)
    const dominance = totalTx > 0 ? (topChainCount / totalTx) : 0;
    
    if (dominance > 0.90 && totalTx > 50) {
       // Specialized Titles
       if (topChainName === "Base") { title = "BASED GOD"; desc = "You live on the blue chain. Brian is proud."; theme = "from-blue-500 to-blue-700"; }
       else if (topChainName === "Ethereum") { title = "ETH MAXI"; desc = "L2s? Never heard of them. You pay the premium."; theme = "from-slate-800 to-gray-900"; }
       else if (topChainName === "Arbitrum") { title = "ARBINAUT"; desc = "Scaling Ethereum, one rollup at a time."; theme = "from-blue-400 to-cyan-600"; }
       else if (topChainName === "Optimism") { title = "THE OPTIMIST"; desc = "You believe in the Superchain."; theme = "from-red-500 to-rose-600"; }
       else if (topChainName === "Polygon") { title = "MATIC MARINE"; desc = "Efficient, scalable, and purple."; theme = "from-purple-600 to-indigo-700"; }
       else if (topChainName === "BSC") { title = "BSC BARON"; desc = "You thrive in the high-volume retail zone."; theme = "from-yellow-400 to-yellow-600"; }
       else if (topChainName === "Avalanche") { title = "AVAX APEX"; desc = "Scaling subnets like a pro."; theme = "from-red-600 to-red-800"; }
       else { title = "THE LOYALIST"; desc = `You are 90% committed to ${topChainName}.`; }
    } 
    // B. The "Behavioral" Personas
    else if (rarityTier === 'Unique') { 
        title = "THE CHOSEN ONE"; desc = "You have transcended chains."; theme = "from-indigo-500 via-purple-500 to-pink-500"; 
    } else if (rarityTier === 'Legendary') { 
        title = "THE WHALE"; desc = "You move markets."; theme = "from-yellow-400 to-orange-500"; 
    } else if (globalCategories['DEX'] > 20) { 
        title = "THE DEGEN"; desc = "Yield is forever. Sleep is optional."; theme = "from-green-400 to-emerald-600"; 
    } else if (globalCategories['BRIDGE'] > 5) { 
        title = "THE NOMAD"; desc = "Home is wherever the yield is."; theme = "from-blue-400 to-cyan-500"; 
    } else if (globalCategories['NFT'] > 10) {
        title = "THE COLLECTOR"; desc = "You value JPEGs more than liquidity."; theme = "from-pink-500 to-rose-500";
    } else if (rarityTier === 'Epic') { 
        title = "THE OPERATOR"; desc = "High volume, high impact."; theme = "from-purple-500 to-pink-600"; 
    }

    // TRAITS
    const traits: string[] = [];
    if (totalTx > 500) traits.push("High Volume");
    if (activeChains >= 4) traits.push("Chain Loyalist");
    if (globalCategories['BRIDGE'] > 2) traits.push("Bridge Hopper");
    if (globalCategories['DEX'] > 10) traits.push("DeFi Native");
    if (globalCategories['NFT'] > 5) traits.push("JPEG Collector");
    if (dominance > 0.9) traits.push(`${topChainName} Maxi`);

    return NextResponse.json({
      wallet: address,
      year: 2025,
      summary: {
        total_tx: totalTx,
        active_days: bestDayCount, 
        active_day_date: activeDayLabel, 
        active_label: "Most Active Day",
        total_gas_usd: totalGasUsd.toFixed(2),
        peak_month: peakMonth
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
    console.error(error);
    return NextResponse.json({ error: 'Fetch Failed' }, { status: 500 });
  }
}