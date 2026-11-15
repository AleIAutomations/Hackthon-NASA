export type RiskLevel = "verde" | "amarelo" | "laranja" | "vermelho";
export type DataOrigin = "measured" | "derived" | "estimated";

export interface AoiSummary {
  id: string;
  name: string;
  center: { lat: number; lon: number };
  risk_type: string;
  scene_counts?: Record<string, number>;
}

export interface RiskCellProperties {
  risk_score: number;
  alert_level: RiskLevel;
  slope_deg: number | null;
  rain_72h_mm: number | null;
  coherence_l_band: number | null;
  coherence_c_band: number | null;
  los_displacement_mm: number | null;
  sigma0_hh_db?: number | null;
  sigma0_hv_db?: number | null;
  depol_ratio_hv_hh?: number | null;
  data_origin: DataOrigin;
  score_physical?: number | null;
  score_statistical?: number | null;
  color?: string;
  estimado?: number;
}

export interface RiskCell {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: RiskCellProperties;
}

export interface TimeseriesDay {
  date: string;
  rain_mm: number;
  los_mm?: number | null;
  coherence_l_band?: number | null;
}

export interface CompareRegion {
  label: string;
  coherence_c: number | null;
  coherence_l: number | null;
  sigma0_c_db: number | null;
  sigma0_l_db: number | null;
  n_cells?: number;
}

export interface AlertBulletin {
  alert_level: RiskLevel;
  max_score: number;
  mean_score: number;
  cells_inside: number;
  cells_critical: number;
  population_exposed?: number | null;
  buildings_nearby?: number | null;
  simulated?: boolean;
  bulletin_text: string;
  source: string;
  generated_at: string;
}

export interface DataSourceInfo {
  name: string;
  platform: string;
  sensor: string;
  bandOrType: string;
  purpose: string;
  status: "Conectado" | "Disponível (ASF)" | "Série Histórica" | "Em Validação";
  coverage: string;
  updateFrequency: string;
  url: string;
  limitations: string;
}

export interface ReportItem {
  id: string;
  aoiId: string;
  aoiName: string;
  timestamp: string;
  level: RiskLevel;
  maxScore: number;
  criticalSlopes: number;
  exposedPopulation: number | null;
  simulatedRain?: number;
  bulletinText: string;
}
