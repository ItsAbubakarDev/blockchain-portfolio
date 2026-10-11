// Source: Muhammad_Abubakar_Lead_Blockchain_Engineer.docx (Oct 2026), corrected by the owner
// (Oct 11 2026): OVEX and MicroSlush are BOTH current — the MicroSlush contract runs alongside the
// OVEX role, it did not replace it. The résumé PDF still shows MicroSlush ending Sep 2026.
// Experience carries role and scope; the evidence (products, numbers, incidents) lives in the Work
// case studies, linked via `caseStudies`. `summary` is the plain first layer; `highlights` sit
// behind "Technical detail".

export type Role = {
  id: string;
  title: string;
  company: string;
  /** e.g. "Islamabad · On-site" */
  where: string;
  /** True when this role runs alongside another current role (shown as "Concurrent"). */
  concurrent?: boolean;
  /** ISO month, e.g. "2026-02" */
  start: string;
  /** ISO month, or null for a current role */
  end: string | null;
  summary: string;
  highlights?: string[];
  /** Case study ids (data/projects.ts) that show the evidence for this role. */
  caseStudies?: string[];
  focus: string[];
  stack: string[];
};

// Primary current role first, then the concurrent contract, then earlier work.
export const roles: Role[] = [
  {
    id: "ovex",
    title: "Blockchain Backend Lead",
    company: "OVEX Technologies",
    where: "Islamabad · On-site · Promoted from Blockchain Developer",
    start: "2025-07",
    end: null,
    summary:
      "Lead the blockchain team for OVEX’s exchange products, built on in-house Bitcoin and EVM L1 forks — from node architecture to the wallets that hold customer funds.",
    highlights: [
      "Own node architecture, wallet design and release standards for custodial and non-custodial exchange products.",
      "Set technical direction for deposit detection, withdrawal signing and [[UTXO]] management across multi-server node deployments.",
      "Review exchange backend services and C++ Bitcoin Core node changes before they reach production.",
      "Mentor developers on Bitcoin protocol internals, chainparams and consensus configuration, EVM contract patterns and custodial key handling.",
    ],
    caseStudies: ["swap21", "chain-split", "forks", "real-estate"],
    focus: ["Team lead", "Exchange infrastructure", "Bitcoin Core forks"],
    stack: ["Bitcoin Core (C++)", "Python", "Django", "Celery", "PostgreSQL", "Redis", "Solidity", "Hardhat"],
  },
  {
    id: "microslush",
    title: "Backend Blockchain Developer",
    company: "MicroSlush",
    where: "Remote · Netherlands",
    concurrent: true,
    start: "2026-02",
    end: null,
    summary:
      "Built the blockchain and backend layer of SILPRE, a crypto investment platform — deposits, settlement and withdrawals across BSC, Ethereum and TRON.",
    highlights: [
      "Owned the multi-chain withdrawal and swap services, the investment and settlement backend, and the admin platform APIs.",
      "Built for concurrent payouts and multi-asset precision: atomic balance updates and per-asset decimals.",
    ],
    caseStudies: ["silpre"],
    focus: ["Settlement", "Multi-chain withdrawals & swaps", "Admin APIs"],
    stack: ["Node.js", "TypeScript", "Express.js", "Firebase Cloud Functions", "Firestore", "ethers.js", "TronWeb"],
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
