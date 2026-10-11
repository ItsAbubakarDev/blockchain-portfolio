// The avatar's sculpted parts as signed-distance functions.
// Units are arbitrary (head ≈ 1.1 tall). Y is up, the figure faces +Z.
// Stylised "vinyl figure" proportions: large head, short neck, soft square shoulders.

import {
  capsule,
  cylinderY,
  ellipsoid,
  noise3,
  smax,
  smin,
  smoothstep,
  taperedCapsule,
  torusTiltedX,
} from "./sdf.mjs";

/** Neck pivot: the head group rotates around this point. */
export const HEAD_PIVOT = [0, 1.02, -0.02];

const cranium = (x, y, z) => ellipsoid(x, y, z, 0, 1.56, 0, 0.48, 0.55, 0.51);

/** Clay skin: cranium, jaw, chin, nose, ears and neck blended into one surface. */
export function skin(x, y, z) {
  const ax = Math.abs(x);
  let d = cranium(x, y, z);
  d = smin(d, ellipsoid(x, y, z, 0, 1.37, 0.07, 0.4, 0.33, 0.4), 0.14);
  d = smin(d, ellipsoid(x, y, z, 0, 1.19, 0.17, 0.16, 0.11, 0.16), 0.1);
  // Cheekbones.
  d = smin(d, ellipsoid(ax, y, z, 0.2, 1.43, 0.3, 0.15, 0.1, 0.14), 0.08);
  // Nose.
  d = smin(d, ellipsoid(x, y, z, 0, 1.45, 0.5, 0.058, 0.095, 0.075), 0.05);
  d = smin(d, ellipsoid(x, y, z, 0, 1.4, 0.52, 0.075, 0.045, 0.05), 0.03);
  // Brow ridge, then shallow eye sockets.
  d = smin(d, ellipsoid(ax, y, z, 0.17, 1.66, 0.42, 0.13, 0.04, 0.06), 0.05);
  d = smax(d, -ellipsoid(ax, y, z, 0.165, 1.55, 0.53, 0.085, 0.07, 0.06), 0.035);
  // Ears.
  d = smin(d, ellipsoid(ax, y, z, 0.475, 1.47, -0.01, 0.06, 0.12, 0.09), 0.04);
  d = smax(d, -ellipsoid(ax, y, z, 0.53, 1.47, 0.0, 0.03, 0.075, 0.05), 0.015);
  // Neck.
  d = smin(d, cylinderY(x, y, z, 0, -0.03, 0.188, 0.62, 1.3), 0.1);
  return d;
}

// Hairline height as a function of the angle around the head (0 = front, π = back).
// [angle, height] keys, interpolated smoothly.
const HAIRLINE = [
  [0.0, 1.8],
  [0.42, 1.77],
  [0.78, 1.7], // temple
  [1.12, 1.5], // sideburn
  [1.32, 1.5],
  [1.5, 1.625], // above the ear
  [1.78, 1.6],
  [2.02, 1.45], // behind the ear
  [2.6, 1.3],
  [Math.PI, 1.26], // nape
];
function hairlineY(theta) {
  const t = Math.abs(theta);
  for (let i = 1; i < HAIRLINE.length; i++) {
    const [a0, y0] = HAIRLINE[i - 1];
    const [a1, y1] = HAIRLINE[i];
    if (t <= a1) {
      const u = (t - a0) / (a1 - a0);
      return y0 + (y1 - y0) * (u * u * (3 - 2 * u));
    }
  }
  return HAIRLINE[HAIRLINE.length - 1][1];
}

// Fringe tufts: [root, tip, rootRadius, tipRadius], swept toward +x (the viewer's right).
const TUFTS = [
  [[-0.31, 1.85, 0.19], [-0.2, 1.775, 0.405], 0.075, 0.018],
  [[-0.17, 1.92, 0.23], [-0.035, 1.755, 0.465], 0.085, 0.02],
  [[0.0, 1.95, 0.24], [0.13, 1.765, 0.462], 0.09, 0.02],
  [[0.15, 1.93, 0.21], [0.275, 1.76, 0.415], 0.085, 0.02],
  [[0.28, 1.88, 0.14], [0.375, 1.735, 0.32], 0.075, 0.018],
];

/** Short textured cut: close at the sides, volume on top, a tufted fringe swept to one side. */
export function hair(x, y, z) {
  // Thickness grows from the sides to the crown (a soft fade).
  const top = smoothstep(1.55, 1.95, y);
  let d = cranium(x, y, z) - (0.016 + 0.05 * top);
  // Crown volume and a soft quiff at the front.
  d = smin(d, ellipsoid(x, y, z, 0.04, 1.99, 0.06, 0.34, 0.15, 0.32), 0.14);
  d = smin(d, ellipsoid(x, y, z, -0.08, 2.02, -0.14, 0.28, 0.12, 0.26), 0.12);
  d = smin(d, ellipsoid(x, y, z, 0.06, 2.03, 0.2, 0.28, 0.12, 0.2), 0.1);
  // Hairline.
  const theta = Math.atan2(x, z);
  d = smax(d, hairlineY(theta) - y, 0.03);
  // Fringe laid over the forehead after the cut, so its edge is the tufts' tips.
  let f = Infinity;
  for (const [a, b, ra, rb] of TUFTS) {
    f = smin(f, taperedCapsule(x, y, z, a[0], a[1], a[2], b[0], b[1], b[2], ra, rb), 0.035);
  }
  d = smin(d, f, 0.045);
  // Texture: lumpy tufts plus fine grooves running front to back.
  const tuft = noise3(x * 9 + 3.1, y * 9, z * 9 - 1.7);
  d += 0.011 * tuft * (0.35 + 0.65 * top);
  d += 0.003 * Math.sin(42 * x + 7 * Math.sin(5 * z) + 3 * y);
  return d;
}

/** Hoodie: torso with chest form, square shoulders, upper arms, a rolled collar and the hood behind. */
export function hoodie(x, y, z) {
  const ax = Math.abs(x);
  let d = ellipsoid(x, y, z, 0, 0.36, -0.02, 0.6, 0.6, 0.34);
  // Lower torso: a tall smooth form that continues straight down instead of rounding off into a
  // belly. It sits inside the chest where they meet, so the blend leaves no seam.
  d = smin(d, ellipsoid(x, y, z, 0, -0.32, -0.03, 0.56, 1.1, 0.31), 0.16);
  // Chest planes.
  d = smin(d, ellipsoid(ax, y, z, 0.21, 0.55, 0.12, 0.25, 0.2, 0.17), 0.14);
  // Shoulders: a near-horizontal line, slightly forward.
  d = smin(d, capsule(ax, y, z, 0, 0.78, -0.05, 0.6, 0.74, -0.04, 0.2), 0.2);
  // Deltoids and upper arms.
  d = smin(d, ellipsoid(ax, y, z, 0.7, 0.66, -0.03, 0.21, 0.23, 0.22), 0.1);
  // Arms hang close to the body and continue below any framing.
  d = smin(d, taperedCapsule(ax, y, z, 0.72, 0.6, -0.03, 0.8, -0.95, 0.03, 0.2, 0.16), 0.1);
  // Rolled collar, lower at the front.
  d = smin(d, torusTiltedX(x, y, z, 0, 0.9, -0.06, 0.26, 0.085, -0.24), 0.05);
  // Hood bunched behind the neck, rising above the collar.
  d = smin(d, ellipsoid(x, y, z, 0, 1.03, -0.25, 0.32, 0.2, 0.14), 0.1);
  d = smin(d, ellipsoid(ax, y, z, 0.22, 0.99, -0.16, 0.12, 0.15, 0.12), 0.08);
  // Neck opening.
  d = smax(d, -cylinderY(x, y, z, 0, -0.03, 0.2, 0.62, 1.5), 0.03);
  // Bottom of the bust (well out of frame).
  d = smax(d, -(y + 1.0), 0.02);
  // Fabric: soft folds where the sleeve meets the shoulder, and a general undulation.
  const sleeve = smoothstep(0.45, 0.75, ax);
  d += 0.007 * Math.sin(16 * (y + 0.5 * ax)) * sleeve * smoothstep(0.75, 0.3, y);
  d += 0.004 * noise3(x * 4, y * 4, z * 4);
  return d;
}
