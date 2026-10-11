// Real loading progress for the intro: each task reports 0..1 and carries a weight.
// The loader reads the weighted sum; nothing here is simulated.

type Task = { label: string; weight: number; value: number };

const tasks = new Map<string, Task>();
const listeners = new Set<() => void>();
let current = "";

const notify = () => listeners.forEach((fn) => fn());

export function registerTask(id: string, label: string, weight: number) {
  if (!tasks.has(id)) tasks.set(id, { label, weight, value: 0 });
  notify();
}

export function reportTask(id: string, value: number) {
  const task = tasks.get(id);
  if (!task) return;
  const next = Math.min(1, Math.max(task.value, value));
  if (next === task.value) return;
  task.value = next;
  current = next < 1 ? task.label : current;
  notify();
}

export function completeTask(id: string) {
  reportTask(id, 1);
}

/** Removes a task that will never run (e.g. 3D on a device without WebGL). */
export function dropTask(id: string) {
  tasks.delete(id);
  notify();
}

export function loadingSnapshot() {
  let total = 0;
  let done = 0;
  let label = "";
  for (const task of tasks.values()) {
    total += task.weight;
    done += task.weight * task.value;
    if (!label && task.value < 1) label = task.label;
  }
  return { progress: total ? done / total : 0, label: label || current, settled: total > 0 && done >= total - 1e-6 };
}

export function subscribeLoading(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

// The intro waits on these. SceneStage drops the 3D ones when the device gets no WebGL.
registerTask("fonts", "Typefaces", 0.12);
registerTask("chunk", "3D engine", 0.3);
registerTask("model", "Avatar model", 0.38);
registerTask("compile", "Shaders", 0.2);
