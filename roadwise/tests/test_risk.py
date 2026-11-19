import unittest
from planner.risk import LEVELS, recommend, risk, summarize


class RiskTests(unittest.TestCase):
    def test_cutoffs(self):
        for i, thresholds in enumerate(((24.9,25,35,45,55),(.099,.1,.25,.5,1.001),(.499,.5,1,2,3.001))):
            for band, value in enumerate(thresholds):
                inputs = [0,0,0]
                inputs[i] = value
                self.assertEqual(risk(*inputs, 0), band)
        self.assertEqual(risk(0,1,3,0), 3)

    def test_strict_load_cutoffs(self):
        for wind, load, expected in [(45,30000,3),(45,30001,4),(35,40000,2),(35,40001,3),(55,0,4)]:
            self.assertEqual(risk(wind,0,0,load), expected)

    def test_partial_interval(self):
        points = [{"mile":mile, "level":LEVELS[level]} for mile, level in [(0,0),(25,2),(30,3)]]
        summary = summarize(points,30)
        self.assertEqual(summary["high_miles"],25)
        self.assertEqual(summary["severe_miles"],5)
        self.assertAlmostEqual(summary["average_risk"],65/30)

    def test_ranking_and_blocked_routes(self):
        a = dict(peak="No Travel", severe_miles=0, high_miles=0, average_risk=0,duration_seconds=1,id="A")
        self.assertIsNone(recommend([a]))
        b = dict(a, peak="Severe",id="B",severe_miles=2)
        c = dict(b, id="C", severe_miles=1, high_miles=40, duration_seconds=10000)
        self.assertEqual(recommend([a,b,c]),"C")
