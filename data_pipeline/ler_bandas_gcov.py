"""Le HH e HV de um GCOV e devolve arrays numpy + geotransform."""
from __future__ import annotations

import sys
from pathlib import Path
import h5py
import numpy as np

BASE = "/science/LSAR/GCOV/grids/frequencyA"


def ler_polarizacao(path: Path, pol: str) -> np.ndarray:
    with h5py.File(path, "r") as f:
        return f[f"{BASE}/{pol}"][:].astype("float32")


def ler_geotransform(path: Path) -> tuple:
    """(x0, dx, 0, y0, 0, dy) nos cantos superiores esquerdos."""
    with h5py.File(path, "r") as f:
        x = f[f"{BASE}/xCoordinates"][:]
        y = f[f"{BASE}/yCoordinates"][:]
    return (
        float(x[0]),
        float(x[1] - x[0]),
        0.0,
        float(y[0]),
        0.0,
        float(y[1] - y[0]),
    )


if __name__ == "__main__":
    if len(sys.argv) > 1:
        arq = Path(sys.argv[1])
        hh = ler_polarizacao(arq, "HH")
        hv = ler_polarizacao(arq, "HV")
        print("HH:", hh.shape, "min", np.nanmin(hh), "max", np.nanmax(hh))
        print("HV:", hv.shape, "min", np.nanmin(hv), "max", np.nanmax(hv))
        print("geotransform:", ler_geotransform(arq))
    else:
        print("Uso: python ler_bandas_gcov.py <arquivo.h5>")
