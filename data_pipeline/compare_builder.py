"""Calcula estatisticas banda C vs banda L por sub-regiao."""
from __future__ import annotations

import numpy as np


def estatisticas_regiao(
    coh_c: np.ndarray,
    coh_l: np.ndarray,
    s0_c: np.ndarray,
    s0_l: np.ndarray,
    mascara: np.ndarray,
) -> dict:
    """Medias dentro da mascara da sub-regiao."""
    def media(arr):
        if arr is None:
            return None
        vals = arr[mascara]
        vals = vals[np.isfinite(vals)]
        return round(float(vals.mean()), 3) if vals.size else None

    return {
        "coherence_c": media(coh_c),
        "coherence_l": media(coh_l),
        "sigma0_c_db": media(s0_c),
        "sigma0_l_db": media(s0_l),
        "n_cells": int(mascara.sum()),
    }


def construir_compare(
    regioes: dict[str, np.ndarray],
    coh_c: np.ndarray,
    coh_l: np.ndarray,
    s0_c: np.ndarray,
    s0_l: np.ndarray,
) -> list[dict]:
    """regioes: nome -> mascara booleana na mesma grade."""
    rows = []
    for nome, mascara in regioes.items():
        rows.append({
            "label": nome,
            **estatisticas_regiao(coh_c, coh_l, s0_c, s0_l, mascara),
        })
    return rows
