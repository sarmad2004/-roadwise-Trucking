from decimal import Decimal
from random import Random
from unittest import TestCase

from planner.fuel import DATA, Station, candidates, optimize, plan_fuel, read_prices, station_grid


def offer(mile, price, identifier=None):
    return (mile, Station(str(identifier or mile), "Test stop", "Dallas", "TX",
                          33, -97, Decimal(str(price))), 0.0)


class FuelTests(TestCase):
    def test_snapshot_counts_and_selected_price(self):
        prices = read_prices(DATA / "prices.csv")
        self.assertEqual(len(prices), 6626)
        self.assertEqual(prices["105"][0], Decimal("3.269"))
        located = [s for locations in station_grid().values() for s in locations]
        self.assertEqual(len(located), 2130)
        self.assertEqual(len({s.state for s in located}), 47)

    def test_arrival_on_initial_tank(self):
        answer = optimize([], 500, 50)
        self.assertEqual(answer["total_cost_usd"], 0)
        self.assertEqual(answer["ending_gallons"], 0)
        self.assertEqual(answer["stops"], [])
        self.assertEqual(optimize([], 20, 5)["ending_gallons"], 3)

    def test_missing_initial_or_midroute_coverage(self):
        for stations, miles, initial in [([], 501, 50), ([offer(40, 3)], 50, 3), ([offer(10, 3)], 511, 2)]:
            result = optimize(stations, miles, initial)
            self.assertEqual(result["status"], "insufficient_coverage")
            self.assertIsNone(result["total_cost_usd"])
            self.assertEqual(result["stops"], [])

    def test_full_range_and_cheaper_station(self):
        r = optimize([offer(0, 4), offer(180, 3), offer(650, 5)], 810, 0)
        self.assertEqual([s["gallons"] for s in r["stops"]], [18, 50, 13])
        self.assertEqual(r["total_cost_usd"], 287)
        self.assertEqual(r["gallons_consumed"], 81)

    def test_colocated_stations_choose_cheapest(self):
        r = optimize([offer(0, 4, "A"), offer(0, 2, "B")], 99.9, 0)
        self.assertEqual(r["total_cost_usd"], 19.98)
        self.assertEqual([s["station_id"] for s in r["stops"]], ["B"])

    def test_exact_range_arrival_and_transaction_rounding(self):
        r = optimize([offer(500, "2.005")], 510, 50)
        self.assertEqual(r["total_cost_usd"], 2.01)
        self.assertEqual(r["stops"][0]["gallons"], 1)

    def test_invalid_values(self):
        for miles, gallons in [(10, -1), (10, 50.001), (10, float("nan")), (-1, 1), (float("inf"), 1)]:
            with self.assertRaises(ValueError):
                optimize([], miles, gallons)

    def test_projection_uses_segments_and_filters_distant_stations(self):
        route = [[-97.151897746554, 33.3], [-97.151897746554, 34.0]]
        r = candidates(route, 70)
        self.assertIn("6563", {s.station_id for _, s, _ in r})
        self.assertNotIn("20086", {s.station_id for _, s, _ in r})
        position = next(mile for mile, s, _ in r if s.station_id == "6563")
        self.assertAlmostEqual(position, 37.107, places=2)

    def test_real_prices_on_demo_corridor(self):
        route = [[-97.177, 33.263], [-97.151898, 33.67107], [-97.170773, 34.188225]]
        result = plan_fuel(route, 72, 1)
        self.assertEqual(result["status"], "ok")
        self.assertTrue(result["stops"])
        for stop in result["stops"]:
            self.assertEqual(stop["price_per_gallon"], float(read_prices(DATA / "prices.csv")[stop["station_id"]][0]))

    def test_duplicate_passes_available(self):
        route = [[-97.1518977, 33.63], [-97.1518977, 33.7], [-97.25, 33.7],
                 [-97.25, 33.63], [-97.1518977, 33.63], [-97.1518977, 33.7]]
        visits = [mile for mile, s, _ in candidates(route, 35) if s.station_id == "6563"]
        self.assertEqual(len(visits), 2)
        self.assertGreater(visits[1] - visits[0], 10)

    def test_against_independent_integer_dynamic_program(self):
        # Integral mile/10 inputs imply an optimum with integral gallons.
        random = Random(1905)
        for _ in range(100):
            destination = random.randint(4, 160)
            initial = random.randint(0, 50)
            miles = sorted(random.sample(range(destination), min(destination, random.randint(0, 7))))
            prices = {mile: random.randint(2, 8) for mile in miles}
            offers = [offer(m * 10, p) for m, p in prices.items()]
            actual = optimize(offers, destination * 10, initial)["total_cost_usd"]
            state = {initial: 0}
            nodes = sorted({0, *miles, destination})
            for start, end in zip(nodes, nodes[1:]):
                after = {}
                for in_tank, spent in state.items():
                    max_buy = 50 - in_tank if start in prices else 0
                    for buy in range(max_buy + 1):
                        fuel = in_tank + buy - (end - start)
                        if fuel >= 0:
                            cost = spent + buy * prices.get(start, 0)
                            after[fuel] = min(after.get(fuel, float("inf")), cost)
                state = after
            self.assertEqual(actual, min(state.values(), default=None))
