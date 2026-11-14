"""Populacao exposta no poligono via grade WorldPop (~100 m)."""
from __future__ import annotations

from pathlib import Path
import numpy as np

try:
    import rasterio
    from rasterio.mask import mask
    from rasterio.warp import transform_geom
except ImportError:
    rasterio = None


def populacao_no_poligono(worldpop_tif: Path, polygon: dict) -> dict:
    """Soma a grade de populacao dentro do poligono GeoJSON."""
    if rasterio is None or not worldpop_tif.exists():
        return {
            "population_exposed": None,
            "method": "WorldPop TIF nao encontrado localmente",
        }
    with rasterio.open(worldpop_tif) as src:
        geom = transform_geom("EPSG:4326", src.crs, polygon)
        dados, _ = mask(src, [geom], crop=True, filled=True, nodata=0)
        total = float(np.nansum(dados[0]))
    return {
        "population_exposed": int(round(total)),
        "method": "WorldPop 100m grid (soma no poligono)",
    }
