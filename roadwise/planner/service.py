"""Application service shared by the HTTP API and reproducible demo export."""
from datetime import datetime, timedelta, timezone
from math import isfinite

from . import demo, fuel, providers
from .risk import LEVELS, recommend, risk, summarize

UTC = timezone.utc
DEMO_ORIGIN = "Dallas, TX"
DEMO_DESTINATION = "Oklahoma City, OK"


class InputError(ValueError):
    pass


def number(data, key, default, low, high):
    raw = data.get(key, default)
    if isinstance(raw, bool):
        raise InputError(f"{key} must be numeric.")
    try:
        value = float(raw)
    except (TypeError, ValueError, OverflowError):
        raise InputError(f"{key} must be numeric.") from None
    if not isfinite(value) or not low <= value <= high:
        raise InputError(f"{key} must be between {low} and {high}.")
    return value


def location(data, key):
    value = data.get(key)
    if not isinstance(value, str) or not 1 <= len(value.strip()) <= 200:
        raise InputError(f"Enter a U.S. {key} (1–200 characters).")
    return value.strip()


def parse_departure(data, mode):
    now = datetime.now(UTC)
    value = data.get("departure", now.isoformat())
    try:
        when = datetime.fromisoformat(value)
    except (ValueError, TypeError):
        raise InputError("Use an ISO 8601 departure with timezone offset.") from None
    if when.utcoffset() is None:
        raise InputError("Departure must include a timezone offset.")
    when = when.astimezone(UTC)
    if mode == "live" and not now - timedelta(minutes=10) <= when <= now + timedelta(days=12):
        raise InputError("Choose a departure from now through the next 12 days.")
    return when


def compute(data, fuel_only=False):
    origin, destination = location(data, "origin"), location(data, "destination")
    if origin.casefold() == destination.casefold():
        raise InputError("Choose different origin and destination locations.")
    mode = data.get("mode", "live")
    if mode not in ("live", "demo"):
        raise InputError("Mode must be live or demo.")
    initial = number(data, "initial_gallons", 12, 0, 50)
    spacing = number(data, "spacing", 25, 10, 50)
    if spacing not in (10, 25, 50):
        raise InputError("Choose checkpoint spacing of 10, 25 or 50 miles.")
    load = number(data, "load_lb", 32000, 0, 200000)
    when = parse_departure(data, mode)
    if mode == "demo":
        if (origin.casefold(), destination.casefold()) != (DEMO_ORIGIN.casefold(), DEMO_DESTINATION.casefold()):
            raise InputError("The demonstration corridor runs from Dallas, TX to Oklahoma City, OK.")
        paths = demo.demo_routes()
        warnings = ["Illustrative route geometry and synthetic weather for the Dallas–Oklahoma City demonstration."]
    else:
        start, end = providers.geocode_pair(origin, destination)
        if start["coordinates"] == end["coordinates"]:
            raise InputError("Both places resolved to the same location.")
        paths = providers.routes(start["coordinates"], end["coordinates"], count=1 if fuel_only else 3)
        origin, destination = start["label"], end["label"]
        warnings = ["Road routes use a driving profile. Vehicle clearance, hazmat and legal truck restrictions require separate checks."]
    if not paths:
        raise InputError("No driving route was found for these locations.")
    if len(paths) < 3 and not fuel_only:
        warnings.append(f"The routing provider returned {len(paths)} distinct route option(s).")
    result = {"mode": mode, "origin": origin, "destination": destination, "departure": when.isoformat(),
              "load_lb": load, "spacing": int(spacing), "initial_gallons": initial, "warnings": warnings, "routes": []}
    groups = []
    for index, path in enumerate(paths[:1 if fuel_only else 3]):
        if not path["miles"] > 0:
            raise InputError("The route has zero length.")
        route = {k: path[k] for k in ("geometry", "miles", "duration_seconds")}
        route.update(id=chr(65 + index), name=path.get("name") or f"Route {index + 1}",
                     fuel=fuel.plan_fuel(path["geometry"], path["miles"], initial))
        result["routes"].append(route)
        if not fuel_only:
            groups.append(providers.checkpoints(path, int(spacing), when))
    if fuel_only:
        return result
    # Fetch each checkpoint location once across routes. Include the forecast
    # slider and every ETA, including journeys lasting longer than two days.
    coords = list(dict.fromkeys(tuple(p["coordinates"]) for group in groups for p in group))
    end = max([when + timedelta(hours=48)] +
              [datetime.fromisoformat(p["eta"]) for group in groups for p in group])
    fetch = demo.demo_weather if mode == "demo" else providers.weather
    series = fetch([list(point) for point in coords], when, end + timedelta(hours=1))
    by_point = dict(zip(coords, series, strict=True))
    for route, group in zip(result["routes"], groups):
        for point in group:
            hourly = by_point[tuple(point["coordinates"])]
            actual = providers.weather_at(hourly, datetime.fromisoformat(point["eta"]))
            point.update(actual, level=LEVELS[risk(**actual, load=load)])
            point["forecast"] = [risk(**providers.weather_at(hourly, when + timedelta(hours=h)), load=load)
                                 for h in range(49)]
        route["checkpoints"] = group
        route.update(summarize(group, route["miles"]))
    result["recommended_id"] = recommend(result["routes"])
    if result["recommended_id"] is None:
        warnings.append("Every option encounters No Travel conditions. Choose another departure.")
    return result


def fixture_request():
    return {"mode":"demo", "origin":DEMO_ORIGIN, "destination":DEMO_DESTINATION,
            "departure":"2026-11-19T14:00:00+00:00", "load_lb":32000, "spacing":25}
