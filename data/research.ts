// Articles on Medium (titles and dates from the author's Medium feed, Oct 2026).
// `plain` is the first layer — what a reader gets from it; `topics` are the technical keywords.

export type Article = {
  id: string;
  title: string;
  url: string;
  /** ISO date published */
  date: string;
  /** Short mono tag */
  area: string;
  plain: string;
  topics: string[];
};

export const articles: Article[] = [
  {
    id: "dao",
    title: "DAO (Decentralized Autonomous Authority)",
    url: "https://medium.com/@abubakarrashraf20/dao-decentralized-autonomous-authority-793a5409f4ed",
    date: "2026-01-22",
    area: "Governance",
    plain: "How an organisation can be run by code and token votes instead of a central authority — and where that breaks down.",
    topics: ["Smart contracts", "Token voting", "Security risks", "Voting costs"],
  },
  {
    id: "cross-compile",
    title: "Cross-Compiling Bitcoin Core for Windows: Solving Common Build Errors for Bitcoin v22",
    url: "https://medium.com/@abubakarrashraf20/cross-compiling-bitcoin-core-for-windows-solving-common-build-errors-for-bitcoin-v22-b8fc20909ec6",
    date: "2025-10-02",
    area: "Bitcoin forks",
    plain: "How to build a Windows wallet for a Bitcoin v22 fork from Linux, and fix the three errors that stop the build.",
    topics: ["Qt wallet", "Filesystem API", "UPnP", "secp256k1"],
  },
  {
    id: "min-chain-work",
    title: "Solving the “Minimum Chain Work” Sync Issue in Bitcoin Forks",
    url: "https://medium.com/@abubakarrashraf20/solving-the-minimum-chain-work-sync-issue-in-bitcoin-forks-b1eee73f5812",
    date: "2025-09-28",
    area: "Bitcoin forks",
    plain: "Why nodes on a new Bitcoin fork refuse to download blocks from each other — and the one setting that fixes it.",
    topics: ["nMinimumChainWork", "chainparams", "Peer sync"],
  },
  {
    id: "lightning",
    title: "Bitcoin Lightning Network",
    url: "https://medium.com/@abubakarrashraf20/bitcoin-lightning-network-759bffeacff7",
    date: "2025-09-03",
    area: "Scaling",
    plain: "How Lightning makes Bitcoin payments fast and cheap by settling most of them away from the main chain.",
    topics: ["Payment channels", "Multi-hop routing", "HTLCs", "Liquidity"],
  },
  {
    id: "eth-lifecycle",
    title: "Ethereum Transaction LifeCycle",
    url: "https://medium.com/@abubakarrashraf20/ethereum-transation-lifecycle-22a2a0b52ada",
    date: "2025-08-03",
    area: "Ethereum",
    plain: "What happens between signing an Ethereum transaction and it becoming final — and how its fee is actually worked out.",
    topics: ["Validators", "Finality", "Gas", "EIP-1559"],
  },
  {
    id: "btc-lifecycle",
    title: "Bitcoin Transaction Life Cycle",
    url: "https://medium.com/@abubakarrashraf20/bitcoin-transaction-life-cycle-2569a370e9e2",
    date: "2025-07-27",
    area: "Bitcoin",
    plain: "Everything between pressing Send and a Bitcoin payment being settled — including what to do when one gets stuck.",
    topics: ["Fees", "Confirmations", "RBF", "CPFP"],
  },
];
