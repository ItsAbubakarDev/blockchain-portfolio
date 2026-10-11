import * as THREE from "three";
import { damp, lerp, smoothstep } from "@/lib/utils/math";

/** A camera pose: where it looks, and from which direction/distance (degrees, units). */
type Pose = { tx: number; ty: number; tz: number; az: number; el: number; r: number; fov: number };
type Key = "hero" | "about" | "contact";

// Landscape poses. `sx` is where the figure should sit on screen (NDC, -1 left … 1 right);
// the camera target is offset to put it there at any aspect ratio.
// hero — figure right, text left; about — figure left, text right; contact — right again, closer.
const WIDE: Record<Key, Omit<Pose, "tx"> & { sx: number }> = {
  hero: { sx: 0.3, ty: 1.24, tz: 0, az: -6, el: 3, r: 5.9, fov: 30 },
  about: { sx: -0.48, ty: 1.22, tz: 0, az: 26, el: 6, r: 6.3, fov: 30 },
  contact: { sx: 0.53, ty: 1.3, tz: 0, az: -18, el: 2, r: 5.8, fov: 30 },
};
// Portrait (phones, tablets upright): figure centred and high, text below.
const TALL: Record<Key, Pose> = {
  hero: { tx: 0, ty: 0.98, tz: 0, az: 0, el: 4, r: 6.3, fov: 36 },
  about: { tx: 0, ty: 1.6, tz: 0, az: 18, el: 8, r: 7.2, fov: 36 },
  contact: { tx: 0, ty: 1.0, tz: 0, az: -10, el: 3, r: 6.6, fov: 36 },
};

/** Resolve a pose for the current aspect ratio. */
function resolve(key: Key, portrait: boolean, phone: boolean, aspect: number, out: Pose) {
  if (portrait) {
    Object.assign(out, TALL[key]);
    // Upright tablets have more height than phones: lift the figure and step back so the
    // ring stays above the text block.
    const extra = Math.max(0, Math.min(aspect, 0.9) - 0.5);
    out.ty -= extra * 1.5;
    out.r += extra * 5.5;
    // Phones: the hero copy is a fixed ~450 px block anchored to the bottom, so the shorter the
    // screen (390×844 → 375×667 → SE in Safari), the higher and smaller the figure has to sit to
    // keep its face clear of the name.
    if (phone) {
      const short = Math.max(0, Math.min(1, (aspect - 0.46) / 0.14));
      out.ty -= short * 0.85;
      out.r += short * 0.8;
    }
    return out;
  }
  const p = WIDE[key];
  // Narrower landscape (1024×768, 4:3) — step back and push the figure further aside.
  const narrow = Math.max(0, 1.6 - aspect);
  const r = p.r * (1 + narrow * 0.55);
  const sx = p.sx + Math.sign(p.sx) * narrow * 0.22;
  const halfWidth = r * Math.tan((p.fov * DEG) / 2) * aspect;
  Object.assign(out, p, { r, tx: -sx * halfWidth });
  return out;
}

const DEG = Math.PI / 180;

export type CameraInput = {
  aspect: number;
  hero: number;
  about: number;
  contact: number;
  pointerX: number;
  pointerY: number;
  intro: number;
  portrait: boolean;
  /** Narrower than 768 px: the hero copy block takes a fixed share of a short screen. */
  phone: boolean;
  still: boolean;
};

/**
 * Blends between section poses from scroll progress, adds pointer parallax and the intro dolly.
 * Everything is damped, so native (non-smoothed) scrolling still produces eased camera motion.
 */
export class CameraRig {
  private cur: Pose = { ...TALL.hero };
  private px = 0;
  private py = 0;
  private target = new THREE.Vector3();
  private pose: Pose = { ...TALL.hero };
  private poses: Record<Key, Pose> = { hero: { ...TALL.hero }, about: { ...TALL.hero }, contact: { ...TALL.hero } };
  private initialised = false;

  update(camera: THREE.PerspectiveCamera, dt: number, input: CameraInput) {
    const set = this.poses;
    resolve("hero", input.portrait, input.phone, input.aspect, set.hero);
    resolve("about", input.portrait, input.phone, input.aspect, set.about);
    resolve("contact", input.portrait, input.phone, input.aspect, set.contact);
    // hero → about over the first part of the about section; contact takes over when it enters.
    const toAbout = smoothstep(0.06, 0.3, input.about);
    const toContact = smoothstep(0.0, 0.8, input.contact);
    const p = this.pose;
    for (const key of ["tx", "ty", "tz", "az", "el", "r", "fov"] as const) {
      const a = lerp(set.hero[key], set.about[key], toAbout);
      p[key] = lerp(a, set.contact[key], toContact);
    }
    // While still in the hero, scrolling lifts the camera slightly and pulls back.
    p.r += input.hero * (1 - toAbout) * 0.6;
    p.el += input.hero * (1 - toAbout) * 4;

    // Intro dolly: starts further away and higher, settles as the lights come up.
    const intro = 1 - input.intro;
    p.r *= 1 + intro * 0.42;
    p.el += intro * 9;
    p.ty += intro * 0.18;

    // Start exactly at the first pose (no swoop from a default).
    const lambda = input.still || !this.initialised ? 1000 : 3.2;
    this.initialised = true;
    const c = this.cur;
    for (const key of ["tx", "ty", "tz", "az", "el", "r", "fov"] as const) c[key] = damp(c[key], p[key], lambda, dt);

    const pl = input.still ? 1000 : 2.6;
    this.px = damp(this.px, input.still ? 0 : input.pointerX, pl, dt);
    this.py = damp(this.py, input.still ? 0 : input.pointerY, pl, dt);

    const az = (c.az + this.px * 4.5) * DEG;
    const el = (c.el - this.py * 2.6) * DEG;
    this.target.set(c.tx + this.px * 0.05, c.ty + this.py * 0.04, c.tz);
    camera.position.set(
      this.target.x + c.r * Math.sin(az) * Math.cos(el),
      this.target.y + c.r * Math.sin(el),
      this.target.z + c.r * Math.cos(az) * Math.cos(el),
    );
    camera.lookAt(this.target);
    if (Math.abs(camera.fov - c.fov) > 0.01) {
      camera.fov = c.fov;
      camera.updateProjectionMatrix();
    }
  }
}
