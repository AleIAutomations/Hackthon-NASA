"""Inspeciona a estrutura de um produto NISAR GCOV (.h5)."""
from __future__ import annotations

import sys
import h5py


def listar_grupos(path: str) -> None:
    with h5py.File(path, "r") as f:
        def visita(nome, obj):
            tipo = "dataset" if isinstance(obj, h5py.Dataset) else "grupo"
            shape = getattr(obj, "shape", "")
            print(f"{tipo:8s} {nome} {shape}")
        f.visititems(visita)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        listar_grupos(sys.argv[1])
    else:
        print("Uso: python inspecionar_gcov.py <arquivo.h5>")
