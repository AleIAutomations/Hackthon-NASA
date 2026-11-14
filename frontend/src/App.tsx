import { useEffect, useState } from "react";
import { Globe3DView } from "./components/Globe3DView";
import { Map3DView } from "./components/Map3DView";
import { BandComparison } from "./components/BandComparison";
import { InSARTimeSeries } from "./components/InSARTimeSeries";
import { CivilDefensePanel } from "./components/CivilDefensePanel";
import { fetchJson } from "./api";
import {
  Layers,
  GitCompare,
  LineChart,
  Shield,
  Satellite,
  Info,
  Globe,
  Map as MapIcon,
} from "lucide-react";

type Aba = "risco" | "comparar" | "serie" | "defesa";
type ViewMode = "globe" | "terrain";

interface Aoi {
  id: string;
  name: string;
  center: { lat: number; lon: number };
}

export default function App() {
  const [aois, setAois] = useState<Aoi[]>([
    {
      id: "serra-do-mar",
      name: "Serra do Mar - São Sebastião (SP)",
      center: { lat: -23.76, lon: -45.41 },
    },
    {
      id: "brumadinho",
      name: "Brumadinho - Quadrilátero Ferrífero (MG)",
      center: { lat: -20.12, lon: -44.12 },
    },
  ]);
  const [aoiId, setAoiId] = useState("serra-do-mar");
  const [aba, setAba] = useState<Aba>("risco");
  const [viewMode, setViewMode] = useState<ViewMode>("globe");
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    fetchJson<{ aois: Aoi[] }>("/api/aois")
      .then((d) => setAois(d.aois))
      .catch(() => {});

    const onOffline = () => setOffline(true);
    document.addEventListener("terraalerta:offline", onOffline);
    return () => document.removeEventListener("terraalerta:offline", onOffline);
  }, []);

  const aoi = aois.find((a) => a.id === aoiId) ?? aois[0];

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Area principal de visualizacao */}
      <div className="flex-1 relative h-full">
        {aba === "comparar" ? (
          <BandComparison aoiId={aoi.id} center={aoi.center} />
        ) : viewMode === "globe" ? (
          <Globe3DView
            aoiId={aoi.id}
            center={aoi.center}
            onSelectAoi={(newId) => setAoiId(newId)}
            onSwitchToDetailed={() => setViewMode("terrain")}
          />
        ) : (
          <Map3DView aoiId={aoi.id} center={aoi.center} />
        )}

        {/* Barra superior de seletores */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
          {/* Seletor de area */}
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-lg shadow-xl px-3 py-2 flex items-center gap-2 backdrop-blur">
            <Satellite size={16} className="text-blue-400" />
            <select
              value={aoiId}
              onChange={(e) => setAoiId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-100 outline-none cursor-pointer"
            >
              {aois.map((a) => (
                <option key={a.id} value={a.id} className="bg-slate-900 text-slate-100">
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Alternador de Modo: Globo 3D vs Terreno Local */}
          {aba !== "comparar" && (
            <div className="bg-slate-900/95 border border-slate-700/80 rounded-lg shadow-xl p-1 flex items-center gap-1 backdrop-blur text-xs">
              <button
                onClick={() => setViewMode("globe")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                  viewMode === "globe"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
                title="Visualização da Terra como Globo Esférico 3D no espaço"
              >
                <Globe size={14} />
                <span>Globo 3D</span>
              </button>
              <button
                onClick={() => setViewMode("terrain")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                  viewMode === "terrain"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
                title="Visualização plana/inclinada de alta resolução das encostas locais"
              >
                <MapIcon size={14} />
                <span>Terreno 3D</span>
              </button>
            </div>
          )}
        </div>

        {/* Selo modo offline */}
        {offline && (
          <span className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-yellow-400 text-slate-950 font-bold text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-slate-950" />
            modo offline - dados locais das áreas
          </span>
        )}
      </div>

      {/* Painel lateral */}
      <aside className="w-full md:w-[420px] bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-2xl z-30">
        {/* Cabecalho */}
        <header className="p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-blue-600/30 text-blue-400 border border-blue-500/40 rounded font-mono">
                  NASA NISAR
                </span>
                <span className="text-xs text-slate-500">Space Apps 2026</span>
              </div>
              <h1 className="font-extrabold text-lg text-slate-100 tracking-tight mt-1 flex items-center gap-2">
                TerraAlerta NISAR
              </h1>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Satellite size={18} />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Monitoramento de encostas e barragens via radar banda L + relevo + chuva diária.
          </p>
        </header>

        {/* Abas */}
        <nav className="flex border-b border-slate-800 bg-slate-950/30 text-xs">
          {(
            [
              ["risco", "Risco 3D", Layers],
              ["comparar", "C vs L", GitCompare],
              ["serie", "Série SAR", LineChart],
              ["defesa", "Defesa Civil", Shield],
            ] as const
          ).map(([id, rotulo, Icon]) => (
            <button
              key={id}
              onClick={() => setAba(id)}
              className={`flex-1 py-3 px-2 font-medium flex flex-col items-center gap-1 border-b-2 transition ${
                aba === id
                  ? "border-blue-500 text-blue-400 bg-blue-500/10"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Icon size={15} />
              <span>{rotulo}</span>
            </button>
          ))}
        </nav>

        {/* Conteudo da aba */}
        <div className="flex-1 overflow-y-auto">
          {aba === "risco" && (
            <div className="p-4 text-xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-100 mb-1">
                  Grade de Triagem de Risco Físico
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Células georreferenciadas de 30 metros calculadas a partir da equação de estabilidade de talude infinito + retroespalhamento polarimétrico e deslocamento em linha de visada (LOS).
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-200 block text-[11px]">
                  Níveis de Alerta (Score 0 a 100):
                </span>
                <ul className="space-y-1.5">
                  <li className="flex items-center justify-between p-1.5 rounded bg-slate-900/80">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="font-medium text-slate-200">Verde (0 - 24)</span>
                    </div>
                    <span className="text-slate-400">Monitoramento rotineiro</span>
                  </li>
                  <li className="flex items-center justify-between p-1.5 rounded bg-slate-900/80">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-yellow-400" />
                      <span className="font-medium text-slate-200">Amarelo (25 - 49)</span>
                    </div>
                    <span className="text-slate-400">Atenção pós-chuva</span>
                  </li>
                  <li className="flex items-center justify-between p-1.5 rounded bg-slate-900/80">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-orange-500" />
                      <span className="font-medium text-slate-200">Laranja (50 - 74)</span>
                    </div>
                    <span className="text-slate-400">Vistoria de campo em 24h</span>
                  </li>
                  <li className="flex items-center justify-between p-1.5 rounded bg-slate-900/80">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="font-medium text-slate-200">Vermelho (75 - 100)</span>
                    </div>
                    <span className="text-slate-400">Protocolo de evacuação</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Info size={14} className="text-blue-400" />
                  <span>Transparência Científica</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Células com contorno escuro representam valores derivados/estimados de acordo com as regras de honestidade do NASA Space Apps Challenge 2026.
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
                  <div>
                    <span className="text-slate-500 block">Radar Primário:</span>
                    <span className="text-slate-300 font-mono">NISAR L-band (ASF DAAC)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Precipitação:</span>
                    <span className="text-slate-300 font-mono">NASA POWER (72h acum.)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Topografia:</span>
                    <span className="text-slate-300 font-mono">NASADEM / SRTM (30m)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Física do Talude:</span>
                    <span className="text-slate-300 font-mono">Infinite Slope (FS)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {aba === "comparar" && (
            <div className="p-4 text-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-100">
                Por que a Banda L muda o jogo?
              </h3>
              <p className="text-slate-300 leading-relaxed">
                No Brasil, as áreas de maior risco geológico (como a Serra do Mar e o Quadrilátero Ferrífero) possuem densa vegetação ou relevo acidentado.
              </p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="font-semibold text-slate-200">Sentinel-1 (Banda C ~5.6 cm):</span>
                </div>
                <p className="text-slate-400 pl-4 text-[11px]">
                  O eco espalha nas folhas e galhos finos da copa. A coerência temporal cai drasticamente em mata tropical (0.15 - 0.25), impedindo a medição precisa da deformação do solo.
                </p>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="font-semibold text-slate-200">NISAR (Banda L ~24 cm):</span>
                </div>
                <p className="text-slate-400 pl-4 text-[11px]">
                  O comprimento de onda longo penetra o dossel florestal e reflete no solo e na rocha matriz. A coerência se mantém alta (0.65 - 0.78), revelando deformações milimétricas antes da ruptura.
                </p>
              </div>
            </div>
          )}

          {aba === "serie" && <InSARTimeSeries aoiId={aoi.id} />}

          {aba === "defesa" && <CivilDefensePanel aoiId={aoi.id} />}
        </div>
      </aside>
    </div>
  );
}
