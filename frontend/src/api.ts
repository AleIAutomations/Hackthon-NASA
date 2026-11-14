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
