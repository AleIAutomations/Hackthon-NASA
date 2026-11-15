# TerraAlerta NISAR

**Challenge:** Dancing with the SARs · NASA Space Apps Challenge 2026

## What it does
TerraAlerta NISAR is a triage tool for civil-defense teams. It combines NISAR L-band radar with rainfall and terrain data to rank where a site visit should happen first, in two areas of Brazil: Serra do Mar (São Sebastião, SP) and Brumadinho (MG).

L-band (~24 cm) penetrates vegetation better than Sentinel-1 C-band (~5.6 cm), which is why it suits forested slopes where C-band loses coherence.

## What we show, and how we label it
Every value is tagged as **measured**, **derived** or **estimated**. The public demo currently runs on an **estimated demonstration grid**, because the NISAR products over our areas are not yet processed in the cache. The interface says so on screen. Real NISAR scenes over both areas exist (ASF DAAC metadata); processing them is the next step.

- Headline of the dashboard: one-sentence verdict and two numbers (km² at high risk, exposed population). Exposed population is shown as "unavailable" until WorldPop is loaded; we do not invent it.
- Risk score (0–100) from an infinite-slope factor of safety plus a line-of-sight displacement term. A Random Forest hook exists but is untrained: we have no labelled landslide inventory yet. Four alert levels: green, yellow, orange, red.
- Climate context card (ENSO, NOAA CPC bulletin of 2026-11-12). It is context only and **not part of the risk score**. A seasonal outlook is not a landslide forecast.
- Brumadinho is a dam area. The slope model is not a dam-safety assessment, and the interface says that.

## NASA data and resources
- NISAR L-band products (GCOV, GUNW, RSLC/GSLC metadata) via ASF DAAC
- NASA POWER (rainfall) and GPM IMERG (planned)
- Terrain elevation: AWS Terrain Tiles (Terrarium, built from SRTM and other public sources); slope derived per cell. Real, not synthetic.
- Complementary: Sentinel-1 (ESA), WorldPop, OpenStreetMap

## Honest limits
Triage to prioritise inspection, not a forecast and not an operational warning. NISAR products in the PROVISIONAL stage are not final. LOS displacement is a line-of-sight measurement, not a full 3D movement.

## AI / software-tool disclosure
We used generative AI tools (Anthropic Claude, Google Gemini inside the Antigravity IDE) to help write code and documentation. Humans reviewed the result. No AI-generated imagery is used as data. No NASA logo or branding appears in AI-generated content.

## Inspirations
Ideas of presentation and method from other projects in the same challenge, credited in the README. No code was copied.

## Links
Repository: https://github.com/AleIAutomations/Hackthon-NASA
