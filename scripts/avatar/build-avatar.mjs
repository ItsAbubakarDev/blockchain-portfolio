// Bakes the avatar into public/models/avatar.glb.
//
//   npm run avatar
//
// Sculpted parts (skin, hair, hoodie) are signed-distance functions meshed with Surface Nets;
// hard-surface parts (eyes, glasses, headphones, drawstrings) are built with three.js geometry.
// The result is simplified and meshopt-compressed. Node names are the contract with
// components/3d/Avatar.tsx: "Head" (rotates to follow the pointer), "EyeL"/"EyeR" (blink),
// "Body" (breathes). Any replacement model that provides those names keeps the interactions.

import fs from "node:fs";
import path from "node:path";
import * as THREE from "three";
import { Document, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, KHRMaterialsClearcoat, KHRMaterialsSheen } from "@gltf-transform/extensions";
import { meshopt, simplify, weld } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";
import { HEAD_PIVOT, hair, hoodie, skin } from "./character.mjs";
import { surfaceNets, surfaceZ } from "./mesher.mjs";

const OUT = path.resolve(import.meta.dirname, "../../public/models/avatar.glb");

// ---------------------------------------------------------------- materials

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const hex = (h, a = 1) => {
  const n = parseInt(h.slice(1), 16);
  return [srgbToLinear(((n >> 16) & 255) / 255), srgbToLinear(((n >> 8) & 255) / 255), srgbToLinear((n & 255) / 255), a];
};

const doc = new Document();
const buffer = doc.createBuffer();
const clearcoatExt = doc.createExtension(KHRMaterialsClearcoat);
const sheenExt = doc.createExtension(KHRMaterialsSheen);

const mat = (name, color, { rough = 0.6, metal = 0, alpha, clearcoat, sheen, emissive } = {}) => {
  const m = doc.createMaterial(name).setBaseColorFactor(hex(color, alpha ?? 1)).setRoughnessFactor(rough).setMetallicFactor(metal);
  if (alpha !== undefined) m.setAlphaMode("BLEND");
  if (clearcoat) m.setExtension("KHR_materials_clearcoat", clearcoatExt.createClearcoat().setClearcoatFactor(clearcoat[0]).setClearcoatRoughnessFactor(clearcoat[1]));
  if (sheen) m.setExtension("KHR_materials_sheen", sheenExt.createSheen().setSheenColorFactor(hex(sheen[0]).slice(0, 3)).setSheenRoughnessFactor(sheen[1]));
  if (emissive) m.setEmissiveFactor(hex(emissive).slice(0, 3));
  return m;
};

const M = {
  skin: mat("Skin", "#e2dbce", { rough: 0.5, clearcoat: [0.3, 0.4] }),
  feature: mat("Feature", "#6d635a", { rough: 0.6 }),
  hair: mat("Hair", "#1c1b1a", { rough: 0.78, sheen: ["#5a554f", 0.45] }),
  eye: mat("Eye", "#0d0c0b", { rough: 0.12, clearcoat: [1, 0.05] }),
  hoodie: mat("Hoodie", "#34312e", { rough: 0.9, sheen: ["#8a847c", 0.5] }),
  frame: mat("Frame", "#141312", { rough: 0.3, metal: 0.5 }),
  lens: mat("Lens", "#ffffff", { rough: 0.04, alpha: 0.1 }),
  plastic: mat("Plastic", "#151413", { rough: 0.38 }),
  cushion: mat("Cushion", "#1e1d1c", { rough: 0.85, sheen: ["#4a4642", 0.6] }),
  accent: mat("Accent", "#ff5a1f", { rough: 0.4, emissive: "#ff5a1f" }),
  cord: mat("Cord", "#d9d3c7", { rough: 0.85 }),
  metal: mat("Metal", "#bdb6aa", { rough: 0.28, metal: 1 }),
};

// ----------------------------------------------------------------- helpers

function primitiveFrom({ positions, normals, indices }, material) {
  const prim = doc
    .createPrimitive()
    .setAttribute("POSITION", doc.createAccessor().setType("VEC3").setArray(positions).setBuffer(buffer))
    .setAttribute("NORMAL", doc.createAccessor().setType("VEC3").setArray(normals).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType("SCALAR").setArray(indices).setBuffer(buffer))
    .setMaterial(material);
  return prim;
}

function nodeFromArrays(name, arrays, material, offset = [0, 0, 0]) {
  const positions = Float32Array.from(arrays.positions);
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] -= offset[0];
    positions[i + 1] -= offset[1];
    positions[i + 2] -= offset[2];
  }
  const mesh = doc.createMesh(name).addPrimitive(primitiveFrom({ ...arrays, positions }, material));
  return doc.createNode(name).setMesh(mesh);
}

/** three.js BufferGeometry (already positioned in avatar space) → glTF node. */
function nodeFromGeometry(name, geometry, material, offset) {
  const g = geometry.index ? geometry : geometry;
  g.computeVertexNormals();
  const index = g.index ? Uint32Array.from(g.index.array) : Uint32Array.from({ length: g.attributes.position.count }, (_, i) => i);
  return nodeFromArrays(
    name,
    { positions: Float32Array.from(g.attributes.position.array), normals: Float32Array.from(g.attributes.normal.array), indices: index },
    material,
    offset,
  );
}

const merge = (geoms) => {
  // Small manual merge (avoids pulling BufferGeometryUtils' extra checks).
  let vCount = 0;
  let iCount = 0;
  for (const g of geoms) {
    vCount += g.attributes.position.count;
    iCount += g.index ? g.index.count : g.attributes.position.count;
  }
  const pos = new Float32Array(vCount * 3);
  const nor = new Float32Array(vCount * 3);
  const idx = new Uint32Array(iCount);
  let vo = 0;
  let io = 0;
  for (const g of geoms) {
    g.computeVertexNormals();
    pos.set(g.attributes.position.array, vo * 3);
    nor.set(g.attributes.normal.array, vo * 3);
    const src = g.index ? g.index.array : Array.from({ length: g.attributes.position.count }, (_, i) => i);
    for (let i = 0; i < src.length; i++) idx[io + i] = src[i] + vo;
    vo += g.attributes.position.count;
    io += src.length;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  return out;
};

function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

const tube = (points, radius, segments = 48, radial = 10) =>
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), segments, radius, radial, false);

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ------------------------------------------------------------- sculpted parts

const t0 = performance.now();
const H = 0.0105;
const skinMesh = surfaceNets(skin, { min: [-0.62, 0.58, -0.62], max: [0.62, 2.0, 0.75], h: H });
const hairMesh = surfaceNets(hair, { min: [-0.62, 1.05, -0.7], max: [0.62, 2.25, 0.7], h: H });
const hoodieMesh = surfaceNets(hoodie, { min: [-1.12, -1.06, -0.55], max: [1.12, 1.25, 0.5], h: 0.015 });
console.log(
  `meshed in ${((performance.now() - t0) / 1000).toFixed(1)}s — skin ${skinMesh.positions.length / 3}v, hair ${hairMesh.positions.length / 3}v, hoodie ${hoodieMesh.positions.length / 3}v`,
);

// --------------------------------------------------------------- face details

const faceZ = (x, y) => surfaceZ(skin, x, y);
const bodyZ = (x, y) => surfaceZ(hoodie, x, y);

const EYE = { x: 0.165, y: 1.55 };
const eyeZ = faceZ(EYE.x, EYE.y);
const eyeGeom = () => new THREE.SphereGeometry(1, 24, 16).scale(0.05, 0.064, 0.026);

const browGeom = (side) => {
  const pts = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    const x = side * (0.09 + t * 0.16);
    const y = 1.682 + Math.sin(t * Math.PI) * 0.016 - t * 0.012;
    pts.push([x, y, (faceZ(x, y) ?? 0.4) + 0.012]);
  }
  return tube(pts, 0.017, 24, 8);
};

const mouthGeom = (() => {
  const pts = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const x = -0.075 + t * 0.16;
    const y = 1.3 - Math.sin(t * Math.PI) * 0.022 + t * 0.012;
    pts.push([x, y, (faceZ(x, y) ?? 0.45) + 0.004]);
  }
  return tube(pts, 0.0095, 32, 8);
})();

// Glasses: two rounded-rectangle rims, a bridge, temples back to the ears.
const GLASS_Z = 0.592;
const rimShape = roundedRect(0.236, 0.162, 0.05);
rimShape.holes.push(roundedRect(0.204, 0.13, 0.038));
const rim = (side) =>
  new THREE.ExtrudeGeometry(rimShape, { depth: 0.016, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2, curveSegments: 10 })
    .translate(side * EYE.x, EYE.y + 0.01, GLASS_Z - 0.008);
const lens = (side) => new THREE.ShapeGeometry(roundedRect(0.206, 0.132, 0.038), 10).translate(side * EYE.x, EYE.y + 0.01, GLASS_Z);
const bridge = tube([[-0.042, 1.585, GLASS_Z], [0, 1.6, GLASS_Z + 0.012], [0.042, 1.585, GLASS_Z]], 0.009, 12, 8);
const temple = (side) =>
  tube([[side * 0.28, 1.59, GLASS_Z - 0.012], [side * 0.405, 1.598, 0.44], [side * 0.455, 1.585, 0.22], [side * 0.475, 1.56, 0.02]], 0.008, 32, 8);

// ---------------------------------------------------------------- body details

// Headphones resting around the neck.
const cupAxis = (side) => V(side * 0.78, 0.5, 0.38).normalize();
const cupCenter = (side) => V(side * 0.3, 0.99, 0.11);
const orient = (geom, axis, center) => {
  const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), axis);
  return geom.applyQuaternion(q).translate(center.x, center.y, center.z);
};
const cupProfile = [
  [0, -0.04], [0.105, -0.04], [0.122, -0.03], [0.128, -0.005], [0.124, 0.022], [0.108, 0.036], [0.07, 0.042], [0, 0.043],
].map(([r, y]) => new THREE.Vector2(r, y));
const cup = (side) => orient(new THREE.LatheGeometry(cupProfile, 48), cupAxis(side), cupCenter(side));
const cushion = (side) => {
  const axis = cupAxis(side);
  const c = cupCenter(side).clone().addScaledVector(axis, -0.055);
  return orient(new THREE.TorusGeometry(0.094, 0.03, 14, 48).rotateX(Math.PI / 2), axis, c);
};
const accentRing = (side) => {
  const axis = cupAxis(side);
  const c = cupCenter(side).clone().addScaledVector(axis, 0.044);
  return orient(new THREE.TorusGeometry(0.072, 0.0055, 8, 48).rotateX(Math.PI / 2), axis, c);
};
const band = tube(
  [
    [0.34, 1.04, 0.07], [0.37, 1.11, -0.1], [0.28, 1.18, -0.28], [0, 1.22, -0.37],
    [-0.28, 1.18, -0.28], [-0.37, 1.11, -0.1], [-0.34, 1.04, 0.07],
  ],
  0.024,
  64,
  12,
);

// Drawstrings following the chest.
const cordPoints = (side) => {
  const pts = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const x = side * (0.075 + t * 0.03 + Math.sin(t * 3) * 0.006);
    const y = 0.86 - t * 0.4;
    pts.push([x, y, (bodyZ(x, y) ?? 0.3) + 0.013]);
  }
  return pts;
};
const cord = (side) => tube(cordPoints(side), 0.0105, 40, 8);
const aglet = (side) => {
  const pts = cordPoints(side);
  const end = V(...pts[pts.length - 1]);
  const prev = V(...pts[pts.length - 2]);
  const dir = end.clone().sub(prev).normalize();
  return orient(new THREE.CylinderGeometry(0.0135, 0.0125, 0.05, 12), dir, end.clone().addScaledVector(dir, 0.02));
};

// ------------------------------------------------------------------- assemble

const pivot = HEAD_PIVOT;
const root = doc.createNode("Avatar");
const body = doc.createNode("Body");
const head = doc.createNode("Head").setTranslation(pivot);
root.addChild(body).addChild(head);

head.addChild(nodeFromArrays("Skin", skinMesh, M.skin, pivot));
head.addChild(nodeFromArrays("Hair", hairMesh, M.hair, pivot));
head.addChild(nodeFromGeometry("Brows", merge([browGeom(1), browGeom(-1)]), M.hair, pivot));
head.addChild(nodeFromGeometry("Mouth", mouthGeom, M.feature, pivot));
for (const [name, side] of [["EyeL", -1], ["EyeR", 1]]) {
  const eye = doc.createNode(name).setTranslation([side * EYE.x - pivot[0], EYE.y - pivot[1], eyeZ - 0.006 - pivot[2]]);
  eye.addChild(nodeFromGeometry(`${name}Mesh`, eyeGeom(), M.eye));
  head.addChild(eye);
}
const glasses = doc.createNode("Glasses");
glasses.addChild(nodeFromGeometry("Frame", merge([rim(1), rim(-1), bridge, temple(1), temple(-1)]), M.frame, pivot));
glasses.addChild(nodeFromGeometry("Lenses", merge([lens(1), lens(-1)]), M.lens, pivot));
head.addChild(glasses);

body.addChild(nodeFromArrays("Hoodie", hoodieMesh, M.hoodie));
body.addChild(nodeFromGeometry("Cords", merge([cord(1), cord(-1)]), M.cord));
body.addChild(nodeFromGeometry("Aglets", merge([aglet(1), aglet(-1)]), M.metal));
const phones = doc.createNode("Headphones");
phones.addChild(nodeFromGeometry("Cups", merge([cup(1), cup(-1), band]), M.plastic));
phones.addChild(nodeFromGeometry("Cushions", merge([cushion(1), cushion(-1)]), M.cushion));
phones.addChild(nodeFromGeometry("AccentRings", merge([accentRing(1), accentRing(-1)]), M.accent));
body.addChild(phones);

doc.createScene("Avatar").addChild(root);

// ------------------------------------------------------------------ optimise

await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
await doc.transform(
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.1, error: 0.0032 }),
  meshopt({ encoder: MeshoptEncoder, level: "medium" }),
);

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder });
fs.mkdirSync(path.dirname(OUT), { recursive: true });
await io.write(OUT, doc);

let tris = 0;
const perMesh = [];
for (const mesh of doc.getRoot().listMeshes()) {
  let t = 0;
  for (const p of mesh.listPrimitives()) t += (p.getIndices()?.getCount() ?? 0) / 3;
  perMesh.push(`${mesh.getName()} ${t}`);
  tris += t;
}
if (process.env.VERBOSE) console.log(perMesh.join(" · "));
console.log(`wrote ${path.relative(process.cwd(), OUT)} — ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB, ${Math.round(tris)} triangles`);
