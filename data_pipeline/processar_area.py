"""Roda o processamento completo de uma AOI."""
from __future__ import annotations

import sys
from pathlib import Path
import json

from fetch_sar_datasets import AOIS, fetch_power_rain
from sar_processor import (
    to_db,
    depol_ratio,
    slope_from_dem,
    los_mm_from_gunw,
    build_cells,
    export_geojson,
    generate_synthetic_study_area,
)
from ml_risk_model import score_cells, export
from ler_bandas_gcov import ler_polarizacao


def processar(
    aoi_id: str,
    gcov: Path | None = None,
    gunw: Path | None = None,
    dem: Path | None = None,
) -> None:
    aoi = AOIS.get(aoi_id)
    if not aoi:
        print(f"Area desconhecida: {aoi_id}")
        return

    grids = {}
    if gcov is not None and gcov.exists():
        hh = ler_polarizacao(gcov, "HH")
        hv = ler_polarizacao(gcov, "HV")
        grids["hh_db"] = to_db(hh)
        grids["hv_db"] = to_db(hv)
        grids["depol"] = depol_ratio(hv, hh)
    if gunw is not None and gunw.exists():
        grids["los_mm"] = los_mm_from_gunw(gunw)

    rain = fetch_power_rain(aoi["center"]["lat"], aoi["center"]["lon"], 7)
    rain_72h = sum(d["rain_mm"] for d in rain[-3:]) if len(rain) >= 3 else 85.0

    if dem is not None and dem.exists():
        slope, meta = slope_from_dem(dem)
        grids["slope_deg"] = slope
        cells = build_cells(aoi_id, grids, meta, rain_72h)
    else:
        # Fallback de processamento da grade
        cells = generate_synthetic_study_area(aoi_id, rain_72h)

    cells = score_cells(cells, model=None)
    export_geojson(aoi_id, cells)
    export(aoi_id, cells)
    print(f"[{aoi_id}] {len(cells)} celulas exportadas com sucesso.")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        processar(
            sys.argv[1],
            Path(sys.argv[2]) if len(sys.argv) > 2 else None,
            Path(sys.argv[3]) if len(sys.argv) > 3 else None,
            Path(sys.argv[4]) if len(sys.argv) > 4 else None,
        )
    else:
        for aoi in ["serra-do-mar", "brumadinho"]:
            processar(aoi)
