"""Servidor FastAPI do TerraAlerta."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import aoi, compare, alerts, tiles, summary

app = FastAPI(
    title="TerraAlerta NISAR",
    version="0.1.0",
    description="Monitoramento de encostas e barragens com NISAR banda L.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(aoi.router, prefix="/api/aois", tags=["aois"])
app.include_router(compare.router, prefix="/api/aois", tags=["compare"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(tiles.router, prefix="/api/aois", tags=["tiles"])
app.include_router(summary.router, prefix="/api/v1", tags=["summary"])


@app.get("/health")
def health():
    cache_loaded = False
    aois_list = []
    try:
        data = aoi.load_cache()
        cache_loaded = True
        aois_list = sorted(data.get("aois", {}).keys())
    except Exception:
        pass

    return {
        "status": "ok",
        "cache_loaded": cache_loaded,
        "aois": aois_list,
    }
