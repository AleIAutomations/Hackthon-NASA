"""Recorta um raster para o WKT da AOI e reprojeta p/ EPSG:4326."""
from __future__ import annotations

from pathlib import Path
import rasterio
from rasterio.mask import mask
from rasterio.warp import calculate_default_transform, reproject, Resampling, transform_geom
from shapely import wkt as shapely_wkt


def recortar(src_path: Path, aoi_wkt: str, out_path: Path) -> Path:
    geom = shapely_wkt.loads(aoi_wkt)
    with rasterio.open(src_path) as src:
        # o poligono esta em EPSG:4326; reprojetar para o CRS do raster
        geom_proj = transform_geom("EPSG:4326", src.crs, geom.__geo_interface__)
        out_img, out_transform = mask(src, [geom_proj], crop=True)
        out_meta = src.meta.copy()
        out_meta.update({
            "height": out_img.shape[1],
            "width": out_img.shape[2],
            "transform": out_transform,
        })
    with rasterio.open(out_path, "w", **out_meta) as dst:
        dst.write(out_img)
    return out_path


def reprojetar_4326(src_path: Path, out_path: Path) -> Path:
    with rasterio.open(src_path) as src:
        transform, largura, altura = calculate_default_transform(
            src.crs, "EPSG:4326", src.width, src.height, *src.bounds
        )
        meta = src.meta.copy()
        meta.update({
            "crs": "EPSG:4326",
            "transform": transform,
            "width": largura,
            "height": altura,
        })
        with rasterio.open(out_path, "w", **meta) as dst:
            for banda in range(1, src.count + 1):
                reproject(
                    source=rasterio.band(src, banda),
                    destination=rasterio.band(dst, banda),
                    src_transform=src.transform,
                    src_crs=src.crs,
                    dst_transform=transform,
                    dst_crs="EPSG:4326",
                    resampling=Resampling.bilinear,
                )
    return out_path
