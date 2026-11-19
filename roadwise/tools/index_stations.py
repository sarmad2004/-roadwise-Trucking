"""Join AllThePlaces point features to the supplied OPIS snapshot offline."""
import argparse
import csv
import json
from collections import defaultdict
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from planner.fuel import DATA, STATES

SPIDERS = (
    "loves_us", "pilot_flying_j", "kwik_trip", "circle_k", "caseys_general_store_us",
    "speedway_us", "maverik", "sheetz", "thorntons_us", "seven_eleven_ca_us",
    "race_trac_us", "travelcenters_of_america_us", "kwik_fill_us", "hucks_us", "rutters_us",
)
# Some operator directories use separate pages for diesel pumps and the shop.
# Dates and source identifiers are retained for every exported crosswalk row.
BRANDS = {
    "LOVES": "loves", "PILOT": "pilot", "ONE9": "pilot", "FLYINGJ": "pilot",
    "KWIKTRIP": "kwiktrip", "KWIKSTAR": "kwiktrip", "CIRCLEK": "circlek",
    "CASEYS": "caseys", "SPEEDWAY": "speedway", "MAVERIK": "maverik",
    "SHEETZ": "sheetz", "THORNTONS": "thorntons", "7ELEVEN": "seveneleven",
    "RACETRAC": "racetrac", "TRAVELCENTERSOFAMERICA": "ta", "PETROSTOPPING": "petro",
    "TA": "ta", "KWIKFILL": "kwikfill", "HUCKS": "hucks", "RUTTERS": "rutters",
}


def norm(text):
    return re.sub("[^A-Z0-9]", "", text.upper())


def brand(name):
    compact = norm(name)
    if re.match(r"^TA(?:\b|#)", name.strip(), re.I):
        return "ta"
    if name.strip().upper() == "PETRO":
        return "petro"
    return next((v for k, v in BRANDS.items() if k != "TA" and compact.startswith(k)), None)


def source_number(spider, props):
    ref = str(props.get("ref", ""))
    if spider == "rutters_us":
        match = re.search(r"#\s*(\d+)", props.get("name", ""))
    elif spider == "hucks_us":
        match = re.match(r"hucks-(\d+)-", ref)
    else:
        match = re.fullmatch(r"(\d+)(?:_(?:fuel|shop))?", ref, re.I)
    return int(match[1]) if match else None


def build(cache, output):
    directory = defaultdict(list)
    for spider in SPIDERS:
        collection = json.loads((cache / (spider + ".json")).read_text())
        date = collection["dataset_attributes"]["spider:collection_time"][:10]
        for feature in collection["features"]:
            props = feature["properties"]
            state = props.get("addr:state", "")
            if state not in STATES or props.get("addr:country") != "US":
                continue
            city = norm(props.get("addr:city", ""))
            chain = brand(props.get("brand", ""))
            number = source_number(spider, props)
            if not (chain and city and number and feature.get("geometry")):
                continue
            lon, lat = feature["geometry"]["coordinates"][:2]
            if not (18 <= lat <= 72 and -180 < lon < -60):
                continue
            source = f"{spider}/{feature['id']}"
            directory[chain, number, city, state].append((lat, lon, source, date))
    matches = defaultdict(set)
    with (DATA / "prices.csv").open(newline="", encoding="utf-8-sig") as file:
        for row in csv.DictReader(file):
            name = row["Truckstop Name"]
            match = re.search(r"#\s*(\d+)", name)
            if match:
                key = (brand(name), int(match[1]), norm(row["City"]), row["State"].strip())
                matches[row["OPIS Truckstop ID"]].update(directory.get(key, []))
    points = {}
    for station_id, variants in matches.items():
        if not variants:
            continue
        representative = min(variants)
        # Multiple entries at the same forecourt are acceptable. Reject incompatible matches.
        if all(max(abs(v[0] - representative[0]), abs(v[1] - representative[1])) < .002 for v in variants):
            points[station_id] = (station_id, *representative)
    with (DATA / "reviewed_locations.csv").open(newline="") as file:
        for row in csv.DictReader(file):
            points[row["station_id"]] = tuple(row[k] for k in ("station_id", "lat", "lon", "source", "date"))
    with output.open("w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(("station_id", "lat", "lon", "source", "date"))
        writer.writerows(points[k] for k in sorted(points, key=int))
    print(f"{len(points)} station coordinates written to {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("cache", type=Path, help="Directory of <spider>.json files from AllThePlaces")
    parser.add_argument("--download", action="store_true", help="Download current CC0 directories before matching")
    parser.add_argument("--output", type=Path, default=DATA / "station_locations.csv")
    args = parser.parse_args()
    if args.download:
        from urllib.request import urlopen
        args.cache.mkdir(parents=True, exist_ok=True)
        for spider in SPIDERS:
            url = f"https://data.alltheplaces.xyz/runs/latest/output/{spider}.geojson"
            with urlopen(url, timeout=60) as response:
                content = response.read()
            json.loads(content)
            (args.cache / (spider + ".json")).write_bytes(content)
    build(args.cache, args.output)
