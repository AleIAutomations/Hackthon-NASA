# TerraAlerta NISAR - 3-Minute Pitch Script & Slide Deck

## Timing Breakdown (3 Minutes)
- **[0:00 - 0:20] The Problem**:
  In February 2023, extreme rainfall triggered catastrophic landslides along the northern coast of São Paulo. The slopes had been deforming for weeks—millimeters at a time—invisible to optical sensors and hidden beneath dense Atlantic forest.
- **[0:20 - 0:50] The Solution (NISAR L-band)**:
  TerraAlerta taps into NISAR, the NASA/ISRO SAR mission. Unlike Sentinel-1 C-band (~5.6 cm) which bounces off leaves and turns to noise, L-band (~24 cm) penetrates through dense canopy directly to the bedrock. Every point on our map is a 30-meter cell scored 0 to 100.
- **[0:50 - 1:30] C vs L Band Comparison**:
  Side-by-side comparison: on forested slopes, C-band coherence collapses (noise), while NISAR L-band maintains ground coherence.
- **[1:30 - 2:10] Physics, Rain & Civil Defense Alert**:
  We fuse radar interferometry with real NASA POWER rainfall and NASADEM slope. Simulating an extreme 200 mm storm flips vulnerable slopes to red. In under 5 seconds, the Civil Defense bulletin is generated: exposed population, critical slopes, and actionable evacuation guidelines.
- **[2:10 - 2:40] Generalization (Brumadinho)**:
  With zero code changes, we monitor Brumadinho: tailings dams and mining subsidence.
- **[2:40 - 3:00] Conclusion & Honesty**:
  All cells transparently declare if data is measured, derived, or estimated. Next step: municipal civil defense pilot. Thank you.

## 7 Slides Outline
1. **Title**: TerraAlerta NISAR - L-band radar watching slopes beneath the forest.
2. **The Problem**: Pre-failure ground motion is invisible under dense canopies.
3. **The Solution**: Multi-source fusion (NISAR + NASA POWER + NASADEM) to risk score.
4. **NASA Data Used**: NISAR (GCOV/GUNW), Sentinel-1, NASADEM, NASA POWER.
5. **Interactive Demo**: 3D Risk Map, C vs L Swipe, Rainfall vs Displacement timeseries.
6. **Civil Defense & Impact**: Immediate actionable dispatch, exposed population estimates.
7. **Team, Disclosure & References**: Full scientific citations, open source Apache 2.0.
