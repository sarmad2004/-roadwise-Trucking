"""Deterministic assessment fixture. Paths are generalized, weather is synthetic.

No external calls are made. These coordinates illustrate corridors and must
never be used for turn-by-turn guidance. Speeds represent scenario assumptions.
"""
from datetime import timedelta, timezone
from math import asin, cos, exp, hypot, radians, sin, sqrt

DALLAS = (-96.7970, 32.7767)
OKLAHOMA_CITY = (-97.5164, 35.4676)

# (longitude, latitude), in travel order. The west and central alternatives
# share I-35E through Gainesville before diverging toward US-82 and I-35.
DALLAS_GAINSVILLE = (
    DALLAS, (-96.8210, 32.7884), (-96.8502, 32.8140),
    (-96.8716, 32.8349), (-96.8984, 32.9095), (-96.9007, 32.9633),
    (-96.9216, 32.9952), (-96.9741, 33.0278), (-96.9911, 33.0705),
    (-97.0139, 33.1008), (-97.0330, 33.1281), (-97.0536, 33.1372),
    (-97.0999, 33.1513), (-97.1209, 33.1846), (-97.1579, 33.1874),
    (-97.1800, 33.2149), (-97.1763, 33.2303), (-97.1790, 33.2631), (-97.1764, 33.2804),
    (-97.1781, 33.3671), (-97.1685, 33.4452), (-97.1658, 33.5728),
    (-97.1528, 33.6342),
)

CENTRAL = DALLAS_GAINSVILLE + (
    (-97.1527, 33.6711), (-97.1554, 33.6824), (-97.1542, 33.7316), (-97.1455, 33.7756),
    (-97.1443, 33.8303), (-97.1361, 33.8868), (-97.1406, 33.9490),
    (-97.1444, 34.0238), (-97.1515, 34.0883), (-97.1771, 34.1250),
    (-97.1732, 34.1755), (-97.1699, 34.1882), (-97.1680, 34.2007), (-97.1759, 34.2753), (-97.1437, 34.3496),
    (-97.1474, 34.4047), (-97.1681, 34.4542), (-97.1616, 34.5040),
    (-97.1901, 34.5719), (-97.2167, 34.6244), (-97.2543, 34.6719),
    (-97.2435, 34.7086), (-97.2628, 34.7338), (-97.3036, 34.7962), (-97.3826, 34.8928),
    (-97.4001, 34.9402), (-97.4848, 35.1090), (-97.4805, 35.1756),
    (-97.4980, 35.1836), (-97.4864, 35.2201), (-97.4876, 35.3123), (-97.4924, 35.3802),
    (-97.4880, 35.4318), (-97.4857, 35.4531), (-97.5081, 35.4538),
    OKLAHOMA_CITY,
)
WEST = DALLAS_GAINSVILLE + (
    (-97.1547, 33.6516), (-97.2123, 33.6490), (-97.3080, 33.6483),
    (-97.3761, 33.6495), (-97.4955, 33.6904), (-97.5871, 33.6977),
    (-97.6795, 33.7587), (-97.7281, 33.7755), (-97.8647, 33.7851),
    (-97.9334, 33.8111), (-97.9414, 33.8764), (-97.9386, 33.9127),
    (-97.9514, 33.9569), (-97.9517, 34.0209), (-97.9514, 34.0957),
    (-98.0122, 34.1654), (-98.0124, 34.2556), (-97.9572, 34.3491),
    (-97.9591, 34.4540), (-97.9717, 34.5056), (-97.9613, 34.5899),
    (-97.9571, 34.6427), (-97.9496, 34.7148), (-97.9602, 34.8125),
    (-97.9604, 34.9200), (-97.9466, 35.0042), (-97.9339, 35.0455),
    (-97.9032, 35.0643), (-97.8371, 35.1247), (-97.7603, 35.1747),
    (-97.6792, 35.2381), (-97.6215, 35.2888), (-97.6039, 35.3384),
    (-97.6010, 35.3864), (-97.5791, 35.4094), (-97.5750, 35.4447),
    (-97.5498, 35.4582), OKLAHOMA_CITY,
)
EAST = (
    DALLAS, (-96.7919, 32.7883), (-96.7822, 32.8123), (-96.7714, 32.8558),
    (-96.7688, 32.9091), (-96.7398, 32.9603), (-96.7060, 33.0170),
    (-96.6820, 33.0582), (-96.6722, 33.1075), (-96.6551, 33.1514),
    (-96.6374, 33.1731), (-96.6366, 33.2160), (-96.6043, 33.2922),
    (-96.5852, 33.3450), (-96.5896, 33.3576), (-96.5822, 33.4500), (-96.5831, 33.5305),
    (-96.6107, 33.6072), (-96.6128, 33.6729), (-96.5815, 33.7319),
    (-96.5479, 33.7902), (-96.5330, 33.8301), (-96.5007, 33.8836),
    (-96.4477, 33.9420), (-96.4299, 33.9983), (-96.4039, 34.0329),
    (-96.4129, 34.0578), (-96.4098, 34.0870), (-96.3796, 34.1525),
    (-96.3540, 34.2195), (-96.3035, 34.2862), (-96.2314, 34.3527),
    (-96.1565, 34.3833), (-96.1797, 34.4169), (-96.2495, 34.4561),
    (-96.3513, 34.4997), (-96.4432, 34.5592), (-96.5085, 34.6423),
    (-96.5877, 34.7067), (-96.6551, 34.7562), (-96.6763, 34.7915),
    (-96.6895, 34.8675), (-96.6851, 34.9589), (-96.6782, 35.0349),
    (-96.6718, 35.1111), (-96.6696, 35.1885), (-96.6712, 35.2534),
    (-96.6616, 35.3194), (-96.6570, 35.4266), (-96.7303, 35.4151),
    (-96.8366, 35.4100), (-96.9136, 35.3952), (-96.9967, 35.3784),
    (-97.0935, 35.3751), (-97.1892, 35.3790), (-97.2678, 35.4035),
    (-97.3432, 35.4229), (-97.4190, 35.4382), (-97.4816, 35.4534),
    OKLAHOMA_CITY,
)


def _miles(first, second):
    lon1, lat1 = map(radians, first)
    lon2, lat2 = map(radians, second)
    d = sin((lat2 - lat1) / 2) ** 2 + cos(lat1) * cos(lat2) * sin((lon2 - lon1) / 2) ** 2
    return 7917.52 * asin(sqrt(min(1.0, d)))


def demo_routes():
    routes = []
    for name, shape, speed in (
        ("I-35 via Ardmore", CENTRAL, 63),
        ("US-81 via Duncan", WEST, 56),
        ("US-75 via Durant", EAST, 59),
    ):
        distances = [_miles(a, b) for a, b in zip(shape, shape[1:])]
        # City segments have a slower assumed speed than open-road segments.
        times = [
            miles * 3600 / (speed - 18 if i < 4 or i >= len(distances) - 3 else speed)
            for i, miles in enumerate(distances)
        ]
        routes.append(dict(name=name, geometry=[list(p) for p in shape],
                           miles=sum(distances), duration_seconds=sum(times),
                           segment_miles=distances, segment_seconds=times))
    return routes


def demo_weather(points, start, end):
    """Produce hourly UTC fixtures, including both endpoint hours."""
    if start.utcoffset() is None or end.utcoffset() is None or end < start:
        raise ValueError("A valid timezone-aware weather interval is required.")
    start_hour = start.astimezone(timezone.utc).replace(minute=0, second=0, microsecond=0)
    end_hour = end.astimezone(timezone.utc).replace(minute=0, second=0, microsecond=0)
    hours = range(int((end_hour - start_hour).total_seconds() // 3600) + 1)
    stamps = [(start_hour + timedelta(hours=h)).strftime("%Y-%m-%dT%H:%M:%SZ") for h in hours]
    result = []
    for lon, lat in points:
        wind, rain, snow = [], [], []
        for h in hours:
            # A moving central wind band and an eastern rain band let reviewers
            # inspect different ETA-based and slider-based risk classifications.
            wind_lon = -97.18 + 0.28 * sin(h / 8)
            gust = 16 + 34 * exp(-hypot((lon-wind_lon)/0.37, (lat-34.45)/0.90)**2)
            rain_lat = 34.38 + 0.20 * sin(h / 12)
            shower = 0.02 + 0.70 * exp(-hypot((lon+96.42)/0.36, (lat-rain_lat)/0.82)**2)
            snow_band = 0.68 * exp(-hypot((lon+97.47)/0.35, (lat-35.24)/0.20)**2)
            wind.append(round(gust, 2))
            rain.append(round(shower, 3))
            snow.append(round(snow_band * max(0.0, sin((h-9)/8)), 3))
        result.append(dict(times=stamps.copy(), wind=wind, rain=rain, snow=snow))
    return result
