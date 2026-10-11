import * as THREE from "three";

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uPointer;
  uniform float uIntro;
  attribute float aSeed;
  attribute float aSize;
  attribute float aWarm;
  varying float vAlpha;
  varying float vWarm;

  void main() {
    vec3 p = position;
    // Slow upward drift, wrapped inside the volume; a gentle sideways sway.
    p.y = mod(p.y + uTime * (0.035 + aSeed * 0.05) + 1.2, 5.0) - 1.2;
    p.x += sin(uTime * 0.21 + aSeed * 31.0) * 0.12;
    p.z += cos(uTime * 0.17 + aSeed * 17.0) * 0.08;
    // Nearer dust moves more with the pointer (parallax).
    float depth = clamp((p.z + 3.0) / 5.0, 0.0, 1.0);
    p.xy += uPointer * vec2(0.22, 0.12) * depth;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (5.5 / -mv.z);

    float twinkle = 0.65 + 0.35 * sin(uTime * (0.8 + aSeed) + aSeed * 40.0);
    float edge = smoothstep(-1.2, -0.6, p.y) * (1.0 - smoothstep(3.0, 3.8, p.y));
    vAlpha = twinkle * edge * mix(0.35, 0.85, depth) * uIntro;
    vWarm = aWarm;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uBone;
  uniform vec3 uSignal;
  varying float vAlpha;
  varying float vWarm;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.1, d) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(mix(uBone, uSignal, vWarm), a * mix(0.55, 0.9, vWarm));
  }
`;

/** Sparse dust in the light around the figure. One draw call, all motion in the vertex shader. */
export class Particles {
  readonly points: THREE.Points;
  readonly uniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uPointer: { value: new THREE.Vector2() },
    uIntro: { value: 0 },
    uBone: { value: new THREE.Color("#ece7dc") },
    uSignal: { value: new THREE.Color("#ff5a1f") },
  };

  constructor(count: number, seed = 7) {
    let s = seed;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
    const pos = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    const warm = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 8;
      pos[i * 3 + 1] = rand() * 5 - 1.2;
      pos[i * 3 + 2] = rand() * 5 - 3;
      seeds[i] = rand();
      sizes[i] = 1.2 + rand() * rand() * 3.2;
      warm[i] = rand() < 0.07 ? 1 : 0;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geom.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geom.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geom.setAttribute("aWarm", new THREE.BufferAttribute(warm, 1));
    const mat = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.points = new THREE.Points(geom, mat);
    this.points.frustumCulled = false;
  }

  setPixelRatio(dpr: number) {
    this.uniforms.uPixelRatio.value = dpr;
  }

  update(dt: number, pointerX: number, pointerY: number, intro: number, animate: boolean) {
    if (animate) this.uniforms.uTime.value += dt;
    this.uniforms.uPointer.value.set(pointerX, pointerY);
    this.uniforms.uIntro.value = intro;
  }

  dispose() {
    this.points.geometry.dispose();
    (this.points.material as THREE.Material).dispose();
  }
}
