import unittest
from datetime import UTC, datetime, timedelta, timezone
from unittest.mock import patch

from planner import providers as p


START = datetime(2026, 1, 1, 12, tzinfo=UTC)


def osrm_row(via=0):
    geom = [[-97, 30], [-97 + via, 30.4], [-97, 31]]
    return {"distance": 50 * p.M_PER_MILE, "duration": 3600, "geometry": {"coordinates": geom},
            "legs": [{"distance": 50 * p.M_PER_MILE, "duration": 3600,
                      "annotation": {"distance": [20 * p.M_PER_MILE, 30 * p.M_PER_MILE],
                                     "duration": [2000, 1200]}}]}


def weather_data():
    return {"hourly_units": {"rain": "inch", "showers": "inch", "snowfall": "inch",
                             "wind_speed_10m": "mp/h"},
            "hourly": {"time": ["2026-01-01T12:00", "2026-01-01T13:00"],
                       "rain": [0, .15], "showers": [.01, .05], "snowfall": [0, .5],
                       "wind_speed_10m": [20, 40]}}


class ProvidersTests(unittest.TestCase):
    def setUp(self):
        self.enterContext(patch.object(p, "sleep"))
        for cache in [p._routes, p._weather, p._places]:
            cache.items.clear()

    def test_eta_uses_segment_duration_and_normalizes_turn_penalties(self):
        r = p._unpack_route(osrm_row())
        points = p.checkpoints(r, 10, START.astimezone(timezone(timedelta(hours=-6))))
        self.assertEqual([v['mile'] for v in points], [0, 10, 20, 30, 40, 50])
        self.assertEqual(points[2]['eta'], '2026-01-01T12:37:30Z')
        self.assertEqual(points[-1]['eta'], '2026-01-01T13:00:00Z')
        self.assertEqual(points[0]['coordinates'], r['geometry'][0])
        self.assertEqual(points[-1]['coordinates'], r['geometry'][-1])

    def test_tail_included_once_and_zero_distance_segments_allowed(self):
        r = {"geometry": [[-100, 35], [-99, 35], [-99, 35], [-98, 35]], "miles": 27,
             "duration_seconds": 880, "segment_miles": [10, 0, 17], "segment_seconds": [300, 10, 570]}
        points = p.checkpoints(r, 10, START)
        self.assertEqual([v['mile'] for v in points], [0, 10, 20, 27])
        self.assertEqual(points[1]['eta'], '2026-01-01T12:05:10Z')
        with self.assertRaises(p.ProviderError):
            p.checkpoints(r, 24, START)

    def test_route_with_incomplete_annotation_fails_closed(self):
        row = osrm_row()
        row['legs'][0]['annotation']['duration'].pop()
        with patch.object(p, '_json', return_value={'code': 'Ok', 'routes': [row]}):
            with self.assertRaises(p.ProviderError) as ctx:
                p.routes([-97, 30], [-97, 31])
        self.assertEqual(ctx.exception.status, 502)

    def test_one_call_for_three_distinct_paths_and_result_cached(self):
        with patch.object(p, '_json', return_value={"code": "Ok", "routes": [osrm_row(n) for n in (0, 1, -1)]}) as get:
            routes = p.routes([-97, 30], [-97, 31])
            self.assertEqual(len(routes), 3)
            self.assertEqual(routes, p.routes([-97, 30], [-97, 31]))
            self.assertEqual(get.call_count, 1)
            self.assertEqual(get.call_args.args[1]['alternatives'], 2)

    def test_fuel_only_uses_one_route_lookup(self):
        with patch.object(p, "_json", return_value={"code": "Ok", "routes": [osrm_row()]}) as get:
            self.assertEqual(len(p.routes([-97, 30], [-97, 31], count=1)), 1)
            self.assertEqual(get.call_count, 1)
            self.assertEqual(get.call_args.args[1]["alternatives"], "false")

    def test_duplicate_route_options_trigger_bounded_fallback(self):
        result = {"code": "Ok", "routes": [osrm_row(), osrm_row()]}
        with patch.object(p, '_json', side_effect=[result, result, {"code": "NoRoute"}]) as get:
            self.assertEqual(len(p.routes([-97, 30], [-97, 31])), 1)
            self.assertEqual(get.call_count, 3)

    def test_geocoding_enforces_country_caches_cleaned_names(self):
        row = {"lat": "30", "lon": "-97", "display_name": "Austin", "address": {"country_code": "us"}}
        with patch.object(p, '_json', return_value=[row]) as get, patch.object(p, 'sleep'):
            result = p.geocode(" Austin,   TX ")
            self.assertEqual(result['coordinates'], [-97, 30])
            self.assertEqual(p.geocode("AUSTIN, TX"), result)
            self.assertEqual(get.call_count, 1)
            self.assertEqual(get.call_args.args[1]['countrycodes'], 'us')
        with patch.object(p, '_json', return_value={**row, "address": {"country_code": "ca"}}), patch.object(p, 'sleep'):
            with self.assertRaises(p.ProviderError) as ctx:
                p.geocode("49.300, -122.100")
            self.assertEqual(ctx.exception.status, 422)

    def test_forecast_coalesces_points_batches_and_reuses_results(self):
        def fetch(url, params, service):
            count = len(params['latitude'].split(','))
            self.assertEqual(params['start_hour'], '2026-01-01T12:00')
            self.assertEqual(params['end_hour'], '2026-01-01T13:00')
            return weather_data() if count == 1 else [weather_data() for _ in range(count)]
        points = [[-97 + i * 0.01, 30] for i in range(33)]
        with patch.object(p, '_json', side_effect=fetch) as get:
            forecasts = p.weather([points[0]] + points, START, START + timedelta(minutes=10))
            self.assertEqual(len(forecasts), 34)
            self.assertEqual(get.call_count, 2)
            repeated = p.weather(points[:2], START, START + timedelta(minutes=15))
            self.assertEqual(repeated, forecasts[1:3])
            self.assertEqual(get.call_count, 2)

    def test_hourly_wind_interpolates_and_rain_includes_showers(self):
        series = p._read_series(weather_data(), START, START + timedelta(hours=1))
        self.assertEqual(p.weather_at(series, START)['wind'], 20)
        self.assertEqual(p.weather_at(series, START + timedelta(microseconds=1))['rain'], .2)
        half = p.weather_at(series, START + timedelta(minutes=30))
        self.assertEqual(half, {'wind': 30, 'snow': .5, 'rain': .2})
        self.assertEqual(p.weather_at(series, START + timedelta(hours=1))['wind'], 40)
        for t in (START - timedelta(minutes=1), START + timedelta(hours=1, minutes=1)):
            with self.assertRaises(p.ProviderError):
                p.weather_at(series, t)

    def test_null_wrong_units_or_missing_hours_cannot_be_safe(self):
        for mutation in ("null", "units", "missing", "wrong count"):
            with self.subTest(mutation=mutation):
                row = weather_data()
                if mutation == "null":
                    row["hourly"]["rain"][1] = None
                elif mutation == "units":
                    row["hourly_units"]["snowfall"] = "cm"
                elif mutation == "missing":
                    row["hourly"]["time"][1] = "2026-01-01T14:00"
                else:
                    row = []
                with patch.object(p, '_json', return_value=row):
                    with self.assertRaises(p.ProviderError):
                        p.weather([[-97, 30]], START, START + timedelta(hours=1))


if __name__ == "__main__":
    unittest.main()
