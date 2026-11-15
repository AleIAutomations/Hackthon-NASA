"""Aplica coerencia e deslocamento LOS REAIS do NISAR L2 GUNW as celulas de cada AOI.

Entrada : data_pipeline/downloads_gunw/<aoi>/*.h5 (NISAR GUNW, fase desenrolada)
Saida   : atualiza risk_grid.geojson / cells.geojson:
          coherence_l_band, los_displacement_mm (relativo a mediana da AOI),
          insar_origin="measured", insar_pair; e recalcula o score.
Nota    : deslocamento = fase * lambda/(4*pi), banda L (lambda ~ 0,2384 m). Sem correcao
          atmosferica/ionosferica completa; e um sinal relativo, nao deformacao absoluta.
O score continua "estimated" enquanto usar chuva de cenario (simulada).
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import h5py
import numpy as np
from pyproj import Transformer

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ml_risk_model import score_cells  # noqa: E402

CACHE = Path(__file__).resolve().parents[1] / "backend" / "data_cache"
DOWN = Path(__file__).resolve().parent / "downloads_gunw"
LAMBDA_M = 0.2384
HALF_M = 150.0


def _find_group(h: h5py.File) -> h5py.Group:
    base = h["science/LSAR/GUNW/grids/frequencyA"]
    for name in ("unwrappedInterferogram/HH", "unwrappedInterferogram/HV"):
        if name in base:
            return base[name]
    raise KeyError("sem unwrappedInterferogram")


def apply(aoi: str) -> dict:
    files = sorted((DOWN / aoi).glob("*.h5"))
    if not files:
        return {"aoi": aoi, "status": "sem arquivo"}
    f = files[0]
    dates = re.findall(r"_(\d{8})T\d{6}_", f.name)
    pair = "/".join(f"{d[:4]}-{d[4:6]}-{d[6:]}" for d in dates[:2]) if dates else None
    grid_path = CACHE / aoi / "risk_grid.geojson"
    fc = json.loads(grid_path.read_text(encoding="utf-8"))
    feats = fc["features"]
    with h5py.File(f, "r") as h:
        g = _find_group(h)
        base = h["science/LSAR/GUNW/grids/frequencyA"]
        epsg = int(g["projection"][()]) if "projection" in g else int(base["projection"][()])
        grp = g if "xCoordinates" in g else base
        x, y = grp["xCoordinates"][:], grp["yCoordinates"][:]
        T = Transformer.from_crs(4326, epsg, always_xy=True)
        pts = [T.transform(*ft["geometry"]["coordinates"][:2]) for ft in feats]
        pad = HALF_M + 200
        ix = np.where((x >= min(p[0] for p in pts) - pad) & (x <= max(p[0] for p in pts) + pad))[0]
        iy = np.where((y >= min(p[1] for p in pts) - pad) & (y <= max(p[1] for p in pts) + pad))[0]
        if not len(ix) or not len(iy):
            return {"aoi": aoi, "status": "AOI fora da cena"}
        sl = (slice(iy.min(), iy.max() + 1), slice(ix.min(), ix.max() + 1))
        ph = g["unwrappedPhase"][sl].astype("float64")
        if "ionospherePhaseScreen" in g:  # remove a componente ionosferica estimada pelo produto
            ion = g["ionospherePhaseScreen"][sl].astype("float64")
            ph = ph - np.where(np.isfinite(ion), ion, 0.0)
        coh = g["coherenceMagnitude"][sl].astype("float64")
        xs, ys = x[ix], y[iy]
        wcoh = None
        base_w = base["wrappedInterferogram"]
        wg = base_w["HH"] if "HH" in base_w else None
        if wg is not None and "coherenceMagnitude" in wg:
            wx, wy = wg["xCoordinates"][:], wg["yCoordinates"][:]
            wix = np.where((wx >= xs.min() - 40) & (wx <= xs.max() + 40))[0]
            wiy = np.where((wy >= ys.min() - 40) & (wy <= ys.max() + 40))[0]
            if len(wix) and len(wiy):
                wcoh = (wg["coherenceMagnitude"][wiy.min():wiy.max() + 1, wix.min():wix.max() + 1].astype("float64"),
                        wx[wix], wy[wiy])
    ph[~np.isfinite(ph) | (ph == 0)] = np.nan
    if not np.isfinite(ph).any():
        ph[:] = np.nan
    coh[~np.isfinite(coh)] = np.nan
    ref = np.nanmedian(ph) if np.isfinite(ph).any() else 0.0
    disp = -(ph - ref) * LAMBDA_M / (4 * np.pi) * 1000.0  # mm, negativo = afastando do satelite
    n_ok = 0
    n_los = 0
    for ft, (cx, cy) in zip(feats, pts):
        c0, c1 = np.searchsorted(xs, [cx - HALF_M, cx + HALF_M])
        r = np.where((ys >= cy - HALF_M) & (ys <= cy + HALF_M))[0]
        if c1 <= c0 or not len(r):
            continue
        d = disp[r.min():r.max() + 1, c0:c1]
        c = coh[r.min():r.max() + 1, c0:c1]
        p = ft["properties"]
        have_los = np.isfinite(d).mean() >= 0.5 and np.isfinite(c).mean() >= 0.5
        if have_los:
            p["coherence_l_band"] = round(float(np.nanmean(c)), 3)
            p["los_displacement_mm"] = round(float(np.nanmean(d)), 2)
            p["los_origin"] = "measured"
            n_los += 1
        elif wcoh is not None:
            wc, wxs, wys = wcoh
            a0, a1 = np.searchsorted(wxs, [cx - HALF_M, cx + HALF_M])
            rr = np.where((wys >= cy - HALF_M) & (wys <= cy + HALF_M))[0]
            if a1 <= a0 or not len(rr):
                continue
            cw = wc[rr.min():rr.max() + 1, a0:a1]
            if np.isfinite(cw).mean() < 0.5:
                continue
            p["coherence_l_band"] = round(float(np.nanmean(cw)), 3)
        else:
            continue
        p["coherence_origin"] = "measured"
        p["insar_pair"] = pair
        p["insar_granule"] = f.name
        n_ok += 1
    score_cells(feats)
    grid_path.write_text(json.dumps(fc, ensure_ascii=False), encoding="utf-8")
    cells_path = CACHE / aoi / "cells.geojson"
    if cells_path.exists():
        cc = json.loads(cells_path.read_text(encoding="utf-8"))
        by = {tuple(ft["geometry"]["coordinates"][:2]): ft["properties"] for ft in feats}
        for ft in cc["features"]:
            s = by.get(tuple(ft["geometry"]["coordinates"][:2]))
            if s and s.get("coherence_origin") == "measured":
                for k in ("coherence_l_band", "los_displacement_mm", "coherence_origin", "los_origin",
                          "insar_pair", "insar_granule", "risk_score", "alert_level",
                          "score_physical", "score_statistical"):
                    if k in s:
                        ft["properties"][k] = s[k]
        cells_path.write_text(json.dumps(cc, ensure_ascii=False), encoding="utf-8")
    return {"aoi": aoi, "granule": f.name, "pair": pair, "cells": len(feats), "coherence_cells": n_ok, "los_cells": n_los}


def main() -> None:
    for a in (sys.argv[1:] or ["serra-do-mar", "brumadinho"]):
        print(apply(a))


if __name__ == "__main__":
    main()
