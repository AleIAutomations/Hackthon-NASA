"""Gera frontend/src/fallbackData.ts a partir do cache do backend."""
from __future__ import annotations

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
CACHE = REPO_ROOT / "backend" / "data_cache"
OUT = REPO_ROOT / "frontend" / "src" / "fallbackData.ts"


def main() -> None:
    dados = {
        "riskGrid": {},
        "sector": {
            "serra-do-mar": {
                "type": "Polygon",
                "coordinates": [[
                    [-45.48, -23.82],
                    [-45.36, -23.82],
                    [-45.36, -23.72],
                    [-45.48, -23.72],
                    [-45.48, -23.82],
                ]],
            },
            "brumadinho": {
                "type": "Polygon",
                "coordinates": [[
                    [-44.18, -20.18],
                    [-44.06, -20.18],
                    [-44.06, -20.08],
                    [-44.18, -20.08],
                    [-44.18, -20.18],
                ]],
            },
        },
        "telemetry": {},
    }

    if CACHE.exists():
        for aoi_dir in CACHE.iterdir():
            if not aoi_dir.is_dir():
                continue
            grid = aoi_dir / "risk_grid.geojson"
            if grid.exists():
                try:
                    features = json.loads(grid.read_text(encoding="utf-8")).get("features", [])
                    dados["riskGrid"][aoi_dir.name] = features[:800]  # limita o bundle
                except Exception as exc:
                    print(f"Erro lendo grid {aoi_dir.name}: {exc}")

        telemetria_path = CACHE / "aoi_telemetry.json"
        if telemetria_path.exists():
            try:
                telemetria = json.loads(telemetria_path.read_text(encoding="utf-8"))
                for aoi_id, a in telemetria.get("aois", {}).items():
                    dados["telemetry"][aoi_id] = a
            except Exception as exc:
                print(f"Erro lendo telemetria: {exc}")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    corpo = "// GERADO AUTOMATICAMENTE - nao editar a mao\n"
    corpo += "export const fallbackRiskGrid: Record<string, any[]> = "
    corpo += json.dumps(dados["riskGrid"], ensure_ascii=False)
    corpo += ";\n\nexport const fallbackTelemetry: Record<string, any> = "
    corpo += json.dumps(dados["telemetry"], ensure_ascii=False)
    corpo += ";\n\nexport const fallbackSector: Record<string, any> = "
    corpo += json.dumps(dados["sector"], ensure_ascii=False) + ";\n"

    OUT.write_text(corpo, encoding="utf-8")
    print(f"fallback gerado com sucesso em {OUT}")


if __name__ == "__main__":
    main()
