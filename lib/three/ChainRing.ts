import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { easeInOutCubic, easeOutCubic } from "@/lib/utils/math";

const SIGNAL = new THREE.Color("#ff5a1f");
const BONE = new THREE.Color("#ece7dc");
const DARK = new THREE.Color("#1b1a18");
const BLOCK = 0.12;
const SLOTS = 15;

// 12 edges of a cube, as corner index pairs (corners are ±x ±y ±z bits).
const EDGE_PAIRS = [0, 1, 2, 3, 4, 5, 6, 7, 0, 2, 1, 3, 4, 6, 5, 7, 0, 4, 1, 5, 2, 6, 3, 7];

type Block = { slot: number; from: number; age: number; alive: boolean; dying: number };

/**
 * A chain of blocks orbiting the avatar on a tilted ellipse.
 * Every few seconds a block is appended at the head (front-right) — it flashes the signal
 * colour — the chain shifts one slot back and the oldest block falls off the tail.
 * One instanced mesh for the blocks, one line buffer for edges, one for the links.
 */
export class ChainRing {
  readonly group = new THREE.Group();
  private blocks: Block[] = [];
  private mesh: THREE.InstancedMesh;
  private edges: THREE.LineSegments;
  private links: THREE.LineSegments;
  private edgePos: Float32Array;
  private edgeCol: Float32Array;
  private linkPos: Float32Array;
  private headFlash = 0;
  private pruneDead = false;
  /** Lights the figure from the newest block while it flashes. */
  readonly light = new THREE.PointLight(SIGNAL, 0, 2.2, 1.6);
  private shift = 1; // 0 → 1 while blocks move one slot back
  private timer = 0;
  /** Blocks in the chain when the page opens — the starting height. */
  readonly initialLength: number;
  private time = 0;
  private readonly capacity: number;
  private readonly interval: number;

  private m = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private s = new THREE.Vector3();
  private p = new THREE.Vector3();
  private e = new THREE.Euler();
  private c = new THREE.Color();
  private corners = Array.from({ length: 8 }, () => new THREE.Vector3());
  private centers: THREE.Vector3[];
  private sizes: number[];

  private onAppend: ((x: number) => void) | null = null;
  private spread = 1;

  constructor(capacity = 12, interval = 6) {
    this.capacity = capacity;
    this.interval = interval;
    this.centers = Array.from({ length: capacity + 1 }, () => new THREE.Vector3());
    this.sizes = new Array(capacity + 1).fill(0);

    const geom = new RoundedBoxGeometry(BLOCK, BLOCK, BLOCK, 2, 0.018);
    const mat = new THREE.MeshStandardMaterial({ color: "#ffffff", metalness: 0.55, roughness: 0.32, envMapIntensity: 1.4 });
    this.mesh = new THREE.InstancedMesh(geom, mat, capacity + 1);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.setColorAt(0, DARK);
    this.mesh.frustumCulled = false;

    this.edgePos = new Float32Array((capacity + 1) * 24 * 3);
    this.edgeCol = new Float32Array((capacity + 1) * 24 * 3);
    const edgeGeom = new THREE.BufferGeometry();
    edgeGeom.setAttribute("position", new THREE.BufferAttribute(this.edgePos, 3).setUsage(THREE.DynamicDrawUsage));
    edgeGeom.setAttribute("color", new THREE.BufferAttribute(this.edgeCol, 3).setUsage(THREE.DynamicDrawUsage));
    this.edges = new THREE.LineSegments(
      edgeGeom,
      new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false }),
    );
    this.edges.frustumCulled = false;

    this.linkPos = new Float32Array(capacity * 2 * 3);
    const linkGeom = new THREE.BufferGeometry();
    linkGeom.setAttribute("position", new THREE.BufferAttribute(this.linkPos, 3).setUsage(THREE.DynamicDrawUsage));
    this.links = new THREE.LineSegments(
      linkGeom,
      new THREE.LineBasicMaterial({ color: BONE, transparent: true, opacity: 0.22, depthWrite: false }),
    );
    this.links.frustumCulled = false;

    this.group.add(this.mesh, this.edges, this.links, this.light);
    // The ring circles the chest, tilted toward the camera.
    this.group.position.set(0, 0.92, 0);
    this.group.rotation.set(0.24, 0, 0.07);

    // Start with a chain that is not yet full, so the first appends read as growth.
    this.initialLength = capacity - 3;
    for (let i = 0; i < this.initialLength; i++) this.blocks.push({ slot: i, from: i, age: 99, alive: true, dying: 0 });
    // First append comes soon after the lights are up, then a steady rhythm.
    this.timer = interval - 2.2;
  }

  /** Position on the ellipse for a (fractional) slot. Slot 0 is the head, front-right. */
  private slotPosition(slot: number, out: THREE.Vector3) {
    const theta = 0.62 - (slot / SLOTS) * Math.PI * 2;
    out.set(Math.cos(theta) * 1.3 * this.spread, Math.sin(this.time * 0.6 + slot * 0.9) * 0.025, Math.sin(theta) * 0.98 * this.spread);
    return out;
  }

  /** Called with the head block's horizontal position (-1..1) whenever a block is appended. */
  setOnAppend(fn: ((x: number) => void) | null) {
    this.onAppend = fn;
  }

  /** `scale` grows the ring in during the intro; `open` widens it on scroll; `tight` pulls it in beside copy. */
  setPose(scale: number, open: number, tight = 0) {
    this.group.scale.setScalar(scale);
    this.spread = 1 + open * 0.3 - tight * 0.24;
    this.group.rotation.x = 0.24 + open * 0.22 + tight * 0.1;
  }

  append() {
    for (const b of this.blocks) {
      b.from = b.slot;
      b.slot += 1;
    }
    this.blocks.unshift({ slot: 0, from: -0.6, age: 0, alive: true, dying: 0 });
    let alive = 0;
    for (const b of this.blocks) {
      if (!b.alive) continue;
      alive++;
      if (alive > this.capacity) b.alive = false;
    }
    this.shift = 0;
    this.headFlash = 1;
    const head = this.slotPosition(0, this.p);
    this.onAppend?.(head.x / 1.3);
  }

  update(dt: number, animate: boolean) {
    if (animate) {
      this.time += dt;
      this.timer += dt;
      if (this.timer >= this.interval) {
        this.timer = 0;
        this.append();
      }
      this.shift = Math.min(1, this.shift + dt / 1.2);
      this.headFlash = Math.max(0, this.headFlash - dt / 2.4);
      for (const b of this.blocks) {
        b.age += dt;
        if (!b.alive) {
          b.dying = Math.min(1, b.dying + dt / 0.9);
          if (b.dying >= 1) this.pruneDead = true;
        }
      }
      if (this.pruneDead) {
        // Rare (once per append), so the allocation here is fine.
        this.blocks = this.blocks.filter((b) => b.alive || b.dying < 1);
        this.pruneDead = false;
      }
    }

    const k = easeInOutCubic(this.shift);
    let n = 0;
    for (let i = 0; i < this.blocks.length && n <= this.capacity; i++) {
      const b = this.blocks[i];
      const slot = b.from + (b.slot - b.from) * k;
      this.slotPosition(slot, this.p);
      const grow = b.age < 1 ? easeOutCubic(Math.min(1, b.age / 0.8)) : 1;
      const scale = grow * (1 - b.dying * 0.7);
      this.e.set(this.time * 0.25 + i * 0.7, this.time * 0.35 + i, 0);
      this.q.setFromEuler(this.e);
      this.s.setScalar(Math.max(scale, 0.0001));
      this.m.compose(this.p, this.q, this.s);
      this.mesh.setMatrixAt(n, this.m);

      // The newest block burns signal orange, then cools back to graphite.
      const flash = i === 0 ? this.headFlash : 0;
      this.c.copy(DARK).lerp(SIGNAL, Math.min(1, flash * 1.2));
      this.mesh.setColorAt(n, this.c);
      this.writeEdges(n, scale, 1 - b.dying);
      if (i === 0) {
        this.light.position.copy(this.p);
        this.light.intensity = flash * flash * 3.2;
      }
      this.centers[n].copy(this.p);
      this.sizes[n] = scale;
      n++;
    }
    this.mesh.count = n;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;

    // Links between consecutive blocks, trimmed to the block faces.
    let l = 0;
    for (let i = 0; i < n - 1; i++) {
      const a = this.centers[i];
      const b = this.centers[i + 1];
      const d = a.distanceTo(b) || 1;
      const ta = ((BLOCK / 2) * this.sizes[i] * 1.2) / d;
      const tb = ((BLOCK / 2) * this.sizes[i + 1] * 1.2) / d;
      this.linkPos[l++] = a.x + (b.x - a.x) * ta;
      this.linkPos[l++] = a.y + (b.y - a.y) * ta;
      this.linkPos[l++] = a.z + (b.z - a.z) * ta;
      this.linkPos[l++] = b.x + (a.x - b.x) * tb;
      this.linkPos[l++] = b.y + (a.y - b.y) * tb;
      this.linkPos[l++] = b.z + (a.z - b.z) * tb;
    }
    const linkGeom = this.links.geometry;
    linkGeom.setDrawRange(0, l / 3);
    linkGeom.attributes.position.needsUpdate = true;

    this.edges.geometry.setDrawRange(0, n * 24);
    this.edges.geometry.attributes.position.needsUpdate = true;
    this.edges.geometry.attributes.color.needsUpdate = true;
  }

  private writeEdges(n: number, scale: number, fade: number) {
    const h = (BLOCK / 2) * scale * 1.002;
    for (let c = 0; c < 8; c++) {
      this.corners[c].set(c & 1 ? h : -h, c & 2 ? h : -h, c & 4 ? h : -h).applyQuaternion(this.q).add(this.p);
    }
    const flash = n === 0 ? this.headFlash : 0;
    this.c.copy(BONE).lerp(SIGNAL, Math.min(1, flash * 1.6)).multiplyScalar(fade * (0.75 + flash));
    let o = n * 24 * 3;
    for (let i = 0; i < 24; i++) {
      const v = this.corners[EDGE_PAIRS[i]];
      this.edgePos[o] = v.x;
      this.edgePos[o + 1] = v.y;
      this.edgePos[o + 2] = v.z;
      this.edgeCol[o] = this.c.r;
      this.edgeCol[o + 1] = this.c.g;
      this.edgeCol[o + 2] = this.c.b;
      o += 3;
    }
  }

  dispose() {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
    this.edges.geometry.dispose();
    (this.edges.material as THREE.Material).dispose();
    this.links.geometry.dispose();
    (this.links.material as THREE.Material).dispose();
  }
}
