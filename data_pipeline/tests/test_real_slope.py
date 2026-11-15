import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from real_slope import decode_terrarium, lonlat_to_tile, slope_deg


def test_decode_terrarium_sea_level_and_1000m():
    rgb = np.array([[[128, 0, 0], [131, 232, 0]]], dtype=np.uint8)
    out = decode_terrarium(rgb)
    assert out[0, 0] == 0.0 and out[0, 1] == 1000.0


def test_slope_of_45_degree_plane():
    y, x = np.mgrid[0:20, 0:20]
    elev = x * 30.0  # sobe 30 m a cada pixel de 30 m
    s = slope_deg(elev, 30.0, 30.0)
    assert abs(s[10, 10] - 45.0) < 0.1


def test_tile_coords_equator_prime_meridian():
    x, y = lonlat_to_tile(0.0, 0.0, 1)
    assert abs(x - 1.0) < 1e-9 and abs(y - 1.0) < 1e-9


def test_cache_uses_real_terrain_slope():
    import json
    from pathlib import Path

    root = Path(__file__).resolve().parents[2] / "backend" / "data_cache"
    for aoi in ("serra-do-mar", "brumadinho"):
        feats = json.loads((root / aoi / "risk_grid.geojson").read_text())["features"]
        assert all(f["properties"].get("slope_origin") == "derived" for f in feats)
        assert all(f["properties"]["data_origin"] == "estimated" for f in feats)
        assert max(f["properties"]["slope_deg"] for f in feats) < 60
