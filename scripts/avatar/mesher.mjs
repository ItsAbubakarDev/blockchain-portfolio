// Naive Surface Nets: turns a signed-distance function into an indexed triangle mesh
// with normals taken from the field gradient. Quads are oriented against the gradient,
// so winding is always outward regardless of edge direction.

const CORNERS = [
  [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
  [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1],
];
const EDGES = [
  [0, 1], [2, 3], [4, 5], [6, 7],
  [0, 2], [1, 3], [4, 6], [5, 7],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

/**
 * @param {(x:number,y:number,z:number)=>number} f  signed distance (negative inside)
 * @param {{min:number[], max:number[], h:number, project?:number}} opts
 */
export function surfaceNets(f, { min, max, h, project = 2 }) {
  const nx = Math.ceil((max[0] - min[0]) / h) + 1;
  const ny = Math.ceil((max[1] - min[1]) / h) + 1;
  const nz = Math.ceil((max[2] - min[2]) / h) + 1;
  const idx = (i, j, k) => i + nx * (j + ny * k);

  // 1. Sample the field on the grid.
  const field = new Float32Array(nx * ny * nz);
  for (let k = 0; k < nz; k++) {
    const z = min[2] + k * h;
    for (let j = 0; j < ny; j++) {
      const y = min[1] + j * h;
      for (let i = 0; i < nx; i++) field[idx(i, j, k)] = f(min[0] + i * h, y, z);
    }
  }

  const grad = (x, y, z) => {
    const e = h * 0.25;
    return [
      f(x + e, y, z) - f(x - e, y, z),
      f(x, y + e, z) - f(x, y - e, z),
      f(x, y, z + e) - f(x, y, z - e),
    ];
  };

  // 2. One vertex per cell that straddles the surface (mean of edge crossings).
  const cellVert = new Int32Array((nx - 1) * (ny - 1) * (nz - 1)).fill(-1);
  const cidx = (i, j, k) => i + (nx - 1) * (j + (ny - 1) * k);
  const positions = [];
  const normals = [];
  const v = new Float32Array(8);

  for (let k = 0; k < nz - 1; k++) {
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        let mask = 0;
        for (let c = 0; c < 8; c++) {
          const [a, b, d] = CORNERS[c];
          v[c] = field[idx(i + a, j + b, k + d)];
          if (v[c] < 0) mask |= 1 << c;
        }
        if (mask === 0 || mask === 255) continue;

        let sx = 0, sy = 0, sz = 0, n = 0;
        for (const [c0, c1] of EDGES) {
          const a = v[c0], b = v[c1];
          if ((a < 0) === (b < 0)) continue;
          const t = a / (a - b);
          const p0 = CORNERS[c0], p1 = CORNERS[c1];
          sx += p0[0] + (p1[0] - p0[0]) * t;
          sy += p0[1] + (p1[1] - p0[1]) * t;
          sz += p0[2] + (p1[2] - p0[2]) * t;
          n++;
        }
        let x = min[0] + (i + sx / n) * h;
        let y = min[1] + (j + sy / n) * h;
        let z = min[2] + (k + sz / n) * h;

        // Pull the vertex onto the true surface (Newton steps along the gradient).
        for (let it = 0; it < project; it++) {
          const d = f(x, y, z);
          const g = grad(x, y, z);
          const gl = g[0] * g[0] + g[1] * g[1] + g[2] * g[2];
          if (gl < 1e-12) break;
          const s = (d / gl) * (h * 0.5);
          x -= g[0] * s;
          y -= g[1] * s;
          z -= g[2] * s;
        }
        const g = grad(x, y, z);
        const gl = Math.hypot(g[0], g[1], g[2]) || 1;
        cellVert[cidx(i, j, k)] = positions.length / 3;
        positions.push(x, y, z);
        normals.push(g[0] / gl, g[1] / gl, g[2] / gl);
      }
    }
  }

  // 3. One quad per grid edge with a sign change, joining the four cells around it.
  const indices = [];
  const quad = (a, b, c, d) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
    // Orient using the average normal at the quad's vertices.
    const P = (q) => [positions[q * 3], positions[q * 3 + 1], positions[q * 3 + 2]];
    const pa = P(a), pb = P(b), pc = P(c);
    const e1 = [pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]];
    const e2 = [pc[0] - pa[0], pc[1] - pa[1], pc[2] - pa[2]];
    const fn = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    let dot = 0;
    for (const q of [a, b, c, d]) dot += fn[0] * normals[q * 3] + fn[1] * normals[q * 3 + 1] + fn[2] * normals[q * 3 + 2];
    if (dot < 0) [b, d] = [d, b];
    // Split along the shorter diagonal.
    const pd = P(d);
    const pbb = P(b);
    const d1 = (pa[0] - pc[0]) ** 2 + (pa[1] - pc[1]) ** 2 + (pa[2] - pc[2]) ** 2;
    const d2 = (pbb[0] - pd[0]) ** 2 + (pbb[1] - pd[1]) ** 2 + (pbb[2] - pd[2]) ** 2;
    if (d1 <= d2) indices.push(a, b, c, a, c, d);
    else indices.push(a, b, d, b, c, d);
  };

  for (let k = 1; k < nz - 1; k++) {
    for (let j = 1; j < ny - 1; j++) {
      for (let i = 1; i < nx - 1; i++) {
        const inside = field[idx(i, j, k)] < 0;
        // Edge along +x
        if (i < nx - 1 && inside !== field[idx(i + 1, j, k)] < 0) {
          quad(cellVert[cidx(i, j - 1, k - 1)], cellVert[cidx(i, j, k - 1)], cellVert[cidx(i, j, k)], cellVert[cidx(i, j - 1, k)]);
        }
        // Edge along +y
        if (j < ny - 1 && inside !== field[idx(i, j + 1, k)] < 0) {
          quad(cellVert[cidx(i - 1, j, k - 1)], cellVert[cidx(i, j, k - 1)], cellVert[cidx(i, j, k)], cellVert[cidx(i - 1, j, k)]);
        }
        // Edge along +z
        if (k < nz - 1 && inside !== field[idx(i, j, k + 1)] < 0) {
          quad(cellVert[cidx(i - 1, j - 1, k)], cellVert[cidx(i, j - 1, k)], cellVert[cidx(i, j, k)], cellVert[cidx(i - 1, j, k)]);
        }
      }
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint32Array(indices),
  };
}

/** March along +z from behind the face to find where a ray at (x, y) meets the surface. */
export function surfaceZ(f, x, y, zFrom = -1, zTo = 1.5, step = 0.002) {
  let prev = f(x, y, zTo);
  for (let z = zTo - step; z > zFrom; z -= step) {
    const d = f(x, y, z);
    if (prev > 0 && d <= 0) return z + step * (d / (d - prev));
    prev = d;
  }
  return null;
}
