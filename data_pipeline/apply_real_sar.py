"""Aplica retroespalhamento NISAR REAL (GCOV L-band) as celulas de cada AOI.

Entrada : data_pipeline/downloads/<aoi>/*.h5 (NISAR L2 GCOV, baixado com token Earthdata)
Saida   : atualiza risk_grid.geojson e cells.geojson com sigma0_hh_db, sigma0_hv_db,
          depol_ratio_hv_hh e sar_origin="measured" + granulo/data, SOMENTE nas
          celulas com pixels validos. Coerencia e LOS continuam estimadas (precisam de GUNW).
O risk_score nao usa sigma0; portanto data_origin do score continua "estimated".
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import h5py
import numpy as np
from pyproj import Transformer

CACHE = Path(__file__).resolve().parents[1] / "backend" / "data_cache"
DOWN = Path(__file__).resolve().parent / "downloads"
HALF_M = 150.0  # celula ~300 m


def _db(lin: float) -> float:
    return round(float(10.0 * np.log10(lin)), 3)


def apply(aoi: str) -> dict:
    files = sorted((DOWN / aoi).glob("*.h5"))
    if not files:
        return {"aoi": aoi, "status": "sem arquivo"}
    f = files[0]
    m = re.search(r"_(\d{8})T\d{6}_", f.name)
    date = f"{m.group(1)[:4]}-{m.group(1)[4:6]}-{m.group(1)[6:]}" if m else None
    grid_path = CACHE / aoi / "risk_grid.geojson"
    fc = json.loads(grid_path.read_text(encoding="utf-8"))
    feats = fc["features"]
    with h5py.File(f, "r") as h:
        g = h["science/LSAR/GCOV/grids/frequencyA"]
        epsg = int(g["projection"][()])
        T = Transformer.from_crs(4326, epsg, always_xy=True)
        x = g["xCoordinates"][:]
        y = g["yCoordinates"][:]
        dx = float(g["xCoordinateSpacing"][()])
        pts = [T.transform(*ft["geometry"]["coordinates"][:2]) for ft in feats]
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        pad = HALF_M + 2 * dx
        ix = np.where((x >= min(xs) - pad) & (x <= max(xs) + pad))[0]
        iy = np.where((y >= min(ys) - pad) & (y <= max(ys) + pad))[0]
        if not len(ix) or not len(iy):
            return {"aoi": aoi, "status": "AOI fora da cena"}
        xs_sub, ys_sub = x[ix], y[iy]
        sl = (slice(iy.min(), iy.max() + 1), slice(ix.min(), ix.max() + 1))
        hh = g["HHHH"][sl]
        hv = g["HVHV"][sl]
    n_ok = 0
    for ft, (cx, cy) in zip(feats, pts):
        c0, c1 = np.searchsorted(xs_sub, [cx - HALF_M, cx + HALF_M])
        # y decresce com o indice
        r_idx = np.where((ys_sub >= cy - HALF_M) & (ys_sub <= cy + HALF_M))[0]
        if c1 <= c0 or not len(r_idx):
            continue
        a = hh[r_idx.min():r_idx.max() + 1, c0:c1]
        b = hv[r_idx.min():r_idx.max() + 1, c0:c1]
        ok = np.isfinite(a) & np.isfinite(b) & (a > 0) & (b > 0)
        if ok.mean() < 0.5:
            continue
        mh, mv = float(a[ok].mean()), float(b[ok].mean())
        p = ft["properties"]
        p["sigma0_hh_db"] = _db(mh)
        p["sigma0_hv_db"] = _db(mv)
        p["depol_ratio_hv_hh"] = round(mv / mh, 3)
        p["sar_origin"] = "measured"
        p["sar_granule"] = f.name
        p["sar_date"] = date
        n_ok += 1
    grid_path.write_text(json.dumps(fc, ensure_ascii=False), encoding="utf-8")
    cells_path = CACHE / aoi / "cells.geojson"
    if cells_path.exists():
        cc = json.loads(cells_path.read_text(encoding="utf-8"))
        by = {tuple(ft["geometry"]["coordinates"][:2]): ft["properties"] for ft in feats}
        for ft in cc["features"]:
            src = by.get(tuple(ft["geometry"]["coordinates"][:2]))
            if src and src.get("sar_origin") == "measured":
                for k in ("sigma0_hh_db", "sigma0_hv_db", "depol_ratio_hv_hh",
                          "sar_origin", "sar_granule", "sar_date"):
                    ft["properties"][k] = src[k]
        cells_path.write_text(json.dumps(cc, ensure_ascii=False), encoding="utf-8")
    return {"aoi": aoi, "granule": f.name, "date": date, "cells": len(feats), "measured_cells": n_ok}


def main() -> None:
    for a in (sys.argv[1:] or ["serra-do-mar", "brumadinho"]):
        print(apply(a))


if __name__ == "__main__":
    main()
