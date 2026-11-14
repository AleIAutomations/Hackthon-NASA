import React, { useState } from "react";
import { Sidebar, NavItemKey } from "./Sidebar";
import { Topbar } from "./Topbar";
import { AoiSummary } from "../../types";

interface AppShellProps {
  currentView: NavItemKey;
  onNavigate: (view: NavItemKey) => void;
  title: string;
  description: string;
  aois: AoiSummary[];
  selectedAoiId: string;
  onSelectAoi: (id: string) => void;
  isOnline: boolean;
  isCacheFirst: boolean;
  lastUpdated: string;
  children: React.ReactNode;
}

export function AppShell({
  currentView,
  onNavigate,
  title,
  description,
  aois,
  selectedAoiId,
  onSelectAoi,
  isOnline,
  isCacheFirst,
  lastUpdated,
  children,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen w-screen flex bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Barra Lateral de Navegacao */}
      <Sidebar
        currentView={currentView}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Conteudo Principal com Header Superior */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Topbar
          title={title}
          description={description}
          aois={aois}
          selectedAoiId={selectedAoiId}
          onSelectAoi={onSelectAoi}
          isOnline={isOnline}
          isCacheFirst={isCacheFirst}
          lastUpdated={lastUpdated}
        />

        <main className="flex-1 relative overflow-hidden bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
