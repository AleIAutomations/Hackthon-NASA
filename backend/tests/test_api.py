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
