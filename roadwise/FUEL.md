# Fuel planning

The supplied snapshot contains **8,151 quotes**. Of those, 620 are in Canadian provinces. The remaining 7,531 US quotes represent 6,626 distinct OPIS IDs in 48 states. With no quote timestamp, the planner uses the lowest positive price for each US ID. Prices are the assessment snapshot in US dollars per gallon.

## Station locations

The source lists station names, cities and highway exits. It omits coordinates. The bundled crosswalk identifies **2,130 priced stations across 47 states**. The importer matches operator family, numbered store, normalized city and state against CC0 operator-directory exports from [AllThePlaces](https://www.alltheplaces.xyz/). It discards ambiguous matches with materially different coordinates. Two additional reviewed locations are recorded with their sources in `data/reviewed_locations.csv`. Each row in `data/station_locations.csv` retains a source feature ID or source URL plus collection date. Unmatched OPIS stations remain in the original CSV for later enrichment.

The normal API path reads the bundled crosswalk. It makes zero geocoding requests for stations. To refresh into a separate file for review, run from the project root:

```sh
python tools/index_stations.py /tmp/roadwise-directories --download --output /tmp/station_locations.csv
```

New upstream directories can change coverage. Review diffs, replace the bundled crosswalk, update the snapshot count test and restart the app after accepting a refresh.

## Cost model

The tank holds **50 gallons** and the vehicle travels **10 miles per gallon**, for a 500-mile full-tank range. The caller specifies prepaid starting gallons. A short trip covered by opening inventory has zero cash purchases. The result includes gallons consumed, gallons bought at each stop, the remaining balance, and the sum of cent-rounded purchase amounts in USD.

A quarter-degree spatial index narrows the station search to the road geometry. Each candidate is projected onto a nearby route segment using a local tangent plane, allowing up to 0.75 miles of lateral separation. Route-mile positions scale to the routing provider's total driving distance. The model assumes station access at the projected mile. Exit ramps, one-way access roads, closures, station availability and extra detour mileage require separate confirmation. For example, a station 0.4 miles from a highway can have a longer access road. A crosswalk gap large enough to exceed remaining range gives `insufficient_coverage` and a null dollar total.

For a fixed, ordered list of candidate stations, the planner buys just enough fuel to reach the first cheaper reachable station. If no cheaper station lies within range, it aims to leave with enough to reach the destination or a full tank, whichever requires less. Carrying fuel already in the tank is free. Buying more before a reachable cheaper station increases cost. Buying less when all reachable stops cost more shifts the same gallons to a higher price. A monotonic stack finds the next cheaper prices in linear time after sorting by route mile. Unrounded quantities drive all decisions, then the program rounds the cash amount of each stop to the nearest cent using half-up rounding.

The test suite checks known routes, station prices, alternate encounters with the same station, exact range limits, cash rounding, and gaps. It also compares 100 deterministic random cases to an independent dynamic program that enumerates every feasible integral purchase quantity.
