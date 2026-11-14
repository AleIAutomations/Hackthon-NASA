import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ml_risk_model import factor_of_safety, physical_score, alert_level, score_cells


def test_fs_plano_estavel():
    assert factor_of_safety(0.0, 1.0) == 99.0


def test_score_cresce_com_chuva_e_declividade():
    base = physical_score(20, 10, None)
    mais_chuva = physical_score(20, 120, None)
    mais_declive = physical_score(40, 10, None)
    assert mais_chuva >= base and mais_declive >= base


def test_alert_level_limites():
    assert alert_level(24.9) == "verde"
    assert alert_level(25.0) == "amarelo"
    assert alert_level(50.0) == "laranja"
    assert alert_level(75.0) == "vermelho"


def test_score_cells_sem_modelo():
    feats = [
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [0, 0]},
            "properties": {"slope_deg": 30, "rain_72h_mm": 80},
        }
    ]
    out = score_cells(feats)
    assert 0 <= out[0]["properties"]["risk_score"] <= 100
    assert out[0]["properties"]["alert_level"] in (
        "verde",
        "amarelo",
        "laranja",
        "vermelho",
    )
