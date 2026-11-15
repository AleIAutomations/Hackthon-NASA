"""Aplica a inclinacao REAL (derivada de DEM publico) as celulas do cache e recalcula o risco.

Entrada : backend/data_cache/<aoi>/terrain_real.json (gerado por real_slope.py)
Saida   : atualiza risk_grid.geojson e cells.geojson com slope_deg/elevation_m reais.

Honestidade: a inclinacao passa a ser "derivada" de um DEM medido. Camadas SAR
(sigma0, coerencia, LOS) continuam sinteticas, entao data_origin permanece
"estimated" para o score completo.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ml_risk_model import score_cells  # noqa: E402

CACHE = Path(__file__).resolve().parents[1] / "backend" / "data_cache"
AOIS = ("serra-do-mar", "brumadinho")
# Cenario de demo: chuva que satura o solo (simulado, nao observado)
SCENARIO_RAIN_MM = 150.0


def _key(lon: float, lat: float) -> tuple[float, float]:
    return (round(lon, 4), round(lat, 4))


def apply(aoi_id: str) -> dict:
    d = CACHE / aoi_id
    terrain = json.loads((d / "terrain_real.json").read_text(encoding="utf-8"))
    lut = {_key(c["lon"], c["lat"]): c for c in terrain["cells"]}
    stats = {"cells": 0, "matched": 0}
    for name in ("risk_grid.geojson", "cells.geojson"):
        p = d / name
        if not p.exists():
            continue
        fc = json.loads(p.read_text(encoding="utf-8"))
        feats = fc["features"]
        for f in feats:
            lon, lat = f["geometry"]["coordinates"][:2]
            t = lut.get(_key(lon, lat))
            if name == "risk_grid.geojson":
                stats["cells"] += 1
            if t is None:
                continue
            if name == "risk_grid.geojson":
                stats["matched"] += 1
            pr = f["properties"]
            pr["rain_72h_mm"] = SCENARIO_RAIN_MM
            pr["slope_deg"] = t["slope_deg"]
            pr["elevation_m"] = t["elev_m"]
            pr["slope_origin"] = "derived"
            pr["slope_source"] = terrain["source"]
        if name == "risk_grid.geojson":
            score_cells(feats)
        p.write_text(json.dumps(fc, ensure_ascii=False), encoding="utf-8")
    return stats


def main() -> None:
    for a in AOIS:
        s = apply(a)
        fc = json.loads((CACHE / a / "risk_grid.geojson").read_text(encoding="utf-8"))
        lv = {}
        for f in fc["features"]:
            k = f["properties"]["alert_level"]
            lv[k] = lv.get(k, 0) + 1
        print(a, s, lv)


if __name__ == "__main__":
    main()
