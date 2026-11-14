"""Estimativa de exposicao populacional no poligono de alerta."""
from __future__ import annotations

import json
import requests

OVERPASS = "https://overpass-api.de/api/interpreter"

QUERY = """[out:json][timeout:25];(
  way["building"](poly:"{poly}");
);out count;"""


def contar_edificios(coords: list[list[float]]) -> int | None:
    """coords: anel do poligono [[lon, lat], ...]."""
    poly_str = " ".join(f"{lat} {lon}" for lon, lat in coords)
    try:
        resp = requests.post(
            OVERPASS,
            data={"data": QUERY.format(poly=poly_str)},
            timeout=25,
        )
        resp.raise_for_status()
        elementos = resp.json().get("elements", [])
        for el in elementos:
            if "tags" in el and "total" in el["tags"]:
                return int(el["tags"]["total"])
        return None
    except Exception as exc:
        print(f"[exposure] overpass falhou: {exc}")
        return None


def populacao_estimada(
    edificios: int | None,
    media_por_domicilio: float = 3.0,
) -> dict:
    """Estimativa declarada: domicilios x media de moradores.

    Na versao completa, somar a grade WorldPop dentro do poligono.
    """
    if edificios is None:
        return {
            "population_exposed": None,
            "method": "indisponivel (overpass falhou)",
        }
    return {
        "population_exposed": int(edificios * media_por_domicilio),
        "buildings_nearby": edificios,
        "method": "OSM buildings x 3.0 moradores/domicilio (estimativa)",
    }
