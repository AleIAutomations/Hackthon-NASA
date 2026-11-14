import math
import sys
from pathlib import Path
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sar_processor import to_db, depol_ratio, los_mm_from_gunw


def test_to_db_valores_conhecidos():
    out = to_db(np.array([1.0, 10.0, 100.0]))
    assert np.allclose(out, [0.0, 10.0, 20.0])


def test_to_db_zero_vira_nan():
    out = to_db(np.array([0.0]))
    assert np.isnan(out[0])


def test_depol_ratio_protege_divisao_por_zero():
    out = depol_ratio(np.array([1.0]), np.array([0.0]))
    assert np.isnan(out[0])


def test_fase_ciclo_completo_equivale_lambda():
    # 4*pi radianos -> um comprimento de onda (240 mm banda L)
    phase = np.array([4 * math.pi], dtype="float32")
    mm = phase * 0.24 / (4 * math.pi) * 1000.0
    assert abs(mm[0] - 240.0) < 1e-3
