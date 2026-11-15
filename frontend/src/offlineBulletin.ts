import type { AlertBulletin, RiskLevel } from "./types";

const nivel = (s: number): RiskLevel =>
  s >= 75 ? "vermelho" : s >= 50 ? "laranja" : s >= 25 ? "amarelo" : "verde";

/** Mesma fisica do backend (talude infinito); usada so quando a API esta offline. */
function rescore(slope: number, rainMm: number, coh: number | null): number {
  if (slope <= 0) return 0;
  const sat = Math.min(1, rainMm / 150);
  const b = (slope * Math.PI) / 180;
  const num = 8 + (18 - sat * 9.81) * 2 * Math.cos(b) ** 2 * Math.tan((32 * Math.PI) / 180);
  const den = 18 * 2 * Math.sin(b) * Math.cos(b);
  const fs = den > 0 ? num / den : 99;
  let score = 100 * Math.max(0, Math.min(1, (1.8 - fs) / 1.8));
  if (coh !== null && coh < 0.3) score = Math.min(100, score + 10);
  return Math.round(score * 10) / 10;
}

/** Boletim calculado sobre o cache local. Populacao e edificacoes ficam indefinidas: nao ha dado. */
export async function buildOfflineBulletin(
  aoiId: string,
  rainMm?: number
): Promise<AlertBulletin> {
  const { fallbackRiskGrid } = await import("./fallbackData");
  const cells = (fallbackRiskGrid[aoiId] ?? []) as any[];
  const scores = cells.map((c) =>
    rainMm === undefined
      ? Number(c.properties.risk_score) || 0
      : rescore(c.properties.slope_deg ?? 0, rainMm, c.properties.coherence_l_band ?? null)
  );
  const n = scores.length || 1;
  const max = scores.length ? Math.max(...scores) : 0;
  const mean = scores.reduce((a, b) => a + b, 0) / n;
  const critical = scores.filter((s) => s >= 75).length;
  const demo = cells.length > 0 && cells.every((c) => c.properties.data_origin !== "measured");
  const lvl = nivel(max);
  return {
    alert_level: lvl,
    max_score: Math.round(max * 10) / 10,
    mean_score: Math.round(mean * 10) / 10,
    cells_inside: cells.length,
    cells_critical: critical,
    simulated: rainMm !== undefined,
    bulletin_text:
      `TERRAALERTA - Nível ${lvl.toUpperCase()}: ${critical} células críticas ` +
      `(score máx ${max.toFixed(0)}/100) no setor monitorado. ` +
      (rainMm !== undefined ? `Simulação: chuva de ${rainMm.toFixed(0)} mm em 72h. ` : "") +
      (demo ? "Cenário de demonstração (dados estimados). " : "") +
      "Triagem para priorizar vistoria de campo; a decisão é da Defesa Civil.",
    source: "TerraAlerta Risk Engine (cache local, API offline)",
    generated_at: new Date().toISOString(),
  };
}

export const EXPOSURE_UNAVAILABLE = "indisponível (WorldPop não carregado)";
