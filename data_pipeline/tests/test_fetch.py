import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fetch_sar_datasets import fetch_power_rain, search_scenes


def test_power_rain_retorna_serie_ordenada():
    serie = fetch_power_rain(-23.76, -45.41, days=30)
    assert len(serie) >= 25
    datas = [d["date"] for d in serie]
    assert datas == sorted(datas)
    assert all(d["rain_mm"] >= 0 for d in serie)


def test_busca_publica_funciona_sem_login():
    wkt = "POLYGON((-45.65 -23.82, -45.35 -23.82, -45.35 -23.70, -45.65 -23.70, -45.65 -23.82))"
    cenas = search_scenes(wkt, "SENTINEL-1", max_results=5)
    assert isinstance(cenas, list)  # nao lanca excecao
    for c in cenas:
        assert c["granule"] and c["url"]
