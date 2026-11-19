# Roadwise

Plan a U.S. trip, compare weather exposure at estimated arrival times and find the least-cost fuel purchases along each candidate route. The React map opens with an explicitly labeled Dallas–Oklahoma City demonstration. Choose Live to request current provider data for another trip.

## Run the Django application

From this directory, use Python 3.12 or later.

```sh
python -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
python manage.py test
python manage.py runserver
```

Open http://127.0.0.1:8000/. Django serves the bundled React application through WhiteNoise. No API keys or database are required for the assessment. To build a container, use `docker build -t roadwise .` and `docker run --rm -p 8000:8000 roadwise`. For a deployment set `ALLOWED_HOSTS` to its hostname and `DJANGO_SECRET_KEY` to a persistent secret. The server accepts `PORT` (default 8000). Run behind a TLS reverse proxy. One threaded Gunicorn worker shares the in-process provider caches and rate limiters.

## HTTP API

| Method | Path | Result |
| --- | --- | --- |
| GET | /api/health | Readiness of HTTP application |
| GET | /api/demo | Three synthetic routes with reproducible weather and real catalog prices |
| POST | /api/fuel | Primary driving geometry, station coordinates, purchase quantities, total cash spent and coverage status |
| POST | /api/plan | Up to three routes, recommendations, fuel plans, ETA-based checkpoints and 49 hourly risk levels per location |

```sh
curl -s http://127.0.0.1:8000/api/fuel -H 'Content-Type: application/json' \
  -d '{"origin":"Dallas, TX","destination":"Oklahoma City, OK","initial_gallons":12}'
```

Both POST endpoints accept U.S. place names, addresses, ZIP codes or coordinates as a string in latitude,longitude order. Response geometry uses longitude,latitude order. Optional fields include `mode` (live by default), ISO 8601 `departure` with UTC offset (defaults to now), `load_lb` (32,000), `spacing` (25 miles, also accepts 10 or 50) and `initial_gallons` (12). An initial 50 gallons represents a full prepaid tank. The map renders the returned lines, checkpoints and station coordinates. Select the route, explore a checkpoint, toggle overlays, or play the forecast timeline. Plan requests report missing forecasts or upstream failures as errors; missing fuel coverage is explicitly represented per route.

Import `postman/Roadwise.postman_collection.json` into Postman. Point its baseUrl at the Django server. The five-minute narrated walkthrough is included under `walkthrough/`.

## Algorithms and constraints

OSRM returns road geometry, segment distances and travel times. The fuel-only path makes one OSRM request on a cache miss. The weather path first requests alternatives in one call, then uses at most two additional via-point queries when the provider supplies too few distinct routes. A disconnected or restricted corridor may yield fewer than three. Nominatim verifies U.S. endpoints. Public OSRM uses a general driving profile, which does not encode height, axle, hazmat or other truck restrictions.

Time and distance accumulate along each route. Open-Meteo provides wind speed at 10 m and hourly rainfall, showers and snowfall. The planner interpolates wind at the ETA and applies the preceding-hour precipitation totals to their corresponding intervals. Shared precipitation boundaries enter the higher category, except the explicit strict No Travel thresholds above 1 inch of rain or 3 inches of snow. Strict load limits use the exact weights in the brief. Intervals inherit the higher-risk endpoint. The recommendation excludes any No Travel route and sorts by severe miles, high miles, distance-weighted mean risk and travel time. If all routes are blocked, the response includes a null recommendation. The forecast slider explores a common hour across the entire corridor; its animation reuses downloaded risk arrays.

The fuel plan assumes 10 mpg and a 50-gallon tank and minimizes new purchases at eligible priced stations. Starting fuel is prepaid. The included dataset has 6,626 unique U.S. station IDs and 2,130 geolocated matches. Projected station positions omit access-road detours. See FUEL.md for the real-coordinate match rules, source provenance, coverage and optimizer proof.

## Verification

The Django suite covers risk boundaries and load cutoffs, provider failures and units, mixed-speed segment ETAs, blocked routes, input validation, complete fixture responses, range gaps and fuel optimality against an independent dynamic program. The frontend suite exercises route selection, layers, forecast playback, stale result handling and request inputs.

```sh
python manage.py check
python manage.py test
(cd web && npm ci && npm test && npm run build)
```

On 19 November 2026, a live Dallas–Oklahoma City HTTP request returned three alternatives of 205.6, 260.6 and 248.7 miles. Starting with 12 gallons, their cash purchases were $27.19, $44.64 and $37.78. Provider availability, latency, weather and route choices vary. The assessment snapshot is the price source.

## Hosted edition

The static build runs the same Python planner in a browser worker using Pyodide. The Django distribution serves the HTTP API used by the Postman collection. To build the static edition, run `python hosted/build.py` and serve `dist/` over HTTP. To check the packaged Python runtime with external providers, run `node hosted/verify.cjs dist --live`. Each browser session maintains its own caches. Public weather and routing services are suitable for low-volume assessment use. A fleet deployment should use provisioned providers or self-hosted routing and a shared request limiter.

## Providers and attribution

- Routing and geocoding use OpenStreetMap contributors' data, OSRM and Nominatim. https://www.openstreetmap.org/copyright
- Forecasts are provided by Open-Meteo. https://open-meteo.com/en/docs
- Basemap and frontend asset licenses are listed in web/assets/. Station sources are recorded in data/station_locations.csv.
