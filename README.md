# TerraAlerta NISAR

**NASA Space Apps Challenge 2026** · Challenge: *"Dancing with the SARs"*  
A spatial triage platform combining NISAR L-band radar, Sentinel-1, NASADEM elevation, and rainfall to prioritize slope and terrain inspections for civil defense teams.

---

## Overview

TerraAlerta NISAR evaluates ground deformation and slope vulnerability beneath dense tropical vegetation. Its core scientific edge is leveraging the **L-band radar (~24 cm wavelength)** of the NASA/ISRO NISAR satellite: while C-band radar (Sentinel-1, ~5.6 cm) decorrelates into noise across tropical forest canopies, L-band penetrates foliage down to the ground.

The system is designed as a **triage tool to prioritize field inspections**, not an automated landslide forecast. It scores terrain on a grid of roughly 300 m cells (demonstration) into four alert levels (green, yellow, orange, red) using infinite-slope geotechnical physics and InSAR coherence.

### Central Demo Moment
In the interactive dashboard, users can simulate an extreme storm event and watch the risk map light up in real time, producing two transparent headline metrics:
- **36.6 km² at high risk** in the Serra do Mar demonstration scenario (orange and red cells combined).
- **Exposed population: unavailable** (displayed honestly until WorldPop layers are ingested into the cache—we never fabricate human exposure figures).

---

## How to run

The application is cache-first and runs offline out-of-the-box using pre-computed demonstration data for both study areas (`serra-do-mar` and `brumadinho`).

```bash
# 1. Environment setup (Earthdata credentials optional)
cp .env.example .env

# 2. Start the backend (FastAPI on http://localhost:8000)
python -m uvicorn main:app --app-dir backend --port 8000

# 3. Start the frontend (Vite + React + TypeScript on http://localhost:5173)
cd frontend
npm install
npm run dev
```

*(Optional)* To test raw data discovery and ingestion pipelines:
```bash
python data_pipeline/fetch_sar_datasets.py
python data_pipeline/sar_processor.py
python data_pipeline/ml_risk_model.py
```

---

## NASA data used

- **NISAR L-band products (GCOV / GUNW)** via ASF DAAC (metadata discovery and forward-compatible pipeline schemas).
- **Sentinel-1 C-band baseline** via ASF DAAC (coherence comparison).
- **NASADEM / SRTM elevation & slope** (30-meter topographic baseline).
- **NASA POWER daily precipitation (PRECTOTCORR)** (regional meteorological context and historical rainfall series).
- **ALOS PALSAR historical L-band records** via ASF DAAC (historical coherence reference over forested terrain).

---

## Areas of Interest

1. **Serra do Mar - São Sebastião (SP), Brazil**: Steep coastal Atlantic rainforest slopes subject to extreme precipitation and historical landslide disasters (February 2023 reference).
2. **Brumadinho - Quadrilátero Ferrífero (MG), Brazil**: Mining subsidence and surface terrain monitoring in areas adjacent to tailings dams.

---

## Honest limits

1. **Estimated Demonstration Grid**: The current public demo operates on an **estimated (synthetic) demonstration grid** with a constant 85 mm rainfall scenario. While ASF DAAC scene metadata and coordinates are authentic, raw NISAR rasters are not yet fully processed in the local cache. All synthetic cells are explicitly tagged `estimated` on screen and in tooltips.
2. **Triage, Not a Forecast**: TerraAlerta is an inspection prioritization tool. It is **not** an operational warning system, **not** a certified landslide forecast, and does not replace in-situ geotechnical sensors or emergency civil defense mandates.
3. **Brumadinho Is Not a Dam-Safety Assessment**: Terrain subsidence triage near mining structures does **not** evaluate structural dam safety. Dam integrity requires internal piezometers, drainage instrumentation, and certified geotechnical audits.
4. **ENSO Is Context Only**: El Niño–Southern Oscillation (ENSO) diagnostic data (NOAA CPC bulletin) is displayed strictly as regional climate context and is **not part of the risk score** (`in_risk_score = false`). A seasonal climate outlook is not a local landslide forecast.
5. **Line-of-Sight Geometry**: InSAR measurements represent 1D line-of-sight (LOS) displacement, not full 3D ground motion vectors.

---

## AI disclosure

In accordance with NASA Space Apps Challenge 2026 rules:
- Code architecture, technical documentation, and translations were developed with assistance from generative AI tools (Google DeepMind / Gemini and Anthropic Claude within the Antigravity IDE) under human engineering supervision.
- Risk scoring is driven by physical slope stability (infinite slope factor of safety) plus a deformation term from NISAR line-of-sight displacement. A Random Forest hook exists but is not trained yet, because we have no labelled landslide inventory; the score today is physics-based and explainable.
- No AI-generated imagery is presented as measured satellite data, and no NASA emblems appear on synthetic assets.

---

## Inspirations

Presentation ideas, visual workflows, and scientific communication strategies were adapted from fellow projects in the *"Dancing with the SARs"* challenge (no code copied; see [docs/COMPETITORS_AND_ELNINO.md](docs/COMPETITORS_AND_ELNINO.md) for full analysis):

- **Nova Matrics VI** (Fardin-Prodhan): Before/after slider interaction and multi-role views.
- **Dancing with the SARs: The Hidden Steps** (dmanpark): Defining a central demo moment and flagging uncertain pixels.
- **SARabande / OpenSource-SAR** (Sidvortex): Explicit synthetic data labeling and honest population exposure metrics.
- **MOTUS** (Tech-Doomsday): Single-sentence executive verdict and treating "not detected" as a valid outcome.
- **Team Zenith** (nabil24024004): Structured landing screen and comprehensive multi-layer summary tables.
