"""Comparativo banda C vs banda L por sub-regiao da area."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

router = APIRouter()

COMPARE_CACHE: dict[str, list[dict]] = {
    "serra-do-mar": [
        {
            "label": "Mata Atlântica Densa",
            "coherence_c": 0.18,
            "coherence_l": 0.64,
            "sigma0_c_db": -11.2,
            "sigma0_l_db": -9.8,
            "n_cells": 4200,
        },
        {
            "label": "Encosta Aberta / Talude",
            "coherence_c": 0.52,
            "coherence_l": 0.68,
            "sigma0_c_db": -8.4,
            "sigma0_l_db": -7.9,
            "n_cells": 1800,
        },
        {
            "label": "Área Urbana / Edificada",
            "coherence_c": 0.72,
            "coherence_l": 0.75,
            "sigma0_c_db": -4.1,
            "sigma0_l_db": -3.6,
            "n_cells": 900,
        },
    ],
    "brumadinho": [
        {
            "label": "Estrutura da Barragem / Mina",
            "coherence_c": 0.58,
            "coherence_l": 0.79,
            "sigma0_c_db": -7.1,
            "sigma0_l_db": -6.2,
            "n_cells": 2200,
        },
        {
            "label": "Cerrado / Vegetação Rala",
            "coherence_c": 0.44,
            "coherence_l": 0.71,
            "sigma0_c_db": -10.5,
            "sigma0_l_db": -9.1,
            "n_cells": 3100,
        },
        {
            "label": "Área Urbana / Infraestrutura",
            "coherence_c": 0.74,
            "coherence_l": 0.78,
            "sigma0_c_db": -3.8,
            "sigma0_l_db": -3.2,
            "n_cells": 1100,
        },
    ],
}


@router.get("/{aoi_id}/compare")
def compare(aoi_id: str):
    rows = COMPARE_CACHE.get(aoi_id)
    if rows is None:
        raise HTTPException(404, f"comparativo ainda nao gerado para {aoi_id}")
    return {
        "aoi_id": aoi_id,
        "regions": rows,
        "source": "NISAR (banda L) vs Sentinel-1 (banda C), via ASF",
    }
