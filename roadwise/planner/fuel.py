"""Minimum fuel spend for a fixed route, with prepaid starting fuel."""
import csv
import math
from collections import defaultdict
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from functools import lru_cache
from pathlib import Path

DATA = Path(__file__).resolve().parents[1] / "data"
STATES = frozenset("AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split())
MPG = 10
CAPACITY = 50
RANGE = MPG * CAPACITY
CORRIDOR_MILES = 0.75
GRID = 0.25
EARTH_MILES = 3958.7613
EPS = 1e-8


@dataclass(frozen=True)
class Station:
    station_id: str
    name: str
    city: str
    state: str
    lat: float
    lon: float
    price: Decimal


def read_prices(path):
    """Keep the cheapest positive US quote per OPIS ID in this snapshot."""
    prices = {}
    with open(path, newline="", encoding="utf-8-sig") as file:
        for row in csv.DictReader(file):
            if row["State"].strip() not in STATES:
                continue
            price = Decimal(row["Retail Price"])
            key = row["OPIS Truckstop ID"].strip()
            if price.is_finite() and price > 0 and (key not in prices or price < prices[key][0]):
                prices[key] = (price, row)
    return prices


@lru_cache(maxsize=1)
def station_grid():
    prices = read_prices(DATA / "prices.csv")
    grid = defaultdict(list)
    seen = set()
    with open(DATA / "station_locations.csv", newline="") as file:
        for point in csv.DictReader(file):
            key = point["station_id"]
            if key in seen or key not in prices:
                raise ValueError(f"Unexpected or duplicate station ID: {key}")
            seen.add(key)
            price, row = prices[key]
            lat, lon = float(point["lat"]), float(point["lon"])
            if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                raise ValueError(f"Invalid station coordinates: {key}")
            station = Station(key, row["Truckstop Name"].strip(), row["City"].strip(), row["State"].strip(), lat, lon, price)
            grid[math.floor(lat / GRID), math.floor(lon / GRID)].append(station)
    return grid


def candidates(coordinates, distance_miles):
    """Project point locations onto nearby route segments in a local tangent plane."""
    grid = station_grid()
    passes = defaultdict(list)
    cumulative = 0
    for segment, ((x0, y0), (x1, y1)) in enumerate(zip(coordinates, coordinates[1:])):
        if abs(x1 - x0) > 180:
            raise ValueError("Route geometry crossing the antimeridian is unsupported.")
        y_scale = math.pi * EARTH_MILES / 180
        x_scale = y_scale * math.cos(math.radians((y0 + y1) / 2))
        dx, dy = (x1 - x0) * x_scale, (y1 - y0) * y_scale
        length = math.hypot(dx, dy)
        if length < EPS:
            continue
        pad_x, pad_y = CORRIDOR_MILES / x_scale, CORRIDOR_MILES / y_scale
        for iy in range(math.floor((min(y0, y1) - pad_y) / GRID), math.floor((max(y0, y1) + pad_y) / GRID) + 1):
            for ix in range(math.floor((min(x0, x1) - pad_x) / GRID), math.floor((max(x0, x1) + pad_x) / GRID) + 1):
                for station in grid.get((iy, ix), ()):
                    sx, sy = (station.lon - x0) * x_scale, (station.lat - y0) * y_scale
                    fraction = min(1, max(0, (sx * dx + sy * dy) / length**2))
                    offset = math.hypot(sx - fraction * dx, sy - fraction * dy)
                    if offset <= CORRIDOR_MILES:
                        match = (offset, cumulative + fraction * length, station)
                        visits = passes[station.station_id]
                        if visits and visits[-1][0] == segment - 1:
                            match = min(match, visits[-1][1], key=lambda m: m[:2])
                            visits[-1] = (segment, match)
                        else:
                            visits.append((segment, match))
        cumulative += length
    if cumulative <= 0 and distance_miles > 0:
        raise ValueError("A positive-length route requires distinct coordinates.")
    return [(min(distance_miles, along / cumulative * distance_miles), station, offset)
            for visits in passes.values() for _, (offset, along, station) in visits]


def optimize(stations, distance_miles, initial_gallons):
    """First cheaper reachable station, otherwise fill to destination or capacity."""
    if not math.isfinite(distance_miles) or distance_miles < 0:
        raise ValueError("Route distance must be finite and nonnegative.")
    if not math.isfinite(initial_gallons) or not 0 <= initial_gallons <= CAPACITY:
        raise ValueError("Starting gallons must be between 0 and 50.")
    ordered = sorted(stations, key=lambda item: (item[0], item[1].price, item[1].station_id))
    # A monotonic stack yields the nearest strictly cheaper station to the right.
    cheaper = [distance_miles] * len(ordered)
    stack = []
    for i in range(len(ordered) - 1, -1, -1):
        mile, station, _ = ordered[i]
        if not 0 <= mile <= distance_miles + EPS:
            raise ValueError("Station lies outside the route.")
        while stack and stack[-1][1] >= station.price:
            stack.pop()
        if stack:
            cheaper[i] = stack[-1][0]
        stack.append((mile, station.price))

    result = {
        "distance_miles": round(distance_miles, 3),
        "gallons_consumed": round(distance_miles / MPG, 4),
        "starting_gallons": initial_gallons,
        "candidate_count": len(ordered),
        "status": "insufficient_coverage", "stops": [], "total_cost_usd": None, "ending_gallons": None,
        "message": "Priced stations in this catalog do not cover the route with this starting fuel.",
    }
    gallons = initial_gallons
    previous = 0
    purchases = []
    total = Decimal("0")
    for i, (mile, station, offset) in enumerate(ordered):
        gallons -= (mile - previous) / MPG
        if gallons < -EPS:
            return result
        gallons = max(0, gallons)
        target = min(CAPACITY, (cheaper[i] - mile) / MPG)
        buy = max(0, target - gallons)
        if buy > EPS:
            cost = (Decimal(str(buy)) * station.price).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            total += cost
            purchases.append({
                "station_id": station.station_id, "name": station.name, "city": station.city, "state": station.state,
                "lat": station.lat, "lon": station.lon, "mile": round(mile, 3), "offset_miles": round(offset, 3),
                "gallons": round(buy, 4), "price_per_gallon": float(station.price), "cost_usd": float(cost),
            })
            gallons += buy
        previous = mile
    gallons -= (distance_miles - previous) / MPG
    if gallons < -EPS:
        return result
    result.update(status="ok", stops=purchases, total_cost_usd=float(total), ending_gallons=round(max(0, gallons), 4),
                  message="Purchases exclude prepaid starting fuel. Ramp and station access mileage are excluded.")
    return result


def plan_fuel(coordinates, distance_miles, initial_gallons=12):
    return optimize(candidates(coordinates, distance_miles), distance_miles, initial_gallons)
