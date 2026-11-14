"""Chuva IMERG (~10 km) - upgrade opcional sobre a NASA POWER.

Requer login Earthdata (GES DISC). Rodar apenas se sobrar tempo;
a POWER ja satisfaz o requisito de dados NASA do desafio.
"""
from __future__ import annotations

import os
from pathlib import Path


def disponivel() -> bool:
    return bool(os.getenv("EARTHDATA_USERNAME") or os.getenv("ASF_EDL_TOKEN"))


def baixar_grade(bbox: tuple, dias: int, out_dir: Path) -> list[str]:
    """Baixa arquivos diarios IMERG Late para a caixa da AOI."""
    if not disponivel():
        print("[imerg] sem credencial; mantendo NASA POWER")
        return []
    try:
        import earthaccess
        from datetime import date, timedelta
        earthaccess.login(strategy="environment")
        fim = date.today()
        ini = fim - timedelta(days=dias)
        results = earthaccess.search_data(
            short_name="GPM_3IMERGDF",
            bounding_box=bbox,
            temporal=(ini.isoformat(), fim.isoformat()),
            count=dias + 2,
        )
        return [str(a) for a in earthaccess.download(results, str(out_dir))]
    except Exception as exc:
        print(f"[imerg] falha: {exc}")
        return []


def chuva_72h_por_celula(arquivos: list[str]):
    """Soma a precipitacao dos ultimos 3 arquivos diarios por grade."""
    import numpy as np
    import rasterio

    if len(arquivos) < 3:
        return None
    acumulado = None
    for arq in sorted(arquivos)[-3:]:
        with rasterio.open(arq) as src:
            banda = src.read(1).astype("float32")
            banda = np.where(banda > 0, banda, 0.0)
        acumulado = banda if acumulado is None else acumulado + banda
    return acumulado
