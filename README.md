# TerraAlerta NISAR

> **Languages / Idiomas**: [English](#english) | [Português](#português)  
> **AI Agents & Collaborators Grounding**: See [AGENT_CONTEXT.md](file:///c:/Users/Alexandre/Downloads/n/Hackthon-NASA/AGENT_CONTEXT.md) for full architecture context and decisions.

---

<a name="english"></a>
## English

Landslide and dam-deformation early warning built on NISAR L-band radar, Sentinel-1, NASADEM and NASA POWER rainfall.

**NASA Space Apps Challenge 2026** - Challenge: *"Dancing with the SARs"*

### Overview
TerraAlerta NISAR crosses satellite radar imagery with precipitation and topography to pinpoint on an interactive map where a slope or dam is beginning to deform, prior to catastrophic failure. Its core scientific edge is leveraging the L-band radar (~24 cm wavelength) of the NASA/ISRO NISAR satellite, which penetrates dense tropical forest canopies down to the ground, where C-band radar (Sentinel-1, ~5.6 cm) typically decorrelates into noise.

### Quick Start
```bash
# 1. Environment setup (optional Earthdata credentials)
cp .env.example .env

# 2. Run data pipeline (or rely on bundled cache)
python data_pipeline/fetch_sar_datasets.py
python data_pipeline/sar_processor.py
python data_pipeline/ml_risk_model.py
python scripts/gerar_fallback.py

# 3. Start backend (FastAPI)
python -m uvicorn main:app --app-dir backend --port 8000

# 4. Start frontend (React + Vite + TypeScript)
cd frontend
npm install
npm run dev
```

No Earthdata account? The pipeline automatically falls back to metadata-only discovery mode, and the application serves the pre-computed high-resolution cache for our two study areas (`serra-do-mar` and `brumadinho`).

### Architecture & NASA Datasets Used
- **NISAR L-band products (GCOV / GUNW)** via ASF DAAC
- **Sentinel-1 C-band baseline** via ASF DAAC
- **NASADEM / SRTM elevation & slope**
- **NASA POWER daily precipitation (PRECTOTCORR)**
- **ALOS PALSAR L-band historical records** (ASF DAAC)

### Areas of Interest
1. **Serra do Mar - São Sebastião (SP), Brazil**: Dense Atlantic rainforest on steep slopes with historical extreme rainfall and fatal landslides (February 2023).
2. **Brumadinho - Quadrilátero Ferrífero (MG), Brazil**: Tailings dam deformation and mining subsidence monitoring (January 2019 event reference).

### Scientific Honesty Policy
Every single grid cell is tagged as `measured`, `derived`, or `estimated`. Estimated cells are rendered with dashed borders on the map and explicitly labeled in tooltips and submission disclosures.

### AI / Super Intelligence (SI) Disclosure
In accordance with the 2026 NASA Space Apps rules:
- Code generation, documentation, and translation assisted by Google DeepMind / Gemini AI tools under human engineering supervision.
- Risk prediction architecture is physical (infinite slope stability factor of safety) combined with explainable statistical models (Random Forest), never a black box.
- All AI-assisted assets are watermarked and declared.

---

<a name="português"></a>
## Português

Sistema de alerta precoce de deslizamento de encostas e deformação de barragens baseado no radar de banda L do satélite NISAR, Sentinel-1, relevo NASADEM e precipitação NASA POWER.

**NASA Space Apps Challenge 2026** - Desafio: *"Dancing with the SARs"*

### Visão Geral
O **TerraAlerta NISAR** cruza imagens de radar de satélite com chuva e relevo para apontar, em um mapa interativo, onde uma encosta ou uma barragem está começando a se deformar, antes de romper. O diferencial científico central é o uso da banda L do satélite NISAR (NASA/ISRO), cujo comprimento de onda de cerca de 24 cm atravessa a copa densa das árvores e enxerga o solo embaixo da mata tropical, algo que o radar de banda C do Sentinel-1 (~5,6 cm) não consegue fazer bem (decorrelaciona em ruído).

### Inicialização Rápida
```bash
# 1. Configuração do ambiente (credenciais Earthdata opcionais)
cp .env.example .env

# 2. Executar pipeline de dados (ou utilizar o cache embutido)
python data_pipeline/fetch_sar_datasets.py
python data_pipeline/sar_processor.py
python data_pipeline/ml_risk_model.py
python scripts/gerar_fallback.py

# 3. Iniciar backend (FastAPI)
python -m uvicorn main:app --app-dir backend --port 8000

# 4. Iniciar frontend (React + Vite + TypeScript)
cd frontend
npm install
npm run dev
```

Sem conta Earthdata? O pipeline entra automaticamente no modo somente-metadados e a aplicação serve o cache embutido de alta resolução das duas áreas de estudo (`serra-do-mar` e `brumadinho`).

### Arquitetura e Dados da NASA Utilizados
- **NISAR Banda L (produtos GCOV / GUNW)** via ASF DAAC
- **Sentinel-1 Banda C (baseline de comparação)** via ASF DAAC
- **NASADEM / SRTM (elevação e declividade do terreno)**
- **NASA POWER (chuva diária PRECTOTCORR sem necessidade de chave)**
- **ALOS PALSAR Banda L (série histórica)** via ASF DAAC

### Áreas de Estudo Monitoradas
1. **Serra do Mar - São Sebastião (SP)**: Mata Atlântica densa sobre encostas íngremes com histórico de chuvas extremas e deslizamentos trágicos (carnaval de 2023).
2. **Brumadinho - Quadrilátero Ferrífero (MG)**: Monitoramento de subsidência e estabilidade de barragens de rejeitos de mineração (evento de referência de janeiro de 2019).

### Política de Honestidade Científica
Cada célula da malha de risco carrega a etiqueta de sua origem: `measured` (medida), `derived` (derivada) ou `estimated` (estimada). Células estimadas possuem contorno visual destacado e são expressamente identificadas no tooltip e no formulário de submissão.

### Declaração de Uso de IA / Superinteligência (SI)
Em conformidade com as regras oficiais do NASA Space Apps Challenge 2026:
- Código, documentação técnica e tradução gerados com assistência de modelos de IA da Google DeepMind / Gemini sob revisão e engenharia humana.
- O modelo de risco utiliza física clássica (fator de segurança de talude infinito) somada a aprendizado estatístico explicável (Random Forest), não sendo uma caixa-preta.
- Todos os materiais gerados por IA são declarados e identificados.

> Arquitetura Climate Intelligence (ENOS): [docs/ARCHITECTURE_CLIMATE_INTELLIGENCE.md](docs/ARCHITECTURE_CLIMATE_INTELLIGENCE.md)

## Inspirações e referências / Inspirations and references

Ideias de apresentação e abordagem tiradas de projetos do mesmo desafio ("Dancing with the SARs"). Nenhum código foi copiado. Detalhes em [docs/COMPETITORS_AND_ELNINO.md](docs/COMPETITORS_AND_ELNINO.md).

- Nova Matrics VI (Fardin-Prodhan): slider antes/depois, divisão de papéis — https://github.com/Fardin-Prodhan/Nova-Matrics---VI
- Dancing with the SARs: The Hidden Steps (dmanpark): um momento central na demo, validação com dado óptico, marcação de pixels duvidosos — https://github.com/dmanpark/dancing-with-the-sars
- SARabande / OpenSource-SAR (Sidvortex): rótulo de dado sintético, população exposta, botão radar/óptico, exportação — https://github.com/Sidvortex/OpenSource-SAR
- MOTUS (Tech-Doomsday): veredito em uma frase, "não detectado" como resultado válido, registro de fontes — https://github.com/Tech-Doomsday/dancing-with-sars-eq
- Team Zenith (nabil24024004): primeira tela, tabela-resumo de camadas — https://github.com/nabil24024004/Team-Zenith-Dancing-With-SARs
