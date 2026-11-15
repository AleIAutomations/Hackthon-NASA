"""Declividade real a partir de tiles publicos de elevacao (AWS Terrain Tiles, formato Terrarium).

Fonte: https://registry.opendata.aws/terrain-tiles/ (composto a partir de SRTM e outras fontes).
Nao requer login. Para cada celula da grade em backend/data_cache/<aoi>/risk_grid.geojson
grava elevacao e declividade em backend/data_cache/<aoi>/terrain_real.json.

Uso (precisa de rede):  python data_pipeline/real_slope.py
"""
from __future__ import annotations

import io
import json
import math
import sys
import urllib.request
from pathlib import Path

import numpy as np

REPO = Path(__file__).resolve().parent.parent
CACHE = REPO / "backend" / "data_cache"
URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
ZOOM = 12
SOURCE = "AWS Terrain Tiles (Terrarium; SRTM e outras fontes), zoom 12"


def lonlat_to_tile(lon: float, lat: float, z: int) -> tuple[float, float]:
    n = 2 ** z
    x = (lon + 180.0) / 360.0 * n
    y = (1.0 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2.0 * n
    return x, y


def decode_terrarium(rgb: np.ndarray) -> np.ndarray:
    r, g, b = (rgb[..., i].astype(np.float64) for i in range(3))
    return (r * 256.0 + g + b / 256.0) - 32768.0


def slope_deg(elev: np.ndarray, pixel_m_x: float, pixel_m_y: float) -> np.ndarray:
    dzdy, dzdx = np.gradient(elev, pixel_m_y, pixel_m_x)
    return np.degrees(np.arctan(np.hypot(dzdx, dzdy)))


def fetch_tile(z: int, x: int, y: int) -> np.ndarray:
    from PIL import Image

    with urllib.request.urlopen(URL.format(z=z, x=x, y=y), timeout=30) as r:
        img = Image.open(io.BytesIO(r.read())).convert("RGB")
    return decode_terrarium(np.asarray(img))


def process_aoi(aoi_id: str) -> dict:
    grid = json.loads((CACHE / aoi_id / "risk_grid.geojson").read_text(encoding="utf-8"))
    pts = [f["geometry"]["coordinates"] for f in grid["features"]]
    lons = [p[0] for p in pts]
    lats = [p[1] for p in pts]
    pad = 0.01
    x0, y1 = lonlat_to_tile(min(lons) - pad, min(lats) - pad, ZOOM)
    x1, y0 = lonlat_to_tile(max(lons) + pad, max(lats) + pad, ZOOM)
    tx0, tx1, ty0, ty1 = int(x0), int(x1), int(y0), int(y1)
    rows = []
    for ty in range(ty0, ty1 + 1):
        rows.append(np.hstack([fetch_tile(ZOOM, tx, ty) for tx in range(tx0, tx1 + 1)]))
    elev = np.vstack(rows)
    lat_c = (min(lats) + max(lats)) / 2
    m_per_px = 40075016.686 * math.cos(math.radians(lat_c)) / (256 * 2 ** ZOOM)
    slope = slope_deg(elev, m_per_px, m_per_px)
    out = []
    half = 4  # janela de ~9 px (~300 m) em volta do ponto da celula
    for lon, lat in pts:
        fx, fy = lonlat_to_tile(lon, lat, ZOOM)
        c = int((fx - tx0) * 256)
        r = int((fy - ty0) * 256)
        win = (slice(max(r - half, 0), r + half + 1), slice(max(c - half, 0), c + half + 1))
        out.append({
            "lon": lon, "lat": lat,
            "elev_m": round(float(elev[r, c]), 1),
            "slope_deg": round(float(np.mean(slope[win])), 2),
        })
    return {"aoi_id": aoi_id, "source": SOURCE, "pixel_m": round(m_per_px, 1), "cells": out}


def main() -> None:
    for aoi_id in ["serra-do-mar", "brumadinho"]:
        res = process_aoi(aoi_id)
        (CACHE / aoi_id / "terrain_real.json").write_text(json.dumps(res), encoding="utf-8")
        s = [c["slope_deg"] for c in res["cells"]]
        print(aoi_id, "cells", len(s), "slope min/mean/max", min(s), round(sum(s) / len(s), 1), max(s))


if __name__ == "__main__":
    sys.exit(main())
