import React from "react";
import { DataOrigin } from "../../types";
import { CheckCircle2, Sliders, AlertCircle } from "lucide-react";

export function ProvenanceBadge({
  origin,
  showLabel = true,
}: {
  origin?: DataOrigin | string;
  showLabel?: boolean;
}) {
  switch (origin) {
    case "measured":
      return (
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
          title="Medição orbital direta via produto validado NISAR/Sentinel-1"
        >
          <CheckCircle2 size={11} />
          {showLabel && <span>Medido</span>}
        </span>
      );
    case "derived":
      return (
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
          title="Dado derivado de equações físicas ou modelos secundários (ex: NASADEM, NASA POWER)"
        >
          <Sliders size={11} />
          {showLabel && <span>Derivado</span>}
        </span>
      );
    case "estimated":
    default:
      return (
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 border-dashed"
          title="Estimativa calibrada para triagem — consulte a metodologia para detalhes"
        >
          <AlertCircle size={11} />
          {showLabel && <span>Estimado</span>}
        </span>
      );
  }
}
