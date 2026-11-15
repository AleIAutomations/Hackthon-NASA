"""Motor de alerta da Defesa Civil - versao completa.

Toda avaliacao e um POST com o poligono.
simulate_rain_mm refaz o score em memoria (nao grava no cache).
"""
from __future__ import annotations

import json
import math
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()
CACHE = Path(__file__).resolve().parent.parent / "data_cache"

NIVEIS = ["verde", "amarelo", "laranja", "vermelho"]


class AlertRequest(BaseModel):
    aoi_id: str
    polygon: dict
    simulate_rain_mm: float | None = None


def _dentro(x: float, y: float, ring: list) -> bool:
    """Ray casting no anel externo do poligono."""
    dentro = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if ((yi > y) != (yj > y)) and (
            x < (xj - xi) * (y - yi) / ((yj - yi) or 1e-12) + xi
        ):
            dentro = not dentro
        j = i
    return dentro


def _nivel(score: float) -> str:
    if score >= 75:
        return "vermelho"
    if score >= 50:
        return "laranja"
    if score >= 25:
        return "amarelo"
    return "verde"


def _rescore_chuva(props: dict, chuva_mm: float) -> dict:
    """Refaz o score fisico da celula com chuva simulada."""
    slope = props.get("slope_deg") or 0.0
    if slope <= 0:
        return {**props, "risk_score": 0.0, "alert_level": "verde"}
    saturacao = min(1.0, chuva_mm / 150.0)
    b_rad = math.radians(slope)
    num = (
        8.0
        + (18.0 - saturacao * 9.81)
        * 2.0
        * (math.cos(b_rad) ** 2)
        * math.tan(math.radians(32.0))
    )
    den = 18.0 * 2.0 * math.sin(b_rad) * math.cos(b_rad)
    fs = num / den if den > 0 else 99.0
    score = 100.0 * max(0.0, min(1.0, (1.8 - fs) / 1.8))
    coh = props.get("coherence_l_band")
    if coh is not None and coh < 0.3:
        score = min(100.0, score + 10.0)
    return {
        **props,
        "risk_score": round(score, 1),
        "alert_level": _nivel(score),
        "rain_72h_mm": chuva_mm,
        "simulated": True,
    }


@router.post("/evaluate")
def evaluate(req: AlertRequest):
    path = CACHE / req.aoi_id / "risk_grid.geojson"
    if not path.exists():
        raise HTTPException(404, f"area sem grade: {req.aoi_id}")
    if req.polygon.get("type") != "Polygon":
        raise HTTPException(400, "polygon precisa ser GeoJSON Polygon")
    coords = req.polygon.get("coordinates", [])
    if not coords or not isinstance(coords[0], list):
        raise HTTPException(400, "polygon coordinates invalidas")
    ring = coords[0]
    if ring and isinstance(ring[0], (int, float)):
        ring = coords
    grid = json.loads(path.read_text(encoding="utf-8"))

    dentro = []
    for f in grid.get("features", []):
        geom = f.get("geometry", {})
        c = geom.get("coordinates", [])
        if len(c) >= 2 and _dentro(c[0], c[1], ring):
            props = dict(f.get("properties", {}))
            if req.simulate_rain_mm is not None:
                props = _rescore_chuva(props, req.simulate_rain_mm)
            dentro.append(props)

    if not dentro:
        raise HTTPException(400, "poligono fora da area ou sem celulas")

    scores = [p["risk_score"] for p in dentro]
    maximo = max(scores)
    nivel = _nivel(maximo)
    criticos = sum(1 for s in scores if s >= 75)

    # Sem WorldPop/OSM no cache nao ha como estimar exposicao: nao inventamos numero.
    demo = all(p.get("data_origin") != "measured" for p in dentro)

    if req.simulate_rain_mm is not None:
        gatilho = f"Simulacao: chuva extrema de {req.simulate_rain_mm:.0f} mm em 72h. "
    else:
        gatilho = ""

    texto = (
        f"TERRAALERTA - Nivel {nivel.upper()}: {criticos} taludes "
        f"criticos (score max {maximo:.0f}/100) no setor monitorado. "
        f"{gatilho}"
        + ("Cenario de demonstracao (dados estimados). " if demo else "")
        + "Triagem para priorizar vistoria de campo; a decisao e da Defesa Civil."
    )

    gen_at = datetime.now(timezone.utc).isoformat()
    telemetry_path = CACHE / "aoi_telemetry.json"
    if telemetry_path.exists():
        try:
            gen_at = json.loads(telemetry_path.read_text(encoding="utf-8")).get("generated_at", gen_at)
        except Exception:
            pass

    return {
        "alert_level": nivel,
        "max_score": round(maximo, 1),
        "mean_score": round(sum(scores) / len(scores), 1),
        "cells_inside": len(dentro),
        "cells_critical": criticos,
        "population_exposed": None,
        "buildings_nearby": None,
        "exposure_note": "indisponivel: WorldPop/OSM ainda nao carregados no cache",
        "is_demo": demo,
        "simulated": req.simulate_rain_mm is not None,
        "bulletin_text": texto,
        "source": "TerraAlerta Risk Engine",
        "generated_at": gen_at,
    }
