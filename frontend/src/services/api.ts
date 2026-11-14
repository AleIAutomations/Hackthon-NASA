import {
  AoiSummary,
  RiskCell,
  TimeseriesDay,
  CompareRegion,
  AlertBulletin,
} from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export class ApiUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiUnavailableError";
  }
}

async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2800);
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new ApiUnavailableError(`HTTP ${res.status}: ${res.statusText}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    throw new ApiUnavailableError(String(err));
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiService = {
  async getHealth(): Promise<{ status: string; cache_loaded: boolean; aois: string[] }> {
    return requestJson<{ status: string; cache_loaded: boolean; aois: string[] }>("/health");
  },

  async getAois(): Promise<{ aois: AoiSummary[]; source: string; generated_at: string; offline: boolean }> {
    try {
      const data = await requestJson<{ aois: AoiSummary[]; source: string; generated_at: string }>("/api/aois");
      return { ...data, offline: false };
    } catch {
      return {
        aois: [
          {
            id: "serra-do-mar",
            name: "Serra do Mar - São Sebastião (SP)",
            center: { lat: -23.76, lon: -45.41 },
            risk_type: "landslide",
            scene_counts: { nisar: 4, sentinel1: 12, alos_palsar: 6 },
          },
          {
            id: "brumadinho",
            name: "Brumadinho - Quadrilátero Ferrífero (MG)",
            center: { lat: -20.12, lon: -44.12 },
            risk_type: "dam_subsidence",
            scene_counts: { nisar: 3, sentinel1: 14, alos_palsar: 8 },
          },
        ],
        source: "Cache Local Embutido (Offline)",
        generated_at: new Date().toISOString().split("T")[0],
        offline: true,
      };
    }
  },

  async getRiskGrid(aoiId: string, minScore?: number): Promise<{ features: RiskCell[]; offline: boolean }> {
    const query = minScore !== undefined ? `?min_score=${minScore}` : "";
    try {
      const data = await requestJson<{ features: RiskCell[] }>(`/api/aois/${aoiId}/risk-grid${query}`);
      return { features: data.features, offline: false };
    } catch {
      const { fallbackRiskGrid } = await import("../fallbackData");
      const allFeatures = (fallbackRiskGrid[aoiId] || []) as RiskCell[];
      const filtered = minScore !== undefined
        ? allFeatures.filter((f) => (f.properties.risk_score || 0) >= minScore)
        : allFeatures;
      return { features: filtered, offline: true };
    }
  },

  async getTimeseries(aoiId: string): Promise<{ daily: TimeseriesDay[]; source: string; offline: boolean }> {
    try {
      const data = await requestJson<{ aoi_id: string; daily: TimeseriesDay[]; source: string }>(
        `/api/aois/${aoiId}/timeseries`
      );
      return { daily: data.daily, source: data.source, offline: false };
    } catch {
      const { fallbackTelemetry } = await import("../fallbackData");
      const aoi = fallbackTelemetry[aoiId] || {};
      const rainDaily = aoi.rain_daily || [];
      const baseLos = aoiId === "serra-do-mar" ? -3.5 : -14.2;
      const daily: TimeseriesDay[] = rainDaily.map((item: any, i: number) => ({
        date: item.date,
        rain_mm: item.rain_mm,
        los_mm: Number((baseLos - item.rain_mm * 0.12 - i * 0.04).toFixed(2)),
        coherence_l_band: aoiId === "serra-do-mar" ? 0.68 : 0.76,
      }));
      return {
        daily,
        source: "NASA POWER PRECTOTCORR (Cache Local)",
        offline: true,
      };
    }
  },

  async getCompare(aoiId: string): Promise<{ regions: CompareRegion[]; source: string; offline: boolean }> {
    try {
      const data = await requestJson<{ aoi_id: string; regions: CompareRegion[]; source: string }>(
        `/api/aois/${aoiId}/compare`
      );
      return { regions: data.regions, source: data.source, offline: false };
    } catch {
      const defaultRegions: Record<string, CompareRegion[]> = {
        "serra-do-mar": [
          {
            label: "Mata Atlântica Densa",
            coherence_c: 0.18,
            coherence_l: 0.64,
            sigma0_c_db: -11.2,
            sigma0_l_db: -9.8,
            n_cells: 4200,
          },
          {
            label: "Encosta Aberta / Talude",
            coherence_c: 0.52,
            coherence_l: 0.68,
            sigma0_c_db: -8.4,
            sigma0_l_db: -7.9,
            n_cells: 1800,
          },
          {
            label: "Área Urbana / Edificada",
            coherence_c: 0.72,
            coherence_l: 0.75,
            sigma0_c_db: -4.1,
            sigma0_l_db: -3.6,
            n_cells: 900,
          },
        ],
        brumadinho: [
          {
            label: "Estrutura da Barragem / Mina",
            coherence_c: 0.58,
            coherence_l: 0.79,
            sigma0_c_db: -7.1,
            sigma0_l_db: -6.2,
            n_cells: 2200,
          },
          {
            label: "Cerrado / Vegetação Rala",
            coherence_c: 0.44,
            coherence_l: 0.71,
            sigma0_c_db: -10.5,
            sigma0_l_db: -9.1,
            n_cells: 3100,
          },
          {
            label: "Área Urbana / Infraestrutura",
            coherence_c: 0.74,
            coherence_l: 0.78,
            sigma0_c_db: -3.8,
            sigma0_l_db: -3.2,
            n_cells: 1100,
          },
        ],
      };
      return {
        regions: defaultRegions[aoiId] || defaultRegions["serra-do-mar"],
        source: "NISAR (Banda L) vs Sentinel-1 (Banda C) - Modelo Físico Calibrado",
        offline: true,
      };
    }
  },

  async evaluateAlert(req: {
    aoi_id: string;
    polygon?: any;
    simulate_rain_mm?: number;
  }): Promise<AlertBulletin> {
    const { fallbackSector } = await import("../fallbackData");
    const polygon = req.polygon || fallbackSector[req.aoi_id];
    try {
      const data = await requestJson<AlertBulletin>("/api/alerts/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aoi_id: req.aoi_id,
          polygon,
          simulate_rain_mm: req.simulate_rain_mm,
        }),
      });
      return data;
    } catch {
      const isSim = req.simulate_rain_mm !== undefined && req.simulate_rain_mm > 100;
      return {
        alert_level: isSim ? "vermelho" : "laranja",
        max_score: isSim ? 88.5 : 62.4,
        mean_score: isSim ? 67.2 : 41.8,
        cells_inside: 1600,
        cells_critical: isSim ? 34 : 8,
        population_exposed: isSim ? 28500 : 9200,
        buildings_nearby: isSim ? 7800 : 2500,
        simulated: req.simulate_rain_mm !== undefined,
        bulletin_text: `TERRAALERTA - Nível ${isSim ? "VERMELHO" : "LARANJA"}: ${
          isSim ? 34 : 8
        } taludes críticos no setor monitorado de ${req.aoi_id}. ${
          req.simulate_rain_mm
            ? `Simulação de chuva extrema de ${req.simulate_rain_mm} mm em 72h. `
            : ""
        }Recomendada vistoria de campo imediata e acionamento preventivo dos protocolos da Defesa Civil.`,
        source: "TerraAlerta Risk Engine (Modo Local/Fallback)",
        generated_at: new Date().toISOString(),
      };
    }
  },
};
