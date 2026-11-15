# Validation status

The risk score has not been validated against real landslides. This file records the check we ran and why it did not produce a result.

## What we tried

We downloaded the NASA Global Landslide Catalog (11,033 events worldwide, 214 in Brazil) and filtered it by the bounding box of each area (`data_pipeline/fetch_landslides.py`).

| Area | Events inside the area | Nearest events |
|---|---|---|
| Serra do Mar, São Sebastião (SP) | 0 | about 100 km away (Greater São Paulo, 2007 to 2011) |
| Brumadinho (MG) | 1 | Belo Horizonte, 2012, located only to within 10 km |

Most Brazilian events in the catalog are from 2010 and 2011. The February 2023 São Sebastião disaster is not in it.

## What this means

- With 0 and 1 events, we cannot compute hit rates or compare against random cells. A 10 km location error is also far larger than our 300 m cells.
- The score is a physical triage ranking (infinite-slope model, real slope, rainfall scenario, NISAR backscatter). It is labeled `estimated` in the app and should not be read as a probability.

## What would validate it

- A mapped scar inventory for the February 2023 São Sebastião event (for example from Brazilian geological or civil-defense agencies), compared with the cells ranked highest by the model before that date.
- A longer NISAR time series, so that coherence and displacement can enter the score with a quality threshold.

The raw catalog CSV (8 MB) is not committed. Download `Global_Landslide_Catalog_Export.csv` from the NASA open data portal (catalog.data.gov, search "Global Landslide Catalog") into `data_pipeline/landslides_glc.csv` and run `python data_pipeline/fetch_landslides.py`. The filtered results are cached in `backend/data_cache/<area>/landslides_glc.json`.
