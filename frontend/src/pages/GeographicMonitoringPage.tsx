import React, { useState } from "react";
import { AoiSummary, RiskCell, RiskLevel } from "../types";
import { Map3DView } from "../components/Map3DView";
import { Globe3DView } from "../components/Globe3DView";
import { RiskLegend } from "../components/map/RiskLegend";
import { ProvenanceBadge } from "../components/common/ProvenanceBadge";
import {
  Filter,
  Eye,
  Info,
  Layers,
  MapPin,
  TrendingDown,
  Globe,
  Map as MapIcon,
} from "lucide-react";

interface GeographicMonitoringPageProps {
  currentAoi: AoiSummary;
  cells: RiskCell[];
  onSelectAoi: (id: string) => void;
}

export function GeographicMonitoringPage({
  currentAoi,
  cells,
  onSelectAoi,
}: GeographicMonitoringPageProps) {
  const [levelFilter, setLevelFilter] = useState<"todos" | RiskLevel>("todos");
  const [viewMode, setViewMode] = useState<"terrain" | "globe">("terrain");
  const [selectedCell, setSelectedCell] = useState<RiskCell | null>(null);

  const filteredCells =
    levelFilter === "todos"
      ? cells
      : cells.filter((c) => c.properties.alert_level === levelFilter);

  const counts = {
    todos: cells.length,
    verde: cells.filter((c) => c.properties.alert_level === "verde").length,
    amarelo: cells.filter((c) => c.properties.alert_level === "amarelo").length,
    laranja: cells.filter((c) => c.properties.alert_level === "laranja").length,
    vermelho: cells.filter((c) => c.properties.alert_level === "vermelho").length,
  };

  return (
    <div className="h-full w-full flex flex-col p-4 gap-4 overflow-hidden">
      {/* Barra de Filtros por Nivel de Risco */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Filter size={15} className="text-cyan-400" />
          <span>Filtro de Células por Risco:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setLevelFilter("todos")}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              levelFilter === "todos"
                ? "bg-slate-100 text-slate-900 font-bold"
                : "bg-slate-950 text-slate-300 hover:bg-slate-800"
            }`}
          >
            Todos ({counts.todos})
          </button>
          <button
            onClick={() => setLevelFilter("verde")}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              levelFilter === "verde"
                ? "bg-emerald-500 text-slate-950 font-bold"
                : "bg-slate-950 text-emerald-400 hover:bg-slate-800"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Baixo ({counts.verde})
          </button>
          <button
            onClick={() => setLevelFilter("amarelo")}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              levelFilter === "amarelo"
                ? "bg-yellow-400 text-slate-950 font-bold"
                : "bg-slate-950 text-yellow-400 hover:bg-slate-800"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            Atenção ({counts.amarelo})
          </button>
          <button
            onClick={() => setLevelFilter("laranja")}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              levelFilter === "laranja"
                ? "bg-orange-500 text-white font-bold"
                : "bg-slate-950 text-orange-400 hover:bg-slate-800"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            Alto ({counts.laranja})
          </button>
          <button
            onClick={() => setLevelFilter("vermelho")}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              levelFilter === "vermelho"
                ? "bg-red-500 text-white font-bold"
                : "bg-slate-950 text-red-400 hover:bg-slate-800"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Crítico ({counts.vermelho})
          </button>
        </div>

        {/* Alternador de Modo */}
        <div className="bg-slate-950 border border-slate-800 p-1 rounded-lg flex items-center gap-1">
          <button
            onClick={() => setViewMode("terrain")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition ${
              viewMode === "terrain"
                ? "bg-blue-600 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MapIcon size={13} />
            <span>Terreno 3D</span>
          </button>
          <button
            onClick={() => setViewMode("globe")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition ${
              viewMode === "globe"
                ? "bg-blue-600 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe size={13} />
            <span>Globo Esférico</span>
          </button>
        </div>
      </div>

      {/* Grid Principal: Mapa Expandido + Inspector de Celula */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[500px] overflow-hidden">
        {/* Mapa Expandido (9 colunas) */}
        <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative shadow-2xl">
          <div className="absolute top-4 right-4 z-20">
            <RiskLegend compact={true} />
          </div>

          <div className="w-full h-full relative">
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

        {/* Painel Lateral: Inspecao Cientifica de Celulas (3 colunas) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between overflow-y-auto shadow-2xl text-xs space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Info size={16} className="text-blue-400" />
              <h3 className="font-bold text-sm text-slate-100">
                Inspetor Geotécnico SAR
              </h3>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              Passe o mouse ou selecione as células do mapa para visualizar as grandezas físicas de radar e relevo.
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5">
              <span className="font-semibold text-slate-200 block text-[11px]">
                Parâmetros Físicos Monitorados:
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400 border-b border-slate-900 pb-1">
                  <span>Banda do Radar:</span>
                  <span className="font-mono text-slate-200">NISAR L-band (~24 cm)</span>
                </div>
                <div className="flex justify-between text-slate-400 border-b border-slate-900 pb-1">
                  <span>Resolução Espacial:</span>
                  <span className="font-mono text-slate-200">Células de 30m</span>
                </div>
                <div className="flex justify-between text-slate-400 border-b border-slate-900 pb-1">
                  <span>Gatilho de Saturação:</span>
                  <span className="font-mono text-slate-200">150 mm / 72h</span>
                </div>
                <div className="flex justify-between text-slate-400 border-b border-slate-900 pb-1">
                  <span>Fator de Segurança:</span>
                  <span className="font-mono text-slate-200">Infinite Slope (FS &lt; 1)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Despolarização HV/HH:</span>
                  <span className="font-mono text-slate-200">Volume vegetal / rugosidade</span>
                </div>
              </div>
            </div>
          </div>

          <RiskLegend />
        </div>
      </div>
    </div>
  );
}
