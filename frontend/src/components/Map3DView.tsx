import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { getRiskGrid, type RiskCell } from "../api";
import {
  GLOBE_SATELLITE_STYLE,
  NASA_BLUEMARBLE_STYLE,
  CARTO_DARK_STYLE,
} from "../mapStyles";
import { Globe, Focus, Layers } from "lucide-react";

const LEVEL_COLOR: Record<string, string> = {
  verde: "#22c55e",
  amarelo: "#eab308",
  laranja: "#f97316",
  vermelho: "#ef4444",
};

function comCor(features: RiskCell[]) {
  return features.map((f) => ({
    ...f,
    properties: {
      ...f.properties,
      color: LEVEL_COLOR[f.properties.alert_level] ?? "#64748b",
      estimado: f.properties.data_origin === "estimated" ? 2 : 0,
    },
  }));
}

export function Map3DView({
  aoiId,
  center,
}: {
  aoiId: string;
  center: { lat: number; lon: number };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [baseStyle, setBaseStyle] = useState<"satellite" | "nasa" | "dark">(
    "satellite"
  );

  const getActiveStyle = (styleKey: "satellite" | "nasa" | "dark") => {
    switch (styleKey) {
      case "nasa":
        return NASA_BLUEMARBLE_STYLE;
      case "dark":
        return CARTO_DARK_STYLE;
      default:
        return GLOBE_SATELLITE_STYLE;
    }
  };

  const setupRiskLayers = async (map: maplibregl.Map, currentAoi: string) => {
    const { features, offline } = await getRiskGrid(currentAoi);
    if (offline) {
      document.dispatchEvent(new CustomEvent("terraalerta:offline"));
    }

    if (map.getSource("risk")) {
      (map.getSource("risk") as maplibregl.GeoJSONSource).setData({
        type: "FeatureCollection",
        features: comCor(features) as any,
      });
      return;
    }

    map.addSource("risk", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: comCor(features) as any,
      },
      cluster: true,
      clusterRadius: 30,
      clusterMaxZoom: 11,
    });

    // Clusters em zoom distante
    map.addLayer({
      id: "clusters",
      type: "circle",
      source: "risk",
      filter: ["has", "point_count"],
      paint: {
        "circle-radius": [
          "step",
          ["get", "point_count"],
          16,
          50,
          22,
          200,
          28,
        ],
        "circle-color": "#0B3D91",
        "circle-opacity": 0.85,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#38bdf8",
      },
    });

    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "risk",
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-size": 11,
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
      },
      paint: {
        "text-color": "#ffffff",
      },
    });

    // Anel externo pulsante / radar
    map.addLayer({
      id: "risk-cells-glow",
      type: "circle",
      source: "risk",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-radius": 9,
        "circle-color": ["get", "color"],
        "circle-opacity": 0.25,
      },
    });

    // Celulas de radar de 30m individuais
    map.addLayer({
      id: "risk-cells",
      type: "circle",
      source: "risk",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-radius": 5.5,
        "circle-color": ["get", "color"],
        "circle-opacity": 0.95,
        "circle-stroke-width": ["get", "estimado"],
        "circle-stroke-color": "#ffffff",
      },
    });

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: "terra-popup",
    });

    map.on("mouseenter", "risk-cells", (e) => {
      map.getCanvas().style.cursor = "pointer";
      const f = e.features?.[0];
      if (!f) return;
      const p = f.properties as any;
      popup
        .setLngLat((f.geometry as any).coordinates)
        .setHTML(
          `<div style="color: rgb(var(--n-100)); font-family: inherit; font-size: 11px; padding: 2px;">` +
            `<div style="font-weight: 800; font-size: 12px; margin-bottom: 4px; color: ${
              LEVEL_COLOR[p.alert_level] || "#0B3D91"
            };">` +
            `SCORE: ${p.risk_score}/100 (${p.alert_level.toUpperCase()})</div>` +
            `<div><b>Declividade:</b> ${p.slope_deg ?? "-"}°</div>` +
            `<div><b>Chuva Acumulada 72h:</b> ${p.rain_72h_mm ?? "-"} mm</div>` +
            `<div><b>Coerência L:</b> ${p.coherence_l_band ?? "-"}</div>` +
            `<div><b>Deslocamento LOS:</b> ${p.los_displacement_mm ?? "-"} mm</div>` +
            `<div style="margin-top: 4px; font-style: italic; color: rgb(var(--n-400)); font-size: 10px;">` +
            `Score: ${p.data_origin}${p.sar_origin === "measured" ? " · Radar NISAR medido (" + p.sar_date + ")" : ""}</div>` +
            `</div>`
        )
        .addTo(map);
    });

    map.on("mouseleave", "risk-cells", () => {
      map.getCanvas().style.cursor = "";
      popup.remove();
    });
  };

  useEffect(() => {
    if (!ref.current) return;

    const map = new maplibregl.Map({
      container: ref.current,
      style: getActiveStyle(baseStyle),
      center: [center.lon, center.lat],
      zoom: 12.5,
      pitch: 58,
      bearing: -15,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      setupRiskLayers(map, aoiId);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Quando a AOI mudar, voar suavemente com camera 3D
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: [center.lon, center.lat],
      zoom: 12.5,
      pitch: 58,
      bearing: -15,
      speed: 1.4,
      curve: 1.5,
      essential: true,
    });
    if (map.isStyleLoaded()) {
      setupRiskLayers(map, aoiId);
    }
  }, [aoiId, center]);

  const changeStyle = (styleKey: "satellite" | "nasa" | "dark") => {
    const map = mapRef.current;
    if (!map) return;
    setBaseStyle(styleKey);
    map.setStyle(getActiveStyle(styleKey));
    map.once("style.load", () => {
      setupRiskLayers(map, aoiId);
    });
  };

  const flyToGlobe = () => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: [-44.5, -21.5],
      zoom: 1.8,
      pitch: 0,
      bearing: 0,
      speed: 1.0,
      essential: true,
    });
  };

  const flyToSlope = () => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: [center.lon, center.lat],
      zoom: 12.5,
      pitch: 58,
      bearing: -15,
      speed: 1.3,
      essential: true,
    });
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      <div ref={ref} className="absolute inset-0" />

      {/* Controles de Camera Rapida e Estilos na parte inferior */}
      <div className="absolute bottom-5 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="bg-slate-900/90 border border-slate-700/80 rounded p-1.5 flex items-center gap-1  ">
          <button
            onClick={flyToGlobe}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded text-xs font-medium transition"
            title="Ver o globo 3D esférico da Terra no espaço"
          >
            <Globe size={14} className="text-blue-400" />
            <span>Globo 3D</span>
          </button>
          <button
            onClick={flyToSlope}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-nasa-blue hover:bg-blue-800 text-white rounded text-xs font-medium transition"
            title="Aproximar para os taludes e encostas da área monitorada"
          >
            <Focus size={14} className="text-cyan-300" />
            <span>Focar Taludes</span>
          </button>
        </div>

        <div className="bg-slate-900/90 border border-slate-700/80 rounded p-1.5 flex items-center gap-1   text-xs">
          <Layers size={13} className="text-slate-400 ml-1" />
          <button
            onClick={() => changeStyle("satellite")}
            className={`px-2 py-1 rounded transition ${
              baseStyle === "satellite"
                ? "bg-blue-600 text-white font-semibold"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Satélite Esri
          </button>
          <button
            onClick={() => changeStyle("nasa")}
            className={`px-2 py-1 rounded transition ${
              baseStyle === "nasa"
                ? "bg-blue-600 text-white font-semibold"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            NASA Blue Marble
          </button>
          <button
            onClick={() => changeStyle("dark")}
            className={`px-2 py-1 rounded transition ${
              baseStyle === "dark"
                ? "bg-blue-600 text-white font-semibold"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Dark HUD
          </button>
        </div>
      </div>
    </div>
  );
}
