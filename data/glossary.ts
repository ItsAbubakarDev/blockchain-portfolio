// Plain-language definitions shown when a reader taps or hovers an annotated term in the technical
// copy. Mark a term in any string rendered through <Annotated> as [[shown text]] (looked up by its
// lowercase form) or [[shown text|key]].

export type GlossaryEntry = { term: string; definition: string };

export const glossary: Record<string, GlossaryEntry> = {
  reorg: {
    term: "Reorg",
    definition:
      "The blockchain briefly disagrees with itself and replaces its most recent blocks. A payment that looked confirmed can vanish, so you wait a few blocks before trusting it.",
  },
  idempotent: {
    term: "Idempotent",
    definition:
      "Doing something twice has the same effect as doing it once. If a payment notice arrives twice, the customer is still credited once.",
  },
  nonce: {
    term: "Nonce",
    definition:
      "A running counter on every transaction an account sends. They must go out in order, so one stuck number blocks everything queued behind it.",
  },
  evm: {
    term: "EVM",
    definition:
      "Ethereum Virtual Machine — the engine shared by Ethereum and compatible networks like BSC, Base and Polygon. One integration can serve all of them.",
  },
  rpc: {
    term: "RPC",
    definition: "The interface a program calls to read from, or send transactions to, a blockchain node.",
  },
  webhook: {
    term: "Webhook",
    definition: "A message one system sends another the moment something happens — here, “this payment just settled”.",
  },
  utxo: {
    term: "UTXO",
    definition:
      "Bitcoin doesn’t keep account balances. It tracks unspent pieces of earlier payments, like individual coins in a wallet, and every payment spends some of them.",
  },
  confirmations: {
    term: "Confirmations",
    definition:
      "How many blocks have been added on top of the one holding a transaction. The more there are, the less likely it is to be undone.",
  },
  finality: {
    term: "Finality",
    definition: "The point after which a transaction can no longer realistically be reversed.",
  },
  "trc-20": {
    term: "TRC-20",
    definition: "The token standard on TRON. Most USDT payments on TRON are TRC-20 transfers.",
  },
  "hd wallet": {
    term: "HD wallet",
    definition:
      "One master secret that can derive any number of addresses, so every customer gets their own deposit address without storing a separate key for each.",
  },
  gas: {
    term: "Gas",
    definition: "The fee paid to an EVM network to process a transaction. It rises and falls with demand.",
  },
  "seed node": {
    term: "Seed node",
    definition: "A well-known node that new nodes contact first to discover the rest of the network.",
  },
};

/** Resolve the key used in [[shown|key]] or [[shown]] (lowercased, with plural "s" tolerated). */
export function lookup(key: string): GlossaryEntry | undefined {
  const k = key.toLowerCase();
  return glossary[k] ?? glossary[k.replace(/s$/, "")];
}
