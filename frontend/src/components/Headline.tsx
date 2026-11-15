import { useEffect, useState } from "react";
import { getEnso, getSummary, type Enso, type Summary } from "../api";

export function Headline({ aoiId }: { aoiId: string }) {
  const [s, setS] = useState<Summary | null>(null);
  const [e, setE] = useState<Enso | null>(null);

  useEffect(() => {
    let vivo = true;
    setS(null);
    getSummary(aoiId).then((r) => vivo && setS(r));
    return () => {
      vivo = false;
    };
  }, [aoiId]);
  useEffect(() => {
    getEnso().then(setE);
  }, []);

  if (!s) return null;
  const pop = s.exposed_population.value;

  return (
    <section className="p-4 border-b border-slate-800 bg-slate-900 space-y-3" aria-label="Resumo">
      {s.is_demo && (
        <span className="inline-block text-[10px] px-2 py-0.5 rounded border border-amber-500/50 bg-amber-500/10 text-amber-300 font-mono">
          DADO ESTIMADO · DEMONSTRAÇÃO
        </span>
      )}
      <p className="text-sm font-semibold text-slate-100 leading-snug">{s.verdict.pt}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
          <div className="text-xl font-bold text-orange-400">
            {s.high_risk_km2.value ?? "—"}
            <span className="text-xs font-normal text-slate-400"> km²</span>
          </div>
          <div className="text-[10px] text-slate-500">em risco alto (derivado)</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
          <div className="text-xl font-bold text-slate-200">
            {pop === null ? "indisponível" : pop.toLocaleString("pt-BR")}
          </div>
          <div className="text-[10px] text-slate-500">
            {pop === null ? s.exposed_population.reason : "pessoas expostas"}
          </div>
        </div>
      </div>
      {s.observed_rain_72h && (
        <p className="text-[11px] text-slate-400">
          Chuva observada (NASA POWER, {s.observed_rain_72h.from} a {s.observed_rain_72h.to}):{" "}
          <b className="text-slate-200">{s.observed_rain_72h.value_mm} mm</b>. O cenário de
          demonstração usa {s.scenario_rain_72h_mm?.value ?? 150} mm (simulado).
        </p>
      )}
      <p className="text-[10px] text-slate-500">{s.disclaimer}</p>
      {e && (
        <div className="rounded-lg border border-slate-800 p-2 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">Contexto climático (ENOS):</span>{" "}
          {e.state}, anomalia Niño-3.4 {e.indices_c.nino34 > 0 ? "+" : ""}
          {e.indices_c.nino34} °C ({e.provenance.source}, {e.provenance.published}). Contexto,
          não entra no score. {e.caveat}
        </div>
      )}
    </section>
  );
}
