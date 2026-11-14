"""Dispara o boletim para webhooks registrados."""
from __future__ import annotations

import json
from datetime import datetime, timezone
import requests


def montar_payload(boletim: dict, aoi_id: str) -> dict:
    return {
        "event": "terraalerta.bulletin",
        "aoi_id": aoi_id,
        "alert_level": boletim.get("alert_level"),
        "text": boletim.get("bulletin_text"),
        "issued_at": datetime.now(timezone.utc).isoformat(),
        "source": "TerraAlerta Risk Engine",
    }


def disparar(payload: dict, webhooks: list[str], timeout: int = 5) -> list[dict]:
    resultados = []
    for url in webhooks:
        try:
            resp = requests.post(url, json=payload, timeout=timeout)
            resultados.append({"url": url, "status": resp.status_code})
        except Exception as exc:
            resultados.append({"url": url, "erro": str(exc)})
    return resultados
