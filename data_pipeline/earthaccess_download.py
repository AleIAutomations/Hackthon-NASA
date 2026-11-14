"""Alternativa ao asf_search para download, via earthaccess.

Util quando o produto esta indexado no CMR da NASA (NASADEM, IMERG).
Sem credencial, sai sem erro e avisa.
"""
from __future__ import annotations

import os
from pathlib import Path


def baixar(
    short_name: str,
    bounding_box: tuple,
    out_dir: Path,
    temporal: tuple | None = None,
) -> list[str]:
    """Baixa granulos de uma colecao NASA para a caixa da AOI."""
    if not (os.getenv("EARTHDATA_USERNAME") or os.getenv("ASF_EDL_TOKEN")):
        print("[earthaccess] sem credencial; pulando", short_name)
        return []
    try:
        import earthaccess
        earthaccess.login(strategy="environment")
        kwargs = dict(short_name=short_name, bounding_box=bounding_box)
        if temporal:
            kwargs["temporal"] = temporal
        results = earthaccess.search_data(**kwargs, count=5)
        arquivos = earthaccess.download(results, str(out_dir))
        return [str(a) for a in arquivos]
    except Exception as exc:
        print(f"[earthaccess] falha: {exc}")
        return []


BBOX = {
    "serra-do-mar": (-45.65, -23.82, -45.35, -23.70),
    "brumadinho": (-44.35, -20.30, -43.90, -19.95),
}
