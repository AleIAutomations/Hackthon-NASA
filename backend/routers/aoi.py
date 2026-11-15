"""Rotas das areas de interesse e telemetria."""
from __future__ import annotations

import json
from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter()
CACHE = Path(__file__).resolve().parent.parent / "data_cache"
cache: dict | None = None


def load_cache() -> dict:
    global cache
    if cache is None:
        path = CACHE / "aoi_telemetry.json"
        if not path.exists():
            raise HTTPException(503, "cache nao carregado; rode o pipeline")
        cache = json.loads(path.read_text(encoding="utf-8"))
    return cache


def get_aoi(aoi_id: str) -> dict:
    data = load_cache()
    aoi = data.get("aois", {}).get(aoi_id)
    if aoi is None:
        raise HTTPException(404, f"aoi desconhecida: {aoi_id}")
    return aoi


@router.get("")
def list_aois():
    data = load_cache()
    aois = []
    for aoi_id, a in data.get("aois", {}).items():
        aois.append({
            "id": aoi_id,
            "name": a.get("name"),
            "center": a.get("center"),
            "risk_type": a.get("risk_type"),
            "scene_counts": {k: len(v) for k, v in a.get("scenes", {}).items()},
        })
    return {
        "aois": aois,
        "source": "ASF SearchAPI + NASA POWER",
        "generated_at": data.get("generated_at"),
    }


@router.get("/{aoi_id}/telemetry")
def telemetry(aoi_id: str):
    data = load_cache()
    return {
        **get_aoi(aoi_id),
        "source": "ASF SearchAPI + NASA POWER",
        "generated_at": data.get("generated_at"),
    }


@router.get("/{aoi_id}/risk-grid")
def risk_grid(aoi_id: str, min_score: float | None = None):
    get_aoi(aoi_id)  # valida aoi existente
    path = CACHE / aoi_id / "risk_grid.geojson"
    if not path.exists():
        raise HTTPException(503, f"risk_grid ainda nao gerado para {aoi_id}")
    grid = json.loads(path.read_text(encoding="utf-8"))
    if min_score is not None:
        grid["features"] = [
            f for f in grid.get("features", [])
            if (f.get("properties", {}).get("risk_score") or 0) >= min_score
        ]
    return grid


@router.get("/{aoi_id}/timeseries")
def timeseries(aoi_id: str):
    aoi = get_aoi(aoi_id)
    daily = aoi.get("rain_daily", [])
    # Adiciona deformacao e coerencia media estimadas para os graficos
    timeseries_data = []
    base_los = -3.2 if aoi_id == "serra-do-mar" else -14.5
    for i, d in enumerate(daily):
        rain = d.get("rain_mm", 0.0)
        # aceleracao de deformacao apos chuvas acumuladas
        los = base_los - (rain * 0.12 if rain > 20 else 0.0) - (0.04 * i)
        timeseries_data.append({
            "date": d.get("date"),
            "rain_mm": rain,
            "los_mm": round(los, 2),
            "coherence_l_band": 0.68 if aoi_id == "serra-do-mar" else 0.76,
        })

    return {
        "aoi_id": aoi_id,
        "daily": timeseries_data,
        "source": aoi.get("sources", {}).get("rain", "NASA POWER")
        + " (chuva, medido). Deformacao LOS e coerencia: ILUSTRATIVAS/estimadas, nao NISAR processado.",
        "origins": {"rain_mm": "measured", "los_mm": "estimated", "coherence_l_band": "estimated"},
        "generated_at": load_cache().get("generated_at"),
    }
