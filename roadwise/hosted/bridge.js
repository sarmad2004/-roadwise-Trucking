// Installed only in the static deployment. The Django build uses its HTTP API.
(() => {
  const workerURL = new URL("planner-worker.js", document.currentScript.src);
  let worker;
  let nextID = 0;
  const pending = new Map();

  function reset(message) {
    if (worker) worker.terminate();
    worker = undefined;
    for (const request of pending.values()) {
      clearTimeout(request.timer);
      request.reject(new Error(message));
    }
    pending.clear();
  }

  function getWorker() {
    if (worker) return worker;
    worker = new Worker(workerURL);
    worker.onmessage = ({data}) => {
      const entry = pending.get(data.id);
      if (!entry) return;
      pending.delete(data.id);
      clearTimeout(entry.timer);
      if (data.error) entry.reject(new Error(data.error));
      else entry.resolve(data.plan);
    };
    worker.onerror = () => reset("The route planner could not start. Refresh and try again.");
    return worker;
  }

  window.roadwisePlan = (payload) => new Promise((resolve, reject) => {
    const runner = getWorker();
    const id = ++nextID;
    const timer = setTimeout(() => reset("The planning request timed out. Please try again."), 180000);
    pending.set(id, {resolve, reject, timer});
    runner.postMessage({id, payload});
  });
})();
