# TerraAlerta NISAR - Architecture Document / Documento de Arquitetura

> **Languages / Idiomas**: [English](#english) | [Português](#português)

---

<a name="english"></a>
## English

### System Layers
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
   - 3D Earth Globe projection with high-resolution satellite imagery (Esri & NASA Blue Marble)
   - Split-screen swipe comparator (Sentinel-1 C-band vs NISAR L-band)
   - Dual-axis timeseries chart (Rainfall mm vs LOS displacement mm)
   - Civil Defense dispatch simulator with 1-click critical sector evaluation

---

<a name="português"></a>
## Português

### Camadas do Sistema
1. **Fontes de Dados**:
   - NISAR Banda L SAR (ASF DAAC)
   - Sentinel-1 Banda C SAR (ASF DAAC)
   - NASA POWER (Precipitação diária PRECTOTCORR)
   - NASADEM / SRTM (Topografia e declividade do terreno)
   - WorldPop e OpenStreetMap (Exposição de população e edificações)

2. **Pipeline de Processamento (Python)**:
   - `auth_earthdata.py`: Autenticação Earthdata com fallback silencioso para modo metadados.
   - `fetch_sar_datasets.py`: Consulta à SearchAPI do ASF e ingestão de chuva diária da NASA POWER.
   - `sar_processor.py`: Conversão de potência para dB, razão de despolarização HV/HH, declividade e deslocamento em linha de visada (LOS).
   - `ml_risk_model.py`: Modelo híbrido combinando a equação física do talude infinito (fator de segurança FS) com Random Forest calibrado.

3. **Cache Local (`backend/data_cache/`)**:
   - Grades GeoJSON e telemetrias pré-processadas que garantem execução e apresentação 100% offline.

4. **Serviços Backend REST (FastAPI)**:
   - `/health`: Status do servidor e verificação de cache carregado.
   - `/api/aois`: Lista de áreas monitoradas com contagem de cenas por satélite.
   - `/api/aois/{id}/telemetry`: Metadados orbitais e série diária de chuva.
   - `/api/aois/{id}/risk-grid`: Células GeoJSON de 30m com todas as grandezas físicas e score de risco.
   - `/api/aois/{id}/compare`: Comparativo estatístico de coerência e retroespalhamento C vs L.
   - `/api/aois/{id}/timeseries`: Série temporal de deformação acumulada vs precipitação.
   - `/api/alerts/evaluate`: Motor de alerta que calcula taludes críticos e gera boletins prontos da Defesa Civil.

5. **Interface Web Frontend (React + Vite + TypeScript + TailwindCSS + MapLibre GL + Recharts)**:
   - Visualizador de terreno 3D e Projeção do Globo Esférico da Terra com imagens de satélite reais.
   - Comparador deslizante (swipe) lado a lado entre banda C e banda L.
   - Gráfico temporal de dois eixos (Chuva em mm vs Deslocamento em mm).
   - Painel operacional da Defesa Civil com simulação de chuvas extremas e cópia de boletim com um clique.

## Climate Intelligence (ENOS / El Niño)

Veja [ARCHITECTURE_CLIMATE_INTELLIGENCE.md](ARCHITECTURE_CLIMATE_INTELLIGENCE.md): ENOS é contexto climático, fora do `risk_score`; Brumadinho exige trilha própria de barragem.
