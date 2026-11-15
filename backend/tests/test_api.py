"""Testes de contrato da API com TestClient."""
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Adiciona o diretorio backend ao sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from main import app
from routers import aoi as aoi_router

client = TestClient(app)
CACHE = Path(__file__).resolve().parent.parent / "data_cache"


@pytest.fixture(autouse=True)
def cache_limpo():
    aoi_router.cache = None
    yield
    aoi_router.cache = None


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_lista_aois():
    if not (CACHE / "aoi_telemetry.json").exists():
        pytest.skip("cache ainda nao gerado")
    resp = client.get("/api/aois")
    assert resp.status_code == 200
    ids = [a["id"] for a in resp.json()["aois"]]
    assert "serra-do-mar" in ids and "brumadinho" in ids


def test_aoi_desconhecida_404():
    if not (CACHE / "aoi_telemetry.json").exists():
        pytest.skip("cache ainda nao gerado")
    resp = client.get("/api/aois/nao-existe/telemetry")
    assert resp.status_code == 404


def test_risk_grid_filtra_min_score():
    grid_path = CACHE / "serra-do-mar" / "risk_grid.geojson"
    if not grid_path.exists():
        pytest.skip("grade ainda nao gerada")
    resp = client.get("/api/aois/serra-do-mar/risk-grid?min_score=50")
    assert resp.status_code == 200
    feats = resp.json()["features"]
    assert all((f["properties"].get("risk_score") or 0) >= 50 for f in feats)


def test_alerta_poligono_invalido_400():
    grid_path = CACHE / "serra-do-mar" / "risk_grid.geojson"
    if not grid_path.exists():
        pytest.skip("grade ainda nao gerada")
    resp = client.post("/api/alerts/evaluate", json={
        "aoi_id": "serra-do-mar",
        "polygon": {"type": "Point", "coordinates": [0, 0]},
    })
    assert resp.status_code == 400


def test_alerta_setor_valido():
    grid_path = CACHE / "serra-do-mar" / "risk_grid.geojson"
    if not grid_path.exists():
        pytest.skip("grade ainda nao gerada")
    # poligono cobrindo o setor da AOI 1
    resp = client.post("/api/alerts/evaluate", json={
        "aoi_id": "serra-do-mar",
        "polygon": {
            "type": "Polygon",
            "coordinates": [[
                [-45.65, -23.82],
                [-45.35, -23.82],
                [-45.35, -23.70],
                [-45.65, -23.70],
                [-45.65, -23.82],
            ]],
        },
    })
    assert resp.status_code == 200
    corpo = resp.json()
    assert corpo["alert_level"] in ("verde", "amarelo", "laranja", "vermelho")
    assert corpo["cells_inside"] > 0
    assert corpo["bulletin_text"]


def test_summary_marks_demo_and_no_invented_population():
    r = client.get("/api/v1/summary/serra-do-mar").json()
    assert r["is_demo"] is True
    assert r["exposed_population"]["value"] is None
    assert r["high_risk_km2"]["origin"] == "estimated"


def test_enso_is_context_only():
    r = client.get("/api/v1/climate/enso").json()
    assert r["in_risk_score"] is False and r["role"] == "context_only"


def test_summary_separates_observed_and_scenario_rain():
    r = client.get("/api/v1/summary/serra-do-mar").json()
    assert r["observed_rain_72h"]["origin"] == "measured"
    assert r["scenario_rain_72h_mm"]["origin"] == "estimated"


def test_alert_does_not_invent_exposure():
    poly = {"type": "Polygon", "coordinates": [[[-45.48, -23.82], [-45.36, -23.82], [-45.36, -23.72], [-45.48, -23.72], [-45.48, -23.82]]]}
    r = client.post("/api/alerts/evaluate", json={"aoi_id": "serra-do-mar", "polygon": poly, "simulate_rain_mm": 200}).json()
    assert r["population_exposed"] is None and r["buildings_nearby"] is None
    assert r["is_demo"] is True and "demonstra" in r["bulletin_text"].lower()


def test_summary_reports_real_nisar_when_present():
    r = client.get("/api/v1/summary/brumadinho").json()
    radar = r.get("radar_nisar")
    if radar:  # so quando o GCOV real foi aplicado ao cache
        assert radar["measured_cells"] > 0
        assert "NISAR" in radar["product"]
        assert "estimados" in radar["layers"]
        assert r["is_demo"] is True  # coerencia/LOS ainda estimados
