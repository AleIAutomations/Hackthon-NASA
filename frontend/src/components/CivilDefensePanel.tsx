import { useState } from "react";
import { fetchJson } from "../api";
import { ShieldAlert, Copy, CloudRain, Check, AlertTriangle } from "lucide-react";

interface Bulletin {
  alert_level: string;
  max_score: number;
  mean_score: number;
  cells_inside: number;
  cells_critical: number;
  population_exposed?: number | null;
  buildings_nearby?: number | null;
  bulletin_text: string;
}

const COR: Record<string, string> = {
  verde: "text-emerald-400 bg-emerald-950/60 border-emerald-700",
  amarelo: "text-yellow-400 bg-yellow-950/60 border-yellow-700",
  laranja: "text-orange-400 bg-orange-950/60 border-orange-700",
  vermelho: "text-red-400 bg-red-950/60 border-red-700",
};

export function CivilDefensePanel({ aoiId }: { aoiId: string }) {
  const [bulletin, setBulletin] = useState<Bulletin | null>(null);
  const [chuva, setChuva] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function avaliar(simularChuva: boolean) {
    setLoading(true);
    setCopied(false);
    try {
      const { fallbackSector } = await import("../fallbackData");
      const resp = await fetchJson<Bulletin>("/api/alerts/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aoi_id: aoiId,
          polygon: fallbackSector[aoiId],
          simulate_rain_mm: simularChuva ? 200 : undefined,
        }),
      });
      setBulletin(resp);
      setChuva(simularChuva);
    } catch {
      // API offline: boletim calculado sobre o cache local
      const { buildOfflineBulletin } = await import("../offlineBulletin");
      setBulletin(await buildOfflineBulletin(aoiId, simularChuva ? 200 : undefined));
      setChuva(simularChuva);
      setChuva(simularChuva);
    } finally {
      setLoading(false);
    }
  }

  const copyBulletin = () => {
    if (bulletin?.bulletin_text) {
      navigator.clipboard.writeText(bulletin.bulletin_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 space-y-4 bg-slate-900 h-full flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
          <ShieldAlert className="text-red-500" size={20} />
          <h3 className="font-bold text-sm text-slate-100">Painel Operacional da Defesa Civil</h3>
        </div>

        <p className="text-xs text-slate-400">
          Gere um boletim de evacuação georreferenciado cruzando risco por célula SAR com exposição populacional.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            onClick={() => avaliar(false)}
            disabled={loading}
            className="flex-1 bg-nasa-blue hover:bg-blue-800 disabled:opacity-50 text-white rounded px-3 py-2 text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <ShieldAlert size={14} />
            {loading && !chuva ? "Avaliando..." : "Avaliar Setor"}
          </button>
          <button
            onClick={() => avaliar(true)}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded px-3 py-2 text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <CloudRain size={14} />
            {loading && chuva ? "Simulando..." : "Chuva Extrema (200mm)"}
          </button>
        </div>

        {bulletin && (
          <div
            className={`border rounded p-3 space-y-2.5 transition-all ${
              COR[bulletin.alert_level] || "border-slate-700 bg-slate-800"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold   flex items-center gap-1">
                <AlertTriangle size={14} />
                Nível {bulletin.alert_level}
              </span>
              {chuva && (
                <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 px-1.5 py-0.5 rounded">
                  Simulação Extrema
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-current/20">
              <div>
                <span className="text-slate-400 block text-[10px]">Score Máx. / Médio</span>
                <span className="font-bold text-slate-100">
                  {bulletin.max_score} / {bulletin.mean_score}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Taludes Críticos</span>
                <span className="font-bold text-slate-100">
                  {bulletin.cells_critical} / {bulletin.cells_inside} células
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">População Exposta</span>
                <span className="font-bold text-slate-100">
                  {bulletin.population_exposed != null
                    ? `~${bulletin.population_exposed.toLocaleString()} hab.`
                    : "indisponível"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Edificações</span>
                <span className="font-bold text-slate-100">
                  {bulletin.buildings_nearby != null
                    ? `~${bulletin.buildings_nearby} estruturas`
                    : "indisponível"}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-current/20">
              <span className="text-[10px] text-slate-400 block mb-1">Boletim Pronto p/ Disparo:</span>
              <p className="text-xs bg-slate-950/70 p-2.5 rounded border border-slate-800 text-slate-200 font-mono leading-relaxed">
                {bulletin.bulletin_text}
              </p>
            </div>

            <button
              onClick={copyBulletin}
              className="text-xs w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center justify-center gap-1 border border-slate-700 transition"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copied ? "Boletim copiado!" : "Copiar boletim para Defesa Civil"}
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 pt-3">
        <p className="text-[11px] text-slate-500 leading-tight">
          Protótipo desenvolvido para o NASA Space Apps Challenge 2026. Não substitui os protocolos oficiais e canais regulatórios da Defesa Civil.
        </p>
      </div>
    </div>
  );
}
