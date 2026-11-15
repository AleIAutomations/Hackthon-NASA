import React, { useState } from "react";
import { AoiSummary } from "../types";
import { InSARTimeSeries } from "../components/InSARTimeSeries";
import { TrendingDown, Calendar, CloudRain, AlertTriangle, Layers, Info } from "lucide-react";

interface DeformationHistoryPageProps {
  currentAoi: AoiSummary;
}

export function DeformationHistoryPage({ currentAoi }: DeformationHistoryPageProps) {
  const [period, setPeriod] = useState<"90" | "180" | "365">("365");

  return (
    <div className="h-full w-full flex flex-col p-4 gap-4 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <TrendingDown size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-100">
                Série Temporal de Deformação &amp; Chuva Acumulada
              </h2>
              <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-cyan-400 border border-blue-500/30 rounded font-mono">
                {currentAoi.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Análise retrospectiva de deslocamento milimétrico em linha de visada (LOS) cruzado com precipitação diária.
            </p>
          </div>
        </div>

        {/* Seletor de Janela Temporal */}
        <div className="flex items-center gap-2 text-xs bg-slate-950 p-1 rounded-xl border border-slate-800">
          <Calendar size={13} className="text-slate-400 ml-2" />
          <button
            onClick={() => setPeriod("90")}
            className={`px-3 py-1.5 rounded-lg transition ${
              period === "90"
                ? "bg-blue-600 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Últimos 90 dias
          </button>
          <button
            onClick={() => setPeriod("180")}
            className={`px-3 py-1.5 rounded-lg transition ${
              period === "180"
                ? "bg-blue-600 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            180 dias
          </button>
          <button
            onClick={() => setPeriod("365")}
            className={`px-3 py-1.5 rounded-lg transition ${
              period === "365"
                ? "bg-blue-600 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            1 ano (Completo)
          </button>
        </div>
      </div>

      {/* Grafico ComposedChart */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-4 flex flex-col min-h-[460px]">
        <InSARTimeSeries aoiId={currentAoi.id} />
      </div>

      {/* Cards de Diagnostico Geotecnico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-red-400 font-bold">
            <TrendingDown size={14} />
            <span>Deslocamento em Linha de Visada (LOS)</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Valores expressos em milímetros. Valores negativos representam afastamento do solo em relação à linha do satélite (subsidência e escorregamento do corpo do talude encosta abaixo).
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <CloudRain size={14} />
            <span>Gatilho Hidrológico (NASA POWER)</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            A chuva acumulada eleva a pressão neutra (poropressão) nos poros do solo, reduzindo a tensão efetiva e acelerando a deformação plástica pré-ruptura.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
            <Info size={14} className="text-blue-400" />
            <span>Lacuna Instrumental (27/07 - 10/08/2026)</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Identificada no gráfico em cinza. Período oficial de manutenção e calibração de rotina do instrumento orbital NISAR, sem dados válidos adquiridos na janela.
          </p>
        </div>
      </div>
    </div>
  );
}
