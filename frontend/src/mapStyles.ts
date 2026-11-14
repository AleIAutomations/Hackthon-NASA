import type { StyleSpecification } from "maplibre-gl";

export const GLOBE_SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  projection: {
    type: "globe" as any,
  },
  sources: {
    esri_satellite: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Esri, Maxar, Earthstar Geographics, USDA, USGS, AeroGRID, IGN",
      maxzoom: 19,
    },
    esri_labels: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#020617",
      },
    },
    {
      id: "esri-satellite",
      type: "raster",
      source: "esri_satellite",
      paint: {
        "raster-saturation": 0.1,
        "raster-contrast": 0.1,
      },
    },
    {
      id: "esri-labels",
      type: "raster",
      source: "esri_labels",
      paint: {
        "raster-opacity": 0.75,
      },
    },
  ],
  sky: {
    "sky-color": "#020617",
    "horizon-color": "#0f172a",
    "fog-color": "#090d16",
  } as any,
};

export const NASA_BLUEMARBLE_STYLE: StyleSpecification = {
  version: 8,
  projection: {
    type: "globe" as any,
  },
  sources: {
    nasa_blue_marble: {
      type: "raster",
      tiles: [
        "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg",
      ],
      tileSize: 256,
      attribution: "NASA Global Imagery Browse Services (GIBS)",
      maxzoom: 8,
    },
    esri_labels: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#020617",
      },
    },
    {
      id: "nasa-layer",
      type: "raster",
      source: "nasa_blue_marble",
    },
    {
      id: "labels-layer",
      type: "raster",
      source: "esri_labels",
      paint: {
        "raster-opacity": 0.8,
      },
    },
  ],
  sky: {
    "sky-color": "#020617",
    "horizon-color": "#030712",
  } as any,
};

export const CARTO_DARK_STYLE: StyleSpecification = {
  version: 8,
  projection: {
    type: "globe" as any,
  },
  sources: {
    carto_dark: {
      type: "raster",
      tiles: [
        "https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap &copy; CARTO",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#020617",
      },
    },
    {
      id: "carto-layer",
      type: "raster",
      source: "carto_dark",
    },
  ],
  sky: {
    "sky-color": "#020617",
    "horizon-color": "#0f172a",
  } as any,
};
