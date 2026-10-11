import * as THREE from "three";
import { clamp, damp, smoothstep } from "@/lib/utils/math";

// Node names this rig understands. The baked avatar uses the first of each list;
// the others cover common exports (Ready Player Me, Mixamo) so a replacement model keeps working.
const HEAD_NAMES = ["Head", "mixamorigHead", "head"];
const BODY_NAMES = ["Body", "Spine2", "mixamorigSpine2", "Armature"];
const EYE_PATTERN = /^(EyeL|EyeR|LeftEye|RightEye|mixamorigLeftEye|mixamorigRightEye)$/;

export type LookInput = {
  /** Where the viewer's attention is, relative to the head, in -1..1. */
  x: number;
  y: number;
  /** 0..1, how strongly to follow (0 = idle wander). */
  weight: number;
};

/**
 * Head tracking, eye blinks, breathing and an idle wander for the avatar.
 * All motion is damped and frame-rate independent; nothing allocates per frame.
 */
export class AvatarRig {
  readonly root: THREE.Object3D;
  private head: THREE.Object3D | null;
  private body: THREE.Object3D | null;
  private eyes: THREE.Object3D[] = [];
  private headBase = new THREE.Vector3();
  private bodyBase = new THREE.Vector3();
  private eyeScale: number[] = [];

  private yaw = 0;
  private pitch = 0;
  private roll = 0;
  private time = 0;
  private blinkAt = 1.8;
  private glanceUntil = 0;
  private glanceX = 0;

  constructor(root: THREE.Object3D) {
    this.root = root;
    this.head = findByNames(root, HEAD_NAMES);
    this.body = findByNames(root, BODY_NAMES);
    root.traverse((o) => {
      if (EYE_PATTERN.test(o.name)) this.eyes.push(o);
    });
    if (this.head) this.headBase.copy(this.head.position);
    if (this.body) this.bodyBase.copy(this.body.position);
    this.eyeScale = this.eyes.map((e) => e.scale.y);
    tuneMaterials(root);
  }

  /** Briefly look toward a point on the ring (x in -1..1), e.g. when a new block lands. */
  glance(x: number) {
    this.glanceX = clamp(x, -1, 1);
    this.glanceUntil = this.time + 1.4;
  }

  update(dt: number, look: LookInput, still: boolean) {
    this.time += dt;
    const t = this.time;

    // Idle wander: slow, small Lissajous drift so the figure never looks frozen.
    const wanderX = Math.sin(t * 0.31) * 0.35 + Math.sin(t * 0.13 + 1.3) * 0.2;
    const wanderY = Math.sin(t * 0.23 + 0.7) * 0.18;
    let tx = look.x * look.weight + wanderX * (1 - look.weight);
    let ty = look.y * look.weight + wanderY * (1 - look.weight);
    if (t < this.glanceUntil && look.weight < 0.5) {
      tx = this.glanceX;
      ty = -0.25;
    }

    const targetYaw = clamp(tx, -1, 1) * 0.5;
    const targetPitch = -clamp(ty, -1, 1) * 0.22;
    const lambda = still ? 0 : 4.2;
    this.yaw = damp(this.yaw, targetYaw, lambda, dt);
    this.pitch = damp(this.pitch, targetPitch, lambda, dt);
    // A little roll into the turn reads as weight, not rotation.
    this.roll = damp(this.roll, -this.yaw * 0.12, lambda, dt);

    if (this.head) {
      this.head.rotation.set(this.pitch, this.yaw, this.roll);
      this.head.position.y = this.headBase.y + (still ? 0 : Math.sin(t * 1.6 - 0.5) * 0.006);
    }
    if (this.body && !still) {
      // Breathing: chest rises a few millimetres; shoulders follow the head a touch.
      this.body.scale.y = 1 + Math.sin(t * 1.6) * 0.0045;
      this.body.rotation.y = this.yaw * 0.12;
    }

    this.updateBlink(still);
  }

  private updateBlink(still: boolean) {
    if (!this.eyes.length || still) return;
    let open = 1;
    if (this.time >= this.blinkAt) {
      const p = (this.time - this.blinkAt) / 0.15;
      if (p < 1) open = 1 - Math.sin(p * Math.PI) * 0.92;
      // Occasionally a quick second blink, otherwise a natural 2.4–6s gap.
      else this.blinkAt = this.time + (Math.random() < 0.18 ? 0.1 : 2.4 + Math.random() * 3.6);
    }
    for (let i = 0; i < this.eyes.length; i++) this.eyes[i].scale.y = this.eyeScale[i] * open;
  }

  /** Entrance: rises into place as the lights come up. */
  entrance(progress: number) {
    const k = smoothstep(0, 1, progress);
    this.root.position.y = (1 - k) * -0.18;
  }

  dispose() {
    this.root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.geometry.dispose();
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => m.dispose());
    });
  }
}

function findByNames(root: THREE.Object3D, names: string[]) {
  for (const name of names) {
    const found = root.getObjectByName(name);
    if (found) return found;
  }
  return null;
}

/** Scene-specific material adjustments that don't belong in the asset. */
function tuneMaterials(root: THREE.Object3D) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.frustumCulled = true;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats as THREE.MeshStandardMaterial[]) {
      if (m.name === "Lens") {
        m.transparent = true;
        m.depthWrite = false;
        m.envMapIntensity = 2.4;
        mesh.renderOrder = 2;
      } else if (m.name === "Eye" || m.name === "Frame" || m.name === "Metal") {
        m.envMapIntensity = 1.8;
      } else if (m.name === "Accent") {
        m.emissiveIntensity = 1.6;
        m.toneMapped = false;
      } else {
        m.envMapIntensity = 1;
      }
    }
  });
}
