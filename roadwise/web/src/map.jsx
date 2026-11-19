import React from "./react-global.js";
import { Icon } from "./icons.jsx";
import {
  COLORS,
  LEVELS,
  ROUTES,
  number,
  timeText,
  money,
} from "./presentation.js";
const { useState, useEffect, useRef } = React;
const L = window.L;
const coords = (p) => [p[1], p[0]];
let basemapPromise;

/* These vector overlays use the map's own projection. Repainting the forecast
   slider never requests new weather, tiles, or route geometry. */
const Drawing = L.Layer.extend({
  initialize(pane, draw) {
    this.pane = pane;
    this.draw = draw;
  },
  onAdd(map) {
    this.map = map;
    this.canvas = L.DomUtil.create("canvas", "map-canvas");
    this.canvas.setAttribute("aria-hidden", "true");
    map.getPane(this.pane).appendChild(this.canvas);
    map.on("move zoom resize viewreset", this.queue, this);
    this.queue();
  },
  onRemove(map) {
    map.off("move zoom resize viewreset", this.queue, this);
    cancelAnimationFrame(this.frame);
    this.canvas.remove();
    this.map = null;
  },
  queue() {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => {
      if (!this.map) return;
      const size = this.map.getSize(),
        ratio = Math.min(window.devicePixelRatio || 1, 2);
      const cv = this.canvas;
      L.DomUtil.setPosition(cv, this.map.containerPointToLayerPoint([0, 0]));
      if (
        cv.width !== Math.round(size.x * ratio) ||
        cv.height !== Math.round(size.y * ratio)
      ) {
        cv.width = Math.round(size.x * ratio);
        cv.height = Math.round(size.y * ratio);
        cv.style.width = size.x + "px";
        cv.style.height = size.y + "px";
      }
      const ctx = cv.getContext("2d");
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, size.x, size.y);
      this.draw(ctx, this.map, size);
    });
  },
});
function prepareBase(data) {
  for (const key of [
    "urban",
    "lakes",
    "counties",
    "rivers",
    "roads",
    "states",
  ]) {
    data[key] = data[key].map((points) => ({
      points,
      box: points.reduce(
        ([w, s, e, n], [x, y]) => [
          Math.min(w, x),
          Math.min(s, y),
          Math.max(e, x),
          Math.max(n, y),
        ],
        [180, 90, -180, -90],
      ),
    }));
  }
  return data;
}
function paintBase(ctx, map, size, data, endpointNames) {
  const view = map.getBounds().pad(0.06);
  const projection = (p) => map.latLngToContainerPoint(coords(p));
  function layer(key, stroke, width, fill) {
    ctx.beginPath();
    for (const {
      points,
      box: [w, s, e, n],
    } of data[key]) {
      if (
        w > view.getEast() ||
        e < view.getWest() ||
        s > view.getNorth() ||
        n < view.getSouth()
      )
        continue;
      points.forEach((p, i) => {
        const q = projection(p);
        i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y);
      });
      if (fill) ctx.closePath();
    }
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.lineWidth = width;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }
  layer("urban", null, 0, "#e0e3d8");
  layer("counties", "#d4d8c8", 0.7);
  layer("lakes", "#afc9c9", 0.6, "#bdd6d7");
  layer("rivers", "#b4cecf", 1.1);
  layer("roads", "#d8ceae", 2.9);
  layer("roads", "#fffbea", 1.5);
  ctx.setLineDash([3, 3]);
  layer("states", "#adb5a5", 1.2);
  ctx.setLineDash([]);
  const used = [];
  function label(x, y, text, font, color, padding = 3) {
    ctx.font = font;
    const width = ctx.measureText(text).width;
    const box = [
      x - width / 2 - padding,
      y - 11 - padding,
      x + width / 2 + padding,
      y + 4 + padding,
    ];
    if (
      used.some(
        (b) =>
          !(box[0] > b[2] || box[2] < b[0] || box[1] > b[3] || box[3] < b[1]),
      )
    )
      return;
    used.push(box);
    ctx.textAlign = "center";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#edf0e3";
    ctx.lineWidth = 3;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }
  for (const [x, y, t] of [
    [-98.55, 34.92, "O K L A H O M A"],
    [-98.3, 33.25, "T E X A S"],
  ]) {
    const q = projection([x, y]);
    label(q.x, q.y, t, "600 13px sans-serif", "#8a9885", 8);
  }
  const cities = data.places
    .filter(
      ([p, name, pop]) =>
        view.contains(coords(p)) &&
        !endpointNames.includes(name.toLowerCase()) &&
        (map.getZoom() >= 7 || pop > 60000),
    )
    .sort((a, b) => b[2] - a[2]);
  for (const [p, name, pop] of cities) {
    const q = projection(p);
    if (q.x < 12 || q.x > size.x - 12) continue;
    label(
      q.x,
      q.y,
      name,
      pop > 100000 ? "600 12px sans-serif" : "11px sans-serif",
      pop > 100000 ? "#586557" : "#76816f",
    );
  }
}
function paintHeat(ctx, map, routes, hour) {
  const merged = new Map();
  for (const r of routes)
    for (const c of r.checkpoints) {
      const p = map.latLngToContainerPoint(coords(c.coordinates));
      const key = Math.round(p.x / 12) + "," + Math.round(p.y / 12);
      const level = c.forecast?.[hour];
      if (!Number.isInteger(level) || level < 0 || level > 4) continue;
      if (!merged.has(key) || merged.get(key).level < level)
        merged.set(key, { p, level });
    }
  for (const { p, level } of [...merged.values()].sort(
    (a, b) => a.level - b.level,
  )) {
    const radius = Math.min(
      100,
      Math.max(31, Math.pow(1.55, map.getZoom() - 6) * 34),
    );
    const color = COLORS[level];
    const gradient = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, radius);
    gradient.addColorStop(0, color + "75");
    gradient.addColorStop(0.45, color + "41");
    gradient.addColorStop(1, color + "00");
    ctx.fillStyle = gradient;
    ctx.fillRect(p.x - radius, p.y - radius, 2 * radius, 2 * radius);
  }
}
function textElement(tag, text, cls = "") {
  const node = document.createElement(tag);
  node.textContent = text;
  node.className = cls;
  return node;
}
function markerIcon(letter, cls, caption) {
  const node = textElement("div", "", "endpoint-inner");
  node.append(textElement("strong", letter), textElement("span", caption));
  return L.divIcon({
    className: "endpoint " + cls,
    html: node,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}
function popup(title, lines) {
  const block = textElement("div", "", "map-popup");
  block.append(textElement("strong", title));
  for (const line of lines) block.append(textElement("span", line));
  return block;
}
export function CorridorMap({ plan, selected, onSelect, hour, heat }) {
  const host = useRef(null),
    mapRef = useRef(null),
    layer = useRef(null),
    heatLayer = useRef(null),
    baseLayer = useRef(null);
  const latest = useRef({});
  latest.current = { plan, hour, heat };
  const [layersOpen, setLayersOpen] = useState(false),
    [street, setStreet] = useState(false),
    [fuel, setFuel] = useState(true),
    [points, setPoints] = useState(true);
  const [baseError, setBaseError] = useState(""),
    [tileError, setTileError] = useState(false);
  function fit(map, mapPlan) {
    if (!mapPlan?.routes?.length) return;
    const all = mapPlan.routes.flatMap((r) => r.geometry.map(coords));
    if (all.length)
      map.fitBounds(L.latLngBounds(all), {
        paddingTopLeft: [40, 42],
        paddingBottomRight: [40, 42],
        animate: false,
        maxZoom: 13,
      });
  }
  useEffect(() => {
    const map = L.map(host.current, {
      zoomControl: false,
      attributionControl: false,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      scrollWheelZoom: false,
      minZoom: 2,
      maxZoom: 18,
      preferCanvas: true,
    }).setView([34.08, -97.1], 7);
    mapRef.current = map;
    map.createPane("offlineBase").style.zIndex = 205;
    map.createPane("corridorHeat").style.zIndex = 350;
    map.getPane("offlineBase").style.pointerEvents = "none";
    map.getPane("corridorHeat").style.pointerEvents = "none";
    layer.current = L.layerGroup().addTo(map);
    if (!basemapPromise)
      basemapPromise = fetch("./assets/basemap.json")
        .then((r) => {
          if (!r.ok) throw Error();
          return r.json();
        })
        .then(prepareBase);
    let mounted = true;
    basemapPromise
      .then((data) => {
        if (mounted)
          baseLayer.current = new Drawing("offlineBase", (ctx, m, size) => {
            const labels = [
              latest.current.plan?.origin || "",
              latest.current.plan?.destination || "",
            ].map((v) => v.split(",")[0].trim().toLowerCase());
            paintBase(ctx, m, size, data, labels);
          }).addTo(map);
      })
      .catch(() => {
        if (mounted) setBaseError("Offline basemap unavailable");
      });
    heatLayer.current = new Drawing("corridorHeat", (ctx, m) => {
      const { plan, hour, heat } = latest.current;
      if (heat && plan) paintHeat(ctx, m, plan.routes, hour);
    }).addTo(map);
    const resize = new ResizeObserver(() => map.invalidateSize());
    resize.observe(host.current);
    return () => {
      mounted = false;
      resize.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);
  useEffect(() => {
    if (mapRef.current) {
      fit(mapRef.current, plan);
      baseLayer.current?.queue();
    }
  }, [plan]);
  useEffect(() => {
    heatLayer.current?.queue();
  }, [plan, hour, heat]);
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !street) return;
    m.createPane("onlineTiles").style.zIndex = 210;
    const tiles = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      { pane: "onlineTiles", maxZoom: 19 },
    ).addTo(m);
    tiles.on("tileerror", () => setTileError(true));
    tiles.on("tileload", () => setTileError(false));
    return () => {
      tiles.remove();
    };
  }, [street]);
  useEffect(() => {
    const group = layer.current;
    if (!group) return;
    group.clearLayers();
    if (!plan?.routes?.length) return;
    const routes = [...plan.routes].sort(
      (a, b) => Number(a.id === selected) - Number(b.id === selected),
    );
    for (const r of routes) {
      const active = r.id === selected,
        line = r.geometry.map(coords),
        color = ROUTES[plan.routes.indexOf(r) % 3];
      if (!line.length) continue;
      L.polyline(line, {
        color: "#fff",
        opacity: 0.9,
        weight: active ? 8 : 6,
        interactive: false,
      }).addTo(group);
      L.polyline(line, {
        color,
        opacity: active ? 1 : 0.87,
        weight: active ? 4.5 : 3.3,
        dashArray: active ? null : "8 5",
      })
        .addTo(group)
        .bindTooltip(textElement("span", "Route " + r.id + " · " + r.name), {
          sticky: true,
        })
        .on("click", () => onSelect(r.id));
      if (!active) continue;
      if (points)
        for (const c of r.checkpoints) {
          const color = COLORS[LEVELS.indexOf(c.level)] || "#75827a";
          L.circleMarker(coords(c.coordinates), {
            radius: 4.4,
            color: "#fff",
            weight: 1.7,
            fillColor: color,
            fillOpacity: 1,
          })
            .addTo(group)
            .bindPopup(
              popup("Mile " + number(c.mile) + " · " + c.level, [
                "ETA " + timeText(c.eta, true),
                "Wind " +
                  number(c.wind, 1) +
                  " mph · Rain " +
                  number(c.rain, 2) +
                  " in/hr",
                "Snow " + number(c.snow, 2) + " in/hr",
              ]),
            );
        }
      if (fuel)
        for (const stop of r.fuel?.stops || []) {
          if (!Number.isFinite(stop.lat) || !Number.isFinite(stop.lon))
            continue;
          const el = textElement("span", "⛽");
          L.marker([stop.lat, stop.lon], {
            icon: L.divIcon({
              className: "fuel-pin",
              html: el,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            }),
            title: stop.name,
          })
            .addTo(group)
            .bindPopup(
              popup(stop.name, [
                "Mile " + number(stop.mile),
                number(stop.gallons, 2) + " gal · " + money(stop.cost_usd),
              ]),
            );
        }
      const endpoints = [
        [line[0], "A", plan.origin],
        [line[line.length - 1], "B", plan.destination],
      ];
      endpoints.forEach(([point, letter, name]) =>
        L.marker(point, {
          icon: markerIcon(
            letter,
            letter === "A" ? "start" : "finish",
            name.split(",")[0],
          ),
          title: name,
          zIndexOffset: 400,
        })
          .addTo(group)
          .bindPopup(textElement("strong", name)),
      );
    }
  }, [plan, selected, fuel, points, onSelect]);
  return (
    <div className="map-stage">
      <div
        ref={host}
        className="map-view"
        aria-label="Interactive map of route options, checkpoints and fuel stops"
      />
      <div className="map-tools">
        <button
          aria-expanded={layersOpen}
          onClick={() => setLayersOpen(!layersOpen)}
          className="layer-toggle"
        >
          <Icon name="layers" size={16} />
          Layers
        </button>
        {layersOpen && (
          <div className="layer-menu">
            <label>
              <input
                type="checkbox"
                checked={points}
                onChange={(e) => setPoints(e.target.checked)}
              />
              Checkpoints
            </label>
            <label>
              <input
                type="checkbox"
                checked={fuel}
                onChange={(e) => setFuel(e.target.checked)}
              />
              Fuel stops
            </label>
            <label>
              <input
                type="checkbox"
                checked={street}
                onChange={(e) => setStreet(e.target.checked)}
              />
              Street tiles (online)
            </label>
          </div>
        )}
      </div>
      <div className="zoom-tools">
        <button
          aria-label="Zoom in"
          title="Zoom in"
          onClick={() => mapRef.current.zoomIn()}
        >
          +
        </button>
        <button
          aria-label="Zoom out"
          title="Zoom out"
          onClick={() => mapRef.current.zoomOut()}
        >
          −
        </button>
        <button
          aria-label="Fit all routes"
          title="Fit all routes"
          onClick={() => fit(mapRef.current, plan)}
        >
          <Icon name="focus" size={16} />
        </button>
      </div>
      {(baseError || (street && tileError)) && (
        <span className="map-error">
          {baseError || "Some online tiles unavailable"}
        </span>
      )}
      <div className="map-credit">
        {street ? (
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            © OpenStreetMap contributors
          </a>
        ) : (
          "U.S. Census Bureau · Natural Earth"
        )}
      </div>
    </div>
  );
}
