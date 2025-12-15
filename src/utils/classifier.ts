// src/utils/classifier.ts

export type ContractCategory = 'DEX' | 'BRIDGE' | 'AGGREGATOR' | 'NFT' | 'INTERACTION';

export interface ContractInfo {
  name: string;
  category: ContractCategory;
}

// 1. UNIVERSAL ROUTERS (Same address on all chains)
const UNIVERSAL_ROUTERS: Record<string, ContractInfo> = {
  // Bridges & Aggregators
  "0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae": { name: "Jumper (LI.FI)", category: "BRIDGE" },
  "0x1111111254fb6c44bac0bed2854e76f90643097d": { name: "1inch", category: "AGGREGATOR" },
  "0xdef1c0ded9bec7f1a1670819833240f027b25eff": { name: "Matcha (0x)", category: "AGGREGATOR" },
  "0x881d40237659c251811cec9c364ef91dc08d300c": { name: "MetaMask Swap", category: "AGGREGATOR" },
  "0x8731d54e9d02c286767d56ac9be2abd8b997fe3f": { name: "Stargate", category: "BRIDGE" },
  "0x4d9079bb4165aeb4084c526a32695dcfd2f77381": { name: "Across", category: "BRIDGE" },
  // DEXs
  "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad": { name: "Uniswap", category: "DEX" },
  // NFTs
  "0x00000000006c3852cbef3e08e8df289169ede581": { name: "OpenSea", category: "NFT" },
};

// 2. CHAIN SPECIFIC (ChainID -> Address)
const CHAIN_ROUTERS: Record<number, Record<string, ContractInfo>> = {
  8453: { // BASE
    "0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43": { name: "Aerodrome", category: "DEX" },
    "0x4cd00e387622c35bddb9b4c962c136462338bc31": { name: "Relay", category: "BRIDGE" },
    "0x327df1e6de05895d2ab08513aaed9eafc48e1a56": { name: "Base Bridge", category: "BRIDGE" }
  },
  42161: { // ARBITRUM
    "0xc873fecbd354f5a56e00e710b90ef4201db24488": { name: "Camelot", category: "DEX" },
    "0x05373188ec72a450ac4d801eca055ceaddb4a7ea": { name: "Relay", category: "BRIDGE" }
  },
  56: { // BSC
    "0x10ed43c718714eb63d5aa57b78b54704e256024e": { name: "PancakeSwap", category: "DEX" }
  },
  43114: { // AVAX
    "0x60ae616a2155ee3d9a68541ba4544862310933d4": { name: "Trader Joe", category: "DEX" }
  },
  137: { // POLYGON
    "0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff": { name: "QuickSwap", category: "DEX" }
  }
};

export function classifyTransaction(tx: any): ContractInfo {
  if (!tx.to_address) return { name: "Contract Deploy", category: "INTERACTION" };
  const to = tx.to_address.toLowerCase();

  // A. Check Universal
  if (UNIVERSAL_ROUTERS[to]) return UNIVERSAL_ROUTERS[to];

  // B. Check Chain Specific
  // Covalent returns chain_id usually, if not we pass it in context
  const chainId = tx.chain_id || tx.chainId; 
  if (chainId && CHAIN_ROUTERS[chainId]?.[to]) {
    return CHAIN_ROUTERS[chainId][to];
  }

  // C. Fallback: Check API Metadata
  if (tx.contract_name) return { name: tx.contract_name, category: "INTERACTION" };

  return { name: "Unknown", category: "INTERACTION" };
}