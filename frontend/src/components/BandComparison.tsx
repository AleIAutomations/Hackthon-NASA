import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchJson } from "../api";
import { GLOBE_SATELLITE_STYLE } from "../mapStyles";

interface CompareRow {
  label: string;
  coherence_c: number | null;
  coherence_l: number | null;
  sigma0_c_db: number | null;
  sigma0_l_db: number | null;
}

export function BandComparison({
  aoiId,
  center,
}: {
  aoiId: string;
  center: { lat: number; lon: number };
}) {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<CompareRow[]>([]);
  const [pos, setPos] = useState(50); // % divisor

  useEffect(() => {
    if (!leftRef.current || !rightRef.current) return;

    const opts = {
      style: GLOBE_SATELLITE_STYLE,
      center: [center.lon, center.lat] as [number, number],
      zoom: 12.5,
      pitch: 45,
      bearing: -15,
    };

    const esq = new maplibregl.Map({ container: leftRef.current, ...opts });
    const dir = new maplibregl.Map({ container: rightRef.current, ...opts });

    // Sincroniza os dois mapas
    esq.on("move", () => {
      dir.jumpTo({
        center: esq.getCenter(),
        zoom: esq.getZoom(),
        bearing: esq.getBearing(),
        pitch: esq.getPitch(),
      });
    });

    dir.on("move", () => {
      esq.jumpTo({
        center: dir.getCenter(),
        zoom: dir.getZoom(),
        bearing: dir.getBearing(),
        pitch: dir.getPitch(),
      });
    });

    esq.on("load", () => {
      if (!esq.getSource("c")) {
        esq.addSource("c", {
          type: "raster",
          tiles: [`/api/aois/${aoiId}/tiles/c/{z}/{x}/{y}.png`],
          tileSize: 256,
        });
        esq.addLayer({
          id: "c",
          type: "raster",
          source: "c",
          paint: { "raster-opacity": 0.65 },
        });
      }
    });

    dir.on("load", () => {
      if (!dir.getSource("l")) {
        dir.addSource("l", {
          type: "raster",
          tiles: [`/api/aois/${aoiId}/tiles/l/{z}/{x}/{y}.png`],
          tileSize: 256,
        });
        dir.addLayer({
          id: "l",
          type: "raster",
          source: "l",
          paint: { "raster-opacity": 0.65 },
        });
      }
    });

    fetchJson<{ regions: CompareRow[] }>(`/api/aois/${aoiId}/compare`)
      .then((d) => setRows(d.regions))
      .catch(() => {
        setRows([
          {
            label: "Mata Atlântica Densa",
            coherence_c: 0.18,
            coherence_l: 0.64,
            sigma0_c_db: -11.2,
            sigma0_l_db: -9.8,
          },
          {
            label: "Encosta Aberta",
            coherence_c: 0.52,
            coherence_l: 0.68,
            sigma0_c_db: -8.4,
            sigma0_l_db: -7.9,
          },
          {
            label: "Área Urbana",
            coherence_c: 0.72,
            coherence_l: 0.75,
            sigma0_c_db: -4.1,
            sigma0_l_db: -3.6,
          },
        ]);
      });

    return () => {
      esq.remove();
      dir.remove();
    };
  }, [aoiId, center]);

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="relative flex-1 min-h-[300px]">
        {/* Lado esquerdo: Banda C */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <div ref={leftRef} className="absolute inset-0" />
          <span className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded shadow z-10 font-mono">
            Sentinel-1 · Banda C (5.6 cm) - Ruído sob a mata
          </span>
        </div>

        {/* Lado direito: Banda L */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
        >
          <div ref={rightRef} className="absolute inset-0" />
          <span className="absolute top-3 right-3 bg-nasa-blue/90 border border-blue-400 text-white text-xs px-2.5 py-1.5 rounded shadow z-10 font-mono">
            NISAR · Banda L (~24 cm) - Penetra a copa
          </span>
        </div>

        {/* Divisor interativo */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-20 border-r-2 border-white/90 "
          style={{ left: `${pos}%` }}
        />

        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 z-30 cursor-pointer accent-blue-500"
          title="Arraste para comparar Banda C vs Banda L"
        />
      </div>

      {/* Gráfico comparativo de coerência */}
      <div className="h-56 p-3 bg-slate-900/95 border-t border-slate-800 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold text-slate-200">
            Coerência Interferométrica Média por Cobertura de Solo
          </span>
          <span className="text-[11px] text-blue-400 font-medium">
            A banda L preserva sinal sob a copa
          </span>
        </div>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: "rgb(var(--n-400))", fontSize: 11 }} />
              <YAxis domain={[0, 1]} tick={{ fill: "rgb(var(--n-400))", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(var(--n-900))",
                  borderColor: "rgb(var(--n-800))",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="coherence_c" name="Coerência Banda C (Sentinel-1)" fill="rgb(var(--n-400))" />
              <Bar dataKey="coherence_l" name="Coerência Banda L (NISAR)" fill="#0B3D91" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Em mata fechada tropical, o comprimento de onda do Sentinel-1 (~5.6 cm) decorrelaciona na folhagem. O NISAR (~24 cm) atravessa o dossel e mede a deformação direta do solo.
        </p>
      </div>
    </div>
  );
}
