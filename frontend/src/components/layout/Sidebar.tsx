import React from "react";
import {
  LayoutDashboard,
  Compass,
  GitCompare,
  TrendingDown,
  ShieldAlert,
  FileText,
  Database,
  Satellite,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export type NavItemKey =
  | "overview"
  | "monitoring"
  | "compare"
  | "timeseries"
  | "alerts"
  | "reports"
  | "datasources";

interface SidebarProps {
  currentView: NavItemKey;
  onNavigate: (view: NavItemKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  currentView,
  onNavigate,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const navItems = [
    {
      key: "overview" as NavItemKey,
      label: "Visão Geral",
      description: "Painel central de monitoramento",
      icon: LayoutDashboard,
    },
    {
      key: "monitoring" as NavItemKey,
      label: "Monitoramento Geográfico",
      description: "Exploração espacial 3D e filtros",
      icon: Compass,
    },
    {
      key: "compare" as NavItemKey,
      label: "Comparador SAR",
      description: "Banda C vs Banda L sob a copa",
      icon: GitCompare,
    },
    {
      key: "timeseries" as NavItemKey,
      label: "Histórico de Deformação",
      description: "Série temporal InSAR e chuvas",
      icon: TrendingDown,
    },
    {
      key: "alerts" as NavItemKey,
      label: "Central de Alertas",
      description: "Defesa Civil e evacuação",
      icon: ShieldAlert,
    },
    {
      key: "reports" as NavItemKey,
      label: "Relatórios",
      description: "Boletins e pareceres técnicos",
      icon: FileText,
    },
    {
      key: "datasources" as NavItemKey,
      label: "Fontes de Dados",
      description: "Transparência NISAR e sensores",
      icon: Database,
    },
  ];

  return (
    <aside
      className={`bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 z-40 select-none ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Topo / Marca */}
      <div>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-950/50">
              <Satellite size={22} />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-100 text-sm tracking-tight">
                    TerraAlerta
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-400 font-mono rounded">
                    NISAR
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  Space Apps Challenge 2026
                </p>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition"
            title={collapsed ? "Expandir menu lateral" : "Recolher menu"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Menu de Navegacao */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition text-left group ${
                  isActive
                    ? "bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition-colors ${
                    isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                {!collapsed && (
                  <div className="overflow-hidden">
                    <span className="block truncate font-semibold">
                      {item.label}
                    </span>
                    <span className="block text-[10px] text-slate-500 truncate">
                      {item.description}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Rodapé institucional */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-2 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-400">NASA/ISRO SAR</span>
            <span className="text-[10px] text-slate-500">Dancing with the SARs</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Sensoriamento orbital para triagem preventiva da Defesa Civil.
          </p>
        </div>
      )}
    </aside>
  );
}
