// Project titles are factual. Problem / architecture / implementation / result copy are
// drafts describing what a system with this title involves — verify and edit each one.
// No metrics are stated on purpose: add real numbers only if you can stand behind them.

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

export type StepKey = "problem" | "architecture" | "implementation" | "result";

export type Step = {
  key: StepKey;
  body: string;
  /** Node ids highlighted in the diagram while this step is active. */
  focus: string[];
};

export type Project = {
  id: string;
  index: string;
  title: string;
  domain: string;
  /** First layer: what it does for a business, in words a non-engineer reads in one pass. */
  plain: string;
  /** Technical summary — shown under "Under the hood". [[term]] marks get glossary definitions. */
  summary: string;
  stack: string[];
  diagram?: {
    caption: string;
    cols: number;
    rows: number;
    nodes: DiagramNode[];
    edges: DiagramEdge[];
  };
  steps?: Step[];
};

export const stepLabels: Record<StepKey, string> = {
  problem: "Problem",
  architecture: "Architecture",
  implementation: "Implementation",
  result: "Result",
};

export const projects: Project[] = [
  {
    id: "payments",
    index: "01",
    title: "Blockchain Payment Infrastructure",
    domain: "Payments",
    plain:
      "Lets a business accept crypto on Bitcoin, Ethereum-style networks and TRON, and get one clear answer back for every payment: paid, or not yet.",
    summary:
      "Payment rails across Bitcoin, EVM networks and TRON: payment intents, on-chain detection, [[confirmation|confirmations]] tracking and merchant [[webhooks]] behind one API.",
    stack: ["Node.js", "TypeScript", "Ethers.js", "TronWeb", "Bitcoin Core", "Firestore", "Webhooks"],
    diagram: {
      caption: "Payment flow — request path above, settlement path below",
      cols: 5,
      rows: 2,
      nodes: [
        { id: "client", label: "Client", sub: "checkout", col: 0, row: 0 },
        { id: "api", label: "Payment API", sub: "intents", col: 1, row: 0 },
        { id: "state", label: "Payment state", sub: "Firestore", col: 2, row: 0 },
        { id: "hooks", label: "Webhooks", sub: "signed, retried", col: 3, row: 0 },
        { id: "merchant", label: "Merchant", sub: "backend", col: 4, row: 0 },
        { id: "rpc", label: "RPC nodes", sub: "BTC · EVM · TRON", col: 0, row: 1 },
        { id: "watchers", label: "Chain watchers", sub: "per network", col: 1, row: 1 },
        { id: "confirm", label: "Confirmations", sub: "depth, reorgs", col: 2, row: 1 },
      ],
      edges: [
        { from: "client", to: "api" },
        { from: "api", to: "state" },
        { from: "state", to: "hooks" },
        { from: "hooks", to: "merchant", kind: "reply" },
        { from: "rpc", to: "watchers" },
        { from: "watchers", to: "confirm" },
        { from: "confirm", to: "state" },
      ],
    },
    steps: [
      {
        key: "problem",
        body: "Accepting payments on Bitcoin, EVM chains and TRON means three transaction models, three sets of confirmation rules and three ways to fail. The product needs one answer: has this payment settled?",
        focus: ["client", "rpc"],
      },
      {
        key: "architecture",
        body: "A payment API creates intents and deposit addresses. Per-network watchers read blocks over [[RPC]]. A confirmation engine tracks depth and [[reorgs|reorg]] and moves each payment through an explicit state machine. Webhooks report every transition.",
        focus: ["client", "api", "state", "hooks", "merchant", "rpc", "watchers", "confirm"],
      },
      {
        key: "implementation",
        body: "TypeScript services. Ethers.js scans EVM blocks and token transfer events, TronWeb handles [[TRC-20]], Bitcoin Core RPC tracks [[UTXOs|utxo]]. Payment state lives in Firestore. Webhook delivery is signed, retried with backoff and [[idempotent]].",
        focus: ["rpc", "watchers", "confirm", "state"],
      },
      {
        key: "result",
        body: "One API and one payment state model in front of several chains. Integrators get a settled event and never need to know which network a payment arrived on.",
        focus: ["client", "api", "state", "hooks", "merchant"],
      },
    ],
  },
  {
    id: "bitcoin-fork",
    index: "02",
    title: "Bitcoin Fork Infrastructure",
    domain: "Nodes",
    plain:
      "Everything needed to run a new Bitcoin-based network: servers that start up identically every time, and a safe front door for the apps built on it.",
    summary:
      "Infrastructure for a Bitcoin Core–derived network: reproducible node builds, seed and full nodes, and an authenticated API between the chain and the applications on top.",
    stack: ["Bitcoin Core", "Docker", "RPC", "Node.js", "APIs"],
    diagram: {
      caption: "Fork infrastructure — build pipeline below, application access above",
      cols: 5,
      rows: 2,
      nodes: [
        { id: "apps", label: "Apps", sub: "wallets, services", col: 0, row: 0 },
        { id: "gateway", label: "API layer", sub: "authenticated", col: 1, row: 0 },
        { id: "rpc", label: "Node RPC", sub: "JSON-RPC", col: 2, row: 0 },
        { id: "node", label: "Full node", sub: "forked Core", col: 3, row: 0 },
        { id: "peers", label: "P2P network", sub: "peers", col: 4, row: 0 },
        { id: "fork", label: "Core fork", sub: "chain params", col: 2, row: 1 },
        { id: "image", label: "Docker image", sub: "reproducible", col: 3, row: 1 },
        { id: "seeds", label: "Seed nodes", sub: "bootstrap", col: 4, row: 1 },
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
    steps: [
      {
        key: "problem",
        body: "A Bitcoin-derived chain needs more than a binary. Nodes have to be built the same way every time, peers have to find each other, and applications need access without talking to raw node RPC.",
        focus: ["node", "peers", "apps"],
      },
      {
        key: "architecture",
        body: "The forked Core codebase carries the network's chain parameters. It builds into one Docker image that runs both seed nodes and full nodes. Applications reach the chain through an API layer in front of node RPC.",
        focus: ["apps", "gateway", "rpc", "node", "peers", "fork", "image", "seeds"],
      },
      {
        key: "implementation",
        body: "Network parameters are set in the Core-derived source. Nodes are containerised with Docker so every deployment is identical. [[Seed nodes|seed node]] bootstrap peer discovery, and RPC stays private behind the API.",
        focus: ["fork", "image", "node", "seeds"],
      },
      {
        key: "result",
        body: "Node deployments that can be reproduced, and a clean boundary between the chain and the wallets and services built on it.",
        focus: ["apps", "gateway", "rpc", "node"],
      },
    ],
  },
  {
    id: "evm-wallets",
    index: "03",
    title: "EVM Wallet Infrastructure",
    domain: "Wallets",
    plain:
      "Wallets a product controls from code — create addresses, send funds, track every transfer — across four networks, without ever exposing the keys.",
    summary:
      "Wallet services for Ethereum, BSC, Base and Polygon: key derivation, isolated signing, [[nonce]] and [[gas]] management, broadcasting and receipt tracking behind one interface.",
    stack: ["Ethers.js", "Node.js", "TypeScript", "Ethereum", "BSC", "Base", "Polygon"],
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
    steps: [
      {
        key: "problem",
        body: "Products need to create addresses, move funds and know what happened, on several EVM chains, without leaking keys or losing track of [[nonces|nonce]] when transactions stall.",
        focus: ["api", "keys", "chains"],
      },
      {
        key: "architecture",
        body: "A wallet API accepts intents. A builder prices gas and assigns nonces per chain. Keys derive from [[HD seeds|hd wallet]] and signing happens in an isolated signer. A broadcaster submits and a tracker follows receipts to [[finality]].",
        focus: ["app", "api", "builder", "broadcast", "chains", "keys", "signer", "receipts"],
      },
      {
        key: "implementation",
        body: "Ethers.js providers per network with fallback RPC endpoints. Per-address nonce queues so concurrent sends never collide. Chain-specific gas strategies, and signing kept apart from request handling.",
        focus: ["builder", "keys", "signer", "broadcast"],
      },
      {
        key: "result",
        body: "One wallet interface across Ethereum, BSC, Base and Polygon, so adding a network is configuration rather than a new code path.",
        focus: ["app", "api", "chains", "receipts"],
      },
    ],
  },
  {
    id: "real-estate",
    index: "04",
    title: "Web3 Real Estate Marketplace",
    domain: "Marketplace",
    plain:
      "A property marketplace where who-owns-what is recorded on a blockchain anyone can check, while browsing stays as fast as any ordinary website.",
    summary:
      "A property marketplace where listing and transfer state is anchored in smart contracts, while search, media and metadata stay fast off-chain.",
    stack: ["Solidity", "Ethers.js", "Next.js", "React", "Firebase", "Tailwind CSS"],
    diagram: {
      caption: "Marketplace — on-chain path above, off-chain index below",
      cols: 5,
      rows: 2,
      nodes: [
        { id: "user", label: "Buyer / seller", sub: "browser", col: 0, row: 0 },
        { id: "app", label: "Next.js app", sub: "listings UI", col: 1, row: 0 },
        { id: "wallet", label: "Wallet", sub: "Ethers.js", col: 2, row: 0 },
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
    steps: [
      {
        key: "problem",
        body: "Listings and ownership records usually live in separate systems, so buyers can't check the state of what they're buying. Putting everything on-chain makes search and media slow and expensive.",
        focus: ["user", "contracts", "store"],
      },
      {
        key: "architecture",
        body: "Solidity contracts hold listing and transfer state. The Next.js app signs through the user's wallet. An indexer follows contract events into Firestore, and the API serves search and media from there.",
        focus: ["user", "app", "wallet", "contracts", "chain", "api", "store", "indexer"],
      },
      {
        key: "implementation",
        body: "Contracts emit an event for every state change. The indexer replays those events into Firestore documents, so the off-chain view can always be rebuilt from the chain.",
        focus: ["contracts", "chain", "indexer", "store"],
      },
      {
        key: "result",
        body: "Listings whose sale state can be checked on-chain, with browsing that feels like any other web app.",
        focus: ["user", "app", "api", "store", "wallet"],
      },
    ],
  },
  {
    id: "contracts",
    index: "05",
    title: "Smart Contract Systems",
    domain: "Contracts",
    plain:
      "Programs on the blockchain that enforce the rules of a deal, and the backend that keeps a product in step with them.",
    summary:
      "Solidity contracts for [[EVM]] networks, and the backend integrations that read their state, listen to their events and send transactions to them.",
    stack: ["Solidity", "Ethers.js", "Ethereum", "BSC", "Base", "Polygon"],
  },
  {
    id: "backends",
    index: "06",
    title: "Blockchain Backend Systems",
    domain: "Backends",
    plain:
      "The services behind the scenes that watch blockchains and tell a product — quickly and reliably — what just happened.",
    summary:
      "Services between chains and products: indexing events, tracking transactions through their lifecycle, and exposing it all through APIs and webhooks.",
    stack: ["Node.js", "TypeScript", "Express", "RPC", "Webhooks", "Docker"],
  },
];
