# TerraAlerta NISAR — 3-Minute Pitch Script & Slide Deck

**NASA Space Apps Challenge 2026** · Challenge: *"Dancing with the SARs"*  
**Project:** TerraAlerta NISAR (Triage & Inspection Prioritization Platform)

---

## Pitch Timing Breakdown (3 Minutes)

### [0:00 - 0:25] The Problem & The Scientific Edge
In February 2023, extreme downpours triggered catastrophic landslides along the northern coast of São Paulo, Brazil. The slopes had been creeping for weeks, but ground deformation was completely concealed beneath dense Atlantic rainforest. 

Optical satellites cannot see through clouds or canopies, and Sentinel-1 C-band radar (~5.6 cm wavelength) scatters off leaves and turns to noise. 

This is where the NASA/ISRO **NISAR L-band radar (~24 cm wavelength)** changes the equation: its longer wavelength penetrates through dense tropical forest canopies directly to the bedrock.

---

### [0:25 - 0:55] What TerraAlerta Does: Triage, Not a Forecast
TerraAlerta NISAR is an **inspection triage platform** for Civil Defense teams—not an automated landslide forecast. 

Using an infinite-slope geotechnical model combined with InSAR coherence and slope geometry, we classify terrain across a ~300 m grid into four actionable alert levels: Green, Yellow, Orange, and Red. This allows emergency managers to prioritize where geotechnical crews must conduct field visits before disaster strikes.

---

### [0:55 - 1:45] Central Demo Moment: Simulating Storms & The Two Headline Metrics
*(Presenter demonstrates live on screen)*:
Watch what happens when we simulate an extreme storm event over our Serra do Mar area of interest. 

The risk grid lights up instantly across the map. Looking at our executive headline banner, Civil Defense teams immediately get the two numbers that matter most:
1. **10.3 km² at high risk** (all orange and red cells prioritized for ground inspection).
2. **Exposed population: unavailable**—and we state this prominently because WorldPop layers are not yet ingested into the cache. In scientific triage, we never fabricate population numbers.

Every cell in the dashboard displays its provenance: the current demo honestly declares an **estimated demonstration grid** (synthetic scenario with a constant 150 mm soil-saturation scenario), with full pipeline readiness for raw NISAR rasters.

---

### [1:45 - 2:15] C vs L Band Swipe & Climate Context (ENSO)
*(Presenter switches to the Comparison and Climate views)*:
Swiping across our radar comparison tool reveals the physical reason NISAR is essential: in forested zones, C-band coherence collapses (0.15–0.25), while NISAR L-band maintains high ground coherence (0.65–0.78).

In the Climate Intelligence panel, we surface the official NOAA Climate Prediction Center ENOS bulletin. Crucially, **ENSO is large-scale context only and is not part of the risk score**. A seasonal climate outlook indicates regional moisture tendencies, but it is never treated as a local landslide forecast.

---

### [2:15 - 2:40] Second Area: Brumadinho (Mining Terrain Triage)
With zero code modifications, our spatial pipeline generalizes to our second area of interest: Brumadinho, in Minas Gerais. 

Here, TerraAlerta tracks surface deformation and terrain subsidence in areas surrounding mining operations. Crucially, we clearly state that **this is not a structural dam-safety assessment**—evaluating dam integrity requires internal piezometers, drainage sensors, and certified geotechnical audits.

---

### [2:40 - 3:00] Honest Limits, Impact & Next Steps
We built TerraAlerta around radical transparency:
- **Triage over false prediction**: Prioritizing site visits rather than claiming automated forecasts.
- **Data integrity**: Explicit labeling of estimated demo data and no invented population counts.
- **Open science**: Open-source architecture ready to ingest raw NISAR GCOV and GUNW granules upon public release.

Thank you.

---

## 7-Slide Deck Outline

### Slide 1: Title & Vision
- **Header**: TerraAlerta NISAR — Radar Triage Beneath the Forest Canopy
- **Visual**: Satellite render of NISAR passing over South America alongside an aerial view of Serra do Mar.
- **Key Message**: Triage and inspection prioritization for civil defense using L-band radar penetration.

### Slide 2: The Physical Challenge
- **Header**: Why C-Band Fails in Tropical Slopes
- **Visual**: Diagram showing Sentinel-1 C-band (~5.6 cm) scattering off tree foliage vs. NISAR L-band (~24 cm) penetrating to the ground.
- **Key Metric**: C-band coherence drops below 0.20 in rainforest; L-band preserves coherence above 0.70.

### Slide 3: The Architecture
- **Header**: Physics-Grounded Spatial Triage
- **Visual**: Multi-layer stack (NASADEM slope + InSAR coherence + precipitation scenario) feeding into infinite-slope factor of safety.
- **Key Message**: Triage to prioritize inspection, not a black-box forecast.

### Slide 4: Central Demo Moment (The Live Map)
- **Header**: Simulated Storm & Immediate Civil Defense Metrics
- **Visual**: Screenshot of the interactive dashboard lighting up after rain simulation.
- **Callout 1**: **10.3 km²** in high risk (orange/red cells).
- **Callout 2**: Exposed population: **unavailable** (WorldPop pending—zero fabricated data).

### Slide 5: Scientific Honesty & Climate Context
- **Header**: Radical Provenance & ENSO Separation
- **Visual**: Badge showing `DADO ESTIMADO · DEMONSTRAÇÃO` alongside the Climate Intelligence card.
- **Key Principle**: ENSO is seasonal climate context only, strictly outside the risk score (`in_risk_score = false`).

### Slide 6: Multi-Hazard Generalization (Brumadinho)
- **Header**: Mining Terrain Subsidence Monitoring
- **Visual**: Brumadinho area map showing ground displacement vectors.
- **Mandatory Disclaimer**: Surface terrain deformation triage is **not a structural dam-safety assessment**.

### Slide 7: Impact, AI Disclosure & Team
- **Header**: Open Science for Resilient Communities
- **Bullets**:
  - Full AI tool disclosure (Google Gemini & Anthropic Claude under human engineering).
  - NASA data: NISAR (ASF DAAC), Sentinel-1, NASADEM, NASA POWER.
  - License: Open Source (Apache 2.0).
- **Call to Action**: Ready for operational municipal civil defense pilots.
