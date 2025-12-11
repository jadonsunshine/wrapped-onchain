import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) return NextResponse.json({ error: 'Address required' }, { status: 400 });

  const apiKey = process.env.COVALENT_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'API Key missing' }, { status: 500 });

  // 1. Chains to Scan (Mainnets only for V1 speed)
  const chains = [
    { name: "base-mainnet", id: 8453, label: "Base" },
    { name: "eth-mainnet", id: 1, label: "Ethereum" },
    { name: "matic-mainnet", id: 137, label: "Polygon" },
    { name: "optimism-mainnet", id: 10, label: "Optimism" },
    { name: "arbitrum-mainnet", id: 42161, label: "Arbitrum" }
  ];

  try {
    // 2. Parallel Fetching (Fast!)
    const promises = chains.map(async (chain) => {
      // fetching summary for the whole year (simplified endpoint)
      const url = `https://api.covalenthq.com/v1/${chain.name}/address/${address}/transaction_v2/summary/?key=${apiKey}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        const items = data?.data?.items || [];
        // The summary endpoint returns a list of years/months, we sum them all for simplicity in V1
        // or grab the latest summary item.
        return { chain: chain.label, items };
      } catch (err) {
        return { chain: chain.label, items: [] };
      }
    });

    const results = await Promise.all(promises);

    // 3. Aggregation Logic
    let totalTx = 0;
    let totalGasUsd = 0;
    let topChain = { name: "None", count: 0 };
    let earliestTx = new Date();
    let latestTx = new Date(0);

    results.forEach((res) => {
      if (res.items && res.items.length > 0) {
        // Covalent summary returns items by time range. We sum them up.
        const chainTx = res.items.reduce((acc: number, item: any) => acc + item.total_count, 0);
        const chainGas = res.items.reduce((acc: number, item: any) => acc + (item.total_gas_cost_usd || 0), 0);

        totalTx += chainTx;
        totalGasUsd += chainGas;

        if (chainTx > topChain.count) {
          topChain = { name: res.chain, count: chainTx };
        }
        
        // Find dates
        res.items.forEach((item: any) => {
             const first = new Date(item.earliest_transaction.block_signed_at);
             const last = new Date(item.latest_transaction.block_signed_at);
             if (first < earliestTx) earliestTx = first;
             if (last > latestTx) latestTx = last;
        });
      }
    });

    // 4. Persona Logic (The fun part)
    let persona = { title: "The Tourist 📸", description: "Just passing through.", color_theme: "#94a3b8" };

    if (totalGasUsd > 100) {
      persona = { title: "The Whale 🐋", description: "You burn gas like it's free.", color_theme: "#3b82f6" };
    } else if (totalTx > 50) {
      persona = { title: "The Grinder ⚙️", description: "Non-stop hustle.", color_theme: "#f59e0b" };
    } else if (totalTx > 10) {
      persona = { title: "The Regular 🤝", description: "Solid on-chain citizen.", color_theme: "#10b981" };
    }

    // 5. Final JSON Response
    return NextResponse.json({
      wallet: address,
      year: 2024,
      summary: {
        total_tx: totalTx,
        active_days: Math.floor(totalTx / 2), // Rough estimate
        total_gas_usd: totalGasUsd.toFixed(2),
        first_tx_date: totalTx > 0 ? earliestTx.toISOString().split('T')[0] : "N/A",
        last_tx_date: totalTx > 0 ? latestTx.toISOString().split('T')[0] : "N/A",
      },
      favorites: {
        top_chain: topChain.name,
        top_chain_count: topChain.count
      },
      persona: persona
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}