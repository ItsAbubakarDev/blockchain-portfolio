// Work: named case studies. Every fact here comes from the owner (brief, Oct 2026) or the résumé
// (Muhammad_Abubakar_Lead_Blockchain_Engineer.docx). Never add a metric that isn't stated there.
//
// Five-part structure: what (plain) · problem · built (technical, behind "What I built") · result
// (with `metrics` where they exist) · stack. `story` holds extra parts some studies need (the chain
// split); an entry with no `body` is awaiting the owner and never renders in production.

export type DiagramNode = {
  id: string;
  label: string;
  sub?: string;
  /** Grid position in the horizontal (desktop) orientation. */
  col: number;
  row: number;
};

export type DiagramEdge = {
  from: string;
  to: string;
  /** "reply" edges are responses/confirmations — drawn dashed in steel. */
  kind?: "request" | "reply";
};

export type Diagram = {
  caption: string;
  cols: number;
  rows: number;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  /** Nodes drawn highlighted. Defaults to all. */
  focus?: string[];
};

export type Metric = { value: string; label: string };


export type StoryPart = { label: string; body?: string };

/**
 * Who the work was delivered for. These are employer products, not personal projects — the brand
 * and the product belong to the company; what is described here is the part Muhammad built.
 */
export type Delivery = {
  /** The company the work was delivered at. */
  org: string;
  /** Role held while delivering it. */
  role: string;
  /** e.g. "Feb 2026 – present" */
  period: string;
  /** One sentence naming the company as owner and Muhammad's part in it. */
  note: string;
};

export type Project = {
  id: string;
  /** Product or study name — the heading. */
  title: string;
  /** What kind of thing it is, in a few words. */
  kind: string;
  /** Short mono tag for the case-study index. */
  domain: string;
  /** Where it was built (short label). */
  org?: string;
  /** Full attribution — who owns the product and what Muhammad delivered. */
  delivery?: Delivery;
  /** True when this study has its own page at /work/<id>. */
  detail?: boolean;
  /** Live product. */
  live?: { url: string; label: string };
  /** 1 · What it is — one plain sentence. */
  what: string;
  /** Headline numbers. Only figures the owner has stated. */
  metrics?: Metric[];
  /** 2 · The problem — what was hard or broken, plainly. */
  problem?: string;
  /** Extra narrative parts (chain split: symptoms, diagnosis, fix). Shown inside "What I built". */
  story?: StoryPart[];
  /** 3 · What I built — the technical substance. [[term]] marks get glossary definitions. */
  built: string[];
  /** 4 · The result. */
  result: string;
  /** Why it matters, when the result alone undersells it. */
  matters?: string;
  /** 5 · Stack. */
  stack?: string[];
  /** Research article ids (data/research.ts) that back this study up. */
  articles?: string[];
  diagram?: Diagram;
};

export const projects: Project[] = [
  {
    id: "silpre",
    title: "SILPRE",
    kind: "Crypto investment platform",
    domain: "Investment platform",
    org: "MicroSlush",
    delivery: {
      org: "MicroSlush",
      role: "Backend Blockchain Developer",
      period: "Feb 2026 – present",
      note: "SILPRE is a MicroSlush product. I delivered its blockchain and backend layer — deposits, settlement, withdrawals and the admin APIs — as part of the team there; the platform and brand are MicroSlush’s.",
    },
    detail: true,
    live: { url: "https://user.silpre.net", label: "user.silpre.net" },
    what: "A crypto investment platform: people deposit crypto, earn returns on a fixed-term plan and withdraw. I built the blockchain and backend layer that moves the money.",
    metrics: [
      { value: "$600,000+", label: "active investment pool, reached within three months of launch" },
      { value: "$340,000+", label: "paid out in investor returns" },
      { value: "$40,000+", label: "processed in user withdrawals" },
    ],
    problem:
      "Every deposit, return and withdrawal is real money on three blockchains, in five assets, often at the same moment. Two payouts racing each other, or a rounding slip between assets, is someone’s balance going wrong.",
    built: [
      "Multi-asset deposit and withdrawal services for USDS, USDT, USDC, BNB and ETH across BSC, Ethereum and TRON, with live CoinGecko price feeds for conversion.",
      "Withdrawal and swap services on Firebase Cloud Functions with ethers.js and TronWeb.",
      "ROI plan engines — 100-day, 12-month and group — with accrual, cancellation and payout scheduling.",
      "Firestore transactions keep balance updates atomic under concurrent payouts.",
      "A centralised admin-wallet pattern with per-asset decimal precision (6 for USDT/USDC, 18 for native tokens) to prevent rounding loss.",
      "Admin APIs for users, roles, KYC verification, deposits, withdrawals and investment requests.",
    ],
    result: "Live in production, with settlement running automatically: returns and withdrawals paid on-chain.",
    stack: ["Node.js", "TypeScript", "Express.js", "Firebase Cloud Functions", "Firestore", "ethers.js", "TronWeb", "BEP20 / ERC20 / TRC20"],
    articles: ["eth-lifecycle"],
    diagram: {
      caption: "SILPRE — money in across the top, investors and admins below (simplified)",
      cols: 5,
      rows: 2,
      nodes: [
        { id: "chains-in", label: "Deposits in", sub: "BSC · ETH · TRON", col: 0, row: 0 },
        { id: "deposits", label: "Deposit service", sub: "ethers.js · TronWeb", col: 1, row: 0 },
        { id: "ledger", label: "Balances", sub: "Firestore txns", col: 2, row: 0 },
        { id: "roi", label: "ROI engine", sub: "accrual · payouts", col: 3, row: 0 },
        { id: "wallet", label: "Admin wallet", sub: "per-asset decimals", col: 4, row: 0 },
        { id: "investor", label: "Investor", sub: "web app", col: 0, row: 1 },
        { id: "api", label: "Platform API", sub: "Express · Functions", col: 1, row: 1 },
        { id: "prices", label: "Price feed", sub: "CoinGecko", col: 2, row: 1 },
        { id: "admin", label: "Admin APIs", sub: "KYC · requests", col: 3, row: 1 },
        { id: "chains-out", label: "Payouts out", sub: "BSC · ETH · TRON", col: 4, row: 1 },
      ],
      edges: [
        { from: "chains-in", to: "deposits" },
        { from: "deposits", to: "ledger" },
        { from: "ledger", to: "roi" },
        { from: "roi", to: "wallet" },
        { from: "wallet", to: "chains-out", kind: "reply" },
        { from: "investor", to: "api" },
        { from: "api", to: "ledger" },
        { from: "prices", to: "ledger" },
        { from: "admin", to: "roi" },
      ],
    },
  },
  {
    id: "swap21",
    title: "SWAP21",
    kind: "Centralized crypto exchange",
    domain: "Exchange",
    org: "OVEX Technologies",
    delivery: {
      org: "OVEX Technologies",
      role: "Blockchain Backend Lead",
      period: "Jul 2025 – present",
      note: "SWAP21 is operated by OVEX Technologies. I lead the blockchain team that builds and runs its chain, custodial wallet and node layer; the exchange and brand are OVEX’s.",
    },
    detail: true,
    live: { url: "https://swap21.com", label: "swap21.com" },
    what: "A crypto exchange that runs on its own Bitcoin-based blockchain — its own nodes, block explorer and custodial wallets. I lead the team that builds and runs that layer.",
    problem:
      "An exchange on its own chain has no provider to fall back on. Every deposit has to be noticed, every withdrawal signed, and every node kept in agreement — by the team, around the clock.",
    built: [
      "The blockchain layer end to end: wallet generation, deposit detection, transaction flow and withdrawal signing against the fork’s nodes.",
      "The network’s block explorer, and a customised Bitcoin Core Qt wallet for transaction tracking and wallet management.",
      "Full nodes across several Ubuntu servers, converted to systemd units with peer-maintenance scripts and timers for unattended recovery.",
      "Deposit-monitoring workers, and PostgreSQL connection exhaustion eliminated under sustained load.",
      "Mining and consensus parameters tuned for faster confirmations.",
    ],
    result: "A live exchange on a chain the team operates itself — including bringing it back from a consensus split.",
    stack: ["Bitcoin Core (C++)", "Python", "Django", "Celery", "PostgreSQL", "Redis", "Ubuntu", "systemd", "Nginx"],
    articles: ["btc-lifecycle"],
    diagram: {
      caption: "SWAP21 — withdrawals across the top, deposits return below (simplified)",
      cols: 5,
      rows: 2,
      nodes: [
        { id: "trader", label: "Trader", sub: "exchange", col: 0, row: 0 },
        { id: "backend", label: "Exchange API", sub: "Django · Celery", col: 1, row: 0 },
        { id: "db", label: "PostgreSQL", sub: "balances", col: 2, row: 0 },
        { id: "signer", label: "Signer", sub: "custodial withdrawals", col: 3, row: 0 },
        { id: "nodes", label: "Fork nodes", sub: "Bitcoin Core fork", col: 4, row: 0 },
        { id: "wallets", label: "Deposit wallets", sub: "address generation", col: 1, row: 1 },
        { id: "monitor", label: "Deposit workers", sub: "detect · confirm", col: 3, row: 1 },
        { id: "peers", label: "Node network", sub: "systemd · timers", col: 4, row: 1 },
      ],
      edges: [
        { from: "trader", to: "backend" },
        { from: "backend", to: "db" },
        { from: "db", to: "signer" },
        { from: "signer", to: "nodes" },
        { from: "nodes", to: "peers" },
        { from: "peers", to: "monitor", kind: "reply" },
        { from: "monitor", to: "db", kind: "reply" },
        { from: "backend", to: "wallets" },
      ],
    },
  },
  {
    id: "chain-split",
    title: "The live chain split",
    kind: "Production incident",
    domain: "Consensus",
    org: "OVEX Technologies · SWAP21",
    delivery: {
      org: "OVEX Technologies",
      role: "Blockchain Backend Lead",
      period: "Jul 2025 – present",
      note: "An incident on the SWAP21 network, operated by OVEX Technologies. I diagnosed the split and restored consensus across the exchange nodes.",
    },
    what: "The exchange’s blockchain split in two: part of the network followed one history, part followed another. Until it was resolved, nobody could say which deposits were real or which balances to trust. I diagnosed the split and brought every exchange node back onto one chain.",
    // TODO(owner): symptoms, diagnosis and fix. Empty parts don't render in production.
    story: [
      { label: "Symptoms" },
      { label: "How I diagnosed it" },
      { label: "The fix" },
    ],
    built: [],
    result: "Consensus restored across the exchange nodes.",
    matters:
      "This is what separates someone who has run a chain in production from someone who has read about one.",
  },
  {
    id: "forks",
    title: "Bitcoin & EVM L1 forks",
    kind: "Custom blockchain networks",
    domain: "L1 forks",
    what: "New blockchains built from Bitcoin’s and Ethereum’s code — designed from the first block, built for every major operating system, and run as real networks.",
    problem:
      "A fork is more than a renamed binary. It needs its own rules from block zero, nodes that can find each other, isolation from the network it was copied from, and builds that come out the same every time.",
    built: [
      "BTC1: a Bitcoin Core v22–derived network powering live custodial exchange backends.",
      "Genesis block, premine window and emission schedule on a post-v29 Bitcoin Core (CMake) base, keeping a 21M supply cap on Bitcoin’s halving curve.",
      "chainparams and consensus configuration, with full isolation from Bitcoin mainnet through custom magic bytes, P2P ports and removal of upstream DNS seeds.",
      "A DNS seeder on AWS EC2 with Route 53, and peer discovery hardened with chainparams-level [[seed|seed node]] literals after an upstream seed outage.",
      "Reproducible Docker builds, plus cross-platform node and Qt wallet builds for Linux/WSL2, Windows (MinGW via depends) and macOS (Homebrew Qt 5.15).",
      "An EVM L1 (chainId 5356) on Geth v1.10.26 proof-of-work, with Uniswap V3 contracts deployed for on-chain liquidity.",
    ],
    result:
      "Networks that start from a designed first block, find their peers, stay isolated from Bitcoin mainnet, and build the same way on every platform.",
    stack: ["Bitcoin Core (C++)", "CMake", "MinGW", "Qt", "Docker", "AWS EC2", "Route 53", "Geth", "Uniswap V3"],
    articles: ["min-chain-work", "cross-compile"],
    diagram: {
      caption: "Fork infrastructure — build pipeline below, application access above",
      cols: 5,
      rows: 2,
      nodes: [
        { id: "apps", label: "Apps", sub: "exchange, wallets", col: 0, row: 0 },
        { id: "gateway", label: "API layer", sub: "authenticated", col: 1, row: 0 },
        { id: "rpc", label: "Node RPC", sub: "JSON-RPC", col: 2, row: 0 },
        { id: "node", label: "Full node", sub: "forked Core", col: 3, row: 0 },
        { id: "peers", label: "P2P network", sub: "isolated", col: 4, row: 0 },
        { id: "fork", label: "Core fork", sub: "chainparams", col: 2, row: 1 },
        { id: "image", label: "Docker image", sub: "reproducible", col: 3, row: 1 },
        { id: "seeds", label: "DNS seeder", sub: "EC2 · Route 53", col: 4, row: 1 },
      ],
      edges: [
        { from: "apps", to: "gateway" },
        { from: "gateway", to: "rpc" },
        { from: "rpc", to: "node" },
        { from: "node", to: "peers" },
        { from: "fork", to: "image" },
        { from: "image", to: "node" },
        { from: "image", to: "seeds" },
        { from: "seeds", to: "peers" },
      ],
    },
  },
  {
    id: "evm-wallets",
    title: "EVM wallet infrastructure",
    kind: "Wallet services",
    domain: "Wallets",
    what: "Wallets a product controls from code — create addresses, send funds, track every transfer — across four networks, without ever exposing the keys.",
    problem:
      "Products need to create addresses, move funds and know what happened on several EVM chains, without leaking keys or losing track of [[nonces|nonce]] when transactions stall.",
    built: [
      "A wallet API accepts intents; a builder prices [[gas]] and assigns nonces per chain.",
      "Per-address nonce queues, so concurrent sends never collide.",
      "Keys derive from [[HD seeds|hd wallet]], and signing happens in an isolated signer, apart from request handling.",
      "Ethers.js providers per network with fallback RPC endpoints; a broadcaster submits and a tracker follows receipts to [[finality]].",
    ],
    result: "One wallet interface across Ethereum, BSC, Base and Polygon, so adding a network is configuration rather than a new code path.",
    stack: ["ethers.js", "Node.js", "TypeScript", "Ethereum", "BSC", "Base", "Polygon"],
    articles: ["eth-lifecycle"],
    diagram: {
      caption: "Wallet pipeline — transaction path above, key path below",
      cols: 5,
      rows: 2,
      nodes: [
        { id: "app", label: "App", sub: "requests", col: 0, row: 0 },
        { id: "api", label: "Wallet API", sub: "one interface", col: 1, row: 0 },
        { id: "builder", label: "Tx builder", sub: "gas · nonce", col: 2, row: 0 },
        { id: "broadcast", label: "Broadcaster", sub: "per chain", col: 3, row: 0 },
        { id: "chains", label: "EVM networks", sub: "ETH BSC Base POL", col: 4, row: 0 },
        { id: "keys", label: "Key derivation", sub: "HD wallets", col: 1, row: 1 },
        { id: "signer", label: "Signer", sub: "isolated", col: 2, row: 1 },
        { id: "receipts", label: "Receipts", sub: "to finality", col: 4, row: 1 },
      ],
      edges: [
        { from: "app", to: "api" },
        { from: "api", to: "builder" },
        { from: "builder", to: "signer" },
        { from: "keys", to: "signer" },
        { from: "signer", to: "broadcast" },
        { from: "broadcast", to: "chains" },
        { from: "chains", to: "receipts", kind: "reply" },
      ],
    },
  },
  {
    id: "real-estate",
    title: "Web3 real estate marketplace",
    kind: "Property tokenization",
    domain: "Marketplace",
    org: "OVEX Technologies",
    delivery: {
      org: "OVEX Technologies",
      role: "Blockchain Backend Lead",
      period: "Jul 2025 – present",
      note: "Delivered at OVEX Technologies: I built the tokenization contracts and the indexer behind the marketplace.",
    },
    what: "A property marketplace where who-owns-what is recorded on a blockchain anyone can check, while browsing stays as fast as any ordinary website.",
    problem:
      "Listings and ownership records usually live in separate systems, so buyers can’t check the state of what they’re buying. Putting everything on-chain makes search and media slow and expensive.",
    built: [
      "Real-estate tokenization contracts in Solidity with Hardhat: listing and transfer state live on-chain, with property purchases signed through MetaMask.",
      "Contracts emit an event for every state change; an indexer replays those events into Firestore, so search and media stay fast and the off-chain view can always be rebuilt from the chain.",
    ],
    result: "Listings whose sale state can be checked on-chain, with browsing that feels like any other web app.",
    stack: ["Solidity", "Hardhat", "ethers.js", "MetaMask", "Next.js", "React", "Firestore"],
    diagram: {
      caption: "Marketplace — on-chain path above, off-chain index below",
      cols: 5,
      rows: 2,
      nodes: [
        { id: "user", label: "Buyer / seller", sub: "browser", col: 0, row: 0 },
        { id: "app", label: "Next.js app", sub: "listings UI", col: 1, row: 0 },
        { id: "wallet", label: "Wallet", sub: "MetaMask", col: 2, row: 0 },
        { id: "contracts", label: "Contracts", sub: "Solidity", col: 3, row: 0 },
        { id: "chain", label: "EVM chain", sub: "settlement", col: 4, row: 0 },
        { id: "api", label: "API", sub: "search, media", col: 1, row: 1 },
        { id: "store", label: "Firestore", sub: "metadata", col: 2, row: 1 },
        { id: "indexer", label: "Event indexer", sub: "contract logs", col: 3, row: 1 },
      ],
      edges: [
        { from: "user", to: "app" },
        { from: "app", to: "wallet" },
        { from: "wallet", to: "contracts" },
        { from: "contracts", to: "chain" },
        { from: "chain", to: "indexer", kind: "reply" },
        { from: "indexer", to: "store" },
        { from: "app", to: "api" },
        { from: "api", to: "store" },
      ],
    },
  },
];

/** A story part is shown only once the owner has written it (dev shows the gap). */
export const isWritten = (p: StoryPart) => !!p.body?.trim();
