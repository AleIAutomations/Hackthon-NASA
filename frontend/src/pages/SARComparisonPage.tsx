import React from "react";
import { AoiSummary } from "../types";
import { BandComparison } from "../components/BandComparison";
import { GitCompare, Satellite, ShieldAlert, Sparkles, Layers, Info } from "lucide-react";

interface SARComparisonPageProps {
  currentAoi: AoiSummary;
}

export function SARComparisonPage({ currentAoi }: SARComparisonPageProps) {
  return (
    <div className="h-full w-full flex flex-col p-4 gap-4 overflow-y-auto">
      {/* Top Banner Explicativo de Física do Radar */}
      <div className="bg-slate-900 border border-slate-800 rounded-md p-4  flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-md bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <GitCompare size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-100">
                Comparador Científico SAR: Banda C vs Banda L
              </h2>
              <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded font-mono">
                {currentAoi.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Evidência física de sensibilidade ao solo sob dossel vegetal: por que o NISAR é decisivo em regiões tropicais.
            </p>
          </div>
        </div>

        {/* Fichas Técnicas das Missões */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-950 px-3 py-2 rounded-md border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
              <Satellite size={12} className="text-slate-400" />
              <span>Sentinel-1 (ESA)</span>
            </div>
            <span className="font-bold text-slate-200">Banda C (λ ~5.6 cm)</span>
          </div>

          <div className="bg-slate-950 px-3 py-2 rounded-md border border-blue-500/40">
            <div className="flex items-center gap-1.5 text-blue-400 text-[10px]">
              <Satellite size={12} className="text-cyan-400" />
              <span>NISAR (NASA/ISRO)</span>
            </div>
            <span className="font-bold text-cyan-400">Banda L (λ ~24 cm)</span>
          </div>
        </div>
      </div>

      {/* Componente Central: Comparador Deslizante (Swipe) e Graficos de Coerencia */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-md overflow-hidden  min-h-[520px] flex flex-col">
        <BandComparison aoiId={currentAoi.id} center={currentAoi.center} />
      </div>

      {/* Grid de Fundamentos Cientificos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900/90 border border-slate-800 rounded-md p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
            <Layers size={14} className="text-cyan-400" />
            <span>1. Comprimento de Onda &amp; Copa</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Folhas e galhos têm centímetros. O pulso de 5.6 cm da banda C sofre espalhamento volumétrico na copa das árvores, transformando o sinal interferométrico do solo em ruído temporal.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-md p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
            <Sparkles size={14} className="text-blue-400" />
            <span>2. Penetração da Banda L</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Com onda de ~24 cm, o NISAR atravessa a biomassa foliar com perda mínima de atenuação e reflete na rocha matriz e no solo, preservando alta coerência interferométrica ao longo de meses.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-md p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
            <Info size={14} className="text-amber-400" />
            <span>3. Transparência Metodológica</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Os valores do gráfico são referências ilustrativas por tipo de cobertura. Não foram calculados dos pares NISAR ou Sentinel-1 deste projeto. A coerência medida no nosso par NISAR da Serra do Mar está no Monitoramento e nas Fontes de Dados.
          </p>
        </div>
      </div>
    </div>
  );
}
