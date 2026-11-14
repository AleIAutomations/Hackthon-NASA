import React, { useState } from "react";
import { AoiSummary, AlertBulletin } from "../types";
import { CivilDefensePanel } from "../components/CivilDefensePanel";
import { DispatchModal } from "../components/alerts/DispatchModal";
import { ShieldAlert, Send, Copy, AlertTriangle, Users, Building, Check, FileCheck } from "lucide-react";

interface AlertsPageProps {
  currentAoi: AoiSummary;
  onSaveReport?: (report: any) => void;
}

export function AlertsPage({ currentAoi, onSaveReport }: AlertsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastBulletin, setLastBulletin] = useState<AlertBulletin>({
    alert_level: "laranja",
    max_score: 64.5,
    mean_score: 43.1,
    cells_inside: 1600,
    cells_critical: 12,
    population_exposed: 18400,
    buildings_nearby: 5200,
    bulletin_text: `TERRAALERTA - Nível LARANJA: 12 taludes críticos (score max 64.5/100) no setor monitorado da ${currentAoi.name}. Recomendada vistoria imediata em campo e emissão de aviso preventivo aos moradores.`,
    source: "TerraAlerta Risk Engine",
    generated_at: new Date().toISOString(),
  });

  function handleConfirmDispatch(channel: "webhook" | "sms_demo") {
    if (onSaveReport) {
      onSaveReport({
        id: `REP-${Date.now()}`,
        aoiId: currentAoi.id,
        aoiName: currentAoi.name,
        timestamp: new Date().toLocaleString(),
        level: lastBulletin.alert_level,
        maxScore: lastBulletin.max_score,
        criticalSlopes: lastBulletin.cells_critical,
        exposedPopulation: lastBulletin.population_exposed || 0,
        bulletinText: lastBulletin.bulletin_text,
      });
    }
  }

  return (
    <div className="h-full w-full flex flex-col p-4 gap-4 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-100">
                Central de Operações da Defesa Civil
              </h2>
              <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded font-mono">
                {currentAoi.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Protocolo de triagem geoespacial, delimitação de perímetros críticos e geração de alertas acionáveis.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-red-950/60 transition"
        >
          <Send size={14} />
          <span>Transmitir Alerta / Despacho</span>
        </button>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Painel Operacional (7 colunas) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          <CivilDefensePanel aoiId={currentAoi.id} />
        </div>

        {/* Historico de Alertas e Exposicao (5 colunas) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Users size={16} className="text-cyan-400" />
              <span>Estimativa de Exposição de Comunidades</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cruzamento geoespacial dos taludes em alerta com a densidade populacional (WorldPop 100m) e edificações registradas (OpenStreetMap).
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">População no Setor:</span>
                <span className="text-xl font-black text-cyan-400">
                  ~{lastBulletin.population_exposed?.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block">habitantes</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Edificações Próximas:</span>
                <span className="text-xl font-black text-slate-200">
                  ~{lastBulletin.buildings_nearby?.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block">estruturas civis</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300 block">
                Diretrizes de Segurança Recomendadas:
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[10px]">
                <li>Nível Laranja: Iniciar vistoria visual de trincas em encostas em até 24h.</li>
                <li>Nível Vermelho: Ativar sirenes municipais e pontos de acolhimento.</li>
                <li>Verificação obrigatória in-situ antes de ordens compulsórias de remoção.</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <AlertTriangle size={15} />
              <span>Salvaguarda e Protocolos Oficiais</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              O TerraAlerta é uma ferramenta técnica de triagem geoespacial. Nenhuma decisão de evacuação compulsória deve ser automatizada sem validação das autoridades da Defesa Civil municipal ou estadual.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Despacho Seguro */}
      <DispatchModal
        bulletin={lastBulletin}
        aoiName={currentAoi.name}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirmDispatch={handleConfirmDispatch}
      />
    </div>
  );
}
