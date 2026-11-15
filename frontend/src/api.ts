export * from "./types";
export * from "./services/api";

import { apiService } from "./services/api";
import { RiskCell } from "./types";

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2800);
  try {
    const resp = await fetch(`${BASE}${path}`, { ...init, signal: ctrl.signal });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return (await resp.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function getRiskGrid(aoiId: string, minScore?: number): Promise<{
  features: RiskCell[];
  offline: boolean;
}> {
  return apiService.getRiskGrid(aoiId, minScore);
}

export interface Summary {
  aoi_id: string;
  verdict: { pt: string; en: string };
  high_risk_km2: { value: number | null; origin: string };
  exposed_population: { value: number | null; origin: string; reason?: string };
  observed_rain_72h?: { value_mm: number; from: string; to: string; source: string } | null;
  scenario_rain_72h_mm?: { value: number };
  is_demo: boolean;
  disclaimer: string;
  track: string;
}

export interface Enso {
  provenance: { source: string; url: string; published: string; status: string };
  state: string;
  indices_c: { nino34: number };
  caveat: string;
  in_risk_score: boolean;
}

const CELL_KM2: Record<string, number> = { "serra-do-mar": 0.0845, brumadinho: 0.0865 };

export async function getSummary(aoiId: string): Promise<Summary> {
  try {
    return await fetchJson<Summary>(`/api/v1/summary/${aoiId}`);
  } catch {
    const { fallbackRiskGrid } = await import("./fallbackData");
    const cells = (fallbackRiskGrid[aoiId] || []) as RiskCell[];
    const high = cells.filter((c) =>
      ["laranja", "vermelho"].includes(c.properties.alert_level)
    ).length;
    const demo = cells.every((c) => c.properties.data_origin !== "measured");
    const km2 = Math.round(high * (CELL_KM2[aoiId] ?? 0.085) * 10) / 10;
    const dam = aoiId === "brumadinho";
    return {
      aoi_id: aoiId,
      verdict: {
        pt: `${km2} km² em risco alto.${demo ? " Cenário de demonstração: dados estimados, não medidos." : ""}`,
        en: `${km2} km² at high risk.${demo ? " Demonstration scenario: estimated data." : ""}`,
      },
      high_risk_km2: { value: km2, origin: "derived" },
      exposed_population: { value: null, origin: "unavailable", reason: "WorldPop ainda não carregado" },
      is_demo: demo,
      disclaimer: dam
        ? "Triagem para priorizar vistoria. Não é previsão nem avaliação de segurança de barragem."
        : "Triagem para priorizar vistoria. Não é previsão de deslizamento.",
      track: dam ? "dam_monitoring_not_slope_model" : "landslide_triage",
    };
  }
}

export async function getEnso(): Promise<Enso> {
  try {
    return await fetchJson<Enso>("/api/v1/climate/enso");
  } catch {
    return {
      provenance: {
        source: "NOAA CPC",
        url: "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml",
        published: "2026-11-12",
        status: "static_fallback",
      },
      state: "El Nino Advisory",
      indices_c: { nino34: 2.5 },
      caveat: "Contexto sazonal. Não causa deslizamentos e não entra no score.",
      in_risk_score: false,
    };
  }
}
