// Signed-distance primitives and operators used to sculpt the avatar.
// Points are plain [x, y, z] arrays; every function is pure.

export const len3 = (x, y, z) => Math.sqrt(x * x + y * y + z * z);
export const len2 = (x, y) => Math.sqrt(x * x + y * y);
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** Polynomial smooth minimum — blends two shapes over a radius of `k`. */
export function smin(a, b, k) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}
export const smax = (a, b, k) => -smin(-a, -b, k);

/** Approximate ellipsoid distance (Quilez). Good enough near the surface. */
export function ellipsoid(px, py, pz, cx, cy, cz, rx, ry, rz) {
  const x = px - cx, y = py - cy, z = pz - cz;
  const k0 = len3(x / rx, y / ry, z / rz);
  const k1 = len3(x / (rx * rx), y / (ry * ry), z / (rz * rz));
  return k1 === 0 ? -Math.min(rx, ry, rz) : (k0 * (k0 - 1)) / k1;
}

export function capsule(px, py, pz, ax, ay, az, bx, by, bz, r) {
  const pax = px - ax, pay = py - ay, paz = pz - az;
  const bax = bx - ax, bay = by - ay, baz = bz - az;
  const h = clamp((pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz), 0, 1);
  return len3(pax - bax * h, pay - bay * h, paz - baz * h) - r;
}

/** Capsule whose radius tapers from ra (at a) to rb (at b). */
export function taperedCapsule(px, py, pz, ax, ay, az, bx, by, bz, ra, rb) {
  const pax = px - ax, pay = py - ay, paz = pz - az;
  const bax = bx - ax, bay = by - ay, baz = bz - az;
  const h = clamp((pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz), 0, 1);
  return len3(pax - bax * h, pay - bay * h, paz - baz * h) - (ra + (rb - ra) * h);
}

/** Vertical capped cylinder centred on (cx, cz), spanning y0..y1. */
export function cylinderY(px, py, pz, cx, cz, r, y0, y1) {
  const dx = len2(px - cx, pz - cz) - r;
  const hy = (y1 - y0) / 2;
  const dy = Math.abs(py - (y0 + hy)) - hy;
  return Math.min(Math.max(dx, dy), 0) + len2(Math.max(dx, 0), Math.max(dy, 0));
}

/** Torus in the XZ plane after rotating the point by `rx` radians around X. */
export function torusTiltedX(px, py, pz, cx, cy, cz, R, r, rx) {
  const x = px - cx;
  let y = py - cy;
  let z = pz - cz;
  const c = Math.cos(rx), s = Math.sin(rx);
  const ty = c * y - s * z;
  const tz = s * y + c * z;
  y = ty;
  z = tz;
  return len2(len2(x, z) - R, y) - r;
}

/** Signed distance to the plane through `p0` with unit normal `n` (positive on the normal side). */
export const plane = (px, py, pz, p0, n) => (px - p0[0]) * n[0] + (py - p0[1]) * n[1] + (pz - p0[2]) * n[2];

export function normalize3(v) {
  const l = len3(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

// Smooth 3D value noise in [-1, 1] — deterministic, used for hair tufts and fabric.
const hash3 = (x, y, z) => {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
const fade = (t) => t * t * (3 - 2 * t);
export function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi);
  const l = (a, b, t) => a + (b - a) * t;
  const c = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz);
  const v = l(
    l(l(c(0, 0, 0), c(1, 0, 0), xf), l(c(0, 1, 0), c(1, 1, 0), xf), yf),
    l(l(c(0, 0, 1), c(1, 0, 1), xf), l(c(0, 1, 1), c(1, 1, 1), xf), yf),
    zf,
  );
  return v * 2 - 1;
}

export const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
