// Verifies the built WASM runtime and shared Python service outside of a browser.
// Pass --live to exercise actual provider hosts using curl as the test transport.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {spawnSync} = require("node:child_process");

async function main() {
  const output = path.resolve(process.argv[2] || "dist", "hosted");
  const runtime = path.join(output, "python");
  const {loadPyodide} = require(path.join(runtime, "pyodide.js"));
  const py = await loadPyodide({indexURL: runtime});
  const destinations = new Set();
  globalThis.roadwise_http = (url) => {
    destinations.add(new URL(url).hostname);
    const request = spawnSync("curl", ["--silent", "--show-error", "--max-time", "20",
      "--user-agent", "Roadwise assessment verification", "-w", "\n%{http_code}", url],
      {encoding: "utf8", maxBuffer: 20 * 1024 * 1024});
    if (request.status !== 0) throw new Error(request.stderr);
    const cut = request.stdout.lastIndexOf("\n");
    return JSON.stringify([Number(request.stdout.slice(cut + 1)), request.stdout.slice(0, cut)]);
  };
  py.unpackArchive(new Uint8Array(fs.readFileSync(path.join(output, "planner.zip"))), "zip", {extractDir: "/roadwise"});
  py.runPython("import sys; sys.path.insert(0, '/roadwise'); from adapter import plan_json");
  const run = py.globals.get("plan_json");
  const input = {
    mode: "demo", origin: "Dallas, TX", destination: "Oklahoma City, OK",
    load_lb: 32000, initial_gallons: 12, spacing: 25
  };
  const demo = JSON.parse(run(JSON.stringify(input)));
  assert.ok(demo.plan, demo.error);
  assert.equal(demo.plan.routes.length, 3);
  assert.equal(destinations.size, 0);
  assert.ok(demo.plan.routes.every(route => route.checkpoints[0].forecast.length === 49));
  assert.ok(demo.plan.routes.every(route => route.fuel.status === "ok"));
  assert.ok(demo.plan.routes.some(route => route.fuel.total_cost_usd > 0));
  const invalid = JSON.parse(run(JSON.stringify({...input, spacing:11})));
  assert.match(invalid.error, /spacing/);
  console.log("WASM demo passed: three routes, shared risk and fuel engines, 49-hour forecast, validation.");
  if (process.argv.includes("--live")) {
    const actual = JSON.parse(run(JSON.stringify({...input, mode: "live", spacing:50})));
    assert.ok(actual.plan, actual.error);
    assert.equal(actual.plan.mode, "live");
    assert.ok(actual.plan.routes.length >= 1);
    assert.equal(actual.plan.routes[0].checkpoints[0].forecast.length, 49);
    assert.equal(destinations.size, 3);
    console.log("WASM live trip passed:", actual.plan.routes.length, "route(s),", [...destinations].join(", "));
  }
}
main().catch(err => {console.error(err); process.exitCode = 1;});
