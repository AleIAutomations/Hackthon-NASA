"""Baixa o NASA Global Landslide Catalog (publico, sem login) e recorta por area.

Saida: backend/data_cache/<aoi>/landslides_glc.json com os eventos dentro de uma
margem ao redor de cada AOI. Dado MEDIDO (registro historico), nao estimado.
Uso: python data_pipeline/fetch_landslides.py caminho/do/COOLR.csv
(os links antigos de data.nasa.gov foram desativados; baixe o CSV em landslides.nasa.gov/viewer)
"""
from __future__ import annotations

import csv
import io
import json
import urllib.request
from pathlib import Path

CACHE = Path(__file__).resolve().parents[1] / "backend" / "data_cache"
URLS = [
    "https://data.nasa.gov/api/views/dd9e-wu2v/rows.csv?accessType=DOWNLOAD",
    "https://data.nasa.gov/api/views/9ns5-uuif/rows.csv?accessType=DOWNLOAD",
]
# (lon_min, lat_min, lon_max, lat_max), com margem de ~0.15 grau
BBOX = {
    "serra-do-mar": (-45.63, -23.97, -45.21, -23.57),
    "brumadinho": (-44.33, -20.33, -43.91, -19.93),
}


def _f(row: dict, *names: str):
    low = {k.lower().strip(): v for k, v in row.items()}
    for n in names:
        if n in low and low[n] not in (None, ""):
            return low[n]
    return None


def load_local(path: str) -> tuple[str, list[dict]]:
    with open(path, newline="", encoding="utf-8", errors="replace") as fh:
        return path, list(csv.DictReader(fh))


def download() -> tuple[str, list[dict]]:
    last = None
    for u in URLS:
        try:
            raw = urllib.request.urlopen(u, timeout=120).read().decode("utf-8", "replace")
            rows = list(csv.DictReader(io.StringIO(raw)))
            if rows:
                return u, rows
        except Exception as e:  # tenta a proxima URL
            last = e
    raise SystemExit(f"falha ao baixar catalogo: {last}")


def main() -> None:
    import sys
    url, rows = load_local(sys.argv[1]) if len(sys.argv) > 1 else download()
    print("fonte:", url, "linhas:", len(rows), "colunas:", list(rows[0].keys())[:25])
    for aoi, (x0, y0, x1, y1) in BBOX.items():
        ev = []
        for r in rows:
            try:
                lat = float(_f(r, "latitude", "lat"))
                lon = float(_f(r, "longitude", "lng", "lon"))
            except (TypeError, ValueError):
                continue
            if x0 <= lon <= x1 and y0 <= lat <= y1:
                ev.append({
                    "lon": lon, "lat": lat,
                    "date": _f(r, "event_date", "date"),
                    "title": _f(r, "event_title", "title"),
                    "trigger": _f(r, "landslide_trigger", "trigger"),
                    "size": _f(r, "landslide_size", "size"),
                    "fatalities": _f(r, "fatality_count", "fatalities"),
                    "accuracy_km": _f(r, "location_accuracy", "accuracy"),
                    "source": _f(r, "source_name", "source"),
                })
        out = {"aoi_id": aoi, "source": "NASA Global Landslide Catalog (publico)", "origin": "measured",
               "bbox": [x0, y0, x1, y1], "count": len(ev), "events": ev}
        (CACHE / aoi / "landslides_glc.json").write_text(
            json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
        print(aoi, len(ev), "eventos")


if __name__ == "__main__":
    main()
