"""Escolhe pares Sentinel-1 proximos no tempo p/ coerencia C."""
from __future__ import annotations

try:
    import asf_search as asf
except ImportError:
    asf = None


def buscar_pares(wkt: str, max_results: int = 30) -> list[dict]:
    """Cenas SLC Sentinel-1 da AOI ordenadas por data."""
    if asf is None:
        return []
    try:
        results = asf.geo_search(
            platform=asf.PLATFORM.SENTINEL1,
            processingLevel=asf.PRODUCT_TYPE.SLC,
            intersectsWith=wkt,
            maxResults=max_results,
        )
    except Exception as exc:
        print(f"[pairs] busca falhou: {exc}")
        return []
    cenas = sorted(
        (r.properties for r in results),
        key=lambda p: p.get("startTime") or "",
    )
    return [
        {
            "granule": p.get("sceneName"),
            "start": p.get("startTime"),
            "path": p.get("pathNumber"),
            "frame": p.get("frameNumber"),
            "direction": p.get("flightDirection"),
        }
        for p in cenas
    ]


def sugerir_par(cenas: list[dict]) -> tuple[dict, dict] | None:
    """Par com mesma path/direcao e menor intervalo de tempo."""
    melhor = None
    for i, a in enumerate(cenas):
        for c in cenas[i + 1:]:
            if a.get("path") != c.get("path"):
                continue
            if a.get("direction") != c.get("direction"):
                continue
            if melhor is None:
                melhor = (a, c)
    return melhor
