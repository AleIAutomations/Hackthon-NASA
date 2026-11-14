import React, { useState } from "react";
import { ReportItem } from "../types";
import { FileText, Printer, Download, Trash2, Calendar, ShieldCheck, MapPin } from "lucide-react";

interface ReportsPageProps {
  reports: ReportItem[];
  onClearReports: () => void;
}

export function ReportsPage({ reports, onClearReports }: ReportsPageProps) {
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(
    reports.length ? reports[0] : null
  );

  function handlePrint() {
    window.print();
  }

  return (
    <div className="h-full w-full flex flex-col p-4 gap-4 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-100">
              Boletins &amp; Pareceres Técnicos da Defesa Civil
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Histórico de laudos georreferenciados gerados pelo TerraAlerta para acionamento de campo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {reports.length > 0 && (
            <>
              <button
                onClick={handlePrint}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Printer size={14} />
                <span>Imprimir / Salvar PDF</span>
              </button>
              <button
                onClick={onClearReports}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition"
                title="Limpar histórico local"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Lista de Boletins (4 colunas) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 overflow-y-auto shadow-xl text-xs">
          <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
            Boletins Gerados ({reports.length})
          </h3>

          {reports.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <FileText size={32} className="mx-auto opacity-40" />
              <p>Nenhum boletim emitido nesta sessão.</p>
              <p className="text-[10px]">
                Acesse a aba <strong>Central de Alertas</strong> ou <strong>Visão Geral</strong> e clique em "Avaliar Setor" para gerar novos laudos.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {reports.map((rep) => {
                const isSelected = selectedReport?.id === rep.id;
                const levelColor = {
                  verde: "border-emerald-500 text-emerald-400 bg-emerald-500/10",
                  amarelo: "border-yellow-400 text-yellow-400 bg-yellow-500/10",
                  laranja: "border-orange-500 text-orange-400 bg-orange-500/10",
                  vermelho: "border-red-500 text-red-400 bg-red-500/10",
                }[rep.level];

                return (
                  <button
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    className={`w-full p-3 rounded-xl border text-left transition space-y-1.5 ${
                      isSelected
                        ? "bg-slate-800/90 border-blue-500 shadow-md"
                        : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 truncate">
                        {rep.aoiName}
                      </span>
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${levelColor}`}>
                        {rep.level}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Score Máx: {rep.maxScore}</span>
                      <span>{rep.timestamp}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Visualizador do Laudo / Parecer Técnico (8 colunas) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
          {selectedReport ? (
            <div className="space-y-6">
              {/* Cabecalho Oficial do Laudo */}
              <div className="border-b border-slate-800 pb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-blue-600/30 text-blue-400 border border-blue-500/40 rounded font-mono font-bold">
                      BOLETIM TÉCNICO TERRAALERTA
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {selectedReport.id}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-100 mt-2">
                    {selectedReport.aoiName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Data da emissão: {selectedReport.timestamp} · Sistema de Triagem Geoespacial SAR
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Classificação de Risco:</span>
                  <span
                    className={`inline-block mt-1 font-black text-sm uppercase px-3 py-1 rounded-lg border ${
                      selectedReport.level === "vermelho"
                        ? "bg-red-500/20 text-red-400 border-red-500/40"
                        : "bg-orange-500/20 text-orange-400 border-orange-500/40"
                    }`}
                  >
                    Nível {selectedReport.level}
                  </span>
                </div>
              </div>

              {/* Indicadores do Laudo */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Score Máximo</span>
                  <span className="text-xl font-black text-slate-100">
                    {selectedReport.maxScore} / 100
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Taludes Críticos</span>
                  <span className="text-xl font-black text-red-400">
                    {selectedReport.criticalSlopes} setores
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">População em Risco</span>
                  <span className="text-xl font-black text-cyan-400">
                    ~{selectedReport.exposedPopulation.toLocaleString()} hab.
                  </span>
                </div>
              </div>

              {/* Texto Completo do Boletim */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Parecer Descritivo e Diretrizes de Ação:
                </h4>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed">
                  {selectedReport.bulletinText}
                </div>
              </div>

              {/* Assinatura e Notas Metodologicas */}
              <div className="border-t border-slate-800 pt-4 text-[10px] text-slate-500 space-y-1">
                <p>
                  <strong>Metodologia Aplicada:</strong> Modelo de talude infinito saturado cruzado com retroespalhamento polarimétrico (NISAR L-band) e precipitação da NASA POWER.
                </p>
                <p>
                  <strong>Salvaguarda:</strong> Documento consultivo para triagem e priorização de vistorias técnicas pela Defesa Civil municipal.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Selecione um relatório ao lado para visualizar os detalhes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
