import React from "react";
import { Wifi, WifiOff, Database } from "lucide-react";

export function StatusIndicator({
  isOnline,
  isCacheFirst,
}: {
  isOnline: boolean;
  isCacheFirst?: boolean;
}) {
  if (!isOnline) {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 "
        title="Operando no modo Offline com Cache Local das áreas de estudo"
      >
        <WifiOff size={13} />
        <span>Modo Offline (Cache)</span>
      </div>
    );
  }

  if (isCacheFirst) {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/40"
        title="Cache-First ativo: respostas instantâneas a partir do cache local"
      >
        <Database size={13} />
        <span>Cache-First Ativo</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
      title="API FastAPI conectada e respondendo"
    >
      <Wifi size={13} />
      <span>API Conectada</span>
    </div>
  );
}
