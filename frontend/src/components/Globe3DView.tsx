import React, { useEffect, useRef, useState } from "react";
import Globe, { GlobeMethods } from "react-globe.gl";
import { getRiskGrid, type RiskCell } from "../api";
import { Play, Pause, Compass, MapPin, Maximize2 } from "lucide-react";

interface GlobePoint {
  lat: number;
  lng: number;
  size: number;
  color: string;
  altitude: number;
  name: string;
  score: number;
  level: string;
  slope: number;
  rain: number;
}

interface AreaMarker {
  id: string;
  lat: number;
  lng: number;
  name: string;
  riskType: string;
  color: string;
  maxScore: number;
}

const LEVEL_COLORS: Record<string, string> = {
  verde: "#22c55e",
  amarelo: "#eab308",
  laranja: "#f97316",
  vermelho: "#ef4444",
};

export function Globe3DView({
  aoiId,
  center,
  onSelectAoi,
  onSwitchToDetailed,
}: {
  aoiId: string;
  center: { lat: number; lon: number };
  onSelectAoi?: (id: string) => void;
  onSwitchToDetailed?: () => void;
}) {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [points, setPoints] = useState<GlobePoint[]>([]);
  const [rings, setRings] = useState<any[]>([]);
  const [autoRotate, setAutoRotate] = useState(false);
  const [texture, setTexture] = useState<"day" | "night">("day");

  const studyAreas: AreaMarker[] = [
    {
      id: "serra-do-mar",
      lat: -23.76,
      lng: -45.41,
      name: "Serra do Mar - São Sebastião (SP)",
      riskType: "Deslizamento em Encosta sob Mata",
      color: "#ef4444",
      maxScore: 89,
    },
    {
      id: "brumadinho",
      lat: -20.12,
      lng: -44.12,
      name: "Brumadinho - Quadrilátero Ferrífero (MG)",
      riskType: "Barragem e Subsidência",
      color: "#f97316",
      maxScore: 74,
    },
  ];

  // Ajusta dimensoes de tela responsivas
  useEffect(() => {
    function updateDimensions() {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    }
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Carrega as celulas de radar e projeta na esfera 3D
  useEffect(() => {
    getRiskGrid(aoiId).then(({ features }) => {
      const globePts: GlobePoint[] = features.slice(0, 1200).map((f) => {
        const [lng, lat] = f.geometry.coordinates;
        const p = f.properties;
        const score = p.risk_score || 0;
        return {
          lat,
          lng,
          size: score > 70 ? 0.45 : 0.25,
          color: LEVEL_COLORS[p.alert_level] || "#22c55e",
          altitude: score * 0.0018 + 0.01,
          name: `${aoiId} - Célula SAR 30m`,
          score,
          level: p.alert_level,
          slope: p.slope_deg ?? 0,
          rain: p.rain_72h_mm ?? 0,
        };
      });
      setPoints(globePts);

      // Aneis de alerta pulsantes nas areas
      const activeRings = studyAreas.map((area) => ({
        lat: area.lat,
        lng: area.lng,
        maxR: area.id === aoiId ? 4.5 : 2.5,
        propagationSpeed: 1.8,
        repeatPeriod: 1200,
        color: area.id === aoiId ? "#ef4444" : "#38bdf8",
      }));
      setRings(activeRings);
    });
  }, [aoiId]);

  // Posiciona a camera do globo na area selecionada
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.pointOfView(
        { lat: center.lat, lng: center.lon, altitude: 0.8 },
        1500
      );
    }
  }, [center]);

  // Controles de auto-rotacao
  useEffect(() => {
    if (globeEl.current) {
      const controls = globeEl.current.controls();
      if (controls) {
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 0.8;
      }
    }
  }, [autoRotate]);

  const globeImage =
    texture === "day"
      ? "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      : "https://unpkg.com/three-globe/example/img/earth-night.jpg";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center select-none"
    >
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl={globeImage}
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
        showAtmosphere={true}
        atmosphereColor="#38bdf8"
        atmosphereAltitude={0.22}
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude="altitude"
        pointRadius="size"
        pointsMerge={false}
        pointLabel={(d: any) => `
          <div style="background: rgba(15, 23, 42, 0.95); color: #f8fafc; padding: 8px 12px; border-radius: 6px; font-family: sans-serif; font-size: 11px; border: 1px solid #334155; box-shadow: 0 8px 20px rgba(0,0,0,0.7);">
            <div style="font-weight: bold; color: ${d.color}; font-size: 12px; margin-bottom: 2px;">
              SCORE SAR: ${d.score}/100 (${d.level.toUpperCase()})
            </div>
            <div>Declividade: ${d.slope}°</div>
            <div>Chuva 72h: ${d.rain} mm</div>
          </div>
        `}
        ringsData={rings}
        ringColor="color"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        labelsData={studyAreas}
        labelLat="lat"
        labelLng="lng"
        labelText={(d: any) => String(d.name).normalize("NFD").replace(/[\u0300-\u036f]/g, "")}
        labelSize={1.4}
        labelDotRadius={0.6}
        labelColor={() => "#38bdf8"}
        labelResolution={2}
        labelAltitude={0.03}
        onLabelClick={(label: any) => {
          if (onSelectAoi) onSelectAoi(label.id);
          if (globeEl.current) {
            globeEl.current.pointOfView(
              { lat: label.lat, lng: label.lng, altitude: 0.6 },
              1200
            );
          }
        }}
      />

      {/* Controles Flutuantes do Globo no Canto Inferior Esquerdo */}
      <div className="absolute bottom-5 left-5 z-20 flex flex-wrap items-center gap-2">
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-1.5 flex items-center gap-1 shadow-2xl backdrop-blur">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition ${
              autoRotate
                ? "bg-blue-600 text-white"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200"
            }`}
            title="Ativar/desativar rotação contínua da Terra"
          >
            {autoRotate ? <Pause size={13} /> : <Play size={13} />}
            <span>{autoRotate ? "Pausar Giro" : "Girar Globo"}</span>
          </button>

          <button
            onClick={() => {
              if (globeEl.current) {
                globeEl.current.pointOfView(
                  { lat: -15.0, lng: -52.0, altitude: 2.2 },
                  1200
                );
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition"
            title="Centralizar visão global no Brasil"
          >
            <Compass size={13} className="text-cyan-400" />
            <span>Ver Brasil</span>
          </button>

          <button
            onClick={() => {
              if (globeEl.current) {
                globeEl.current.pointOfView(
                  { lat: center.lat, lng: center.lon, altitude: 0.45 },
                  1200
                );
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-nasa-blue hover:bg-blue-800 text-white rounded text-xs font-medium transition"
            title="Aproximar para a área monitorada"
          >
            <MapPin size={13} className="text-red-400" />
            <span>Focar Área</span>
          </button>
        </div>

        <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-1.5 flex items-center gap-1 shadow-2xl backdrop-blur text-xs">
          <button
            onClick={() => setTexture("day")}
            className={`px-2.5 py-1 rounded transition ${
              texture === "day"
                ? "bg-blue-600 text-white font-semibold"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            NASA Blue Marble
          </button>
          <button
            onClick={() => setTexture("night")}
            className={`px-2.5 py-1 rounded transition ${
              texture === "night"
                ? "bg-blue-600 text-white font-semibold"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Terra Noturna
          </button>
        </div>

        {onSwitchToDetailed && (
          <button
            onClick={onSwitchToDetailed}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-2xl flex items-center gap-1.5 transition"
            title="Alternar para o mapa detalhado de alta resolução com relevo"
          >
            <Maximize2 size={13} />
            <span>Modo Taludes (Alta Resolução)</span>
          </button>
        )}
      </div>

      {/* Dica de Interatividade no Canto Superior Direito */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none bg-slate-900/80 border border-slate-800 text-slate-300 text-[11px] px-3 py-1.5 rounded-lg shadow backdrop-blur flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>Arraste com o mouse para girar o globo · Scroll para zoom</span>
      </div>
    </div>
  );
}
