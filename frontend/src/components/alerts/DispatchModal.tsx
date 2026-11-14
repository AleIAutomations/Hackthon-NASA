import React, { useState } from "react";
import { AlertBulletin } from "../../types";
import { ShieldAlert, Send, CheckCircle2, X, AlertTriangle } from "lucide-react";

interface DispatchModalProps {
  bulletin: AlertBulletin;
  aoiName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDispatch: (channel: "webhook" | "sms_demo") => void;
}

export function DispatchModal({
  bulletin,
  aoiName,
  isOpen,
  onClose,
  onConfirmDispatch,
}: DispatchModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [channel, setChannel] = useState<"webhook" | "sms_demo">("webhook");

  if (!isOpen) return null;

  function handleSend() {
    onConfirmDispatch(channel);
    setDispatched(true);
    setTimeout(() => {
      setDispatched(false);
      setConfirmed(false);
      onClose();
    }, 2400);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-xs">
        {/* Header do Modal */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <ShieldAlert size={18} />
            <span>Confirmação de Disparo de Alerta</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-5 space-y-4">
          <div className="p-3 rounded-lg border border-red-500/30 bg-red-950/20 text-slate-200 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-xs text-red-300">
              <span>{aoiName}</span>
              <span className="uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40">
                Nível {bulletin.alert_level}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-300 bg-slate-950/80 p-2.5 rounded border border-slate-800">
              {bulletin.bulletin_text}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">População Exposta:</span>
              <span className="font-bold text-sm text-slate-100">
                ~{bulletin.population_exposed?.toLocaleString() || "Calculando..."} hab.
              </span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Canal Selecionado:</span>
              <span className="font-bold text-sm text-cyan-400">
                {channel === "webhook" ? "Webhook Defesa Civil (JSON)" : "Simulação SMS/WhatsApp"}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium block">
              Selecione o Destino Operacional:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setChannel("webhook")}
                className={`p-2 rounded border text-left transition ${
                  channel === "webhook"
                    ? "bg-blue-600/20 border-blue-500 text-blue-300 font-semibold"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                Endpoint Webhook (API)
              </button>
              <button
                type="button"
                onClick={() => setChannel("sms_demo")}
                className={`p-2 rounded border text-left transition ${
                  channel === "sms_demo"
                    ? "bg-blue-600/20 border-blue-500 text-blue-300 font-semibold"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                Prévia Celular / Morador
              </button>
            </div>
          </div>

          {/* Termo de Seguranca Obrigatorio */}
          <div className="flex items-start gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <input
              type="checkbox"
              id="confirmDispatch"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 rounded bg-slate-900 border-slate-700 text-red-500 focus:ring-0 cursor-pointer"
            />
            <label
              htmlFor="confirmDispatch"
              className="text-[11px] text-slate-400 cursor-pointer select-none leading-tight"
            >
              Declaro que esta ação foi revisada pela equipe técnica. Compreendo que este é um protótipo de triagem e que as diretrizes formais de evacuação dependem da Defesa Civil.
            </label>
          </div>
        </div>

        {/* Rodape */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={!confirmed || dispatched}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-lg font-bold transition flex items-center gap-1.5 shadow-lg shadow-red-950/60"
          >
            {dispatched ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Alerta Transmitido!</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Confirmar Envio</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
