// Dedicated worker: Python execution and sequential provider calls leave the map responsive.
const assets = new URL("./", self.location.href);
const runtime = new URL("python/", assets);
let loading;

self.roadwise_http = function(url) {
  const request = new XMLHttpRequest();
  request.open("GET", url, false);
  request.setRequestHeader("Accept", "application/json");
  request.timeout = 20000;
  request.send();
  return JSON.stringify([request.status, request.responseText]);
};

async function initialize() {
  importScripts(new URL("pyodide.js", runtime).href);
  const [py, archive] = await Promise.all([
    loadPyodide({indexURL: runtime.href}),
    fetch(new URL("planner.zip", assets)).then(response => {
      if (!response.ok) throw new Error("Planner module download failed.");
      return response.arrayBuffer();
    })
  ]);
  py.unpackArchive(archive, "zip", {extractDir: "/roadwise"});
  py.runPython("import sys; sys.path.insert(0, '/roadwise')");
  py.runPython("from adapter import plan_json");
  return py.globals.get("plan_json");
}

self.onmessage = async ({data}) => {
  try {
    loading ??= initialize();
    const plan = await loading;
    const result = JSON.parse(plan(JSON.stringify(data.payload)));
    self.postMessage({id: data.id, ...result});
  } catch (error) {
    console.error("Roadwise worker", error);
    self.postMessage({id: data.id, error: "The planning engine could not load. Reload the page and retry."});
    loading = undefined;
  }
};
