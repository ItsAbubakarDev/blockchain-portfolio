import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * A neutral studio environment for reflections (glasses, eyes, clearcoat) — generated on the GPU,
 * so no HDR file is downloaded. Kept dim: the direct lights do the drawing.
 */
export function applyEnvironment(gl: THREE.WebGLRenderer, scene: THREE.Scene, intensity = 0.3) {
  const pmrem = new THREE.PMREMGenerator(gl);
  const room = new RoomEnvironment();
  const target = pmrem.fromScene(room, 0.04);
  scene.environment = target.texture;
  scene.environmentIntensity = intensity;
  room.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
  });
  pmrem.dispose();
  return () => {
    if (scene.environment === target.texture) scene.environment = null;
    target.dispose();
  };
}

/** Projects a world-space point to normalised device coordinates. */
export function toNdc(point: THREE.Vector3, camera: THREE.Camera, out: THREE.Vector3) {
  return out.copy(point).project(camera);
}
