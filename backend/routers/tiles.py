"""Tiles PNG a partir dos COGs das bandas C e L."""
from __future__ import annotations

import io
from pathlib import Path

from fastapi import APIRouter, HTTPException, Response

router = APIRouter()
CACHE = Path(__file__).resolve().parent.parent / "data_cache"


@router.get("/{aoi_id}/tiles/{banda}/{z}/{x}/{y}.png")
def tile(aoi_id: str, banda: str, z: int, x: int, y: int):
    if banda not in ("c", "l"):
        raise HTTPException(404, "banda precisa ser c ou l")
    cog = CACHE / aoi_id / f"band_{banda}.tif"
    if not cog.exists():
        # Fallback de tile transparente / placeholder caso o COG binario nao tenha sido baixado
        from PIL import Image, ImageDraw
        img = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        # cor indicativa: banda C (azul/cinza frio), banda L (azul escuro NASA)
        fill_color = (148, 163, 184, 50) if banda == "c" else (11, 61, 145, 70)
        draw.rectangle([0, 0, 256, 256], fill=fill_color)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return Response(content=buf.getvalue(), media_type="image/png")

    try:
        from rio_tiler.io import Reader
        from rio_tiler.utils import render
        import numpy as np

        with Reader(str(cog)) as src:
            img = src.tile(x, y, z)
            dados = img.data[0].astype("float32")
            norm = np.clip((dados + 25.0) / 25.0, 0, 1)
            png = render(
                (norm * 255).astype("uint8"),
                img.mask,
                img_format="PNG",
            )
        return Response(content=png, media_type="image/png")
    except Exception as exc:
        raise HTTPException(500, f"falha no tile: {exc}")
