import React from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { Info } from "lucide-react";

export function RiskLegend({ compact = false }: { compact?: boolean }) {
  const levels = [
    {
      label: "Baixo",
      range: "0 - 24",
      color: "bg-emerald-500",
      action: "Monitoramento rotineiro",
    },
    {
      label: "Atenção",
      range: "25 - 49",
      color: "bg-yellow-400",
      action: "Revisar após chuva",
    },
    {
      label: "Alto",
      range: "50 - 74",
      color: "bg-orange-500",
      action: "Vistoria em 24h",
    },
    {
      label: "Crítico",
      range: "75 - 100",
      color: "bg-red-500",
      action: "Evacuação preventiva",
    },
  ];

  if (compact) {
    return (
      <div className="bg-slate-900/95 border border-slate-800 rounded-lg p-2.5 shadow-xl text-xs backdrop-blur flex items-center gap-3">
        <span className="text-[11px] font-semibold text-slate-300">Risco:</span>
        <div className="flex items-center gap-2">
          {levels.map((l) => (
            <div key={l.label} className="flex items-center gap-1 text-[10px] text-slate-300">
              <span className={`w-2 h-2 rounded-full ${l.color}`} />
              <span>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 space-y-3 text-xs shadow-xl backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="font-bold text-slate-100 flex items-center gap-1.5">
          <Info size={14} className="text-blue-400" />
          Escala de Risco Físico (0-100)
        </span>
        <span className="text-[10px] text-slate-400">Células de 30m</span>
      </div>

      <ul className="space-y-1.5">
        {levels.map((lvl) => (
          <li
            key={lvl.label}
            className="flex items-center justify-between p-1.5 rounded bg-slate-900/60"
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${lvl.color}`} />
              <span className="font-semibold text-slate-200">
                {lvl.label}{" "}
                <span className="font-normal text-slate-400 font-mono text-[10px]">
                  ({lvl.range})
                </span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400">{lvl.action}</span>
          </li>
        ))}
      </ul>

      <div className="border-t border-slate-800/80 pt-2 space-y-1.5">
        <span className="text-[10px] font-semibold text-slate-400 block">
          Proveniência Científica dos Dados:
        </span>
        <div className="flex flex-wrap gap-1.5">
          <ProvenanceBadge origin="measured" />
          <ProvenanceBadge origin="derived" />
          <ProvenanceBadge origin="estimated" />
        </div>
        <p className="text-[9px] text-slate-500 leading-tight">
          Células com contorno escuro e tracejado indicam valores estimados conforme os critérios de integridade da NASA.
        </p>
      </div>
    </div>
  );
}
