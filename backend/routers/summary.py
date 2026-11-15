"""Resumo executivo por AOI e contexto climatico (ENOS).

O ENOS e contexto: nunca entra no risk_score (ver docs/ARCHITECTURE_CLIMATE_INTELLIGENCE.md).
Nada aqui inventa numero: sem dado real, o campo vem null e o motivo vai junto.
"""
from __future__ import annotations

import json
import math
from collections import Counter
from pathlib import Path

from fastapi import APIRouter, HTTPException

router = APIRouter()
CACHE = Path(__file__).resolve().parent.parent / "data_cache"

# Espacamento da grade em graus (cache atual: 0.003 lon x 0.0025 lat)
STEP_LON, STEP_LAT = 0.003, 0.0025

ENSO_SNAPSHOT = {
    "provenance": {
        "source": "NOAA Climate Prediction Center - ENSO Diagnostic Discussion",
        "url": "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml",
        "published": "2026-11-12",
        "retrieved_in_team_brief": "2026-11-14",
        "status": "reported",
        "note": "Valores transcritos do brief da equipe; conferir na fonte antes de citar.",
    },
    "role": "context_only",
    "in_risk_score": False,
    "state": "El Nino Advisory",
    "indices_c": {"nino34": 2.5, "nino3": 3.6, "nino12": 4.4},
    "outlook": "El Nino forte a muito forte ate JFM 2027 (prob. > 79%)",
    "caveat": (
        "El Nino aumenta a probabilidade de chuva extrema em certas regioes; "
        "nao causa deslizamentos. Previsao sazonal nao e previsao de deslizamento."
    ),
}


def _cells(aoi_id: str) -> list[dict]:
    path = CACHE / aoi_id / "risk_grid.geojson"
    if not path.exists():
        raise HTTPException(404, f"aoi desconhecida: {aoi_id}")
    return json.loads(path.read_text(encoding="utf-8"))["features"]


def _observed_rain(aoi_id: str) -> dict | None:
    """Ultimos 3 dias da serie NASA POWER (PRECTOTCORR) guardada no cache."""
    path = CACHE / "aoi_telemetry.json"
    if not path.exists():
        return None
    serie = json.loads(path.read_text(encoding="utf-8"))["aois"].get(aoi_id, {}).get("rain_daily") or []
    if len(serie) < 3:
        return None
    ult = serie[-3:]
    return {
        "value_mm": round(sum(x["rain_mm"] for x in ult), 1),
        "from": ult[0]["date"],
        "to": ult[-1]["date"],
        "source": "NASA POWER PRECTOTCORR",
        "origin": "measured",
    }


def _cell_km2(lat: float) -> float:
    return (STEP_LON * 111.32 * math.cos(math.radians(lat))) * (STEP_LAT * 110.57)


@router.get("/climate/enso")
def enso():
    return ENSO_SNAPSHOT


@router.get("/summary/{aoi_id}")
def summary(aoi_id: str):
    feats = _cells(aoi_id)
    if not feats:
        raise HTTPException(404, f"sem celulas para {aoi_id}")
    levels = Counter(f["properties"]["alert_level"] for f in feats)
    origins = Counter(f["properties"]["data_origin"] for f in feats)
    lat0 = sum(f["geometry"]["coordinates"][1] for f in feats) / len(feats)
    high = levels.get("laranja", 0) + levels.get("vermelho", 0)
    high_km2 = round(high * _cell_km2(lat0), 1)
    sar_meas = [f["properties"] for f in feats if f["properties"].get("sar_origin") == "measured"]
    radar = {
        "measured_cells": len(sar_meas), "total_cells": len(feats),
        "product": "NISAR L2 GCOV (L-band), ASF DAAC",
        "date": sar_meas[0].get("sar_date") if sar_meas else None,
        "granule": sar_meas[0].get("sar_granule") if sar_meas else None,
        "layers": "sigma0 HH/HV e razao de despolarizacao (medidos); coerencia e LOS seguem estimados",
    } if sar_meas else None
    is_demo = origins.get("estimated", 0) > 0  # qualquer celula estimada ja marca demo
    dam = aoi_id == "brumadinho"

    if high == 0:
        pt = "Nenhuma celula em risco alto neste cenario."
        en = "No high-risk cells in this scenario."
    else:
        pt = (f"{high_km2} km² em risco alto (laranja/vermelho), "
              f"{levels.get('vermelho', 0)} células em vermelho.")
        en = (f"{high_km2} km² at high risk (orange/red), "
              f"{levels.get('vermelho', 0)} cells in red.")
    if is_demo:
        pt += " Cenário de demonstração: dados estimados, não medidos."
        en += " Demonstration scenario: estimated data, not measured."

    return {
        "aoi_id": aoi_id,
        "verdict": {"pt": pt, "en": en},
        "high_risk_km2": {"value": high_km2, "origin": "estimated" if is_demo else "derived",
                          "method": "celulas laranja+vermelho x area da celula"},
        "observed_rain_72h": _observed_rain(aoi_id),
        "scenario_rain_72h_mm": {"value": 150.0, "origin": "estimated",
                                 "note": "chuva do cenario de demonstracao, nao observada"},
        "exposed_population": {"value": None, "origin": "unavailable",
                               "reason": "WorldPop ainda nao carregado no cache"},
        "radar_nisar": radar,
        "alert_levels": dict(levels),
        "data_origin": dict(origins),
        "is_demo": is_demo,
        "track": "dam_monitoring_not_slope_model" if dam else "landslide_triage",
        "disclaimer": (
            "Triagem para priorizar vistoria. Nao e previsao nem avaliacao de seguranca de barragem."
            if dam else
            "Triagem para priorizar vistoria. Nao e previsao de deslizamento."
        ),
        "climate_context": {"enso_endpoint": "/api/v1/climate/enso", "in_risk_score": False},
    }
