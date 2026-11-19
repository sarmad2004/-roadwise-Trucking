import unittest

import numpy as np
import pandas as pd

from score import validate_december, validate_predictions
from train import FreightModel


class FreightTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = pd.read_csv("data/train_test.csv", nrows=800)
        cls.model = FreightModel().fit(cls.data)

    def test_future_target_id_and_quote_are_never_features(self):
        before = self.model.predict(self.data)
        dirty = self.data.assign(load_id="ignored", posted_rate=-1000, quote_signal=1e9)
        np.testing.assert_array_equal(before, self.model.predict(dirty))

    def test_unknown_city_and_absent_optional_inputs(self):
        one = pd.read_csv("data/december_chart_inputs.csv").iloc[:2].copy()
        one["pickup"] = "UNSEEN"
        one["weight"] = [float("nan"), -10.]
        prediction = self.model.predict(one)
        self.assertTrue(np.isfinite(prediction).all() and (prediction > 0).all())

    def test_distance_guard(self):
        with self.assertRaises(ValueError):
            self.model.predict(self.data.iloc[:1].assign(distance=0))

    def test_deliverables_keep_all_ids_and_fixed_inputs(self):
        output = pd.read_csv("validation_predictions.csv")
        template = pd.read_csv("data/validation_predictions_template.csv")
        pd.testing.assert_series_equal(output.load_id, template.load_id)
        validate_predictions(output)
        december = pd.read_csv("december_predictions.csv")
        original = pd.read_csv("data/december_chart_inputs.csv")
        pd.testing.assert_frame_equal(december.drop(columns="predicted_rate"), original.drop(columns="predicted_rate"))
        validate_december(december)


if __name__ == "__main__":
    unittest.main()
