"""Processamento SAR e fusao com relevo/chuva - TerraAlerta.

Converte produtos brutos em malha de celulas GeoJSON com propriedades fisicas.
Cada propriedade marca a origem: measured, derived ou estimated.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np

try:
    import rasterio
    from rasterio.transform import from_origin
except ImportError:
    rasterio = None

REPO_ROOT = Path(__file__).resolve().parent.parent
CACHE_DIR = REPO_ROOT / "backend" / "data_cache"

CELL_DEG = 0.0003  # ~30 m na latitude das AOIs


def to_db(power: np.ndarray) -> np.ndarray:
    """Converte potencia linear para dB, protegendo zeros."""
    power = np.asarray(power, dtype=float)
    with np.errstate(divide="ignore", invalid="ignore"):
        db = 10.0 * np.log10(np.where(power > 0, power, np.nan))
    return db


def depol_ratio(hv: np.ndarray, hh: np.ndarray) -> np.ndarray:
    """Razao HV/HH em escala linear (indicador de volume/rugosidade)."""
    hv = np.asarray(hv, dtype=float)
    hh = np.asarray(hh, dtype=float)
    with np.errstate(divide="ignore", invalid="ignore"):
        return np.where(hh > 0, hv / hh, np.nan)


def slope_from_dem(dem_path: Path) -> tuple[np.ndarray, dict]:
    """Declividade em graus a partir do DEM (gradiente central)."""
    if rasterio is not None and dem_path.exists():
        with rasterio.open(dem_path) as src:
            dem = src.read(1).astype("float32")
            transform = src.transform
            res_x, res_y = abs(transform.a), abs(transform.e)
        gy, gx = np.gradient(dem, res_y, res_x)
        slope = np.degrees(np.arctan(np.hypot(gx, gy)))
        return slope, {"transform": transform}
    raise FileNotFoundError(f"DEM nao encontrado: {dem_path}")


def los_mm_from_gunw(gunw_path: Path) -> np.ndarray:
    """Deslocamento LOS em mm a partir do interferograma desenrolado.

    deslocamento = fase * lambda / (4 * pi); lambda banda L ~ 0.24 m.
    """
    wavelength_m = 0.24
    if rasterio is not None and gunw_path.exists():
        with rasterio.open(gunw_path) as src:
            phase = src.read(1).astype("float32")
        return phase * wavelength_m / (4 * math.pi) * 1000.0
    raise FileNotFoundError(f"GUNW nao encontrado: {gunw_path}")


def _val(arr, r, c):
    if arr is None:
        return None
    try:
        v = float(arr[r, c])
        return None if math.isnan(v) else round(v, 3)
    except Exception:
        return None


def _origin(grids, r, c) -> str:
    """measured so se veio de produto real; dados sinteticos/demo sao sempre estimated."""
    if grids.get("synthetic"):
        return "estimated"
    return "measured" if grids.get("los_mm") is not None else "estimated"


def build_cells(
    aoi_id: str,
    grids: dict[str, np.ndarray],
    meta: dict,
    rain_72h_mm: float,
) -> list[dict]:
    """Amostra as grades em celulas de ~30 m e monta as features."""
    features = []
    transform = meta["transform"]
    grid = grids["slope_deg"]
    rows, cols = grid.shape
    # step em pixels correspondente a CELL_DEG
    pixel_size = abs(transform.a) if hasattr(transform, "a") else 0.0001
    step = max(1, int(round(CELL_DEG / pixel_size)))

    for r in range(0, rows, step):
        for c in range(0, cols, step):
            if hasattr(transform, "__mul__"):
                x, y = transform * (c, r)
            else:
                x = transform[0] + c * transform[1]
                y = transform[3] + r * transform[5]

            cell = {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [round(x, 5), round(y, 5)]},
                "properties": {
                    "sigma0_hh_db": _val(grids.get("hh_db"), r, c),
                    "sigma0_hv_db": _val(grids.get("hv_db"), r, c),
                    "depol_ratio_hv_hh": _val(grids.get("depol"), r, c),
                    "coherence_l_band": _val(grids.get("coh_l"), r, c),
                    "coherence_c_band": _val(grids.get("coh_c"), r, c),
                    "los_displacement_mm": _val(grids.get("los_mm"), r, c),
                    "slope_deg": _val(grids.get("slope_deg"), r, c),
                    "rain_72h_mm": round(rain_72h_mm, 2),
                    "data_origin": _origin(grids, r, c),
                },
            }
            features.append(cell)
    return features


def export_geojson(aoi_id: str, features: list[dict]) -> Path:
    out = CACHE_DIR / aoi_id / "cells.geojson"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(
        json.dumps({"type": "FeatureCollection", "features": features}, ensure_ascii=False),
        encoding="utf-8",
    )
    return out


def generate_synthetic_study_area(aoi_id: str, rain_72h: float = 85.0) -> list[dict]:
    """Gera grade sintetica fisicamente coerente para a AOI se dados brutos de satelite nao estiverem baixados."""
    if aoi_id == "serra-do-mar":
        min_lon, max_lon, min_lat, max_lat = -45.48, -45.36, -23.82, -23.72
        # Serra com alta declividade na escarpa e vegetacao densa
        n_rows, n_cols = 40, 40
        lats = np.linspace(max_lat, min_lat, n_rows)
        lons = np.linspace(min_lon, max_lon, n_cols)
        slope = np.zeros((n_rows, n_cols), dtype=float)
        coh_c = np.zeros((n_rows, n_cols), dtype=float)
        coh_l = np.zeros((n_rows, n_cols), dtype=float)
        hh_db = np.zeros((n_rows, n_cols), dtype=float)
        hv_db = np.zeros((n_rows, n_cols), dtype=float)
        los_mm = np.zeros((n_rows, n_cols), dtype=float)

        rng = np.random.RandomState(42)
        for r in range(n_rows):
            for c in range(n_cols):
                dist_escarp = math.sin(r / 6.0) * math.cos(c / 8.0)
                # Escarpa da serra atinge 35-48 graus
                slope[r, c] = float(np.clip(22.0 + 24.0 * abs(dist_escarp) + rng.normal(0, 3), 4, 52))
                # Mata densa: banda C decorrelaciona (0.12 - 0.28), banda L penetra (0.55 - 0.78)
                coh_c[r, c] = float(np.clip(0.18 + rng.normal(0, 0.05), 0.05, 0.40))
                coh_l[r, c] = float(np.clip(0.68 + rng.normal(0, 0.06), 0.35, 0.90))
                hh_db[r, c] = float(np.clip(-8.5 + rng.normal(0, 1.2), -18, -2))
                hv_db[r, c] = float(np.clip(-14.0 + rng.normal(0, 1.5), -24, -8))
                # Deformacao lenta em taludes instaveis
                if slope[r, c] > 36.0:
                    los_mm[r, c] = float(-12.5 - 15.0 * (slope[r, c] - 36.0) / 12.0 + rng.normal(0, 2))
                else:
                    los_mm[r, c] = float(rng.normal(0, 1.5))

    else:  # brumadinho
        min_lon, max_lon, min_lat, max_lat = -44.18, -44.06, -20.18, -20.08
        n_rows, n_cols = 40, 40
        lats = np.linspace(max_lat, min_lat, n_rows)
        lons = np.linspace(min_lon, max_lon, n_cols)
        slope = np.zeros((n_rows, n_cols), dtype=float)
        coh_c = np.zeros((n_rows, n_cols), dtype=float)
        coh_l = np.zeros((n_rows, n_cols), dtype=float)
        hh_db = np.zeros((n_rows, n_cols), dtype=float)
        hv_db = np.zeros((n_rows, n_cols), dtype=float)
        los_mm = np.zeros((n_rows, n_cols), dtype=float)

        rng = np.random.RandomState(84)
        for r in range(n_rows):
            for c in range(n_cols):
                # Estruturas de barragem / cava de mineracao
                is_dam = (15 <= r <= 24) and (16 <= c <= 26)
                slope[r, c] = float(np.clip(28.0 + rng.normal(0, 4) if is_dam else 12.0 + rng.normal(0, 3), 2, 45))
                # Terreno mais aberto: coerencia C razoavel, L muito alta
                coh_c[r, c] = float(np.clip(0.48 + rng.normal(0, 0.08), 0.20, 0.75))
                coh_l[r, c] = float(np.clip(0.76 + rng.normal(0, 0.05), 0.50, 0.95))
                hh_db[r, c] = float(np.clip(-6.0 + rng.normal(0, 1.0), -15, 0))
                hv_db[r, c] = float(np.clip(-12.5 + rng.normal(0, 1.2), -20, -5))
                if is_dam:
                    los_mm[r, c] = float(-24.0 + rng.normal(0, 3))  # subsidencia acelerada
                else:
                    los_mm[r, c] = float(rng.normal(0, 1.2))

    class SimpleTransform:
        def __init__(self, x0, dx, y0, dy):
            self.a, self.b, self.c = dx, 0.0, x0
            self.d, self.e, self.f = 0.0, dy, y0

        def __mul__(self, coords):
            c, r = coords
            return (self.c + c * self.a, self.f + r * self.e)

    transform = SimpleTransform(min_lon, (max_lon - min_lon) / n_cols, max_lat, (min_lat - max_lat) / n_rows)
    depol = np.power(10.0, (hv_db - hh_db) / 10.0)

    grids = {
        "slope_deg": slope,
        "hh_db": hh_db,
        "hv_db": hv_db,
        "depol": depol,
        "coh_l": coh_l,
        "coh_c": coh_c,
        "los_mm": los_mm,
        "synthetic": True,  # grade de demonstracao: nunca rotular como measured
    }

    cells = build_cells(aoi_id, grids, {"transform": transform}, rain_72h)
    return cells
