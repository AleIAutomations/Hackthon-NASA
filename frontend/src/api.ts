const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export class ApiUnavailable extends Error {}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2500);
  try {
    const resp = await fetch(`${BASE}${path}`, { ...init, signal: ctrl.signal });
    if (!resp.ok) throw new ApiUnavailable(`HTTP ${resp.status}`);
    return (await resp.json()) as T;
  } catch (err) {
    throw new ApiUnavailable(String(err));
  } finally {
    clearTimeout(timer);
  }
}

export interface RiskCell {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: {
    risk_score: number;
    alert_level: "verde" | "amarelo" | "laranja" | "vermelho";
    slope_deg: number | null;
    rain_72h_mm: number | null;
    coherence_l_band: number | null;
    coherence_c_band: number | null;
    los_displacement_mm: number | null;
    data_origin: "measured" | "derived" | "estimated";
    color?: string;
    estimado?: number;
  };
}

export async function getRiskGrid(aoiId: string): Promise<{
  features: RiskCell[];
  offline: boolean;
}> {
  try {
    const data = await fetchJson<{ features: RiskCell[] }>(
      `/api/aois/${aoiId}/risk-grid`
    );
    return { features: data.features, offline: false };
  } catch {
    const { fallbackRiskGrid } = await import("./fallbackData");
    const cells = (fallbackRiskGrid[aoiId] || []) as RiskCell[];
    return { features: cells, offline: true };
  }
}
