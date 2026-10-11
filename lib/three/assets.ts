// The avatar model is fetched as soon as the page hydrates — in parallel with the 3D code chunk —
// so the loader can show real byte progress. The scene parses the buffer once it arrives.

export const AVATAR_URL = "/models/avatar.glb";

let pending: Promise<ArrayBuffer> | null = null;

export function fetchAvatar(onProgress?: (fraction: number) => void): Promise<ArrayBuffer> {
  if (pending) return pending;
  pending = (async () => {
    const res = await fetch(AVATAR_URL);
    if (!res.ok) throw new Error(`avatar ${res.status}`);
    const total = Number(res.headers.get("content-length")) || 0;
    if (!res.body || !total) {
      const buf = await res.arrayBuffer();
      onProgress?.(1);
      return buf;
    }
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      // A compressed transfer can report a different length than the decoded body.
      onProgress?.(Math.min(0.99, received / total));
    }
    const out = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      out.set(chunk, offset);
      offset += chunk.length;
    }
    onProgress?.(1);
    return out.buffer;
  })();
  pending.catch(() => {
    pending = null;
  });
  return pending;
}
