export type CategoryId = "frontend" | "backend" | "infrastructure" | "blockchain";

export type Category = {
  id: CategoryId;
  name: string;
  /** Where this category sits in the hero's layer model. */
  layer: string;
};

export type Technology = {
  id: string;
  name: string;
  category: CategoryId;
  /** One line: what it does in the systems Muhammad builds. */
  note: string;
};

// Ordered to mirror the system: interface → backend → infrastructure → chain.
export const categories: Category[] = [
  { id: "frontend", name: "Frontend", layer: "L3" },
  { id: "backend", name: "Backend", layer: "L2–L1" },
  { id: "infrastructure", name: "Infrastructure", layer: "L1" },
  { id: "blockchain", name: "Blockchain", layer: "L0" },
];

export const technologies: Technology[] = [
  // Frontend
  { id: "react", name: "React", category: "frontend", note: "Interfaces for wallets, dashboards and marketplaces." },
  { id: "nextjs", name: "Next.js", category: "frontend", note: "Server-rendered React apps in front of the APIs." },
  { id: "tailwind", name: "Tailwind CSS", category: "frontend", note: "Styling system for product interfaces." },

  // Backend
  { id: "nodejs", name: "Node.js", category: "backend", note: "Runtime for chain watchers, payment services and APIs." },
  { id: "typescript", name: "TypeScript", category: "backend", note: "Typed contracts across services, chains and UI." },
  { id: "javascript", name: "JavaScript", category: "backend", note: "The language under Node.js and the browser." },
  { id: "express", name: "Express", category: "backend", note: "HTTP layer for REST APIs and webhook endpoints." },
  { id: "python", name: "Python", category: "backend", note: "Exchange backend services with Django and Celery workers." },
  { id: "postgresql", name: "PostgreSQL", category: "backend", note: "Exchange ledgers, deposits and withdrawals under sustained load." },
  { id: "redis", name: "Redis", category: "backend", note: "Queues and caching behind the exchange workers." },
  { id: "firebase", name: "Firebase", category: "backend", note: "Managed backend services for auth and functions." },
  { id: "firestore", name: "Firestore", category: "backend", note: "Document state for payments, listings and jobs." },

  // Infrastructure
  { id: "apis", name: "APIs", category: "infrastructure", note: "The contract between products and the chain." },
  { id: "webhooks", name: "Webhooks", category: "infrastructure", note: "Signed, retried event delivery to other systems." },
  { id: "rpc", name: "RPC infrastructure", category: "infrastructure", note: "Reliable read/write access to chain nodes." },
  { id: "nodes", name: "Blockchain nodes", category: "infrastructure", note: "Self-run nodes for chains that need them." },
  { id: "docker", name: "Docker", category: "infrastructure", note: "Reproducible builds for services and nodes." },
  { id: "linux", name: "Linux / systemd", category: "infrastructure", note: "Full nodes run as systemd units with self-recovery timers." },
  { id: "aws", name: "AWS", category: "infrastructure", note: "EC2 and Route 53 for a fork network’s DNS seeder." },

  // Blockchain
  { id: "solidity", name: "Solidity", category: "blockchain", note: "Contract logic deployed to EVM networks." },
  { id: "ethersjs", name: "Ethers.js", category: "blockchain", note: "EVM reads, writes, events and signing from TypeScript." },
  { id: "tronweb", name: "TronWeb", category: "blockchain", note: "TRON and TRC-20 integration from Node.js." },
  { id: "bitcoincore", name: "Bitcoin Core", category: "blockchain", note: "Forked, built and run in production: C++ node changes, chainparams, consensus." },
  { id: "geth", name: "Geth", category: "blockchain", note: "A custom proof-of-work EVM L1 (chainId 5356)." },
  { id: "hardhat", name: "Hardhat", category: "blockchain", note: "Building and testing Solidity contracts before deployment." },
  { id: "ethereum", name: "Ethereum", category: "blockchain", note: "EVM mainnet." },
  { id: "bsc", name: "BSC", category: "blockchain", note: "EVM network — BNB Smart Chain." },
  { id: "base", name: "Base", category: "blockchain", note: "EVM network — Ethereum L2." },
  { id: "polygon", name: "Polygon", category: "blockchain", note: "EVM network — Polygon PoS." },
  { id: "tron", name: "TRON", category: "blockchain", note: "Account-based chain with TRC-20 tokens." },
];

/** Undirected relationships between technologies. */
export const links: [string, string][] = [
  // EVM
  ["solidity", "ethereum"], ["solidity", "bsc"], ["solidity", "base"], ["solidity", "polygon"],
  ["solidity", "ethersjs"],
  ["ethersjs", "ethereum"], ["ethersjs", "bsc"], ["ethersjs", "base"], ["ethersjs", "polygon"],
  ["ethersjs", "nodejs"], ["ethersjs", "react"], ["ethersjs", "rpc"],
  // TRON
  ["tronweb", "tron"], ["tronweb", "nodejs"], ["tronweb", "rpc"],
  // Bitcoin
  ["bitcoincore", "nodes"], ["bitcoincore", "rpc"], ["bitcoincore", "docker"],
  // Chains ↔ infra
  ["ethereum", "rpc"], ["bsc", "rpc"], ["base", "rpc"], ["polygon", "rpc"], ["tron", "rpc"],
  ["nodes", "rpc"], ["nodes", "docker"],
  // Backend
  ["nodejs", "typescript"], ["nodejs", "javascript"], ["nodejs", "express"], ["nodejs", "firebase"],
  ["nodejs", "docker"],
  ["typescript", "javascript"], ["typescript", "express"],
  ["express", "apis"], ["express", "webhooks"],
  ["firebase", "firestore"],
  ["python", "postgresql"], ["python", "redis"], ["python", "apis"],
  ["apis", "webhooks"],
  // Frontend
  ["react", "nextjs"], ["react", "javascript"], ["nextjs", "tailwind"],
  ["typescript", "react"], ["typescript", "nextjs"], ["nextjs", "apis"],
  // Protocol
  ["bitcoincore", "linux"], ["bitcoincore", "aws"], ["nodes", "linux"], ["aws", "nodes"],
  ["geth", "nodes"], ["geth", "rpc"], ["geth", "solidity"],
  ["hardhat", "solidity"], ["hardhat", "ethersjs"],
];
