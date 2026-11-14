import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import { getRiskGrid, type RiskCell } from "../api";

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
      estimado: f.properties.data_origin === "estimated" ? 1 : 0,
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

  useEffect(() => {
    if (!ref.current) return;

    const map = new maplibregl.Map({
      container: ref.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [center.lon, center.lat],
      zoom: 12,
      pitch: 55,
      bearing: -15,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", async () => {
      const { features, offline } = await getRiskGrid(aoiId);
      if (offline) {
        document.dispatchEvent(new CustomEvent("terraalerta:offline"));
      }

      if (!map.getSource("risk")) {
        map.addSource("risk", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: comCor(features) as any,
          },
          cluster: true,
          clusterRadius: 35,
        });

        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "risk",
          filter: ["has", "point_count"],
          paint: {
            "circle-radius": 14,
            "circle-color": "#0B3D91",
            "circle-opacity": 0.75,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#ffffff",
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
          },
          paint: {
            "text-color": "#ffffff",
          },
        });

        map.addLayer({
          id: "risk-cells",
          type: "circle",
          source: "risk",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-radius": 6,
            "circle-color": ["get", "color"],
            "circle-opacity": 0.85,
            "circle-stroke-width": ["get", "estimado"],
            "circle-stroke-color": "#111827",
          },
        });

        const popup = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
        });

        map.on("mouseenter", "risk-cells", (e) => {
          map.getCanvas().style.cursor = "pointer";
          const f = e.features?.[0];
          if (!f) return;
          const p = f.properties as any;
          popup
            .setLngLat((f.geometry as any).coordinates)
            .setHTML(
              `<div style="color: #111827; font-size: 12px; line-height: 1.4;">` +
                `<b>Score de Risco: ${p.risk_score}</b> (${p.alert_level})<br/>` +
                `Declividade: ${p.slope_deg ?? "-"}°<br/>` +
                `Chuva 72h: ${p.rain_72h_mm ?? "-"} mm<br/>` +
                `Coerência L: ${p.coherence_l_band ?? "-"}<br/>` +
                `Deslocamento LOS: ${p.los_displacement_mm ?? "-"} mm<br/>` +
                `<i>Origem: ${p.data_origin}</i>` +
                `</div>`
            )
            .addTo(map);
        });

        map.on("mouseleave", "risk-cells", () => {
          map.getCanvas().style.cursor = "";
          popup.remove();
        });
      }
    });

    return () => {
      map.remove();
    };
  }, [aoiId, center]);

  return <div ref={ref} className="absolute inset-0" />;
}
