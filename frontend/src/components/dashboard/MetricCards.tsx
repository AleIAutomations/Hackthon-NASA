import React from "react";
import { RiskCell, RiskLevel } from "../../types";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import {
  AlertTriangle,
  CloudRain,
  Activity,
  Layers,
  Satellite,
  TrendingDown,
} from "lucide-react";

interface MetricCardsProps {
  cells: RiskCell[];
  rain72h: number;
  loading?: boolean;
}

export function MetricCards({ cells, rain72h, loading }: MetricCardsProps) {
  if (loading || cells.length === 0) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-slate-900/80 border border-slate-800 rounded-md p-3.5  h-24"
          />
        ))}
      </div>
    );
  }

  const scores = cells.map((c) => c.properties.risk_score || 0);
  const maxScore = scores.length ? Math.max(...scores) : 0;
  const criticalCount = cells.filter(
    (c) => c.properties.alert_level === "vermelho"
  ).length;
  const attentionCount = cells.filter(
    (c) => c.properties.alert_level === "laranja"
  ).length;

  const displacements = cells
    .map((c) => c.properties.los_displacement_mm)
    .filter((v): v is number => v !== null && v !== undefined);
  const minLos = displacements.length ? Math.min(...displacements) : -3.5;

  const maxLevel: RiskLevel =
    maxScore >= 75
      ? "vermelho"
      : maxScore >= 50
      ? "laranja"
      : maxScore >= 25
      ? "amarelo"
      : "verde";

  const levelColor = {
    verde: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    amarelo: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    laranja: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    vermelho: "text-red-400 bg-red-500/10 border-red-500/30",
  }[maxLevel];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Score Maximo */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-md p-3.5 flex flex-col justify-between ">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="font-semibold">Score Máximo de Risco</span>
          <ProvenanceBadge origin="derived" />
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-black text-slate-100">
            {maxScore.toFixed(1)}
          </span>
          <span className="text-xs text-slate-400 font-mono">/ 100</span>
          <span
            className={`ml-auto text-[10px] font-bold  px-2 py-0.5 rounded border ${levelColor}`}
          >
            {maxLevel}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">
          Fator de segurança + Random Forest
        </p>
      </div>

      {/* 2. Taludes em Alerta */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-md p-3.5 flex flex-col justify-between ">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="font-semibold">Taludes Monitorados</span>
          <AlertTriangle size={14} className="text-orange-400" />
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-black text-red-400">
            {criticalCount}
          </span>
          <span className="text-xs text-slate-400">críticos</span>
          <span className="text-xs text-slate-400 font-bold ml-1">
            · {attentionCount}
          </span>
          <span className="text-xs text-slate-500">em alerta</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">
          Total de {cells.length} células SAR de 30m
        </p>
      </div>

      {/* 3. Chuva 72h */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-md p-3.5 flex flex-col justify-between ">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="font-semibold">Precipitação 72h</span>
          <ProvenanceBadge origin="derived" />
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-black text-cyan-400">
            {rain72h.toFixed(1)}
          </span>
          <span className="text-xs text-slate-400 font-mono">mm</span>
          <span className="text-[10px] text-slate-500 ml-auto">NASA POWER</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">
          {rain72h > 100
            ? "Sat. crítica do perfil de solo"
            : "Umidade dentro da normalidade"}
        </p>
      </div>

      {/* 4. Deformacao LOS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-md p-3.5 flex flex-col justify-between ">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="font-semibold">Deslocamento LOS Máx.</span>
          <ProvenanceBadge origin="estimated" />
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-black text-amber-400 font-mono">
            {minLos.toFixed(1)}
          </span>
          <span className="text-xs text-slate-400 font-mono">mm</span>
          <TrendingDown size={14} className="text-amber-400 ml-auto" />
        </div>
        <p className="text-[10px] text-slate-500 mt-1">
          Linha de visada radar (afastamento)
        </p>
      </div>
    </div>
  );
}
