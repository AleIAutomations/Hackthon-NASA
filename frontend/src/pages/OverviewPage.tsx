import React, { useState } from "react";
import { AoiSummary, RiskCell } from "../types";
import { Headline } from "../components/Headline";
import { MetricCards } from "../components/dashboard/MetricCards";
import { Globe3DView } from "../components/Globe3DView";
import { Map3DView } from "../components/Map3DView";
import { RiskLegend } from "../components/map/RiskLegend";
import { CivilDefensePanel } from "../components/CivilDefensePanel";
import { RainfallSimulator } from "../components/simulation/RainfallSimulator";
import { Globe, Map as MapIcon, SlidersHorizontal, ShieldAlert, Sparkles } from "lucide-react";

interface OverviewPageProps {
  currentAoi: AoiSummary;
  cells: RiskCell[];
  loading: boolean;
  onSelectAoi: (id: string) => void;
  onNavigateToView: (view: any) => void;
}

export function OverviewPage({
  currentAoi,
  cells,
  loading,
  onSelectAoi,
  onNavigateToView,
}: OverviewPageProps) {
  const [viewMode, setViewMode] = useState<"globe" | "terrain">("globe");
  const [showSim, setShowSim] = useState(false);

  const rain72h = cells.length ? cells[0].properties.rain_72h_mm || 150.0 : 150.0;

  return (
    <div className="h-full w-full flex flex-col p-4 gap-4 overflow-y-auto">
      {/* 0. Veredito e dois numeros (dado estimado/real marcado) */}
      <div className="shrink-0 rounded-md border border-slate-800 overflow-hidden">
        <Headline aoiId={currentAoi.id} />
      </div>

      {/* 1. Indicadores Principais */}
      <div className="shrink-0">
        <MetricCards cells={cells} rain72h={rain72h} loading={loading} />
      </div>

      {/* 2. Grid Central: Mapa / Globo como Protagonista + Painel Lateral de Risco */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[580px]">
        {/* Area do Mapa (8 colunas) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-md overflow-hidden relative  flex flex-col">
          {/* Header sobre o mapa com alternadores de camera */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <div className="bg-slate-950/90 border border-slate-800 rounded p-1 flex items-center gap-1   text-xs">
              <button
                onClick={() => setViewMode("globe")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition ${
                  viewMode === "globe"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
                title="Ver o globo 3D esférico da Terra"
              >
                <Globe size={14} />
                <span>Globo 3D</span>
              </button>
              <button
                onClick={() => setViewMode("terrain")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition ${
                  viewMode === "terrain"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
                title="Ver terreno inclinado e células individuais de 30m"
              >
                <MapIcon size={14} />
                <span>Terreno 3D</span>
              </button>
            </div>

            <button
              onClick={() => setShowSim(!showSim)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold  border  transition ${
                showSim
                  ? "bg-cyan-600 text-white border-cyan-400"
                  : "bg-slate-950/90 text-cyan-300 border-cyan-500/30 hover:bg-slate-900"
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>Simulador Chuva 72h</span>
            </button>
          </div>

          {/* Legenda Flutuante Compacta no topo direito */}
          <div className="absolute top-4 right-4 z-20">
            <RiskLegend compact={true} />
          </div>

          {/* Canvas do Mapa */}
          <div className="flex-1 relative">
            {viewMode === "globe" ? (
              <Globe3DView
                aoiId={currentAoi.id}
                center={currentAoi.center}
                onSelectAoi={onSelectAoi}
                onSwitchToDetailed={() => setViewMode("terrain")}
              />
            ) : (
              <Map3DView aoiId={currentAoi.id} center={currentAoi.center} />
            )}
          </div>
        </div>

        {/* Painel Lateral: Inteligência de Risco & Defesa Civil (4 colunas) */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto">
          {/* Gaveta do Simulador de Chuva quando aberta */}
          {showSim && (
            <div className="animate-fadeIn">
              <RainfallSimulator
                aoiId={currentAoi.id}
                baselineRain={rain72h}
              />
            </div>
          )}

          {/* Painel Operacional da Defesa Civil */}
          <div className="bg-slate-900 border border-slate-800 rounded-md overflow-hidden  flex-1 flex flex-col">
            <CivilDefensePanel aoiId={currentAoi.id} />
          </div>

          {/* Legenda e Proveniencia Cientifica Detalhada */}
          <RiskLegend />
        </div>
      </div>
    </div>
  );
}
