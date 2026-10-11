// Source: Muhammad_Abubakar_Lead_Blockchain_Engineer.docx (Oct 2026). Titles, dates, products and
// figures are from the résumé. `summary` is the plain first layer; `highlights` sit behind
// "Technical detail" and may use [[term]] glossary marks.

export type Role = {
  id: string;
  title: string;
  company: string;
  /** e.g. "Islamabad · On-site" */
  where: string;
  /** ISO month, e.g. "2026-02" */
  start: string;
  /** ISO month, or null for a current role */
  end: string | null;
  summary: string;
  highlights?: string[];
  focus: string[];
  stack: string[];
};

// Most recent start first. OVEX (current) and MicroSlush overlapped in 2026.
export const roles: Role[] = [
  {
    id: "microslush",
    title: "Backend Blockchain Developer",
    company: "MicroSlush",
    where: "Remote · Netherlands",
    start: "2026-02",
    end: "2026-09",
    summary:
      "Built the money side of SILPRE, a crypto investment platform — deposits, payouts and withdrawals that now carry an investment pool of over $600,000.",
    highlights: [
      "SILPRE (user.silpre.net): the blockchain and backend layer reached an active investment pool of over $600,000 within three months of production launch.",
      "Automated settlement that has paid out over $340,000 in investor returns and processed over $40,000 in user withdrawals on-chain.",
      "Multi-chain withdrawal and swap services on Firebase Cloud Functions with ethers.js, covering BSC, Ethereum and TRON.",
      "Investment and settlement backend on Firestore transactions and Express.js REST APIs, keeping balance updates atomic under concurrent payouts.",
      "Multi-asset deposits and withdrawals for USDS, USDT, USDC, BNB and ETH with live CoinGecko price feeds, and a centralised admin wallet with per-asset decimal precision so transfers never lose value to rounding.",
      "ROI plan engines (100-day, 12-month and group) with accrual, cancellation and payout scheduling, plus admin APIs for users, roles, KYC, deposits, withdrawals and cancellations.",
    ],
    focus: ["Settlement", "Multi-chain withdrawals & swaps", "Admin APIs"],
    stack: ["Node.js", "TypeScript", "Express.js", "Firebase Cloud Functions", "Firestore", "ethers.js", "TronWeb"],
  },
  {
    id: "ovex",
    title: "Blockchain Backend Lead",
    company: "OVEX Technologies",
    where: "Islamabad · On-site · Promoted from Blockchain Developer",
    start: "2025-07",
    end: null,
    summary:
      "Lead the blockchain team behind SWAP21, a crypto exchange that runs on its own Bitcoin-based network — from the nodes up to the wallets that hold customer funds.",
    highlights: [
      "Lead the blockchain team for custodial and non-custodial exchange products built on in-house Bitcoin and EVM L1 forks, owning node architecture, wallet design and release standards.",
      "SWAP21 (swap21.com): engineered the blockchain layer end to end — wallet generation, deposit detection, transaction flow and withdrawal signing against fork nodes.",
      "Diagnosed and resolved a chain fork/split on the live network, restoring consensus across exchange nodes.",
      "Built the network’s block explorer and customised the Bitcoin Core Qt wallet; run full nodes across Ubuntu servers as systemd units with peer-maintenance timers for unattended recovery.",
      "Wrote missing deposit-monitoring workers, eliminated PostgreSQL connection exhaustion under sustained load, and tuned mining and consensus parameters for faster confirmations.",
      "Set direction for deposit detection, withdrawal signing and [[UTXO]] management; review exchange services and C++ Bitcoin Core changes before production; mentor developers on Bitcoin internals and custodial key handling.",
      "Real-estate tokenization contracts in Solidity with Hardhat, with on-chain property purchases through MetaMask.",
    ],
    focus: ["Team lead", "Exchange infrastructure", "Bitcoin Core forks"],
    stack: ["Bitcoin Core (C++)", "Python", "Django", "Celery", "PostgreSQL", "Redis", "Solidity", "Hardhat"],
  },
  {
    id: "forhopps",
    title: "Software Developer",
    company: "Forhopps Inc",
    where: "Remote",
    start: "2024-07",
    end: "2024-08",
    summary: "Built a SaaS platform on the MERN stack, including a customised rich-text editor.",
    focus: ["Feature delivery", "Full-stack"],
    stack: ["MongoDB", "Express", "React", "Node.js", "TipTap"],
  },
];
