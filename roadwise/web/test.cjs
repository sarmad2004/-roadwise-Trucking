// Component-level integration with the shipped React and Leaflet builds.
// Canvas drawing calls and DOM dimensions are stubbed because jsdom has no layout engine.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { JSDOM, VirtualConsole } = require("jsdom");
const base = __dirname;
const route = (id, name, score) => ({
  id,
  name,
  geometry: [
    [-96.8, 32.78],
    [-97.13, 34.17],
    [-97.52, 35.47],
  ],
  miles: 208,
  duration_seconds: 14100,
  peak: score,
  severe_miles: 0,
  high_miles: 0,
  no_travel_miles: 0,
  average_risk: 1,
  checkpoints: [
    {
      coordinates: [-96.8, 32.78],
      mile: 0,
      eta: "2026-11-19T14:00:00Z",
      level: score,
      wind: 16,
      rain: 0.02,
      snow: 0,
      forecast: Array.from({ length: 49 }, (_, i) => i % 5),
    },
  ],
  fuel: {
    status: "ok",
    total_cost_usd: 28.2,
    stops: [
      {
        name: "Sample station",
        lon: -97.13,
        lat: 34.17,
        gallons: 8.8,
        cost_usd: 28.2,
        mile: 104,
      },
    ],
  },
});
const sample = {
  origin: "Dallas, TX",
  destination: "Oklahoma City, OK",
  departure: "2026-11-19T14:00:00Z",
  mode: "demo",
  load_lb: 32000,
  initial_gallons: 12,
  spacing: 25,
  routes: [
    route("A", "Central", "Low"),
    route("B", "Western", "Moderate"),
    route("C", "Eastern", "High"),
  ],
  recommended_id: "A",
  warnings: ["Sample data."],
};
async function settle(check) {
  for (let i = 0; i < 300; i++) {
    if (check()) return;
    await new Promise((r) => setTimeout(r, 8));
  }
  assert.fail("UI did not reach the expected state");
}
test("route selection, fuel and weather details, layers, forecast and live request", async (t) => {
  const errors = [],
    posted = [];
  let gradients = 0;
  const log = new VirtualConsole();
  log.on("jsdomError", (err) => errors.push(err.message));
  const dom = new JSDOM('<!doctype html><div id="app"></div>', {
    url: "http://localhost/",
    runScripts: "outside-only",
    pretendToBeVisual: true,
    virtualConsole: log,
  });
  t.after(() => dom.window.close());
  const w = dom.window,
    d = w.document;
  w.ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
  Object.defineProperty(w.HTMLElement.prototype, "clientWidth", {
    get: () => 800,
  });
  Object.defineProperty(w.HTMLElement.prototype, "clientHeight", {
    get: () => 390,
  });
  const noop = () => {};
  const context = new Proxy(
    {
      measureText: () => ({ width: 27 }),
      createRadialGradient() {
        gradients++;
        return { addColorStop: noop };
      },
    },
    { get: (target, key) => target[key] ?? noop },
  );
  w.HTMLCanvasElement.prototype.getContext = function () {
    context.canvas = this;
    return context;
  };
  w.fetch = async (url, options) => {
    let data = sample;
    if (url.includes("basemap"))
      data = JSON.parse(
        fs.readFileSync(path.join(base, "assets/basemap.json")),
      );
    if (url === "/api/plan") {
      const body = JSON.parse(options.body);
      posted.push(body);
      data = {
        ...sample,
        mode: body.mode,
        departure: body.departure,
        spacing: body.spacing,
      };
    }
    return {
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => data,
    };
  };
  for (const asset of [
    "react.min.js",
    "react-dom.min.js",
    "leaflet.js",
    "app.js",
  ])
    w.eval(fs.readFileSync(path.join(base, "assets", asset), "utf8"));
  const buttons = () => [...d.querySelectorAll("button")];
  const button = (text) => buttons().find((b) => b.textContent === text);
  await settle(() => d.querySelectorAll(".route-card").length === 3);
  await settle(() => gradients > 0);
  d.querySelectorAll(".route-card")[1].click();
  await settle(() => d.querySelector(".detail h2").textContent === "Western");
  button("Fuel").click();
  await settle(() =>
    d.querySelector(".detail").textContent.includes("Sample station"),
  );
  button("Weather").click();
  await settle(() => d.querySelector(".detail details"));
  button("Layers").click();
  await settle(() => d.querySelector(".layer-menu"));
  assert.equal(d.querySelectorAll(".layer-menu input").length, 3);
  d.querySelector('button[aria-label="Play forecast animation"]').click();
  await settle(() => d.querySelector("output").textContent !== "+0h");
  d.querySelector('button[aria-label="Pause forecast animation"]').click();
  button("Live planning").click();
  await settle(() => !d.querySelector("#origin").readOnly);
  d.querySelector('input[name="spacing"][value="50"]').click();
  await settle(() => d.querySelector(".form-status"));
  d.querySelector("form").dispatchEvent(
    new w.Event("submit", { bubbles: true, cancelable: true }),
  );
  await settle(
    () => d.querySelector(".result-mode")?.textContent === "Live result",
  );
  assert.equal(posted.length, 1);
  assert.equal(posted[0].spacing, 50);
  assert.equal(posted[0].mode, "live");
  assert.equal(d.querySelector(".form-status"), null);
  assert.deepEqual(errors, []);
});
