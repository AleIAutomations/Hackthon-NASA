# TerraAlerta NISAR

Landslide and dam-deformation early warning built on NISAR L-band radar, Sentinel-1, NASADEM and NASA POWER rainfall.

NASA Space Apps Challenge 2026 - Challenge: "Dancing with the SARs"

## Overview
TerraAlerta NISAR crosses satellite radar imagery with precipitation and topography to pinpoint on an interactive map where a slope or dam is beginning to deform, prior to catastrophic failure. Its core scientific edge is leveraging the L-band radar (~24 cm wavelength) of the NASA/ISRO NISAR satellite, which penetrates dense tropical forest canopies down to the ground, where C-band radar (Sentinel-1, ~5.6 cm) typically decorrelates into noise.

## Quick Start
```bash
# 1. Environment setup (optional Earthdata credentials)
cp .env.example .env

# 2. Run data pipeline (or rely on bundled cache)
python data_pipeline/fetch_sar_datasets.py
python data_pipeline/sar_processor.py
python data_pipeline/ml_risk_model.py
python scripts/gerar_fallback.py

# 3. Start backend (FastAPI)
cd backend
uvicorn main:app --reload --port 8000

# 4. Start frontend (React + Vite + TypeScript)
cd ../frontend
npm install
npm run dev
```

No Earthdata account? The pipeline automatically falls back to metadata-only discovery mode, and the application serves the pre-computed high-resolution cache for our two study areas (`serra-do-mar` and `brumadinho`).

## Architecture & NASA Datasets Used
- **NISAR L-band products (GCOV / GUNW)** via ASF DAAC
- **Sentinel-1 C-band baseline** via ASF DAAC
- **NASADEM / SRTM elevation & slope**
- **NASA POWER daily precipitation (PRECTOTCORR)**
- **ALOS PALSAR L-band historical records** (ASF DAAC)

## Areas of Interest
1. **Serra do Mar - São Sebastião (SP), Brazil**: Dense Atlantic rainforest on steep slopes with historical extreme rainfall and fatal landslides (February 2023).
2. **Brumadinho - Quadrilátero Ferrífero (MG), Brazil**: Tailings dam deformation and mining subsidence monitoring (January 2019 event reference).

## Scientific Honesty Policy
Every single grid cell is tagged as `measured`, `derived`, or `estimated`. Estimated cells are rendered with dashed borders on the map and explicitly labeled in tooltips and submission disclosures.

## AI / Super Intelligence (SI) Disclosure
In accordance with the 2026 NASA Space Apps rules:
- Code generation, documentation, and translation assisted by Google DeepMind / Gemini AI tools under human engineering supervision.
- Risk prediction architecture is physical (infinite slope stability factor of safety) combined with explainable statistical models (Random Forest), never a black box.
- All AI-assisted assets are watermarked and declared.
