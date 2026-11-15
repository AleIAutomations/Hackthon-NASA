import React, { useEffect, useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { NavItemKey } from "./components/layout/Sidebar";
import { apiService } from "./services/api";
import { AoiSummary, RiskCell, ReportItem } from "./types";

// Paginas
import { OverviewPage } from "./pages/OverviewPage";
import { GeographicMonitoringPage } from "./pages/GeographicMonitoringPage";
import { SARComparisonPage } from "./pages/SARComparisonPage";
import { DeformationHistoryPage } from "./pages/DeformationHistoryPage";
import { AlertsPage } from "./pages/AlertsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { DataSourcesPage } from "./pages/DataSourcesPage";

export default function App() {
  const [currentView, setCurrentView] = useState<NavItemKey>("overview");
  const [aois, setAois] = useState<AoiSummary[]>([
    {
      id: "serra-do-mar",
      name: "Serra do Mar - São Sebastião (SP)",
      center: { lat: -23.76, lon: -45.41 },
      risk_type: "landslide",
      scene_counts: { nisar: 10, sentinel1: 10, alos_palsar: 10 },
    },
    {
      id: "brumadinho",
      name: "Brumadinho - Quadrilátero Ferrífero (MG)",
      center: { lat: -20.12, lon: -44.12 },
      risk_type: "dam_subsidence",
      scene_counts: { nisar: 10, sentinel1: 10, alos_palsar: 10 },
    },
  ]);
  const [selectedAoiId, setSelectedAoiId] = useState<string>("serra-do-mar");
  const [cells, setCells] = useState<RiskCell[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isCacheFirst, setIsCacheFirst] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>("Carregando...");

  // Historico de relatorios e laudos emitidos localmente
  const [reports, setReports] = useState<ReportItem[]>(() => {
    try {
      const saved = localStorage.getItem("terraalerta_reports");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Salva no storage quando adicionar relatorio
  const handleSaveReport = (newReport: ReportItem) => {
    const updated = [newReport, ...reports];
    setReports(updated);
    try {
      localStorage.setItem("terraalerta_reports", JSON.stringify(updated));
    } catch {}
  };

  const handleClearReports = () => {
    setReports([]);
    try {
      localStorage.removeItem("terraalerta_reports");
    } catch {}
  };

  // Carrega lista de AOIs e verifica status do backend
  useEffect(() => {
    apiService
      .getAois()
      .then((data) => {
        if (data.aois && data.aois.length) {
          setAois(data.aois);
        }
        setIsOnline(!data.offline);
        setLastUpdated(data.generated_at || new Date().toISOString().split("T")[0]);
      })
      .catch(() => {
        setIsOnline(false);
      });

    const onOfflineEvent = () => setIsOnline(false);
    document.addEventListener("terraalerta:offline", onOfflineEvent);
    return () => document.removeEventListener("terraalerta:offline", onOfflineEvent);
  }, []);

  // Recarrega celulas de risco ao trocar de AOI
  useEffect(() => {
    setLoading(true);
    apiService
      .getRiskGrid(selectedAoiId)
      .then((res) => {
        setCells(res.features);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [selectedAoiId]);

  const activeAoi = aois.find((a) => a.id === selectedAoiId) || aois[0];

  const viewMetadata: Record<NavItemKey, { title: string; description: string }> = {
    overview: {
      title: "Visão Geral",
      description: "Centro de Comando Geoespacial e Triagem de Risco",
    },
    monitoring: {
      title: "Monitoramento Geográfico",
      description: "Exploração Espacial e Análise de Células de 30m",
    },
    compare: {
      title: "Comparador SAR",
      description: "Banda C (Sentinel-1) vs Banda L (NISAR)",
    },
    timeseries: {
      title: "Histórico de Deformação",
      description: "Série Temporal de Deslocamento e Precipitação",
    },
    alerts: {
      title: "Central de Alertas",
      description: "Protocolos e Despacho Operacional da Defesa Civil",
    },
    reports: {
      title: "Relatórios & Pareceres",
      description: "Boletins Técnicos Georreferenciados Emitidos",
    },
    datasources: {
      title: "Fontes de Dados",
      description: "Catálogo e Transparência Científica de Sensores",
    },
  };

  return (
    <AppShell
      currentView={currentView}
      onNavigate={setCurrentView}
      title={viewMetadata[currentView].title}
      description={viewMetadata[currentView].description}
      aois={aois}
      selectedAoiId={selectedAoiId}
      onSelectAoi={setSelectedAoiId}
      isOnline={isOnline}
      isCacheFirst={isCacheFirst}
      lastUpdated={lastUpdated}
    >
      {currentView === "overview" && (
        <OverviewPage
          currentAoi={activeAoi}
          cells={cells}
          loading={loading}
          onSelectAoi={setSelectedAoiId}
          onNavigateToView={setCurrentView}
        />
      )}

      {currentView === "monitoring" && (
        <GeographicMonitoringPage
          currentAoi={activeAoi}
          cells={cells}
          onSelectAoi={setSelectedAoiId}
        />
      )}

      {currentView === "compare" && <SARComparisonPage currentAoi={activeAoi} />}

      {currentView === "timeseries" && (
        <DeformationHistoryPage currentAoi={activeAoi} />
      )}

      {currentView === "alerts" && (
        <AlertsPage currentAoi={activeAoi} onSaveReport={handleSaveReport} />
      )}

      {currentView === "reports" && (
        <ReportsPage reports={reports} onClearReports={handleClearReports} />
      )}

      {currentView === "datasources" && <DataSourcesPage />}
    </AppShell>
  );
}
