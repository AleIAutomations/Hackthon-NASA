# TerraAlerta NISAR - Contexto do Projeto para Agentes e Colaboradores
*(Project Context & Grounding for AI Agents and Human Collaborators)*

Este documento serve como o **ponto de ancoragem e alinhamento (grounding)** para qualquer agente de IA ou desenvolvedor que for continuar o desenvolvimento, auditoria ou manutenção deste repositório.

---

## 1. O que é o Projeto

- **Nome**: TerraAlerta NISAR
- **Evento**: NASA Space Apps Challenge 2026
- **Desafio Escolhido**: *"Dancing with the SARs"* (Ciências da Terra / Sensoriamento Remoto por Radar)
- **Objetivo Principal**: Monitoramento geoespacial precoce de deformações lentas de encostas e barragens de rejeitos no Brasil, cruzando dados de radar de satélite (**NISAR banda L** e **Sentinel-1 banda C**) com precipitação diária (**NASA POWER**) e declividade do terreno (**NASADEM / SRTM**).
- **Proposta de Valor Central**: Em regiões tropicais brasileiras (ex: Serra do Mar), o radar de banda C (~5,6 cm) decorrelaciona e vira ruído na copa das árvores. O radar de banda L (~24 cm) do satélite NISAR penetra o dossel florestal e mede diretamente o solo e a rocha matriz. O sistema converte esse sinal em um boletim operacional pronto para a Defesa Civil em menos de 5 segundos.

---

## 2. Decisões de Arquitetura e Engenharia Tomadas

### A. Política Cache-First & Resiliência Offline (RNF02)
- Durante avaliações de hackathons ou eventos de emergência, conexões com APIs externas (NASA ASF DAAC / GES DISC) podem falhar ou exigir autenticações pesadas.
- O backend opera em modo **`DEMO_CACHE_FIRST`**, servindo os GeoJSONs pré-computados das duas áreas de estudo (`backend/data_cache/`).
- O frontend possui um fallback estático embutido (`frontend/src/fallbackData.ts`), garantindo que **a aplicação web e os mapas funcionem 100% mesmo se a internet ou o backend caírem**.

### B. Visualização Dual: Globo 3D Esférico + Terreno Local
- **Globo Esférico 3D (`react-globe.gl` + Three.js)**: A Terra é renderizada como uma esfera 3D real flutuando no espaço sideral com estrelas, brilho atmosférico, imagens da NASA Blue Marble / Terra Noturna, rotação orbital interativa e células SAR projetadas na superfície.
- **Terreno 3D Local (`MapLibre GL`)**: Permite inspecionar taludes locais inclinados a 58° com fotografia de satélite de alta resolução (Esri World Imagery) e filtros interativos por nível de risco (*Todos, Baixo, Atenção, Alto, Crítico*).
- **Comparador SAR (`BandComparison.tsx`)**: Divisor deslizante (*swipe*) que compara visualmente a banda C (Sentinel-1) e a banda L (NISAR) lado a lado na mesma extensão.

### C. Transparência Científica e Regras da NASA 2026
- Cada célula de 30m possui o campo `data_origin`:
  - `measured`: Dado orbital medido diretamente via produto validado.
  - `derived`: Dado derivado de equações físicas ou modelos (ex: declividade do NASADEM).
  - `estimated`: Estimativa calibrada de InSAR quando o par de cenas complexo não estiver disponível localmente (renderizado com contorno tracejado no mapa).
- **Simulador de Chuva 72h**: O recálculo físico utiliza a equação clássica de estabilidade de talude infinito saturado através do endpoint real `POST /api/alerts/evaluate?simulate_rain_mm=X`. Jamais inventar fórmulas fictícias no cliente.
- **Salvaguarda de Defesa Civil**: A aplicação deixa explícito em todos os painéis e no modal de despacho que é uma ferramenta de triagem técnica e que qualquer ordem formal de evacuação compete exclusivamente às autoridades públicas.

---

## 3. Estrutura do Repositório

```text
terra-alerta-nisar/
├── AGENT_CONTEXT.md               # Este arquivo de alinhamento
├── README.md                      # Documentação bilíngue oficial (PT/EN)
├── .env.example                   # Modelo de variáveis de ambiente
├── .gitignore                     # Proteção de credenciais e caches binários
├── docker-compose.yml             # Orquestração do backend + frontend
├── docs/
│   ├── ARCHITECTURE.md            # Especificação das 5 camadas do sistema
│   └── PITCH_SCRIPT_3MIN.md       # Roteiro do pitch de 3 minutos + 7 slides
├── data_pipeline/                 # Pipeline Python de ingestão e física SAR
│   ├── auth_earthdata.py          # Autenticação NASA Earthdata e .netrc
│   ├── fetch_sar_datasets.py      # Busca ASF SearchAPI e NASA POWER
│   ├── sar_processor.py           # Processamento dB, despolarização e DEM
│   ├── ml_risk_model.py           # Modelo híbrido (talude infinito + Random Forest)
│   ├── compare_builder.py         # Estatísticas de coerência C vs L
│   ├── exposure.py                # População exposta (WorldPop / Overpass)
│   ├── notify.py                  # Disparo para webhooks
│   └── tests/                     # Testes automatizados (pytest)
├── backend/                       # API REST FastAPI
│   ├── main.py                    # Servidor principal com CORS liberado
│   ├── routers/
│   │   ├── aoi.py                 # Áreas, telemetria e grade de risco
│   │   ├── compare.py             # Comparativo C vs L
│   │   ├── alerts.py              # Motor de avaliação e simulação de chuva
│   │   └── tiles.py               # Fatiamento de tiles COG
│   ├── data_cache/                # Cache GeoJSON das duas áreas de interesse
│   └── tests/test_api.py          # Testes de contrato da API
├── scripts/
│   └── gerar_fallback.py          # Compila o cache no frontend/src/fallbackData.ts
└── frontend/                      # Aplicação Web (React + Vite + TS + Tailwind)
    ├── src/
    │   ├── types/index.ts         # Tipos TypeScript estritos
    │   ├── services/api.ts        # Cliente de API centralizado com cache-first
    │   ├── fallbackData.ts        # Dados estáticos embutidos para modo offline
    │   ├── mapStyles.ts           # Estilos de satélite (Esri, NASA Blue Marble, Dark)
    │   ├── components/
    │   │   ├── layout/            # AppShell, Sidebar (7 telas) e Topbar
    │   │   ├── dashboard/         # MetricCards
    │   │   ├── map/               # Globe3DView, Map3DView e RiskLegend
    │   │   ├── sar/               # BandComparison (Swipe C vs L)
    │   │   ├── charts/            # InSARTimeSeries (Recharts)
    │   │   ├── alerts/            # CivilDefensePanel e DispatchModal
    │   │   ├── simulation/        # RainfallSimulator
    │   │   └── common/            # ProvenanceBadge e StatusIndicator
    │   ├── pages/                 # As 7 telas da aplicação
    │   └── App.tsx                # Orquestrador da aplicação
```

---

## 4. As 7 Telas do Frontend Implementadas

1. **Visão Geral (`overview`)**: Cards com métricas consolidadas, seletor de AOI, mapa/globo central, painel da Defesa Civil e legenda de risco.
2. **Monitoramento Geográfico (`monitoring`)**: Exploração espacial ampla com filtros dinâmicos por nível de alerta (*Todos, Baixo, Atenção, Alto, Crítico*), inspetor geotécnico e alternância 3D.
3. **Comparador SAR (`compare`)**: Comparador com divisor móvel (*swipe*) comparando Sentinel-1 (banda C) e NISAR (banda L), com gráfico de coerência por cobertura vegetal.
4. **Histórico de Deformação (`timeseries`)**: Gráfico temporal de chuva diária vs deslocamento LOS em mm, com marcação da lacuna de calibração do instrumento NISAR (27/07 a 10/08/2026).
5. **Central de Alertas (`alerts`)**: Cálculo de taludes críticos, contagem de população e edificações expostas, e modal de despacho seguro com confirmação explícita.
6. **Relatórios (`reports`)**: Pareceres técnicos formatados com histórico de boletins, persistência local e suporte a impressão / exportação em PDF.
7. **Fontes de Dados (`datasources`)**: Catálogo completo com status, frequências, links oficiais e limitações de cada dataset NASA/parceiros.

---

## 5. Como Executar e Validar

### Iniciar o Backend:
```bash
python -m uvicorn main:app --app-dir backend --port 8000
```
- Endpoint de saúde: `http://localhost:8000/health`
- Swagger / OpenAPI: `http://localhost:8000/docs`

### Iniciar o Frontend:
```bash
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173
```
- Aplicação ativa: `http://localhost:5173/`

### Executar Testes Automatizados:
```bash
python -m pytest backend/tests data_pipeline/tests -v
```

### Compilar o Frontend para Produção:
```bash
cd frontend
npm run build
```

---

## 6. Próximos Passos e Roadmap Técnico

Caso novos agentes ou desenvolvedores forem expandir o sistema:
1. **Ingestão Contínua**: Criar um cron / webhook para consultar automaticamente novas passagens do NISAR sobre as AOIs na SearchAPI do ASF.
2. **Upgrade de Resolução de Chuva**: Conectar a grade de 10 km do GPM IMERG via `data_pipeline/imerg_fetch.py` quando credenciais GES DISC estiverem configuradas no `.env`.
3. **WorldPop Real**: Realizar o download local do raster populacional do Brasil (`bra_ppp.tif`) para cálculo matricial exato via `data_pipeline/worldpop_exposure.py`.
4. **Novas AOIs**: O pipeline é agnóstico à área. Para adicionar uma nova região (ex: Vale do Paraíba ou encostas no Rio de Janeiro), basta registrar o polígono WKT e as coordenadas no dicionário `AOIS` em `fetch_sar_datasets.py`.
