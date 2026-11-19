"""Fit and evaluate a freight quote model with chronological two-month backtests."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import Ridge
from sklearn.preprocessing import OneHotEncoder

CITIES = ["pickup", "delivery"]
BASE_CATEGORIES = [*CITIES, "equipment", "weekday"]
DETAIL_CATEGORIES = ["lane", "origin_equipment", "destination_equipment"]
BASE_NUMBERS = ["log_distance", "inverse_distance", "thousand_miles", "weight_scaled",
                "market", "time_years", "market_missing", "weight_missing"]
DETAIL_NUMBERS = ["lat_delta", "lon_delta", "flat_market", "reefer_market", "heavy",
                  "flat_weight", "reefer_weight", "log_distance_squared"]


def numeric_column(frame, name):
    return pd.to_numeric(frame.get(name, pd.Series(np.nan, index=frame.index)), errors="coerce")


class FreightModel:
    def __init__(self, detailed=True):
        self.detailed = detailed

    def _features(self, frame):
        x = frame[CITIES + ["equipment"]].copy()
        dates = pd.to_datetime(frame["date"], errors="raise")
        x["weekday"] = dates.dt.dayofweek.astype(str)
        x["time_years"] = (dates - self.first_date).dt.days / 365.25
        x["lane"] = x.pickup + "|" + x.delivery
        x["origin_equipment"] = x.pickup + "|" + x.equipment
        x["destination_equipment"] = x.delivery + "|" + x.equipment
        distance = numeric_column(frame, "distance")
        if (~np.isfinite(distance) | (distance <= 0)).any():
            raise ValueError("Distance must be positive and finite.")
        x["thousand_miles"] = distance / 1000
        x["inverse_distance"] = 100 / distance
        x["log_distance"] = np.log(distance / 1000)
        x["log_distance_squared"] = x.log_distance ** 2
        weight = numeric_column(frame, "weight").where(lambda s: s > 0)
        x["weight_missing"] = weight.isna().astype(float)
        x["weight_scaled"] = (weight.fillna(x.equipment.map(self.weights))
                              .fillna(self.weight_default) - 32000) / 10000
        x["heavy"] = x.weight_scaled.clip(lower=0)
        market = numeric_column(frame, "market_index")
        x["market_missing"] = market.isna().astype(float)
        # Only use already available market observations from the fitted training period.
        market_by_date = self.market_daily.reindex(pd.DatetimeIndex(dates), method="ffill")
        x["market"] = market.fillna(pd.Series(market_by_date.to_numpy(), index=x.index)).fillna(self.market_default) - 1
        for equip, prefix in [("Flatbed", "flat"), ("Reefer", "reefer")]:
            x[prefix + "_market"] = x.market * x.equipment.eq(equip)
            x[prefix + "_weight"] = x.weight_scaled * x.equipment.eq(equip)
        for axis in ("lat", "lon"):
            values = []
            for endpoint in CITIES:
                coord = numeric_column(frame, endpoint + "_" + axis)
                values.append(coord.fillna(x[endpoint].map(self.coords[axis])).fillna(0))
            x[axis + "_delta"] = (values[1] - values[0]) / 10
        return x

    def fit(self, frame):
        if frame.load_id.duplicated().any() or frame.load_id.isna().any():
            raise ValueError("Training IDs must be present and unique.")
        dates = pd.to_datetime(frame.date)
        self.first_date = dates.min()
        clean_weights = frame.weight.where(frame.weight > 0)
        self.weights = clean_weights.groupby(frame.equipment).median()
        self.weight_default = clean_weights.median()
        self.market_daily = frame.market_index.groupby(dates).median().rolling(7, min_periods=1).median()
        self.market_default = frame.market_index.median()
        self.coords = {}
        for axis in ("lat", "lon"):
            pairs = [pd.Series(frame[ep + "_" + axis].to_numpy(), index=frame[ep]) for ep in CITIES]
            self.coords[axis] = pd.concat(pairs).groupby(level=0).median()
        categories = BASE_CATEGORIES + (DETAIL_CATEGORIES if self.detailed else [])
        numbers = BASE_NUMBERS + (DETAIL_NUMBERS if self.detailed else [])
        self.encoder = ColumnTransformer([
            ("categories", OneHotEncoder(handle_unknown="ignore"), categories), ("numbers", "passthrough", numbers)
        ], sparse_threshold=1.0)
        matrix = self.encoder.fit_transform(self._features(frame))
        target = (frame.posted_rate / frame.distance).to_numpy()
        if (~np.isfinite(target) | (target <= 0)).any():
            raise ValueError("Training targets must be positive and finite.")
        weights = np.ones(len(target))
        # Iteratively reweighted ridge implements a Huber loss on rate per mile.
        # Abnormal labels retain bounded influence without exclusion from evaluation.
        self.regressor = Ridge(alpha=5.0, solver="lsqr", tol=1e-7)
        for _ in range(5):
            self.regressor.fit(matrix, target, sample_weight=weights)
            residual = target - self.regressor.predict(matrix)
            scale = np.median(np.abs(residual - np.median(residual))) / 0.67449
            weights = np.minimum(1., max(1.35 * scale, 1e-5) / np.maximum(np.abs(residual), 1e-8))
        return self

    def predict(self, frame):
        matrix = self.encoder.transform(self._features(frame))
        return np.maximum(0.01, frame.distance.to_numpy() * self.regressor.predict(matrix))


def metrics(actual, prediction):
    error = np.asarray(actual) - np.asarray(prediction)
    return {"mae": float(np.mean(abs(error))), "rmse": float(np.sqrt(np.mean(error ** 2))),
            "median_abs_error": float(np.median(abs(error)))}


def solve(data, output):
    development = pd.read_csv(data / "train_test.csv")
    validation = pd.read_csv(data / "validation.csv")
    december = pd.read_csv(data / "december_chart_inputs.csv")
    template = pd.read_csv(data / "validation_predictions_template.csv")
    if development.load_id.isin(validation.load_id).any():
        raise ValueError("Development and prediction identifiers overlap.")
    results = []
    # July/August for design comparison; Sept/Oct reserved for final evaluation.
    chosen = None
    for start, end in [("2025-07-01", "2025-09-01"), ("2025-09-01", "2025-11-01")]:
        train = development[development.date < start]
        test = development[(development.date >= start) & (development.date < end)]
        baseline = (train.posted_rate / train.distance).groupby(train.equipment).median()
        res = {"start":start, "end_exclusive":end, "train_n":len(train), "test_n":len(test),
               "baseline":metrics(test.posted_rate, test.distance * test.equipment.map(baseline))}
        candidates = ("main_effects", "with_interactions") if chosen is None else (chosen,)
        for name in candidates:
            model = FreightModel(detailed=name == "with_interactions").fit(train)
            res[name] = metrics(test.posted_rate, model.predict(test))
            if chosen is not None:
                res["chart_schema"] = metrics(test.posted_rate, model.predict(test[december.columns.drop("predicted_rate")]))
        if chosen is None:
            chosen = min(candidates, key=lambda n:res[n]["mae"])
        results.append(res)
    model = FreightModel(detailed=chosen == "with_interactions").fit(development)
    by_id = pd.Series(model.predict(validation), index=validation.load_id)
    if not by_id.index.is_unique or set(by_id.index) != set(template.load_id):
        raise ValueError("Prediction IDs must match the template.")
    template["predicted_rate"] = template.load_id.map(by_id).round(2)
    december["predicted_rate"] = model.predict(december).round(2)
    output.mkdir(parents=True, exist_ok=True)
    template.to_csv(output / "validation_predictions.csv", index=False, float_format="%.2f")
    december.to_csv(output / "december_predictions.csv", index=False, float_format="%.2f")
    stats = {"chosen":chosen, "folds":results, "training_rows":len(development),
             "bad_weights":int((development.weight <= 0).sum()), "missing_weights":int(development.weight.isna().sum()),
             "missing_market":int(development.market_index.isna().sum()),
             "unseen_cities":sorted((set(validation.pickup)|set(validation.delivery)) - (set(development.pickup)|set(development.delivery))),
             "rate_per_mile_percentiles":(development.posted_rate/development.distance).quantile([0,.01,.5,.99,1]).to_dict()}
    (output / "evaluation.json").write_text(json.dumps(stats, indent=2)+"\n")
    print(json.dumps(stats,indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, default=Path("data"))
    parser.add_argument("--output", type=Path, default=Path("."))
    args = parser.parse_args()
    solve(args.data, args.output)
