"""Converte um GeoTIFF comum em Cloud-Optimized GeoTIFF."""
from __future__ import annotations

from pathlib import Path
from rasterio.shutil import copy as rio_copy


def para_cog(src: Path, out: Path) -> Path:
    rio_copy(
        src,
        out,
        driver="COG",
        compress="deflate",
        overview_resampling="average",
    )
    return out
