import React from "./react-global.js";
import { Icon, Logo } from "./icons.jsx";
import { CorridorMap } from "./map.jsx";
import {
  COLORS,
  LEVELS,
  ROUTES,
  number,
  money,
  duration,
  timeText,
  localDate,
} from "./presentation.js";
import { createRoot } from "./root-global.js";

const { useState, useEffect, useRef } = React;
const sample = { origin: "Dallas, TX", destination: "Oklahoma City, OK" };
const initial = {
  ...sample,
  mode: "demo",
  departure: localDate("2026-11-19T14:00:00Z"),
  load_lb: "32000",
  spacing: "25",
  initial_gallons: "12",
};
async function jsonResponse(response) {
  if (!response.headers.get("content-type")?.includes("json"))
    throw Error(
      "The planning API is unavailable. Check the server and try again.",
    );
  const data = await response.json();
  if (!response.ok)
    throw Error(data.error || "The request could not be completed.");
  return data;
}
function Legend() {
  return (
    <div className="legend" aria-label="Weather risk scale">
      {LEVELS.map((level, i) => (
        <span key={level}>
          <i style={{ background: COLORS[i] }} />
          {level}
        </span>
      ))}
    </div>
  );
}
function Form({ form, change, submit, busy, message, stale }) {
  const demo = form.mode === "demo";
  return (
    <form className="panel trip-form" onSubmit={submit}>
      <div className="panel-title">
        <span className="icon-block">
          <Icon name="compare" />
        </span>
        <h2>Trip parameters</h2>
      </div>
      <div className="form-body">
        <label className="field" htmlFor="origin">
          Origin
          <div className="input-wrap">
            <Icon name="origin" />
            <input
              id="origin"
              autoComplete="off"
              maxLength={200}
              required
              readOnly={demo}
              value={form.origin}
              onChange={(e) => change("origin", e.target.value)}
            />
          </div>
        </label>
        <label className="field" htmlFor="destination">
          Destination
          <div className="input-wrap">
            <Icon name="pin" />
            <input
              id="destination"
              autoComplete="off"
              maxLength={200}
              required
              readOnly={demo}
              value={form.destination}
              onChange={(e) => change("destination", e.target.value)}
            />
          </div>
        </label>
        <div className="rule" />
        <label className="field" htmlFor="departure">
          Departure <small>Local time</small>
          <div className="input-wrap date-wrap">
            <input
              id="departure"
              type="datetime-local"
              required
              value={form.departure}
              onChange={(e) => change("departure", e.target.value)}
            />
          </div>
        </label>
        <div className="pair">
          <label className="field" htmlFor="load">
            Load weight
            <div className="input-wrap">
              <input
                id="load"
                type="number"
                min="0"
                max="200000"
                required
                value={form.load_lb}
                onChange={(e) => change("load_lb", e.target.value)}
              />
              <span>lb</span>
            </div>
          </label>
          <label className="field" htmlFor="tank">
            Starting fuel
            <div className="input-wrap">
              <input
                id="tank"
                type="number"
                step="any"
                min="0"
                max="50"
                required
                value={form.initial_gallons}
                onChange={(e) => change("initial_gallons", e.target.value)}
              />
              <span>gal</span>
            </div>
          </label>
        </div>
        <fieldset className="spacing">
          <legend>Checkpoint spacing</legend>
          <div className="segmented">
            {["10", "25", "50"].map((s) => (
              <label className={form.spacing === s ? "active" : ""} key={s}>
                <input
                  type="radio"
                  name="spacing"
                  value={s}
                  checked={form.spacing === s}
                  onChange={() => change("spacing", s)}
                />
                {s} mi
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" className="primary" disabled={busy}>
          <Icon name="route" size={19} />
          {busy ? "Planning routes…" : "Calculate routes"}
        </button>
        {message && (
          <p className="error-text" role="alert">
            {message}
          </p>
        )}
        {stale && !message && (
          <p className="muted form-status" role="status">
            Inputs changed. Calculate to update the displayed trip.
          </p>
        )}
      </div>
    </form>
  );
}
function Forecast({ hour, setHour, heat, setHeat, plan }) {
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setHour((i) => (i + 1) % 49), 650);
    return () => clearInterval(t);
  }, [playing, setHour]);
  useEffect(() => setPlaying(false), [plan]);
  return (
    <div className="forecast">
      <div className="forecast-head">
        <div className="subhead">
          <Icon name="wind" size={17} />
          Weather forecast
        </div>
        <label className="switch-label">
          <input
            type="checkbox"
            checked={heat}
            onChange={(e) => setHeat(e.target.checked)}
          />
          <span className="switch" />
          Heatmap
        </label>
      </div>
      <div className="timeline">
        <button
          className="play"
          aria-label={
            playing ? "Pause forecast animation" : "Play forecast animation"
          }
          onClick={() => {
            if (!heat) setHeat(true);
            setPlaying(!playing);
          }}
          disabled={!plan}
        >
          <Icon name={playing ? "pause" : "play"} size={15} />
        </button>
        <div className="timeline-input">
          <input
            aria-label="Forecast hours after departure"
            type="range"
            min="0"
            max="48"
            value={hour}
            style={{ "--progress": (hour / 48) * 100 + "%" }}
            onChange={(e) => {
              setPlaying(false);
              setHour(Number(e.target.value));
            }}
          />
          <div className="ticks">
            <span>0h</span>
            <span>12h</span>
            <span>24h</span>
            <span>36h</span>
            <span>48h</span>
          </div>
        </div>
        <output
          title={
            plan
              ? timeText(
                  new Date(new Date(plan.departure).getTime() + hour * 3600000),
                  true,
                )
              : ""
          }
        >
          +{hour}h
        </output>
      </div>
      <Legend />
    </div>
  );
}
function RouteCard({ route: r, index, selected, recommended, onClick }) {
  return (
    <button
      type="button"
      className={"route-card" + (selected ? " selected" : "")}
      onClick={onClick}
      aria-pressed={selected}
      aria-label={"Select route " + r.id + ", " + r.name}
      style={{ "--route-color": ROUTES[index % 3] }}
    >
      <div className="route-card-top">
        <span className="route-id">Route {r.id}</span>
        {recommended ? (
          <span className="recommend">
            <Icon name="shield" size={13} />
            Recommended
          </span>
        ) : (
          <span
            className="risk-label"
            style={{ "--risk": COLORS[LEVELS.indexOf(r.peak)] }}
          >
            {r.peak} risk
          </span>
        )}
      </div>
      <h3>{r.name}</h3>
      <div className="route-metrics">
        <span>
          <Icon name="clock" size={15} />
          {duration(r.duration_seconds)}
        </span>
        <span>
          <Icon name="road" size={15} />
          {number(r.miles)} mi
        </span>
        <span>
          <Icon name="fuel" size={15} />
          {money(r.fuel?.total_cost_usd)}
        </span>
      </div>
    </button>
  );
}
function RouteDetail({ route: r }) {
  const [tab, setTab] = useState("Weather");
  if (!r) return null;
  const f = r.fuel || {},
    stops = f.stops || [];
  return (
    <section className="panel detail" aria-label="Selected route details">
      <div className="detail-head">
        <div>
          <div className="small-kicker">ROUTE {r.id}</div>
          <h2>{r.name}</h2>
        </div>
        <div className="tabs" role="group" aria-label="Route details view">
          {["Weather", "Fuel"].map((t) => (
            <button aria-pressed={tab === t} key={t} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>
      {tab === "Weather" ? (
        <>
          <div className="summaries">
            {[
              ["Peak risk", r.peak],
              ["Severe miles", number(r.severe_miles, 1)],
              ["High miles", number(r.high_miles, 1)],
              ["No Travel miles", number(r.no_travel_miles, 1)],
              ["Average risk", number(r.average_risk, 2) + " / 4"],
            ].map(([key, v]) => (
              <div key={key}>
                <span>{key}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
          <details>
            <summary>Weather at {r.checkpoints.length} checkpoints</summary>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {[
                      "Mile",
                      "Arrival (local)",
                      "Risk",
                      "Wind (mph)",
                      "Rain (in/hr)",
                      "Snow (in/hr)",
                    ].map((c) => (
                      <th key={c}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {r.checkpoints.map((p, i) => (
                    <tr key={i}>
                      <td>{number(p.mile, 1)}</td>
                      <td>{timeText(p.eta, true)}</td>
                      <td>
                        <span
                          className="risk-label"
                          style={{ "--risk": COLORS[LEVELS.indexOf(p.level)] }}
                        >
                          {p.level}
                        </span>
                      </td>
                      <td>{number(p.wind, 1)}</td>
                      <td>{number(p.rain, 3)}</td>
                      <td>{number(p.snow, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      ) : (
        <>
          <div className="summaries">
            <div>
              <span>Trip fuel purchases</span>
              <strong>{money(f.total_cost_usd)}</strong>
            </div>
            <div>
              <span>Planned stops</span>
              <strong>{f.status === "ok" ? number(stops.length) : "—"}</strong>
            </div>
            <div>
              <span>Tank range</span>
              <strong>500 mi</strong>
            </div>
            <div>
              <span>Efficiency</span>
              <strong>10 mpg</strong>
            </div>
          </div>
          {f.message && <p className="note">{f.message}</p>}
          {stops.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {["Truck stop", "Mile", "Gallons", "Purchase"].map((c) => (
                      <th key={c}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stops.map((s, i) => (
                    <tr key={i}>
                      <td>{s.name}</td>
                      <td>{number(s.mile, 1)}</td>
                      <td>{number(s.gallons, 2)}</td>
                      <td>{money(s.cost_usd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
function App() {
  const [form, setForm] = useState(initial),
    [applied, setApplied] = useState(null),
    [plan, setPlan] = useState(null),
    [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [hour, setHour] = useState(0),
    [heat, setHeat] = useState(true);
  const [activeNav, setActiveNav] = useState("planner");
  const sequence = useRef(0);
  function accept(data, submitted) {
    if (!data?.routes?.length) throw Error("The planner returned no routes.");
    setPlan(data);
    setSelected(data.recommended_id || data.routes[0].id);
    setHour(0);
    setApplied(submitted);
    setError("");
  }
  useEffect(() => {
    let alive = true;
    const start = sequence.current;
    (async () => {
      let data;
      if (!window.roadwisePlan) {
        try {
          data = await fetch("/api/demo").then(jsonResponse);
        } catch {}
      }
      if (!data) data = await fetch("./demo.json").then(jsonResponse);
      if (alive && sequence.current === start) {
        const received = {
          ...initial,
          ...sample,
          departure: localDate(data.departure),
          load_lb: String(data.load_lb),
          spacing: String(data.spacing),
          initial_gallons: String(data.initial_gallons ?? 12),
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
    const departure =
      mode === "live" ? localDate(Date.now() + 3600000) : initial.departure;
    setForm((f) => ({
      ...f,
      ...(mode === "demo" ? sample : {}),
      mode,
      departure,
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
        initial_gallons: +form.initial_gallons,
      };
      const data = window.roadwisePlan
        ? await window.roadwisePlan(payload)
        : await fetch("/api/plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).then(jsonResponse);
      if (current === sequence.current) accept(data, form);
    } catch (e) {
      if (current === sequence.current) setError(e.message || String(e));
    } finally {
      if (current === sequence.current) setLoading(false);
    }
  }
  const stale =
    applied && Object.keys(initial).some((k) => applied[k] !== form[k]);
  const route = plan?.routes.find((r) => r.id === selected);
  const title = plan
    ? plan.origin.split(",")[0] + " to " + plan.destination.split(",")[0]
    : "Trip corridor";
  return (
    <>
      <header className="topbar">
        <div className="top-inner">
          <a
            className="brand"
            href="#planner"
            onClick={() => setActiveNav("planner")}
          >
            <Logo />
            Roadwise
          </a>
          <nav aria-label="Page sections">
            <a
              className={activeNav === "planner" ? "current" : ""}
              href="#planner"
              onClick={() => setActiveNav("planner")}
            >
              Planner
            </a>
            <a
              className={activeNav === "comparison" ? "current" : ""}
              href="#comparison"
              onClick={() => setActiveNav("comparison")}
            >
              Route comparison
            </a>
          </nav>
          <span className="vehicle">
            <Icon name="truck" size={18} />
            Truck routing
          </span>
        </div>
      </header>
      <main id="planner">
        <div className="page-header">
          <div>
            <h1>Route planner</h1>
            <p>
              Compare weather exposure, travel time, and fuel costs along your
              trip.
            </p>
          </div>
          <div className="mode-picker" role="group" aria-label="Planning mode">
            <button
              disabled={loading}
              aria-pressed={form.mode === "demo"}
              onClick={() => switchMode("demo")}
            >
              Sample trip
            </button>
            <button
              disabled={loading}
              aria-pressed={form.mode === "live"}
              onClick={() => switchMode("live")}
            >
              Live planning
            </button>
          </div>
        </div>
        <div className="workspace">
          <Form
            form={form}
            change={change}
            submit={submit}
            busy={loading}
            message={error}
            stale={stale}
          />
          <section className="panel corridor">
            <div className="corridor-title">
              <div>
                <div className="small-kicker">CORRIDOR MAP</div>
                <h2>{title}</h2>
              </div>
              <span className="result-mode">
                <i />
                {plan?.mode === "live"
                  ? "Live result"
                  : plan
                    ? "Sample data"
                    : "Loading"}
              </span>
            </div>
            <CorridorMap
              plan={plan}
              selected={selected}
              onSelect={setSelected}
              hour={hour}
              heat={heat}
            />
            <Forecast
              plan={plan}
              hour={hour}
              setHour={setHour}
              heat={heat}
              setHeat={setHeat}
            />
          </section>
        </div>
        <section className="comparison" id="comparison">
          <div className="section-title">
            <div>
              <h2>Route comparison</h2>
            </div>
            {plan && (
              <span className="option-count">
                {plan.routes.length}{" "}
                {plan.routes.length === 1 ? "option" : "options"}
              </span>
            )}
          </div>
          {plan ? (
            <div className="cards">
              {plan.routes.map((r, i) => (
                <RouteCard
                  key={r.id}
                  route={r}
                  index={i}
                  selected={r.id === selected}
                  recommended={r.id === plan.recommended_id}
                  onClick={() => setSelected(r.id)}
                />
              ))}
            </div>
          ) : (
            <p role="status" className="muted">
              {error ? "No trip loaded." : "Loading sample trip…"}
            </p>
          )}
        </section>
        {plan && !plan.recommended_id && (
          <p role="status" className="danger">
            <Icon name="shield" />
            No route recommended. Every option encounters No Travel conditions.
          </p>
        )}
        <RouteDetail route={route} />
        {plan?.warnings?.length > 0 && (
          <div className="warnings">
            <Icon name="info" size={16} />
            <div>
              {plan.warnings.map((w, i) => (
                <p key={i}>{w}</p>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
createRoot(document.getElementById("app")).render(<App />);
