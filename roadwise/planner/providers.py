"""US geocoding, bounded alternative routing, and hourly corridor forecasts.

Coordinates throughout are GeoJSON [longitude, latitude]. All times are UTC.
"""
from bisect import bisect_left, bisect_right
from collections import OrderedDict
from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime, timedelta
from http.client import HTTPException
from itertools import accumulate
import json
from math import cos, floor, hypot, isfinite, radians
import os
import re
from threading import Lock
from time import monotonic, sleep
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

M_PER_MILE = 1609.344
OSRM = os.getenv("OSRM_URL", "https://router.project-osrm.org").rstrip("/")
NOMINATIM = os.getenv("NOMINATIM_URL", "https://nominatim.openstreetmap.org").rstrip("/")
FORECAST = os.getenv("WEATHER_URL", "https://api.open-meteo.com/v1/forecast")
USER_AGENT = os.getenv("PROVIDER_USER_AGENT", "RoadwiseAssessment/1.0 (US freight route planner)")


class ProviderError(Exception):
    def __init__(self, message, status=502):
        super().__init__(message)
        self.status = status


class _Cache:
    def __init__(self, size, ttl):
        self.size, self.ttl = size, ttl
        self.items = OrderedDict()
        self.lock = Lock()

    def get(self, key):
        with self.lock:
            entry = self.items.get(key)
            if entry:
                if entry[0] > monotonic():
                    self.items.move_to_end(key)
                    return entry[1]
                del self.items[key]

    def put(self, key, value):
        with self.lock:
            self.items[key] = (monotonic() + self.ttl, value)
            self.items.move_to_end(key)
            while len(self.items) > self.size:
                self.items.popitem(last=False)


_places = _Cache(2048, 7 * 86400)
_routes = _Cache(12, 3600)
_weather = _Cache(2500, 1800)
class _Pacer:
    """Space provider starts within a single multi-threaded application worker."""
    def __init__(self):
        self.lock = Lock()
        self.next_start = 0.0

    def wait(self):
        with self.lock:
            now = monotonic()
            delay = self.next_start - now
            if delay > 0:
                sleep(delay)
            self.next_start = monotonic() + 1.05


_geocoding_pacer = _Pacer()
_routing_pacer = _Pacer()



def _json(url, params, service):
    request = Request(url + "?" + urlencode(params), headers={
        "User-Agent": USER_AGENT, "Accept": "application/json"
    })
    try:
        with urlopen(request, timeout=16) as response:
            return json.load(response)
    except HTTPError as exc:
        if service == "Routing" and exc.code == 400:
            try:
                reason = json.loads(exc.read(4096)).get("code")
            except (ValueError, AttributeError):
                reason = None
            if reason in {"NoRoute", "NoSegment"}:
                raise ProviderError("No connected road route was found.", 422) from exc
        status = 503 if exc.code in (429, 503) else 502
        raise ProviderError(f"{service} service returned HTTP {exc.code}. Try again later.", status) from exc
    except (URLError, HTTPException, TimeoutError, OSError, ValueError) as exc:
        raise ProviderError(f"{service} service could not return a usable response.", 503) from exc


def _coord(lon, lat):
    lon, lat = float(lon), float(lat)
    if not (-180 <= lon <= 180 and -90 <= lat <= 90):
        raise ValueError("Invalid geographic coordinates")
    return [lon, lat]


def geocode(place):
    """Accept an address, place name, ZIP code, or literal 'lat, lon'."""
    if not isinstance(place, str) or not 1 <= len(place.strip()) <= 240:
        raise ProviderError("Enter a US location of 1 to 240 characters.", 400)
    place = " ".join(place.split())
    key = place.casefold()
    cached = _places.get(key)
    if cached is not None:
        return cached
    _geocoding_pacer.wait()
    literals = re.fullmatch(r"([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)", place)
    exact = None
    if literals:
        try:
            exact = _coord(literals[2], literals[1])
        except ValueError as exc:
            raise ProviderError("Latitude or longitude is out of range.", 400) from exc
        result = _json(NOMINATIM + "/reverse", {
            "lon": exact[0], "lat": exact[1], "addressdetails": 1, "format": "jsonv2"
        }, "Geocoding")
        rows = [result]
    else:
        rows = _json(NOMINATIM + "/search", {
            "q": place, "countrycodes": "us", "limit": 1,
            "addressdetails": 1, "format": "jsonv2"
        }, "Geocoding")
    try:
        if not rows or rows[0].get("address", {}).get("country_code") != "us":
            raise ProviderError(f"No US location matched {place!r}.", 422)
        row = rows[0]
        result = {"label": str(row["display_name"]), "coordinates": exact or _coord(row["lon"], row["lat"])}
    except (KeyError, TypeError, AttributeError, IndexError, ValueError) as exc:
        raise ProviderError("Geocoding returned an incomplete location.") from exc
    _places.put(key, result)
    return result


def geocode_pair(origin, destination):
    """Resolve both endpoints concurrently, pacing public service request starts."""
    return tuple(_map_batches(geocode, [origin, destination]))


def _positive(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not isfinite(value) or value < 0:
        raise ValueError("Missing or invalid numeric measurement")
    return float(value)


def _unpack_route(row):
    geometry = [_coord(*pair) for pair in row["geometry"]["coordinates"]]
    legs = row["legs"]
    distances, durations = [], []
    for leg in legs:
        annotations = leg["annotation"]
        for field, target in [("distance", distances), ("duration", durations)]:
            parts = [_positive(v) for v in annotations[field]]
            subtotal, total = sum(parts), _positive(leg[field])
            if not parts or (not subtotal and total):
                raise ValueError("Missing segment weights")
            # OSRM segment durations exclude turn penalties. Distribute the leg's
            # residual proportionally so waypoint and final ETAs match routing.
            target.extend(v * total / subtotal if subtotal else 0 for v in parts)
    if len(distances) != len(geometry) - 1 or len(durations) != len(distances):
        raise ValueError("Annotations and route geometry have different lengths")
    miles = _positive(row["distance"]) / M_PER_MILE
    seconds = _positive(row["duration"])
    if not miles or not seconds or not sum(distances) or not sum(durations):
        raise ValueError("Route endpoints coincide")
    sum_meters, sum_seconds = sum(distances), sum(durations)
    return {"geometry": geometry, "miles": miles, "duration_seconds": seconds,
            "segment_miles": [d * miles / sum_meters for d in distances],
            "segment_seconds": [s * seconds / sum_seconds for s in durations]}


def _fetch_paths(points, alternatives):
    coords = ";".join(f"{lon:.6f},{lat:.6f}" for lon, lat in points)
    params = {"alternatives": alternatives, "annotations": "distance,duration",
              "geometries": "geojson", "overview": "full"}
    if len(points) == 3:
        # Bound the via snap to avoid spurious routes via distant roads or water.
        params["radiuses"] = "unlimited;8000;unlimited"
        params["continue_straight"] = "true"
    _routing_pacer.wait()
    data = _json(f"{OSRM}/route/v1/driving/{coords}", params, "Routing")
    try:
        if data.get("code") in {"NoRoute", "NoSegment"}:
            raise ProviderError("No connected road route was found.", 422)
        if data.get("code") != "Ok":
            raise ValueError("Routing did not succeed")
        paths = [_unpack_route(row) for row in data["routes"][:3]]
        if not paths:
            raise ProviderError("No connected road route was found.", 422)
        return paths
    except (AttributeError, KeyError, TypeError, ValueError, IndexError) as exc:
        raise ProviderError("Routing returned incomplete road geometry or travel times.") from exc


def _profile(route):
    return (list(accumulate(route["segment_miles"], initial=0.0)),
            list(accumulate(route["segment_seconds"], initial=0.0)))


def _position(route, profile, mile):
    distance, seconds = profile
    geom = route["geometry"]
    if mile <= 0:
        return geom[0], 0.0
    if mile >= route["miles"] - 1e-8:
        return geom[-1], route["duration_seconds"]
    i = min(bisect_right(distance, mile) - 1, len(geom) - 2)
    fraction = (mile - distance[i]) / (distance[i + 1] - distance[i])
    start, finish = geom[i], geom[i + 1]
    # Select the short arc when crossing longitude 180.
    lon = start[0] + (((finish[0] - start[0] + 180) % 360) - 180) * fraction
    coord = [(lon + 180) % 360 - 180, start[1] + (finish[1] - start[1]) * fraction]
    return coord, seconds[i] + (seconds[i + 1] - seconds[i]) * fraction


def _via_points(route):
    profile = _profile(route)
    m = route["miles"]
    middle, _ = _position(route, profile, m * .5)
    before, _ = _position(route, profile, m * .40)
    after, _ = _position(route, profile, m * .60)
    scale = max(.05, cos(radians(middle[1])))
    dx = (((after[0] - before[0] + 180) % 360) - 180) * scale
    dy = after[1] - before[1]
    length = hypot(dx, dy)
    if not length:
        return []
    offset = min(40, m * .14) / 69.1
    return [[middle[0] - sign * dy / length * offset / scale,
             middle[1] + sign * dx / length * offset] for sign in (1, -1)]


def _road_cells(route):
    # Compare actual shapes, including sparse geometric segments. Quantizing
    # samples avoids treating tiny endpoint snaps as different corridors.
    profile = _profile(route)
    miles = route["miles"]
    step = max(.1, min(2, miles / 32))
    return {tuple(round(c, 2) for c in _position(route, profile, min(miles, i * step))[0])
            for i in range(2 + floor(miles / step))}


def routes(origin, destination, count=3):
    """Return up to three alternatives, or only the fastest for fuel planning."""
    if count not in (1, 3):
        raise ValueError("Expected one or three routes")
    key = (tuple(origin), tuple(destination), count)
    cached = _routes.get(key)
    if cached is not None:
        return cached
    if key[0] == key[1]:
        raise ProviderError("Choose different origin and destination locations.", 422)
    if count == 1:
        full = _routes.get((key[0], key[1], 3))
        fastest = full[:1] if full else _fetch_paths([origin, destination], "false")[:1]
        _routes.put(key, fastest)
        return fastest
    initial = _fetch_paths([origin, destination], 2)
    accepted, cells = [], []

    def accept(candidate):
        shape = _road_cells(candidate)
        if any(len(shape & old) / len(shape | old) > .92 for old in cells):
            return
        cells.append(shape)
        accepted.append(candidate)

    for route in initial:
        accept(route)
    if len(accepted) < 3 and accepted[0]["miles"] >= 5:
        primary = accepted[0]
        def optional_path(via):
            try:
                return _fetch_paths([origin, via, destination], "false")[0]
            except ProviderError:
                # Missing alternate corridors do not discard a valid primary.
                return None

        via_points = _via_points(primary)
        # Two missing alternatives can be fetched concurrently. For one missing
        # alternative, stop after the first success to conserve routing calls.
        mapper = map if len(accepted) == 2 else _map_batches
        for candidate in mapper(optional_path, via_points):
            if candidate and (candidate["miles"] <= primary["miles"] * 1.65 and
                              candidate["duration_seconds"] <= primary["duration_seconds"] * 1.8):
                accept(candidate)
                if len(accepted) == 3:
                    break
    _routes.put(key, accepted)
    return accepted


def _utc(instant):
    if isinstance(instant, str):
        instant = datetime.fromisoformat(instant)
    if instant.utcoffset() is None:
        raise ValueError("Timezone-aware datetime required")
    return instant.astimezone(UTC)


def _iso(instant):
    return instant.astimezone(UTC).isoformat(timespec="seconds").replace("+00:00", "Z")


def checkpoints(route, spacing, departure):
    if spacing not in (10, 25, 50):
        raise ProviderError("Checkpoint spacing must be 10, 25, or 50 miles.", 400)
    departure = _utc(departure)
    profile = _profile(route)
    miles = route["miles"]
    marks = [i * spacing for i in range(1 + floor(miles / spacing)) if i * spacing < miles - 1e-8]
    result = []
    for mark in [*marks, miles]:
        coord, seconds = _position(route, profile, mark)
        result.append({"mile": mark, "coordinates": coord, "eta": _iso(departure + timedelta(seconds=seconds))})
    return result


def _read_series(row, first, last):
    units, hourly = row["hourly_units"], row["hourly"]
    if units["wind_speed_10m"] not in ("mp/h", "mph") or any(
        units[field] != "inch" for field in ("rain", "showers", "snowfall")
    ):
        raise ValueError("Unexpected forecast units")
    dates = [datetime.fromisoformat(t).replace(tzinfo=UTC) for t in hourly["time"]]
    if (not dates or dates[0] > first or dates[-1] < last
            or any(b - a != timedelta(hours=1) for a, b in zip(dates, dates[1:]))):
        raise ValueError("Incomplete hourly window")
    values = {field: [_positive(v) for v in hourly[field]]
              for field in ("wind_speed_10m", "rain", "showers", "snowfall")}
    if any(len(v) != len(dates) for v in values.values()):
        raise ValueError("Missing hourly measurements")
    return {"times": [_iso(d) for d in dates], "wind": values["wind_speed_10m"],
            "rain": [round(a + b, 8) for a, b in zip(values["rain"], values["showers"])],
            "snow": values["snowfall"]}


def _map_batches(fetch, batches):
    if len(batches) <= 1:
        yield from map(fetch, batches)
        return
    with ThreadPoolExecutor(max_workers=min(3, len(batches))) as executor:
        yield from executor.map(fetch, batches)


def weather(points, start, end):
    start, end = _utc(start), _utc(end)
    first = start.replace(minute=0, second=0, microsecond=0)
    last = end.replace(minute=0, second=0, microsecond=0)
    if last < end:
        last += timedelta(hours=1)
    if end < start:
        raise ProviderError("Forecast end precedes the start.", 400)
    if last.date() > (datetime.now(UTC).date() + timedelta(days=15)):
        raise ProviderError("This trip extends beyond the 16-day forecast window.", 422)
    coords = [(round(p[0], 3), round(p[1], 3)) for p in points]
    series, missing = {}, []
    for coord in dict.fromkeys(coords):
        item = _weather.get((coord, first, last))
        if item is None:
            missing.append(coord)
        else:
            series[coord] = item

    def fetch_batch(batch):
        params = {"latitude": ",".join(str(p[1]) for p in batch),
                  "longitude": ",".join(str(p[0]) for p in batch),
                  "start_hour": first.strftime("%Y-%m-%dT%H:00"),
                  "end_hour": last.strftime("%Y-%m-%dT%H:00"),
                  "hourly": "wind_speed_10m,rain,showers,snowfall",
                  "wind_speed_unit": "mph", "precipitation_unit": "inch", "timezone": "GMT"}
        response = _json(FORECAST, params, "Weather")
        rows = [response] if isinstance(response, dict) else response
        try:
            if len(rows) != len(batch):
                raise ValueError("Incorrect location count")
            return [(coord, _read_series(row, first, last)) for coord, row in zip(batch, rows)]
        except (TypeError, KeyError, ValueError, AttributeError) as exc:
            raise ProviderError("Hourly weather is missing for part of this route and time window.") from exc

    if missing:
        batches = [missing[i:i + 32] for i in range(0, len(missing), 32)]
        for group in _map_batches(fetch_batch, batches):
            for coord, item in group:
                _weather.put((coord, first, last), item)
                series[coord] = item
    return [series[c] for c in coords]


def weather_at(series, instant):
    """Interpolate instantaneous wind; use the hour ending after ETA for precipitation."""
    t = _utc(instant)
    lower = t.replace(minute=0, second=0, microsecond=0)
    upper = lower if t == lower else lower + timedelta(hours=1)
    timestamp = _iso(upper)
    times = series["times"]
    i = bisect_left(times, timestamp)
    if i == len(times) or times[i] != timestamp or (i == 0 and t != upper):
        raise ProviderError("Forecast does not cover the requested time.", 422)
    wind = series["wind"][i]
    if t != upper:
        fraction = (t - lower).total_seconds() / 3600
        wind = series["wind"][i - 1] + (wind - series["wind"][i - 1]) * fraction
    return {"wind": wind, "rain": series["rain"][i], "snow": series["snow"][i]}
