import unittest
from datetime import datetime, timedelta, timezone

from planner.demo import DALLAS, OKLAHOMA_CITY, demo_routes, demo_weather


class DemoFixturesTests(unittest.TestCase):
    def test_routes_share_endpoints_and_have_consistent_totals(self):
        routes = demo_routes()
        self.assertEqual(len({r['name'] for r in routes}), 3)
        self.assertEqual(len({tuple(map(tuple, r['geometry'])) for r in routes}), 3)
        for route in routes:
            with self.subTest(route=route['name']):
                self.assertEqual(route['geometry'][0], list(DALLAS))
                self.assertEqual(route['geometry'][-1], list(OKLAHOMA_CITY))
                for key, total in [('segment_miles', 'miles'), ('segment_seconds', 'duration_seconds')]:
                    self.assertEqual(len(route[key]), len(route['geometry']) - 1)
                    self.assertTrue(all(v > 0 for v in route[key]))
                    self.assertAlmostEqual(sum(route[key]), route[total])
                self.assertLess(route['miles'], 380)
                self.assertGreater(route['miles'], 185)

    def test_forecast_includes_both_utc_hours_and_all_fields(self):
        tz = timezone(timedelta(hours=-6))
        start = datetime(2026, 11, 19, 5, 32, tzinfo=tz)
        end = start + timedelta(hours=48)
        points = [[-97.18, 34.45], [-96.42, 34.38], [-97.47, 35.24]]
        forecast = demo_weather(points, start, end)
        self.assertEqual(forecast, demo_weather(points, start, end))
        self.assertEqual(len(forecast), len(points))
        for point in forecast:
            self.assertEqual(point['times'][0], '2026-11-19T11:00:00Z')
            self.assertEqual(point['times'][-1], '2026-11-21T11:00:00Z')
            for key in ['times', 'wind', 'rain', 'snow']:
                self.assertEqual(len(point[key]), 49)
        self.assertGreaterEqual(forecast[0]['wind'][0], 45)
        self.assertGreaterEqual(forecast[1]['rain'][0], 0.5)
        self.assertGreaterEqual(max(forecast[2]['snow']), 0.5)
        self.assertGreater(len(set(forecast[0]['wind'])), 10)

    def test_bad_time_windows_do_not_silently_create_empty_forecasts(self):
        time = datetime(2026, 11, 19, tzinfo=timezone.utc)
        for start, end in [(time, time-timedelta(hours=1)), (time.replace(tzinfo=None), time)]:
            with self.assertRaises(ValueError):
                demo_weather([], start, end)
