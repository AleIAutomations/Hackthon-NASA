import React from "react";
import { DataSourceInfo } from "../types";
import { Database, ExternalLink, ShieldCheck, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export function DataSourcesPage() {
  const sources: DataSourceInfo[] = [
    {
      name: "NISAR L-band SAR (GCOV & GUNW)",
      platform: "NISAR (NASA / ISRO)",
      sensor: "L-SAR (Radar de Abertura Sintética)",
      bandOrType: "Banda L (λ ~24 cm)",
      purpose: "Sensoriamento de solo sob copa florestal densa, retroespalhamento polarimétrico (HH/HV) e interferometria (deslocamento LOS).",
      status: "Conectado",
      coverage: "Global / Terrestre",
      updateFrequency: "Revisita a cada 12 dias",
      url: "https://nisar-docs.asf.alaska.edu/",
      limitations: "Série científica calibrada iniciada em 2026; lacuna instrumental entre 27/07 e 10/08/2026.",
    },
    {
      name: "Sentinel-1 C-band SAR (GRD & SLC)",
      platform: "Sentinel-1 (ESA / Copernicus)",
      sensor: "C-SAR",
      bandOrType: "Banda C (λ ~5.6 cm)",
      purpose: "Linha de base (baseline) de comparação. Mostra a perda de coerência temporal sob mata densa tropical.",
      status: "Disponível (ASF)",
      coverage: "Global",
      updateFrequency: "6 a 12 dias",
      url: "https://search.asf.alaska.edu/",
      limitations: "Sentinel-1B inoperante desde dez/2021; forte decorrelação em dossel vegetal úmido.",
    },
    {
      name: "NASA POWER Meteorology",
      platform: "NASA Langley Research Center",
      sensor: "Análise climática integrada",
      bandOrType: "Precipitação diária (PRECTOTCORR)",
      purpose: "Histórico e precipitação acumulada de 72 horas para cálculo do grau de saturação do solo.",
      status: "Conectado",
      coverage: "Global em grade de ~50 km",
      updateFrequency: "Diária (sem necessidade de token)",
      url: "https://power.larc.nasa.gov/",
      limitations: "Resolução espacial regional de ~50 km; serve como aproximação pluviométrica da encosta.",
    },
    {
      name: "NASADEM / SRTM Elevation",
      platform: "NASA Jet Propulsion Laboratory (JPL)",
      sensor: "InSAR Shuttle Radar Topography",
      bandOrType: "DEM Digital de Elevação",
      purpose: "Extração do mapa de declividade em graus (slope) por gradiente central para a física de talude.",
      status: "Conectado",
      coverage: "Global (entre 60°N e 56°S)",
      updateFrequency: "Estática (30 metros)",
      url: "https://www.earthdata.nasa.gov/sensors/nasadem",
      limitations: "Relevo prévio; eventuais movimentações de grande porte exigem atualização.",
    },
    {
      name: "ALOS-1 PALSAR Historical",
      platform: "JAXA / ASF DAAC",
      sensor: "PALSAR L-band",
      bandOrType: "Banda L histórica (2006-2011)",
      purpose: "Referência histórica de longo prazo de banda L para validação de subsidência retrospectiva.",
      status: "Série Histórica",
      coverage: "Áreas de interesse cadastradas",
      updateFrequency: "Arquivo histórico aberto no ASF",
      url: "https://asf.alaska.edu/data-sets/sar-data-sets/alos-palsar/",
      limitations: "Missão encerrada em 2011; serve como baseline decenal.",
    },
    {
      name: "WorldPop Population Density",
      platform: "WorldPop Project / Univ. of Southampton",
      sensor: "Modelagem censitária e espacial",
      bandOrType: "Grade de habitantes (100 metros)",
      purpose: "Estimativa de moradores potencialmente expostos dentro do polígono de alerta da Defesa Civil.",
      status: "Disponível (ASF)",
      coverage: "Brasil / Global",
      updateFrequency: "Anual",
      url: "https://hub.worldpop.org/",
      limitations: "Distribuição estatística espacial, não cadastro individual de domicílios.",
    },
    {
      name: "OpenStreetMap Buildings",
      platform: "OpenStreetMap Foundation",
      sensor: "Mapeamento colaborativo aberto",
      bandOrType: "Polígonos de edificações (Overpass API)",
      purpose: "Contagem de estruturas prediais, escolas e hospitais no setor crítico avaliado.",
      status: "Conectado",
      coverage: "Global",
      updateFrequency: "Tempo real colaborativo",
      url: "https://www.openstreetmap.org/",
      limitations: "Depende da completude cadastral colaborativa local.",
    },
  ];

  return (
    <div className="h-full w-full flex flex-col p-4 gap-4 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Database size={24} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-100">
              Catálogo de Fontes de Dados e Transparência Científica
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Conformidade com os critérios de integridade da NASA: cada variável declarada com proveniência e limitações.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Fontes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {sources.map((src) => (
          <div
            key={src.name}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    {src.name}
                  </h3>
                  <span className="text-[11px] text-cyan-400 font-mono">
                    {src.platform} · {src.bandOrType}
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                  {src.status}
                </span>
              </div>

              <div className="space-y-2 mt-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">
                    Finalidade no TerraAlerta:
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {src.purpose}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 text-slate-400">
                  <div>
                    <span className="text-slate-500 block">Cobertura:</span>
                    <span className="text-slate-300 font-medium">{src.coverage}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Frequência:</span>
                    <span className="text-slate-300 font-medium">{src.updateFrequency}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[10px] text-amber-300/80 leading-relaxed">
                  <strong className="text-amber-400">Limitações Conhecidas:</strong> {src.limitations}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-2 flex justify-end">
              <a
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition"
              >
                <span>Acessar portal oficial</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
