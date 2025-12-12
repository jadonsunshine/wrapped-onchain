

### **Project Name:** WrappedOnChain
**Tagline:** The "Spotify Wrapped" for Web3.

### **Elevator Pitch**
WrappedOnChain transforms dry, tabular transaction history into a gamified, visual narrative. By aggregating cross-chain data, we generate a personalized "Year in Review" story for users, culminating in a unique, mintable "Onchain Persona" (e.g., *The Diamond Hand*, *The Gas Guzzler*) that turns boring analytics into social proof.

---

### **The Problem**
* **Data Fragmentation:** Users transact across multiple chains (ETH, Base, Polygon), but their history is scattered across disparate block explorers.
* **Lack of Engagement:** Current tools (Etherscan, Debank) are utilitarian and spreadsheet-like. There is no emotional connection or "fun" way to review on-chain milestones.
* **Social Void:** Web3 users love to flex, but screenshots of transaction hashes aren't viral. They need polished, shareable visuals.

### **The Solution**
A polished, interactive dApp that connects to a user's wallet and instantly generates a 6-slide "Story" of their year:
1.  **Multi-Chain Aggregation:** Uses Covalent API to pull history from Ethereum, Base, Optimism, Arbitrum, and Polygon simultaneously.
2.  **Narrative Analytics:** Calculates key metrics like "Top Chain Habitat," "Busiest Month," and "Total Gas Burned."
3.  **Algorithmic Personas:** Assigns an RPG-style class (e.g., "The Whale") based on specific behavior patterns (high volume vs. high value).

---

### **Key Features (MVP)**
* **Visual Carousel:** A Framer Motion-powered slideshow with smooth transitions and a progress bar.
* **Smart Fallbacks:** Custom logic to estimate gas fees even when APIs return zeroes.
* **Web3 Native Design:** "Summer Green" aesthetic with curated, floating crypto icons and "Magic Pattern" grids—moving away from generic corporate UI.
* **Secure Connection:** Read-only wallet connection using Wagmi/Viem; no sensitive permissions required.

### **Technology Stack**
* **Frontend:** Next.js 14, React, Tailwind CSS v4.
* **Animations:** Framer Motion.
* **Data Engine:** Covalent Unified API (Server-side aggregation).
* **Web3:** Wagmi hooks, Viem.
* **Assets:** React Icons (Si* Library), Heroicons.

---

### **Business Model (Sustainability)**
* **Freemium Fun:** Generating and viewing the "Wrapped" slides is 100% free to maximize viral user acquisition (Top of Funnel).
* **Monetized Minting:** Users pay a small fee (~$2-4) to mint their final "Persona Card" as a Soulbound Token (SBT) or NFT on Base/Optimism.
* **B2B Sponsorships:** Future slides (e.g., "Top DEX") can be sponsored by protocols (e.g., Uniswap) targeting active users.

### **Current Status**
**Stage:** MVP / Live Beta
The application is fully functional: it connects to wallets, successfully aggregates cross-chain data, calculates persona logic, and renders the complete visual story. We are currently refining the mobile experience and preparing for mainnet contract deployment.
