(() => {
  // src/react-global.js
  var react_global_default = window.React;

  // src/icons.jsx
  var paths = {
    route: /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("circle", { cx: "6", cy: "6", r: "2.4" }), /* @__PURE__ */ react_global_default.createElement("circle", { cx: "18", cy: "18", r: "2.4" }), /* @__PURE__ */ react_global_default.createElement("path", { d: "M8.5 6h5a4 4 0 0 1 0 8h-3a3 3 0 0 0 0 6H13" })),
    compare: /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("path", { d: "M4 7h16M4 17h16" }), /* @__PURE__ */ react_global_default.createElement("circle", { cx: "8", cy: "7", r: "2.5", fill: "currentColor" }), /* @__PURE__ */ react_global_default.createElement("circle", { cx: "16", cy: "17", r: "2.5", fill: "currentColor" })),
    pin: /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("path", { d: "M19.5 10c0 5.2-7.5 11.5-7.5 11.5S4.5 15.2 4.5 10a7.5 7.5 0 0 1 15 0Z" }), /* @__PURE__ */ react_global_default.createElement("circle", { cx: "12", cy: "10", r: "2.5" })),
    origin: /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("circle", { cx: "12", cy: "12", r: "7.5" }), /* @__PURE__ */ react_global_default.createElement("circle", { cx: "12", cy: "12", r: "2.1", fill: "currentColor", stroke: "none" })),
    swap: /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("path", { d: "M8 19V5m-4 4 4-4 4 4M16 5v14m-4-4 4 4 4-4" })),
    calendar: /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("rect", { x: "3.5", y: "5", width: "17", height: "16", rx: "2" }), /* @__PURE__ */ react_global_default.createElement("path", { d: "M3.5 10.5h17M8 3v4M16 3v4" })),
    weight: /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("path", { d: "M5 8.5h14l2 12H3l2-12Z" }), /* @__PURE__ */ react_global_default.createElement("circle", { cx: "12", cy: "6", r: "2.5" })),
    layers: /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("path", { d: "m12 3 10 5-10 5L2 8l10-5Zm-9 10 9 4.5 9-4.5m-18 5L12 22l9-4.5" })),
    wind: /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("path", { d: "M2 8h12a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M2 16h6a3 3 0 1 1-3 3" })),
    clock: /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("circle", { cx: "12", cy: "12", r: "9" }), /* @__PURE__ */ react_global_default.createElement("path", { d: "M12 6.5v6l4 2.5" })),
    road: /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("path", { d: "M8 3 3 21m13-18 5 18M12 4v3m0 3v4m0 4v3" })),
    fuel: /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("path", { d: "M3 21V4h10v17M2 21h12M3 10h10m0 3h2c1.5 0 2 1 2 2.5v2.2a2 2 0 0 0 4 0V9l-3.5-4M19 7v4h2" })),
    compass: /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("circle", { cx: "12", cy: "12", r: "9" }), /* @__PURE__ */ react_global_default.createElement("path", { d: "m16 8-3 5-5 3 3-5 5-3Z" })),
    focus: /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("path", { d: "M4 9V4h5m6 0h5v5m0 6v5h-5M9 20H4v-5" }), /* @__PURE__ */ react_global_default.createElement("circle", { cx: "12", cy: "12", r: "2" })),
    play: /* @__PURE__ */ react_global_default.createElement("path", { d: "m8 5 11 7-11 7V5Z", fill: "currentColor", stroke: "none" }),
    pause: /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("path", { d: "M8 5v14m8-14v14", strokeWidth: "4" })),
    shield: /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("path", { d: "m12 2.5 8 3.5v5.5c0 5-4 8.4-8 10-4-1.6-8-5-8-10V6l8-3.5Z" }), /* @__PURE__ */ react_global_default.createElement("path", { d: "m8.5 11.5 2.4 2.4 4.8-5" })),
    info: /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("circle", { cx: "12", cy: "12", r: "9" }), /* @__PURE__ */ react_global_default.createElement("path", { d: "M12 10.5v6M12 7v.1" })),
    chevron: /* @__PURE__ */ react_global_default.createElement("path", { d: "m7 10 5 5 5-5" }),
    map: /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("path", { d: "M3 5 9 3l6 3 6-2v15l-6 2-6-3-6 2V5Zm6-2v15m6-12v15" })),
    check: /* @__PURE__ */ react_global_default.createElement("path", { d: "m4 12 5 5L20 6" }),
    cross: /* @__PURE__ */ react_global_default.createElement("path", { d: "m6 6 12 12M18 6 6 18" }),
    truck: /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("path", { d: "M2 5h13v12H2V5Zm13 5h4l3 4v3h-7" }), /* @__PURE__ */ react_global_default.createElement("circle", { cx: "6", cy: "18", r: "2" }), /* @__PURE__ */ react_global_default.createElement("circle", { cx: "18", cy: "18", r: "2" }))
  };
  function Icon({ name, size = 18, ...rest }) {
    return /* @__PURE__ */ react_global_default.createElement(
      "svg",
      {
        "aria-hidden": "true",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.7",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        ...rest
      },
      paths[name]
    );
  }
  function Logo() {
    return /* @__PURE__ */ react_global_default.createElement(
      "svg",
      {
        "aria-hidden": "true",
        className: "logo",
        width: "36",
        height: "36",
        viewBox: "0 0 36 36"
      },
      /* @__PURE__ */ react_global_default.createElement("rect", { width: "36", height: "36", rx: "9", fill: "#b9f599" }),
      /* @__PURE__ */ react_global_default.createElement(
        "path",
        {
          d: "M7 27 15.7 8h4.6l-8.7 19Zm10.7 0 2.1-4.7h7.7l2.1 4.7ZM21 19.4l2.5-5.5 2.5 5.5Z",
          fill: "#173e34"
        }
      )
    );
  }

  // src/presentation.js
  var LEVELS = ["Low", "Moderate", "High", "Severe", "No Travel"];
  var COLORS = ["#29856c", "#bc8d26", "#da702e", "#c44542", "#803662"];
  var ROUTES = ["#196954", "#7571a8", "#517b9a"];
  var number = (value, precision = 0) => Number.isFinite(value) ? value.toLocaleString("en-US", { maximumFractionDigits: precision }) : "\u2014";
  var money = (value) => Number.isFinite(value) ? value.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "\u2014";
  function duration(seconds) {
    const minutes = Math.round(seconds / 60);
    return minutes >= 60 ? Math.floor(minutes / 60) + "h " + minutes % 60 + "m" : minutes + "m";
  }
  function timeText(value, includeDate = false) {
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return "\u2014";
    return date.toLocaleString(
      void 0,
      includeDate ? {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short"
      } : { hour: "numeric", minute: "2-digit", timeZoneName: "short" }
    );
  }
  function localDate(value) {
    const date = new Date(value);
    return new Date(date.getTime() - date.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
  }

  // src/map.jsx
  var { useState, useEffect, useRef } = react_global_default;
  var L = window.L;
  var coords = (p) => [p[1], p[0]];
  var basemapPromise;
  var Drawing = L.Layer.extend({
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
        const size = this.map.getSize(), ratio = Math.min(window.devicePixelRatio || 1, 2);
        const cv = this.canvas;
        L.DomUtil.setPosition(cv, this.map.containerPointToLayerPoint([0, 0]));
        if (cv.width !== Math.round(size.x * ratio) || cv.height !== Math.round(size.y * ratio)) {
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
    }
  });
  function prepareBase(data) {
    for (const key of [
      "urban",
      "lakes",
      "counties",
      "rivers",
      "roads",
      "states"
    ]) {
      data[key] = data[key].map((points) => ({
        points,
        box: points.reduce(
          ([w, s, e, n], [x, y]) => [
            Math.min(w, x),
            Math.min(s, y),
            Math.max(e, x),
            Math.max(n, y)
          ],
          [180, 90, -180, -90]
        )
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
        box: [w, s, e, n]
      } of data[key]) {
        if (w > view.getEast() || e < view.getWest() || s > view.getNorth() || n < view.getSouth())
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
        y + 4 + padding
      ];
      if (used.some(
        (b) => !(box[0] > b[2] || box[2] < b[0] || box[1] > b[3] || box[3] < b[1])
      ))
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
      [-98.3, 33.25, "T E X A S"]
    ]) {
      const q = projection([x, y]);
      label(q.x, q.y, t, "600 13px sans-serif", "#8a9885", 8);
    }
    const cities = data.places.filter(
      ([p, name, pop]) => view.contains(coords(p)) && !endpointNames.includes(name.toLowerCase()) && (map.getZoom() >= 7 || pop > 6e4)
    ).sort((a, b) => b[2] - a[2]);
    for (const [p, name, pop] of cities) {
      const q = projection(p);
      if (q.x < 12 || q.x > size.x - 12) continue;
      label(
        q.x,
        q.y,
        name,
        pop > 1e5 ? "600 12px sans-serif" : "11px sans-serif",
        pop > 1e5 ? "#586557" : "#76816f"
      );
    }
  }
  function paintHeat(ctx, map, routes, hour) {
    const merged = /* @__PURE__ */ new Map();
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
      (a, b) => a.level - b.level
    )) {
      const radius = Math.min(
        100,
        Math.max(31, Math.pow(1.55, map.getZoom() - 6) * 34)
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
      iconAnchor: [11, 11]
    });
  }
  function popup(title, lines) {
    const block = textElement("div", "", "map-popup");
    block.append(textElement("strong", title));
    for (const line of lines) block.append(textElement("span", line));
    return block;
  }
  function CorridorMap({ plan, selected, onSelect, hour, heat }) {
    const host = useRef(null), mapRef = useRef(null), layer = useRef(null), heatLayer = useRef(null), baseLayer = useRef(null);
    const latest = useRef({});
    latest.current = { plan, hour, heat };
    const [layersOpen, setLayersOpen] = useState(false), [street, setStreet] = useState(false), [fuel, setFuel] = useState(true), [points, setPoints] = useState(true);
    const [baseError, setBaseError] = useState(""), [tileError, setTileError] = useState(false);
    function fit(map, mapPlan) {
      if (!mapPlan?.routes?.length) return;
      const all = mapPlan.routes.flatMap((r) => r.geometry.map(coords));
      if (all.length)
        map.fitBounds(L.latLngBounds(all), {
          paddingTopLeft: [40, 42],
          paddingBottomRight: [40, 42],
          animate: false,
          maxZoom: 13
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
        preferCanvas: true
      }).setView([34.08, -97.1], 7);
      mapRef.current = map;
      map.createPane("offlineBase").style.zIndex = 205;
      map.createPane("corridorHeat").style.zIndex = 350;
      map.getPane("offlineBase").style.pointerEvents = "none";
      map.getPane("corridorHeat").style.pointerEvents = "none";
      layer.current = L.layerGroup().addTo(map);
      if (!basemapPromise)
        basemapPromise = fetch("./assets/basemap.json").then((r) => {
          if (!r.ok) throw Error();
          return r.json();
        }).then(prepareBase);
      let mounted = true;
      basemapPromise.then((data) => {
        if (mounted)
          baseLayer.current = new Drawing("offlineBase", (ctx, m, size) => {
            const labels = [
              latest.current.plan?.origin || "",
              latest.current.plan?.destination || ""
            ].map((v) => v.split(",")[0].trim().toLowerCase());
            paintBase(ctx, m, size, data, labels);
          }).addTo(map);
      }).catch(() => {
        if (mounted) setBaseError("Offline basemap unavailable");
      });
      heatLayer.current = new Drawing("corridorHeat", (ctx, m) => {
        const { plan: plan2, hour: hour2, heat: heat2 } = latest.current;
        if (heat2 && plan2) paintHeat(ctx, m, plan2.routes, hour2);
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
        { pane: "onlineTiles", maxZoom: 19 }
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
        (a, b) => Number(a.id === selected) - Number(b.id === selected)
      );
      for (const r of routes) {
        const active = r.id === selected, line = r.geometry.map(coords), color = ROUTES[plan.routes.indexOf(r) % 3];
        if (!line.length) continue;
        L.polyline(line, {
          color: "#fff",
          opacity: 0.9,
          weight: active ? 8 : 6,
          interactive: false
        }).addTo(group);
        L.polyline(line, {
          color,
          opacity: active ? 1 : 0.87,
          weight: active ? 4.5 : 3.3,
          dashArray: active ? null : "8 5"
        }).addTo(group).bindTooltip(textElement("span", "Route " + r.id + " \xB7 " + r.name), {
          sticky: true
        }).on("click", () => onSelect(r.id));
        if (!active) continue;
        if (points)
          for (const c of r.checkpoints) {
            const color2 = COLORS[LEVELS.indexOf(c.level)] || "#75827a";
            L.circleMarker(coords(c.coordinates), {
              radius: 4.4,
              color: "#fff",
              weight: 1.7,
              fillColor: color2,
              fillOpacity: 1
            }).addTo(group).bindPopup(
              popup("Mile " + number(c.mile) + " \xB7 " + c.level, [
                "ETA " + timeText(c.eta, true),
                "Wind " + number(c.wind, 1) + " mph \xB7 Rain " + number(c.rain, 2) + " in/hr",
                "Snow " + number(c.snow, 2) + " in/hr"
              ])
            );
          }
        if (fuel)
          for (const stop of r.fuel?.stops || []) {
            if (!Number.isFinite(stop.lat) || !Number.isFinite(stop.lon))
              continue;
            const el = textElement("span", "\u26FD");
            L.marker([stop.lat, stop.lon], {
              icon: L.divIcon({
                className: "fuel-pin",
                html: el,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              }),
              title: stop.name
            }).addTo(group).bindPopup(
              popup(stop.name, [
                "Mile " + number(stop.mile),
                number(stop.gallons, 2) + " gal \xB7 " + money(stop.cost_usd)
              ])
            );
          }
        const endpoints = [
          [line[0], "A", plan.origin],
          [line[line.length - 1], "B", plan.destination]
        ];
        endpoints.forEach(
          ([point, letter, name]) => L.marker(point, {
            icon: markerIcon(
              letter,
              letter === "A" ? "start" : "finish",
              name.split(",")[0]
            ),
            title: name,
            zIndexOffset: 400
          }).addTo(group).bindPopup(textElement("strong", name))
        );
      }
    }, [plan, selected, fuel, points, onSelect]);
    return /* @__PURE__ */ react_global_default.createElement("div", { className: "map-stage" }, /* @__PURE__ */ react_global_default.createElement(
      "div",
      {
        ref: host,
        className: "map-view",
        "aria-label": "Interactive map of route options, checkpoints and fuel stops"
      }
    ), /* @__PURE__ */ react_global_default.createElement("div", { className: "map-tools" }, /* @__PURE__ */ react_global_default.createElement(
      "button",
      {
        "aria-expanded": layersOpen,
        onClick: () => setLayersOpen(!layersOpen),
        className: "layer-toggle"
      },
      /* @__PURE__ */ react_global_default.createElement(Icon, { name: "layers", size: 16 }),
      "Layers"
    ), layersOpen && /* @__PURE__ */ react_global_default.createElement("div", { className: "layer-menu" }, /* @__PURE__ */ react_global_default.createElement("label", null, /* @__PURE__ */ react_global_default.createElement(
      "input",
      {
        type: "checkbox",
        checked: points,
        onChange: (e) => setPoints(e.target.checked)
      }
    ), "Checkpoints"), /* @__PURE__ */ react_global_default.createElement("label", null, /* @__PURE__ */ react_global_default.createElement(
      "input",
      {
        type: "checkbox",
        checked: fuel,
        onChange: (e) => setFuel(e.target.checked)
      }
    ), "Fuel stops"), /* @__PURE__ */ react_global_default.createElement("label", null, /* @__PURE__ */ react_global_default.createElement(
      "input",
      {
        type: "checkbox",
        checked: street,
        onChange: (e) => setStreet(e.target.checked)
      }
    ), "Street tiles (online)"))), /* @__PURE__ */ react_global_default.createElement("div", { className: "zoom-tools" }, /* @__PURE__ */ react_global_default.createElement(
      "button",
      {
        "aria-label": "Zoom in",
        title: "Zoom in",
        onClick: () => mapRef.current.zoomIn()
      },
      "+"
    ), /* @__PURE__ */ react_global_default.createElement(
      "button",
      {
        "aria-label": "Zoom out",
        title: "Zoom out",
        onClick: () => mapRef.current.zoomOut()
      },
      "\u2212"
    ), /* @__PURE__ */ react_global_default.createElement(
      "button",
      {
        "aria-label": "Fit all routes",
        title: "Fit all routes",
        onClick: () => fit(mapRef.current, plan)
      },
      /* @__PURE__ */ react_global_default.createElement(Icon, { name: "focus", size: 16 })
    )), (baseError || street && tileError) && /* @__PURE__ */ react_global_default.createElement("span", { className: "map-error" }, baseError || "Some online tiles unavailable"), /* @__PURE__ */ react_global_default.createElement("div", { className: "map-credit" }, street ? /* @__PURE__ */ react_global_default.createElement(
      "a",
      {
        href: "https://www.openstreetmap.org/copyright",
        target: "_blank",
        rel: "noreferrer"
      },
      "\xA9 OpenStreetMap contributors"
    ) : "U.S. Census Bureau \xB7 Natural Earth"));
  }

  // src/root-global.js
  var createRoot = window.ReactDOM.createRoot;

  // src/app.jsx
  var { useState: useState2, useEffect: useEffect2, useRef: useRef2 } = react_global_default;
  var sample = { origin: "Dallas, TX", destination: "Oklahoma City, OK" };
  var initial = {
    ...sample,
    mode: "demo",
    departure: localDate("2026-11-19T14:00:00Z"),
    load_lb: "32000",
    spacing: "25",
    initial_gallons: "12"
  };
  async function jsonResponse(response) {
    if (!response.headers.get("content-type")?.includes("json"))
      throw Error(
        "The planning API is unavailable. Check the server and try again."
      );
    const data = await response.json();
    if (!response.ok)
      throw Error(data.error || "The request could not be completed.");
    return data;
  }
  function Legend() {
    return /* @__PURE__ */ react_global_default.createElement("div", { className: "legend", "aria-label": "Weather risk scale" }, LEVELS.map((level, i) => /* @__PURE__ */ react_global_default.createElement("span", { key: level }, /* @__PURE__ */ react_global_default.createElement("i", { style: { background: COLORS[i] } }), level)));
  }
  function Form({ form, change, submit, busy, message, stale }) {
    const demo = form.mode === "demo";
    return /* @__PURE__ */ react_global_default.createElement("form", { className: "panel trip-form", onSubmit: submit }, /* @__PURE__ */ react_global_default.createElement("div", { className: "panel-title" }, /* @__PURE__ */ react_global_default.createElement("span", { className: "icon-block" }, /* @__PURE__ */ react_global_default.createElement(Icon, { name: "compare" })), /* @__PURE__ */ react_global_default.createElement("h2", null, "Trip parameters")), /* @__PURE__ */ react_global_default.createElement("div", { className: "form-body" }, /* @__PURE__ */ react_global_default.createElement("label", { className: "field", htmlFor: "origin" }, "Origin", /* @__PURE__ */ react_global_default.createElement("div", { className: "input-wrap" }, /* @__PURE__ */ react_global_default.createElement(Icon, { name: "origin" }), /* @__PURE__ */ react_global_default.createElement(
      "input",
      {
        id: "origin",
        autoComplete: "off",
        maxLength: 200,
        required: true,
        readOnly: demo,
        value: form.origin,
        onChange: (e) => change("origin", e.target.value)
      }
    ))), /* @__PURE__ */ react_global_default.createElement("label", { className: "field", htmlFor: "destination" }, "Destination", /* @__PURE__ */ react_global_default.createElement("div", { className: "input-wrap" }, /* @__PURE__ */ react_global_default.createElement(Icon, { name: "pin" }), /* @__PURE__ */ react_global_default.createElement(
      "input",
      {
        id: "destination",
        autoComplete: "off",
        maxLength: 200,
        required: true,
        readOnly: demo,
        value: form.destination,
        onChange: (e) => change("destination", e.target.value)
      }
    ))), /* @__PURE__ */ react_global_default.createElement("div", { className: "rule" }), /* @__PURE__ */ react_global_default.createElement("label", { className: "field", htmlFor: "departure" }, "Departure ", /* @__PURE__ */ react_global_default.createElement("small", null, "Local time"), /* @__PURE__ */ react_global_default.createElement("div", { className: "input-wrap date-wrap" }, /* @__PURE__ */ react_global_default.createElement(
      "input",
      {
        id: "departure",
        type: "datetime-local",
        required: true,
        value: form.departure,
        onChange: (e) => change("departure", e.target.value)
      }
    ))), /* @__PURE__ */ react_global_default.createElement("div", { className: "pair" }, /* @__PURE__ */ react_global_default.createElement("label", { className: "field", htmlFor: "load" }, "Load weight", /* @__PURE__ */ react_global_default.createElement("div", { className: "input-wrap" }, /* @__PURE__ */ react_global_default.createElement(
      "input",
      {
        id: "load",
        type: "number",
        min: "0",
        max: "200000",
        required: true,
        value: form.load_lb,
        onChange: (e) => change("load_lb", e.target.value)
      }
    ), /* @__PURE__ */ react_global_default.createElement("span", null, "lb"))), /* @__PURE__ */ react_global_default.createElement("label", { className: "field", htmlFor: "tank" }, "Starting fuel", /* @__PURE__ */ react_global_default.createElement("div", { className: "input-wrap" }, /* @__PURE__ */ react_global_default.createElement(
      "input",
      {
        id: "tank",
        type: "number",
        step: "any",
        min: "0",
        max: "50",
        required: true,
        value: form.initial_gallons,
        onChange: (e) => change("initial_gallons", e.target.value)
      }
    ), /* @__PURE__ */ react_global_default.createElement("span", null, "gal")))), /* @__PURE__ */ react_global_default.createElement("fieldset", { className: "spacing" }, /* @__PURE__ */ react_global_default.createElement("legend", null, "Checkpoint spacing"), /* @__PURE__ */ react_global_default.createElement("div", { className: "segmented" }, ["10", "25", "50"].map((s) => /* @__PURE__ */ react_global_default.createElement("label", { className: form.spacing === s ? "active" : "", key: s }, /* @__PURE__ */ react_global_default.createElement(
      "input",
      {
        type: "radio",
        name: "spacing",
        value: s,
        checked: form.spacing === s,
        onChange: () => change("spacing", s)
      }
    ), s, " mi")))), /* @__PURE__ */ react_global_default.createElement("button", { type: "submit", className: "primary", disabled: busy }, /* @__PURE__ */ react_global_default.createElement(Icon, { name: "route", size: 19 }), busy ? "Planning routes\u2026" : "Calculate routes"), message && /* @__PURE__ */ react_global_default.createElement("p", { className: "error-text", role: "alert" }, message), stale && !message && /* @__PURE__ */ react_global_default.createElement("p", { className: "muted form-status", role: "status" }, "Inputs changed. Calculate to update the displayed trip.")));
  }
  function Forecast({ hour, setHour, heat, setHeat, plan }) {
    const [playing, setPlaying] = useState2(false);
    useEffect2(() => {
      if (!playing) return;
      const t = setInterval(() => setHour((i) => (i + 1) % 49), 650);
      return () => clearInterval(t);
    }, [playing, setHour]);
    useEffect2(() => setPlaying(false), [plan]);
    return /* @__PURE__ */ react_global_default.createElement("div", { className: "forecast" }, /* @__PURE__ */ react_global_default.createElement("div", { className: "forecast-head" }, /* @__PURE__ */ react_global_default.createElement("div", { className: "subhead" }, /* @__PURE__ */ react_global_default.createElement(Icon, { name: "wind", size: 17 }), "Weather forecast"), /* @__PURE__ */ react_global_default.createElement("label", { className: "switch-label" }, /* @__PURE__ */ react_global_default.createElement(
      "input",
      {
        type: "checkbox",
        checked: heat,
        onChange: (e) => setHeat(e.target.checked)
      }
    ), /* @__PURE__ */ react_global_default.createElement("span", { className: "switch" }), "Heatmap")), /* @__PURE__ */ react_global_default.createElement("div", { className: "timeline" }, /* @__PURE__ */ react_global_default.createElement(
      "button",
      {
        className: "play",
        "aria-label": playing ? "Pause forecast animation" : "Play forecast animation",
        onClick: () => {
          if (!heat) setHeat(true);
          setPlaying(!playing);
        },
        disabled: !plan
      },
      /* @__PURE__ */ react_global_default.createElement(Icon, { name: playing ? "pause" : "play", size: 15 })
    ), /* @__PURE__ */ react_global_default.createElement("div", { className: "timeline-input" }, /* @__PURE__ */ react_global_default.createElement(
      "input",
      {
        "aria-label": "Forecast hours after departure",
        type: "range",
        min: "0",
        max: "48",
        value: hour,
        style: { "--progress": hour / 48 * 100 + "%" },
        onChange: (e) => {
          setPlaying(false);
          setHour(Number(e.target.value));
        }
      }
    ), /* @__PURE__ */ react_global_default.createElement("div", { className: "ticks" }, /* @__PURE__ */ react_global_default.createElement("span", null, "0h"), /* @__PURE__ */ react_global_default.createElement("span", null, "12h"), /* @__PURE__ */ react_global_default.createElement("span", null, "24h"), /* @__PURE__ */ react_global_default.createElement("span", null, "36h"), /* @__PURE__ */ react_global_default.createElement("span", null, "48h"))), /* @__PURE__ */ react_global_default.createElement(
      "output",
      {
        title: plan ? timeText(
          new Date(new Date(plan.departure).getTime() + hour * 36e5),
          true
        ) : ""
      },
      "+",
      hour,
      "h"
    )), /* @__PURE__ */ react_global_default.createElement(Legend, null));
  }
  function RouteCard({ route: r, index, selected, recommended, onClick }) {
    return /* @__PURE__ */ react_global_default.createElement(
      "button",
      {
        type: "button",
        className: "route-card" + (selected ? " selected" : ""),
        onClick,
        "aria-pressed": selected,
        "aria-label": "Select route " + r.id + ", " + r.name,
        style: { "--route-color": ROUTES[index % 3] }
      },
      /* @__PURE__ */ react_global_default.createElement("div", { className: "route-card-top" }, /* @__PURE__ */ react_global_default.createElement("span", { className: "route-id" }, "Route ", r.id), recommended ? /* @__PURE__ */ react_global_default.createElement("span", { className: "recommend" }, /* @__PURE__ */ react_global_default.createElement(Icon, { name: "shield", size: 13 }), "Recommended") : /* @__PURE__ */ react_global_default.createElement(
        "span",
        {
          className: "risk-label",
          style: { "--risk": COLORS[LEVELS.indexOf(r.peak)] }
        },
        r.peak,
        " risk"
      )),
      /* @__PURE__ */ react_global_default.createElement("h3", null, r.name),
      /* @__PURE__ */ react_global_default.createElement("div", { className: "route-metrics" }, /* @__PURE__ */ react_global_default.createElement("span", null, /* @__PURE__ */ react_global_default.createElement(Icon, { name: "clock", size: 15 }), duration(r.duration_seconds)), /* @__PURE__ */ react_global_default.createElement("span", null, /* @__PURE__ */ react_global_default.createElement(Icon, { name: "road", size: 15 }), number(r.miles), " mi"), /* @__PURE__ */ react_global_default.createElement("span", null, /* @__PURE__ */ react_global_default.createElement(Icon, { name: "fuel", size: 15 }), money(r.fuel?.total_cost_usd)))
    );
  }
  function RouteDetail({ route: r }) {
    const [tab, setTab] = useState2("Weather");
    if (!r) return null;
    const f = r.fuel || {}, stops = f.stops || [];
    return /* @__PURE__ */ react_global_default.createElement("section", { className: "panel detail", "aria-label": "Selected route details" }, /* @__PURE__ */ react_global_default.createElement("div", { className: "detail-head" }, /* @__PURE__ */ react_global_default.createElement("div", null, /* @__PURE__ */ react_global_default.createElement("div", { className: "small-kicker" }, "ROUTE ", r.id), /* @__PURE__ */ react_global_default.createElement("h2", null, r.name)), /* @__PURE__ */ react_global_default.createElement("div", { className: "tabs", role: "group", "aria-label": "Route details view" }, ["Weather", "Fuel"].map((t) => /* @__PURE__ */ react_global_default.createElement("button", { "aria-pressed": tab === t, key: t, onClick: () => setTab(t) }, t)))), tab === "Weather" ? /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("div", { className: "summaries" }, [
      ["Peak risk", r.peak],
      ["Severe miles", number(r.severe_miles, 1)],
      ["High miles", number(r.high_miles, 1)],
      ["No Travel miles", number(r.no_travel_miles, 1)],
      ["Average risk", number(r.average_risk, 2) + " / 4"]
    ].map(([key, v]) => /* @__PURE__ */ react_global_default.createElement("div", { key }, /* @__PURE__ */ react_global_default.createElement("span", null, key), /* @__PURE__ */ react_global_default.createElement("strong", null, v)))), /* @__PURE__ */ react_global_default.createElement("details", null, /* @__PURE__ */ react_global_default.createElement("summary", null, "Weather at ", r.checkpoints.length, " checkpoints"), /* @__PURE__ */ react_global_default.createElement("div", { className: "table-wrap" }, /* @__PURE__ */ react_global_default.createElement("table", null, /* @__PURE__ */ react_global_default.createElement("thead", null, /* @__PURE__ */ react_global_default.createElement("tr", null, [
      "Mile",
      "Arrival (local)",
      "Risk",
      "Wind (mph)",
      "Rain (in/hr)",
      "Snow (in/hr)"
    ].map((c) => /* @__PURE__ */ react_global_default.createElement("th", { key: c }, c)))), /* @__PURE__ */ react_global_default.createElement("tbody", null, r.checkpoints.map((p, i) => /* @__PURE__ */ react_global_default.createElement("tr", { key: i }, /* @__PURE__ */ react_global_default.createElement("td", null, number(p.mile, 1)), /* @__PURE__ */ react_global_default.createElement("td", null, timeText(p.eta, true)), /* @__PURE__ */ react_global_default.createElement("td", null, /* @__PURE__ */ react_global_default.createElement(
      "span",
      {
        className: "risk-label",
        style: { "--risk": COLORS[LEVELS.indexOf(p.level)] }
      },
      p.level
    )), /* @__PURE__ */ react_global_default.createElement("td", null, number(p.wind, 1)), /* @__PURE__ */ react_global_default.createElement("td", null, number(p.rain, 3)), /* @__PURE__ */ react_global_default.createElement("td", null, number(p.snow, 2))))))))) : /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("div", { className: "summaries" }, /* @__PURE__ */ react_global_default.createElement("div", null, /* @__PURE__ */ react_global_default.createElement("span", null, "Trip fuel purchases"), /* @__PURE__ */ react_global_default.createElement("strong", null, money(f.total_cost_usd))), /* @__PURE__ */ react_global_default.createElement("div", null, /* @__PURE__ */ react_global_default.createElement("span", null, "Planned stops"), /* @__PURE__ */ react_global_default.createElement("strong", null, f.status === "ok" ? number(stops.length) : "\u2014")), /* @__PURE__ */ react_global_default.createElement("div", null, /* @__PURE__ */ react_global_default.createElement("span", null, "Tank range"), /* @__PURE__ */ react_global_default.createElement("strong", null, "500 mi")), /* @__PURE__ */ react_global_default.createElement("div", null, /* @__PURE__ */ react_global_default.createElement("span", null, "Efficiency"), /* @__PURE__ */ react_global_default.createElement("strong", null, "10 mpg"))), f.message && /* @__PURE__ */ react_global_default.createElement("p", { className: "note" }, f.message), stops.length > 0 && /* @__PURE__ */ react_global_default.createElement("div", { className: "table-wrap" }, /* @__PURE__ */ react_global_default.createElement("table", null, /* @__PURE__ */ react_global_default.createElement("thead", null, /* @__PURE__ */ react_global_default.createElement("tr", null, ["Truck stop", "Mile", "Gallons", "Purchase"].map((c) => /* @__PURE__ */ react_global_default.createElement("th", { key: c }, c)))), /* @__PURE__ */ react_global_default.createElement("tbody", null, stops.map((s, i) => /* @__PURE__ */ react_global_default.createElement("tr", { key: i }, /* @__PURE__ */ react_global_default.createElement("td", null, s.name), /* @__PURE__ */ react_global_default.createElement("td", null, number(s.mile, 1)), /* @__PURE__ */ react_global_default.createElement("td", null, number(s.gallons, 2)), /* @__PURE__ */ react_global_default.createElement("td", null, money(s.cost_usd)))))))));
  }
  function App() {
    const [form, setForm] = useState2(initial), [applied, setApplied] = useState2(null), [plan, setPlan] = useState2(null), [selected, setSelected] = useState2("");
    const [loading, setLoading] = useState2(false), [error, setError] = useState2(""), [hour, setHour] = useState2(0), [heat, setHeat] = useState2(true);
    const [activeNav, setActiveNav] = useState2("planner");
    const sequence = useRef2(0);
    function accept(data, submitted) {
      if (!data?.routes?.length) throw Error("The planner returned no routes.");
      setPlan(data);
      setSelected(data.recommended_id || data.routes[0].id);
      setHour(0);
      setApplied(submitted);
      setError("");
    }
    useEffect2(() => {
      let alive = true;
      const start = sequence.current;
      (async () => {
        let data;
        if (!window.roadwisePlan) {
          try {
            data = await fetch("/api/demo").then(jsonResponse);
          } catch {
          }
        }
        if (!data) data = await fetch("./demo.json").then(jsonResponse);
        if (alive && sequence.current === start) {
          const received = {
            ...initial,
            ...sample,
            departure: localDate(data.departure),
            load_lb: String(data.load_lb),
            spacing: String(data.spacing),
            initial_gallons: String(data.initial_gallons ?? 12)
          };
          accept(data, received);
          setForm(received);
        }
      })().catch((e) => {
        if (alive && sequence.current === start) setError(e.message);
      });
      return () => {
        alive = false;
      };
    }, []);
    function change(key, value) {
      setError("");
      setForm((f) => ({ ...f, [key]: value }));
    }
    function switchMode(mode) {
      if (form.mode === mode) return;
      setError("");
      const departure = mode === "live" ? localDate(Date.now() + 36e5) : initial.departure;
      setForm((f) => ({
        ...f,
        ...mode === "demo" ? sample : {},
        mode,
        departure
      }));
    }
    async function submit(e) {
      e.preventDefault();
      if (loading) return;
      const current = ++sequence.current;
      setLoading(true);
      setError("");
      try {
        const payload = {
          ...form,
          origin: form.origin.trim(),
          destination: form.destination.trim(),
          departure: new Date(form.departure).toISOString(),
          spacing: +form.spacing,
          load_lb: +form.load_lb,
          initial_gallons: +form.initial_gallons
        };
        const data = window.roadwisePlan ? await window.roadwisePlan(payload) : await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).then(jsonResponse);
        if (current === sequence.current) accept(data, form);
      } catch (e2) {
        if (current === sequence.current) setError(e2.message || String(e2));
      } finally {
        if (current === sequence.current) setLoading(false);
      }
    }
    const stale = applied && Object.keys(initial).some((k) => applied[k] !== form[k]);
    const route = plan?.routes.find((r) => r.id === selected);
    const title = plan ? plan.origin.split(",")[0] + " to " + plan.destination.split(",")[0] : "Trip corridor";
    return /* @__PURE__ */ react_global_default.createElement(react_global_default.Fragment, null, /* @__PURE__ */ react_global_default.createElement("header", { className: "topbar" }, /* @__PURE__ */ react_global_default.createElement("div", { className: "top-inner" }, /* @__PURE__ */ react_global_default.createElement(
      "a",
      {
        className: "brand",
        href: "#planner",
        onClick: () => setActiveNav("planner")
      },
      /* @__PURE__ */ react_global_default.createElement(Logo, null),
      "Roadwise"
    ), /* @__PURE__ */ react_global_default.createElement("nav", { "aria-label": "Page sections" }, /* @__PURE__ */ react_global_default.createElement(
      "a",
      {
        className: activeNav === "planner" ? "current" : "",
        href: "#planner",
        onClick: () => setActiveNav("planner")
      },
      "Planner"
    ), /* @__PURE__ */ react_global_default.createElement(
      "a",
      {
        className: activeNav === "comparison" ? "current" : "",
        href: "#comparison",
        onClick: () => setActiveNav("comparison")
      },
      "Route comparison"
    )), /* @__PURE__ */ react_global_default.createElement("span", { className: "vehicle" }, /* @__PURE__ */ react_global_default.createElement(Icon, { name: "truck", size: 18 }), "Truck routing"))), /* @__PURE__ */ react_global_default.createElement("main", { id: "planner" }, /* @__PURE__ */ react_global_default.createElement("div", { className: "page-header" }, /* @__PURE__ */ react_global_default.createElement("div", null, /* @__PURE__ */ react_global_default.createElement("h1", null, "Route planner"), /* @__PURE__ */ react_global_default.createElement("p", null, "Compare weather exposure, travel time, and fuel costs along your trip.")), /* @__PURE__ */ react_global_default.createElement("div", { className: "mode-picker", role: "group", "aria-label": "Planning mode" }, /* @__PURE__ */ react_global_default.createElement(
      "button",
      {
        disabled: loading,
        "aria-pressed": form.mode === "demo",
        onClick: () => switchMode("demo")
      },
      "Sample trip"
    ), /* @__PURE__ */ react_global_default.createElement(
      "button",
      {
        disabled: loading,
        "aria-pressed": form.mode === "live",
        onClick: () => switchMode("live")
      },
      "Live planning"
    ))), /* @__PURE__ */ react_global_default.createElement("div", { className: "workspace" }, /* @__PURE__ */ react_global_default.createElement(
      Form,
      {
        form,
        change,
        submit,
        busy: loading,
        message: error,
        stale
      }
    ), /* @__PURE__ */ react_global_default.createElement("section", { className: "panel corridor" }, /* @__PURE__ */ react_global_default.createElement("div", { className: "corridor-title" }, /* @__PURE__ */ react_global_default.createElement("div", null, /* @__PURE__ */ react_global_default.createElement("div", { className: "small-kicker" }, "CORRIDOR MAP"), /* @__PURE__ */ react_global_default.createElement("h2", null, title)), /* @__PURE__ */ react_global_default.createElement("span", { className: "result-mode" }, /* @__PURE__ */ react_global_default.createElement("i", null), plan?.mode === "live" ? "Live result" : plan ? "Sample data" : "Loading")), /* @__PURE__ */ react_global_default.createElement(
      CorridorMap,
      {
        plan,
        selected,
        onSelect: setSelected,
        hour,
        heat
      }
    ), /* @__PURE__ */ react_global_default.createElement(
      Forecast,
      {
        plan,
        hour,
        setHour,
        heat,
        setHeat
      }
    ))), /* @__PURE__ */ react_global_default.createElement("section", { className: "comparison", id: "comparison" }, /* @__PURE__ */ react_global_default.createElement("div", { className: "section-title" }, /* @__PURE__ */ react_global_default.createElement("div", null, /* @__PURE__ */ react_global_default.createElement("h2", null, "Route comparison")), plan && /* @__PURE__ */ react_global_default.createElement("span", { className: "option-count" }, plan.routes.length, " ", plan.routes.length === 1 ? "option" : "options")), plan ? /* @__PURE__ */ react_global_default.createElement("div", { className: "cards" }, plan.routes.map((r, i) => /* @__PURE__ */ react_global_default.createElement(
      RouteCard,
      {
        key: r.id,
        route: r,
        index: i,
        selected: r.id === selected,
        recommended: r.id === plan.recommended_id,
        onClick: () => setSelected(r.id)
      }
    ))) : /* @__PURE__ */ react_global_default.createElement("p", { role: "status", className: "muted" }, error ? "No trip loaded." : "Loading sample trip\u2026")), plan && !plan.recommended_id && /* @__PURE__ */ react_global_default.createElement("p", { role: "status", className: "danger" }, /* @__PURE__ */ react_global_default.createElement(Icon, { name: "shield" }), "No route recommended. Every option encounters No Travel conditions."), /* @__PURE__ */ react_global_default.createElement(RouteDetail, { route }), plan?.warnings?.length > 0 && /* @__PURE__ */ react_global_default.createElement("div", { className: "warnings" }, /* @__PURE__ */ react_global_default.createElement(Icon, { name: "info", size: 16 }), /* @__PURE__ */ react_global_default.createElement("div", null, plan.warnings.map((w, i) => /* @__PURE__ */ react_global_default.createElement("p", { key: i }, w))))));
  }
  createRoot(document.getElementById("app")).render(/* @__PURE__ */ react_global_default.createElement(App, null));
})();
