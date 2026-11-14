# TerraAlerta NISAR - Architecture Document

## System Layers
1. **Data Sources**:
   - NISAR L-band SAR (ASF DAAC)
   - Sentinel-1 C-band SAR (ASF DAAC)
   - NASA POWER (Precipitation PRECTOTCORR)
   - NASADEM / SRTM (Topography & slope)
   - WorldPop & OpenStreetMap (Population & buildings exposure)

2. **Data Pipeline (Python)**:
   - `auth_earthdata.py`: NASA Earthdata login and fallback
   - `fetch_sar_datasets.py`: ASF SearchAPI granule metadata & NASA POWER daily rain
   - `sar_processor.py`: Decibel conversion, HH/HV depolarization, slope derivation, LOS displacement
   - `ml_risk_model.py`: Hybrid physical infinite-slope safety factor (FS) + Random Forest risk score (0-100)

3. **Local Cache (`backend/data_cache/`)**:
   - Pre-generated GeoJSON risk grids and telemetry for offline resilience during evaluation.

4. **REST API Backend (FastAPI)**:
   - `/health`: Health status & loaded AOIs
   - `/api/aois`: List study areas
   - `/api/aois/{id}/telemetry`: Metadata & rain timeseries
   - `/api/aois/{id}/risk-grid`: Filterable GeoJSON cells with physical properties
   - `/api/aois/{id}/compare`: C-band vs L-band coherence and backscatter
   - `/api/aois/{id}/timeseries`: Temporal deformation & rainfall
   - `/api/alerts/evaluate`: Civil defense bulletin generator with simulated extreme rainfall

5. **Frontend (React + Vite + TypeScript + TailwindCSS + MapLibre GL + Recharts)**:
   - 3D Terrain & risk layer with visual distinction for estimated vs measured data
   - Split-screen swipe comparator (Sentinel-1 C-band vs NISAR L-band)
   - Dual-axis timeseries chart (Rainfall mm vs LOS displacement mm)
   - Civil Defense dispatch simulator with 1-click critical sector evaluation
