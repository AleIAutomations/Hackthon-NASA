import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceArea,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { fetchJson } from "../api";

interface Day {
  date: string;
  rain_mm: number;
  los_mm?: number | null;
}

export function InSARTimeSeries({ aoiId }: { aoiId: string }) {
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchJson<{ daily: Day[] }>(`/api/aois/${aoiId}/timeseries`)
      .then((d) => {
        setDays(d.daily);
        setLoading(false);
      })
      .catch(async () => {
        const { fallbackTelemetry } = await import("../fallbackData");
        const aoi = fallbackTelemetry[aoiId];
        if (aoi && aoi.rain_daily) {
          const simulated = aoi.rain_daily.map((item: any, i: number) => ({
            ...item,
            los_mm: Number((-4.0 - item.rain_mm * 0.1 - i * 0.05).toFixed(2)),
          }));
          setDays(simulated);
        }
        setLoading(false);
      });
  }, [aoiId]);

  return (
    <div className="p-4 space-y-3 bg-slate-900 h-full flex flex-col">
      <div>
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
          Série Temporal: Chuva vs Deslocamento do Solo
        </h3>
        <p className="text-xs text-slate-400">
          Cruzamento da chuva diária (NASA POWER) com deformação em linha de visada (InSAR mm).
        </p>
      </div>

      <div className="flex-1 min-h-[300px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            Carregando série temporal...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={days} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--n-800))" />
              <XAxis dataKey="date" minTickGap={35} tick={{ fill: "rgb(var(--n-400))", fontSize: 10 }} />
              <YAxis
                yAxisId="mm"
                orientation="left"
                tick={{ fill: "#ef4444", fontSize: 10 }}
                label={{
                  value: "LOS (mm)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#ef4444",
                  fontSize: 10,
                }}
              />
              <YAxis
                yAxisId="rain"
                orientation="right"
                reversed
                tick={{ fill: "rgb(var(--a-400))", fontSize: 10 }}
                label={{
                  value: "Chuva (mm)",
                  angle: 90,
                  position: "insideRight",
                  fill: "rgb(var(--a-400))",
                  fontSize: 10,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(var(--n-900))",
                  borderColor: "rgb(var(--n-800))",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              {/* Lacuna de instrumento NISAR (27/07 a 10/08/2026) */}
              <ReferenceArea
                yAxisId="mm"
                x1="2026-07-27"
                x2="2026-08-10"
                fill="rgb(var(--n-400))"
                fillOpacity={0.2}
                label={{ value: "Lacuna Instrumento", fill: "rgb(var(--n-400))", fontSize: 9 }}
              />
              <Bar
                yAxisId="rain"
                dataKey="rain_mm"
                fill="rgb(var(--a-400))"
                name="Chuva Diária (mm) - NASA POWER"
                opacity={0.8}
              />
              <Line
                yAxisId="mm"
                type="monotone"
                dataKey="los_mm"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="LOS simulado (mm) - ilustrativo, nao medido"
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700 text-xs text-slate-300">
        <span className="font-semibold text-amber-400">Diagnóstico Geotécnico:</span> A curva de LOS é uma simulação ilustrativa calculada a partir da chuva (não é medição NISAR); a chuva diária é real (NASA POWER). Em dados reais, aceleração contínua do LOS sem retorno ao equilíbrio seria um sinal a investigar em campo.
      </div>
    </div>
  );
}
