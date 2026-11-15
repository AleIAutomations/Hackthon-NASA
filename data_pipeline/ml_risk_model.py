"""Modelo de risco hibrido (fisica + Random Forest) - TerraAlerta.

Combina o fator de seguranca (FS) do talude infinito com Random Forest.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
from sklearn.ensemble import RandomForestRegressor

REPO_ROOT = Path(__file__).resolve().parent.parent
CACHE_DIR = REPO_ROOT / "backend" / "data_cache"

# Parametros de solo genericos para solos residuais de encosta tropical
PHI_DEG = 32.0       # angulo de atrito interno tipico de solo residual
COHESION_KPA = 8.0   # coesao efetiva
GAMMA_SOIL = 18.0    # peso especifico do solo (kN/m3)
GAMMA_W = 9.81       # peso especifico da agua (kN/m3)
DEPTH_M = 2.0        # espessura da camada deslizante


def factor_of_safety(slope_deg: float, saturation: float) -> float:
    """Talude infinito: FS = (c + (g - m*gw)*z*cos^2(b)*tan(phi)) / (g*z*sin(b)*cos(b)).

    saturation (m) de 0 (seco) a 1 (saturado).
    """
    b_rad = math.radians(slope_deg)
    if slope_deg <= 0:
        return 99.0
    num = (
        COHESION_KPA
        + (GAMMA_SOIL - saturation * GAMMA_W)
        * DEPTH_M
        * (math.cos(b_rad) ** 2)
        * math.tan(math.radians(PHI_DEG))
    )
    den = GAMMA_SOIL * DEPTH_M * math.sin(b_rad) * math.cos(b_rad)
    return num / den if den > 0 else 99.0


def physical_score(
    slope_deg: float, rain_72h_mm: float, coherence: float | None
) -> float:
    """Score fisico 0-100: quanto menor o FS, maior o score."""
    saturation = min(1.0, max(0.0, rain_72h_mm / 150.0))  # 150 mm/72h satura
    fs = factor_of_safety(slope_deg, saturation)
    score = 100.0 * max(0.0, min(1.0, (1.8 - fs) / 1.8))
    if coherence is not None and coherence < 0.3:
        score = min(100.0, score + 10.0)  # decorrelacao localizada = mudanca recente
    return round(score, 1)


FEATURES = [
    "slope_deg",
    "rain_72h_mm",
    "sigma0_hh_db",
    "sigma0_hv_db",
    "depol_ratio_hv_hh",
    "coherence_l_band",
    "los_displacement_mm",
]


def train_or_default(X: np.ndarray | None, y: np.ndarray | None):
    """Treina o RF se houver rotulos; senao devolve None (so fisica)."""
    if X is None or y is None or len(X) < 30:
        return None
    model = RandomForestRegressor(
        n_estimators=100, max_depth=8, random_state=42, n_jobs=-1
    )
    model.fit(X, y)
    return model


def alert_level(score: float) -> str:
    if score >= 75:
        return "vermelho"
    if score >= 50:
        return "laranja"
    if score >= 25:
        return "amarelo"
    return "verde"


def score_cells(features: list[dict], model=None) -> list[dict]:
    """Aplica o score em cada celula do GeoJSON."""
    X = []
    for f in features:
        p = f["properties"]
        row = [p.get(k) for k in FEATURES]
        X.append([v if v is not None else 0.0 for v in row])

    stat_scores = model.predict(np.array(X)) if model else None

    for i, f in enumerate(features):
        p = f["properties"]
        real_insar = p.get("coherence_origin") == "measured"
        # Com coerencia real, ela nao vira gatilho (baixa coerencia em floresta e normal)
        phys = physical_score(
            p.get("slope_deg") or 0.0,
            p.get("rain_72h_mm") or 0.0,
            None if real_insar else p.get("coherence_l_band"),
        )
        # Se ha deslocamento pronunciado, ajusta o score estatistico
        los = p.get("los_displacement_mm")
        if stat_scores is not None:
            stat = float(np.clip(stat_scores[i], 0, 100))
            score = 0.5 * phys + 0.5 * stat
        else:
            # Calibracao empirica suplementar se modelo ML nao treinado
            bonus_los = 0.0
            # LOS real de um par de 12 dias tem ruido atmosferico (~1 cm): nao entra no score
            if not real_insar and los is not None and los < -10.0:  # subsidencia / movimento encosta
                bonus_los = min(30.0, abs(los) * 1.5)
            score = min(100.0, phys + bonus_los)
            stat = None

        p["risk_score"] = round(score, 1)
        p["alert_level"] = alert_level(score)
        p["score_physical"] = phys
        p["score_statistical"] = round(stat, 1) if stat is not None else None
    return features


def export(aoi_id: str, features: list[dict]) -> Path:
    out = CACHE_DIR / aoi_id / "risk_grid.geojson"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(
        json.dumps({"type": "FeatureCollection", "features": features}, ensure_ascii=False),
        encoding="utf-8",
    )
    return out


def main():
    """Gera e exporta as grades de risco para as areas cadastradas."""
    from sar_processor import export_geojson, generate_synthetic_study_area

    for aoi_id in ["serra-do-mar", "brumadinho"]:
        cells_path = CACHE_DIR / aoi_id / "cells.geojson"
        if cells_path.exists():
            data = json.loads(cells_path.read_text(encoding="utf-8"))
            cells = data.get("features", [])
        else:
            cells = generate_synthetic_study_area(aoi_id)
            export_geojson(aoi_id, cells)

        scored = score_cells(cells)
        export(aoi_id, scored)
        print(f"[ml_risk_model] {len(scored)} celulas de risco exportadas para {aoi_id}")


if __name__ == "__main__":
    main()
