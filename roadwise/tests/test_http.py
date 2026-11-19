from django.test import SimpleTestCase
from unittest.mock import patch
from planner.service import fixture_request


class HttpTests(SimpleTestCase):
    def send(self, data, path="/api/plan"):
        return self.client.post(path,data,content_type="application/json")

    def test_http_contract(self):
        self.assertEqual(self.client.get("/api/health").json(), {"status":"ok"})
        self.assertEqual(self.client.get("/api/plan").status_code,405)
        self.assertEqual(self.client.post("/api/plan","{}",content_type="text/plain").status_code,415)
        self.assertEqual(self.send([]).status_code,400)
        self.assertEqual(self.send("{").status_code,400)

    def test_inputs(self):
        for key,value in [("origin",""),("spacing",11),("initial_gallons",51),("load_lb",-1),
                          ("load_lb",True),("load_lb","NaN"),("departure","2026-01-01"),
                          ("mode",[]),("origin","New York")]:
            response=self.send(dict(fixture_request(), **{key:value}))
            self.assertEqual(response.status_code,400,(key,response.content))

    def test_demo_contract(self):
        d=self.client.get("/api/demo").json()
        self.assertEqual(len(d["routes"]),3)
        for r in d["routes"]:
            self.assertAlmostEqual(r["checkpoints"][-1]["mile"],r["miles"],places=2)
            for p in r["checkpoints"]:
                self.assertEqual(len(p["forecast"]),49)
                self.assertTrue(all(0 <= h <= 4 for h in p["forecast"]))
        self.assertEqual(self.send(fixture_request()).json(),d)

    def test_fuel_without_weather(self):
        with patch("planner.demo.demo_weather",side_effect=AssertionError):
            r=self.send(fixture_request(),"/api/fuel").json()["routes"][0]
            self.assertIn("geometry",r)
            self.assertIn("total_cost_usd",r["fuel"])
