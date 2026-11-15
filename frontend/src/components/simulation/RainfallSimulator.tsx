import React, { useState } from "react";
import { apiService } from "../../services/api";
import { AlertBulletin } from "../../types";
import { CloudRain, Play, RotateCcw, AlertTriangle, ShieldCheck } from "lucide-react";

interface RainfallSimulatorProps {
  aoiId: string;
  baselineRain: number;
  onSimulationComplete?: (result: AlertBulletin, simulatedMm: number) => void;
}

export function RainfallSimulator({
  aoiId,
  baselineRain,
  onSimulationComplete,
}: {
  aoiId: string;
  baselineRain: number;
  onSimulationComplete?: (result: AlertBulletin, simulatedMm: number) => void;
}) {
  const [rainMm, setRainMm] = useState<number>(Math.max(120, baselineRain + 60));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AlertBulletin | null>(null);

  async function handleSimulate() {
    setLoading(true);
    try {
      const bulletin = await apiService.evaluateAlert({
        aoi_id: aoiId,
        simulate_rain_mm: rainMm,
      });
      setResult(bulletin);
      if (onSimulationComplete) {
        onSimulationComplete(bulletin, rainMm);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setRainMm(Math.max(120, baselineRain + 60));
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-md p-4 space-y-4 ">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-blue-500/10 text-cyan-400 flex items-center justify-center border border-blue-500/30">
            <CloudRain size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">
              Simulador de Cenário de Chuva 72h
            </h3>
            <p className="text-[11px] text-slate-400">
              Teste o impacto de eventos extremos no fator de segurança (FS) dos taludes
            </p>
          </div>
        </div>
      </div>

      {/* Controles do Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Chuva Acumulada Hipotética:</span>
          <div className="flex items-baseline gap-1 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 font-mono">
            <span className="text-lg font-bold text-cyan-400">{rainMm}</span>
            <span className="text-slate-400 text-xs">mm / 72h</span>
          </div>
        </div>

        <input
          type="range"
          min={10}
          max={280}
          step={5}
          value={rainMm}
          onChange={(e) => setRainMm(Number(e.target.value))}
          className="w-full h-2 bg-slate-950 rounded appearance-none cursor-pointer accent-cyan-400"
        />

        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>10 mm (Leve)</span>
          <span>100 mm (Gatilho Saturante)</span>
          <span>200 mm (Extremo)</span>
          <span>280 mm (Catastrófico)</span>
        </div>
      </div>

      {/* Comparacao de Cenarios */}
      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/70 p-3 rounded border border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 block">Cenário Base (NASA POWER):</span>
          <span className="font-bold text-slate-200 text-sm">
            {baselineRain.toFixed(1)} mm
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Últimos 3 dias</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Cenário Simulado:</span>
          <span className="font-bold text-cyan-400 text-sm">
            +{Math.max(0, rainMm - baselineRain).toFixed(0)} mm sobre o histórico
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {rainMm >= 150 ? "Saturação plena de solo" : "Saturação parcial"}
          </span>
        </div>
      </div>

      {/* Botoes de Acao */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSimulate}
          disabled={loading}
          className="flex-1    hover: hover: text-white font-semibold py-2 px-3 rounded text-xs transition flex items-center justify-center gap-2   disabled:opacity-50"
        >
          <Play size={14} />
          <span>{loading ? "Calculando Fator de Segurança..." : "Executar Simulação de Risco"}</span>
        </button>

        {result && (
          <button
            onClick={handleReset}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
            title="Resetar simulação"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>

      {/* Resultado da Simulacao */}
      {result && (
        <div className="p-3 rounded border border-cyan-500/30 bg-cyan-950/20 space-y-2 animate-fadeIn text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200">Resultado do Recálculo Físico:</span>
            <span
              className={`text-[10px]  font-bold px-2 py-0.5 rounded ${
                result.alert_level === "vermelho"
                  ? "bg-red-500/20 text-red-400 border border-red-500/40"
                  : "bg-orange-500/20 text-orange-400 border border-orange-500/40"
              }`}
            >
              Nível {result.alert_level}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div>
              <span className="text-slate-400 block text-[10px]">Score Máximo / Médio</span>
              <span className="font-bold text-slate-100">
                {result.max_score} / {result.mean_score}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Taludes Críticos</span>
              <span className="font-bold text-red-400">
                {result.cells_critical} taludes em alerta máximo
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800 font-mono">
            {result.bulletin_text}
          </p>
        </div>
      )}

      {/* Aviso Permanente de Honestidade Cientifica */}
      <div className="flex items-start gap-2 bg-amber-950/20 border border-amber-500/30 p-2.5 rounded text-[10px] text-amber-300/90 leading-relaxed">
        <AlertTriangle size={14} className="shrink-0 text-amber-400 mt-0.5" />
        <span>
          <strong>Aviso de Integridade Científica:</strong> Simulação conceitual baseada na equação de talude infinito. Não representa previsão meteorológica oficial nem substitui laudos da Defesa Civil.
        </span>
      </div>
    </div>
  );
}
