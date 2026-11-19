"""Checkpoint classification and distance-weighted route comparisons."""
from bisect import bisect_right

LEVELS = ("Low", "Moderate", "High", "Severe", "No Travel")


def risk(wind, rain, snow, load):
    """Shared cutoffs take the higher class, except the explicit > maxima."""
    wind_band = bisect_right((25, 35, 45, 55), wind)
    rain_band = 4 if rain > 1 else bisect_right((0.10, 0.25, 0.50), rain)
    snow_band = 4 if snow > 3 else bisect_right((0.5, 1, 2), snow)
    if wind >= 45 and load > 30000:
        wind_band = 4
    elif wind >= 35 and load > 40000:
        wind_band = max(3, wind_band)
    return max(wind_band, rain_band, snow_band)


def summarize(points, miles):
    # Use the more hazardous endpoint for each interval. A short final
    # segment contributes only its actual length to the exposure totals.
    totals = [0.] * len(LEVELS)
    for left, right in zip(points, points[1:]):
        level = max(LEVELS.index(left["level"]), LEVELS.index(right["level"]))
        totals[level] += right["mile"] - left["mile"]
    return {
        "peak": max((p["level"] for p in points), key=LEVELS.index),
        "no_travel_miles": totals[4], "severe_miles": totals[3],
        "high_miles": totals[2],
        "average_risk": sum(i * distance for i, distance in enumerate(totals)) / miles,
    }


def recommend(routes):
    eligible = [r for r in routes if r["peak"] != "No Travel"]
    if eligible:
        return min(eligible, key=lambda r: (r["severe_miles"], r["high_miles"],
                   r["average_risk"], r["duration_seconds"], r["id"]))["id"]
    return None
