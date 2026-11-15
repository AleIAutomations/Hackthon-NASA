import React from "react";
import { AoiSummary } from "../../types";
import { StatusIndicator } from "../common/StatusIndicator";
import { MapPin, Clock, ExternalLink, HelpCircle } from "lucide-react";

interface TopbarProps {
  title: string;
  description: string;
  aois: AoiSummary[];
  selectedAoiId: string;
  onSelectAoi: (id: string) => void;
  isOnline: boolean;
  isCacheFirst: boolean;
  lastUpdated: string;
}

export function Topbar({
  title,
  description,
  aois,
  selectedAoiId,
  onSelectAoi,
  isOnline,
  isCacheFirst,
  lastUpdated,
}: TopbarProps) {
  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between backdrop-blur z-30">
      {/* Esquerda: Titulo e Contexto */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>{title}</span>
            <span className="text-slate-500 font-normal">/</span>
            <span className="text-xs font-normal text-slate-400">
              {description}
            </span>
          </h2>
        </div>
      </div>

      {/* Direita: Controles Operacionais */}
      <div className="flex items-center gap-3">
        {/* Seletor de Area de Interesse */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-sm">
          <MapPin size={14} className="text-red-400 shrink-0" />
          <select
            id="aoi-selector"
            name="aoi-selector"
            aria-label="Selecionar Área de Interesse"
            value={selectedAoiId}
            onChange={(e) => onSelectAoi(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer"
          >
            {aois.map((aoi) => (
              <option key={aoi.id} value={aoi.id} className="bg-slate-900 text-slate-200">
                {aoi.name}
              </option>
            ))}
          </select>
        </div>

        {/* Data/Hora de Atualizacao */}
        <div
          className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1.5"
          title="Data do último pacote de telemetria SAR e dados meteorológicos"
        >
          <Clock size={13} className="text-slate-500" />
          <span className="font-mono text-[11px]">{lastUpdated}</span>
        </div>

        {/* Indicador de Status API e Cache */}
        <StatusIndicator isOnline={isOnline} isCacheFirst={isCacheFirst} />

        {/* Link para Documentacao Swagger da API */}
        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 rounded-lg transition"
          title="Abrir Swagger API (/docs)"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </header>
  );
}
