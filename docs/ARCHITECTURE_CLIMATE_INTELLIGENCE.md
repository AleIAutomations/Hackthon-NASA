# TerraAlerta NISAR — Climate Intelligence Architecture (v2)

> Fonte: TerraAlerta_Arquitetura_Climate_Intelligence_v2.docx (14/11/2026). ENOS é contexto climático, **fora do risk_score**.

**Arquitetura integrada de Inteligência Geoespacial e Climática**

**Especificação técnica --- Climate Intelligence / ENOS (El
Niño--Oscilação Sul)**

**Versão 2.0 \| 14 de novembro de 2026**

**NASA Space Apps Challenge 2026 --- Dancing with the SARs**

# 1. Resumo executivo

O TerraAlerta evolui de uma plataforma de monitoramento de deformação de
encostas e estruturas com radar de abertura sintética (SAR) para uma
plataforma de inteligência geoespacial e climática voltada ao apoio à
Defesa Civil.

A arquitetura integra quatro famílias de evidências:

1.  **Mudança da superfície:** NISAR banda L, Sentinel-1 banda C e,
    quando tecnicamente adequado, dados históricos ALOS PALSAR.

2.  **Condições meteorológicas e hidrológicas:** precipitação
    observada/estimada por satélite, dados de estações quando
    disponíveis, acumulados móveis, anomalias e previsões oficiais.

3.  **Contexto climático de grande escala:** estado do ENOS, índices
    oceânicos e previsões/probabilidades sazonais publicadas por centros
    oficiais.

4.  **Vulnerabilidade territorial:** declividade, relevo, uso/cobertura
    do solo, população, edificações e infraestrutura exposta.

O sistema não deve interpretar o El Niño como causa direta de
deslizamento ou ruptura de barragem. O ENOS é uma condição climática de
escala interanual que pode alterar probabilidades de padrões regionais
de chuva e temperatura. O risco local continua dependendo de evidências
locais e da caracterização geotécnica/hidrológica pertinente.

**Produto pretendido:** uma ferramenta de triagem e priorização de áreas
para análise e vistoria, com rastreabilidade científica. Não é um
sistema operacional certificado de previsão de deslizamentos, não
substitui instrumentação local, equipes técnicas ou alertas oficiais e
não deve emitir ordens de evacuação automaticamente.

# 2. Alinhamento com o plano original

A especificação preserva a proposta central do plano TerraAlerta NISAR:
demonstrar mudanças da superfície com dados reais, explorar a
complementaridade entre banda L e banda C, cruzar radar com chuva e
relevo, mapear exposição e manter transparência de proveniência. Também
preserva a arquitetura cache-first, a aplicação React e o backend
FastAPI.

O plano original estabelece duas áreas demonstrativas:

-   **São Sebastião / Serra do Mar (SP):** foco em encostas íngremes,
    vegetação densa, precipitação extrema e deslizamentos.

-   **Brumadinho / Quadrilátero Ferrífero (MG):** foco em monitoramento
    territorial associado a estruturas de mineração/barragens e áreas a
    jusante. A análise de estabilidade de barragens exige variáveis e
    instrumentação específicas; não se deve reutilizar automaticamente
    um modelo de talude de encosta para avaliar segurança estrutural de
    barragem.

O documento original também determina que cada célula seja identificada
como measured, derived ou estimated, e reconhece que NISAR não fornece
revisita operacional em tempo real. Essas restrições permanecem
obrigatórias.

# 3. Fundamento científico: onde o El Niño entra

## 3.1 O que o ENOS representa

O El Niño--Oscilação Sul é um padrão acoplado oceano-atmosfera no
Pacífico tropical. Suas fases incluem El Niño, La Niña e neutralidade. O
monitoramento deve usar índices oficiais e a interpretação publicada
pelos centros responsáveis, sem criar um classificador proprietário como
fonte primária do estado do fenômeno.

Em 2026, a NOAA/CPC passou a utilizar o **Relative Oceanic Niño Index
(RONI)** como referência operacional para monitoramento e previsão
oficial do ENOS, considerando o aquecimento do Niño 3.4 relativo à média
tropical. O ONI tradicional pode continuar sendo mostrado como série
histórica complementar, mas a interface deve identificar claramente qual
índice está sendo exibido e qual é usado na classificação oficial
vigente.

## 3.2 Relação com o Brasil

Os impactos do El Niño não são uniformes no território brasileiro nem
iguais em todos os episódios. Em termos gerais, a Região Sul apresenta
sinal mais recorrente de aumento de chuva em determinadas estações;
Norte e partes do Nordeste podem apresentar redução de precipitação; no
Sudeste e Centro-Oeste, a resposta é mais variável e depende da estação,
da configuração atmosférica e da interação com outros modos climáticos e
sistemas meteorológicos.

Para São Sebastião e Brumadinho, portanto, o sistema não deve inferir
"mais risco" diretamente a partir da fase El Niño. Deve consultar a
previsão climática regional mais recente e, sobretudo, acompanhar a
chuva efetivamente observada na área. A informação climática serve para
planejamento sazonal e preparação, não para afirmar que haverá chuva
extrema em uma encosta específica.

## 3.3 Uso correto no produto

O ENOS será utilizado para:

-   contextualizar o cenário climático de médio prazo;

-   exibir fase, intensidade/índice, tendência e probabilidades
    oficiais;

-   mostrar a previsão sazonal regional emitida por órgãos competentes;

-   comparar anomalias de precipitação observadas com climatologias de
    referência;

-   orientar atenção operacional e planejamento de campanhas de
    monitoramento;

-   apoiar estudos retrospectivos sobre a relação entre episódios ENOS,
    precipitação e eventos geológicos.

O ENOS **não** será utilizado, na versão inicial, para:

-   somar pontos automaticamente ao risk_score;

-   declarar que uma localidade está em risco por estar em El Niño;

-   substituir previsão meteorológica de curto prazo;

-   transformar probabilidade sazonal em previsão pontual para um
    bairro, talude ou barragem;

-   atribuir causalidade de um desastre específico ao El Niño.

# 4. Arquitetura lógica

## 4.1 Camadas

**A. Fontes de dados**

-   SAR: NISAR (GCOV/GUNW conforme disponibilidade e adequação),
    Sentinel-1 e ALOS PALSAR histórico quando útil.

-   Terreno: NASADEM/SRTM e derivados topográficos.

-   Precipitação: GPM IMERG; NASA POWER como contexto meteorológico
    regional e série complementar; estações INMET/CEMADEN e pluviômetros
    locais quando houver acesso confiável.

-   ENOS: NOAA CPC/PSL --- RONI, ONI histórico, discussão diagnóstica e
    outlook probabilístico.

-   Previsão sazonal brasileira: CPTEC/INPE, INMET, FUNCEME e Painel El
    Niño interinstitucional (INPE, INMET, CEMADEN, ANA, SGB, MIDR/Defesa
    Civil e parceiros).

-   Exposição: WorldPop e OpenStreetMap; dados oficiais locais sempre
    que disponíveis.

**B. Ingestão e catálogo**

Conectores independentes por fonte. Cada aquisição registra source_id,
URL/produto, versão, timestamp de aquisição, período coberto, unidade,
CRS, resolução espacial/temporal, método de processamento,
licença/termos e status de qualidade. Falha em uma fonte não pode
interromper a ingestão das demais.

**C. Padronização e controle de qualidade**

Validar geometria, CRS, unidades, datas, valores ausentes, faixa física,
duplicidade, latência e cobertura. Nunca reamostrar uma camada para uma
resolução mais fina e apresentá-la como se tivesse ganho resolução
observacional. A grade comum de análise pode ser de 30 m, mas
precipitação de grade de \~10 km ou \~50 km deve manter sua resolução
nativa e ser identificada como dado de suporte regional.

**D. Pipelines científicos independentes**

-   Pipeline SAR: leitura de produtos, correção/registro conforme
    produto, retroespalhamento, coerência, deslocamento LOS, máscaras de
    qualidade e comparação banda L/C.

-   Pipeline meteorológico: precipitação acumulada, máximos móveis,
    anomalias, qualidade e comparação com climatologia.

-   Pipeline Climate Intelligence: ingestão de índices ENOS e previsões
    oficiais, classificação documentada, validade e contextualização
    regional.

-   Pipeline territorial: declividade, exposição, uso do solo,
    população, edifícios e ativos críticos.

-   Pipeline de validação: inventário de eventos, métricas, validação
    temporal/espacial e análise de incerteza.

**E. Fusão e motor de evidências**

Combina as camadas sem ocultar diferenças de escala, origem ou
incerteza. A primeira versão deve apresentar componentes separados e um
painel de evidências; qualquer score agregado exige calibração e
validação documentadas.

**F. Persistência e serviços**

Armazenar rasters como Cloud Optimized GeoTIFF (COG), vetores como
GeoJSON/GeoParquet conforme necessidade, séries temporais em tabelas
temporais e metadados em banco relacional. FastAPI publica endpoints
versionados. Cache local permite demonstração offline.

**G. Interface**

React + Vite + TypeScript + Tailwind, MapLibre GL e Recharts. A
interface deve permitir ligar/desligar camadas, inspecionar metadados,
comparar períodos e consultar a explicação de cada indicador.

## 4.2 Fluxo de dados

5.  Agendadores consultam fontes e registram novas
    observações/previsões.

6.  Validadores verificam esquema, unidade, cobertura, latência e
    qualidade.

7.  Pipelines científicos processam cada domínio independentemente.

8.  Produtos padronizados são persistidos com metadados e proveniência.

9.  O motor de evidências associa camadas por área e janela temporal,
    preservando a resolução nativa.

10. O backend publica dados, status de atualização e limitações.

11. O frontend renderiza observações, previsões e contexto climático em
    painéis distintos.

12. O usuário gera um boletim de triagem com fontes, datas, incerteza e
    recomendação de verificação técnica.

# 5. Módulo Climate Intelligence

## 5.1 Submódulo ENSO Monitor

Campos mínimos:

-   phase: el_nino, la_nina, neutral, transition ou unknown;

-   index_name: RONI, ONI ou outro índice explicitamente identificado;

-   index_value e unit;

-   period_start, period_end e published_at;

-   official_status conforme texto da fonte;

-   probabilidades por temporada e categoria, quando publicadas;

-   source_agency, source_url, dataset_version;

-   valid_until ou período de validade;

-   confidence_note e method_note.

Não classificar fase com base em um único mês isolado. Consumir a
classificação e a metodologia oficiais. Se for necessário reproduzir a
classificação, versionar o algoritmo e registrar o índice e limiares
usados.

## 5.2 Submódulo Seasonal Outlook

Armazena previsões sazonais de precipitação e temperatura:

-   temporada (ex.: NDJ 2026/27);

-   área espacial coberta;

-   categoria/anomalia prevista;

-   probabilidades por tercil, quando fornecidas;

-   modelo/conjunto e instituição emissora;

-   data de emissão e validade;

-   mapa original ou grade de origem;

-   texto de interpretação oficial.

A visualização deve mostrar probabilidades e categorias, não converter
automaticamente a previsão em milímetros locais. A previsão sazonal é
probabilística e não descreve o tempo de um dia específico.

## 5.3 Submódulo Rainfall Anomaly

Para cada AOI e pixel nativo da fonte:

-   precipitação acumulada em 24h, 72h e 7 dias, quando suportado;

-   acumulado mensal;

-   anomalia frente à climatologia correspondente;

-   percentil ou período de retorno apenas se o método e a série forem
    adequados;

-   cobertura/qualidade e latência;

-   fonte e resolução espacial.

A climatologia deve usar período de referência declarado e consistente.
Comparações devem respeitar calendário, sazonalidade e mudanças de
versão do produto. Não combinar diretamente produtos com algoritmos ou
períodos diferentes sem harmonização documentada.

## 5.4 Submódulo Regional Climate Context

Gera um resumo por AOI, não uma previsão local:

-   estado ENOS atual e tendência;

-   previsão sazonal oficial para a região;

-   anomalia de precipitação observada;

-   alertas meteorológicos/hidrológicos oficiais disponíveis;

-   nota de incerteza e limitações.

A redação deve ser conservadora: "o outlook indica maior probabilidade
de chuva acima da faixa normal na região" em vez de "El Niño causará
chuva intensa nesta encosta".

# 6. Integração com o motor de risco

## 6.1 Princípio

O score local deve refletir evidências relevantes ao mecanismo de perigo
estudado. O contexto ENSO não é uma medição do estado do talude.
Portanto, na versão inicial, o ENOS fica fora da equação do score e
aparece como contexto independente.

## 6.2 Componentes para encostas

**Evidências físicas e observacionais:**

-   declividade e geometria do terreno;

-   precipitação observada em janelas curtas e longas;

-   anomalia de precipitação;

-   umidade do solo, se houver produto válido e apropriado;

-   deslocamento LOS e sua tendência, com geometria de aquisição e
    qualidade;

-   coerência interferométrica e máscaras;

-   cobertura vegetal/uso do solo;

-   inventário de cicatrizes e eventos conhecidos;

-   exposição populacional e infraestrutura.

Não interpretar deslocamento LOS como deslocamento vertical ou direção
real do talude sem decomposição geométrica e dados adicionais. Coerência
baixa pode indicar mudança, mas também decorre de decorrelação
temporal/volumétrica, vegetação, chuva e geometria; não deve ser
interpretada isoladamente como movimento.

## 6.3 Brumadinho: trilha específica

Não aplicar automaticamente o modelo de talude infinito à estabilidade
de uma barragem de rejeitos. A avaliação de segurança de barragem requer
dados próprios, tais como instrumentação geotécnica, piezometria,
deslocamentos, nível d\'água, drenagem, geometria, propriedades dos
rejeitos, histórico operacional e documentação técnica autorizada. O
TerraAlerta pode apoiar o monitoramento remoto de deformação superficial
e contexto hidrometeorológico, mas deve apresentar claramente que isso
não equivale a uma avaliação de segurança estrutural.

## 6.4 Futuro score contextual

Somente após validação retrospectiva, calibração por região e revisão
técnica, pode-se testar se variáveis de contexto climático melhoram a
previsão probabilística em horizontes sazonais. Esse modelo deve ser
separado do score operacional de condição atual, comparado com um
baseline sem ENOS e avaliado fora da amostra. Se não houver ganho
robusto, o ENOS permanece como contexto e não entra no score.

# 7. Dados, resolução e prioridade de fontes

  -----------------------------------------------------------------------
  **Domínio**       **Fonte           **Uso**           **Cuidado**
                    preferencial**                      
  ----------------- ----------------- ----------------- -----------------
  Estado ENOS       NOAA CPC / PSL    Fase, índice e    Identificar
                                      outlook           RONI/ONI e data

  Previsão sazonal  CPTEC/INPE, INMET Contexto regional Não é previsão
  Brasil            e Painel El Niño                    pontual

  Chuva satelital   GPM IMERG         Acumulados e      Grade aproximada
                                      anomalias         de 0,1° (\~10
                                                        km); produto e
                                                        latência variam

  Chuva             NASA POWER        Série             Resolução
  complementar                        meteorológica     meteorológica
                                      regional          nativa é
                                                        grosseira para
                                                        encosta

  Radar L           NISAR via ASF     Mudança de        Verificar
                    DAAC              superfície        cobertura,
                                                        produto,
                                                        qualidade e datas

  Radar C           Sentinel-1        Comparação e      Vegetação e
                                      série             decorrelação
                                      complementar      afetam
                                                        observabilidade

  Relevo            NASADEM/SRTM      Elevação e        Resolução e
                                      declividade       artefatos do DEM

  Exposição         WorldPop / OSM    População e       Dados estimados,
                                      edificações       incompletos e com
                                                        datas próprias
  -----------------------------------------------------------------------

**Regra de resolução:** nunca converter a grade de precipitação de \~10
km em "chuva de 30 m". A camada pode ser visualmente alinhada ao mapa de
30 m, mas deve manter a indicação da resolução original e não aparentar
precisão espacial inexistente.

**Regra de atualização:** índices ENOS e outlooks seguem a cadência da
instituição emissora; precipitação e alertas seguem a cadência do
produto; SAR segue a disponibilidade de aquisição e processamento. Não
prometer atualização em tempo real do NISAR.

# 8. Modelo de dados e contratos

## 8.1 Envelope comum de proveniência

> {\
> \"dataset_id\": \"gpm_imerg_precipitation\",\
> \"source_agency\": \"NASA\",\
> \"source_product\": \"GPM IMERG\",\
> \"source_url\": \"https://gpm.nasa.gov/data/imerg\",\
> \"retrieved_at\": \"2026-11-14T12:00:00Z\",\
> \"observation_start\": \"2026-11-13T00:00:00Z\",\
> \"observation_end\": \"2026-11-14T00:00:00Z\",\
> \"spatial_resolution\": \"0.1 degree\",\
> \"temporal_resolution\": \"30 minutes\",\
> \"native_unit\": \"mm\",\
> \"processing_version\": \"v1\",\
> \"quality_status\": \"validated\",\
> \"provenance\": \"measured\"\
> }

Os valores acima são apenas um exemplo de estrutura; o produto, datas,
versão e unidade devem ser preenchidos com os metadados reais do arquivo
ingerido.

## 8.2 Objeto ENSO

> {\
> \"phenomenon\": \"ENSO\",\
> \"phase\": \"el_nino\",\
> \"index_name\": \"RONI\",\
> \"index_value\": null,\
> \"unit\": \"degC\",\
> \"period\": \"YYYY-MM\",\
> \"published_at\": \"YYYY-MM-DD\",\
> \"official_status\": \"as_published_by_source\",\
> \"forecast_seasons\": \[\],\
> \"source_agency\": \"NOAA CPC\",\
> \"source_url\":
> \"https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml\",\
> \"validity\": \"source_defined\",\
> \"provenance\": \"measured\",\
> \"interpretation\": \"large_scale_climate_context\"\
> }

Não preencher index_value com valor estimado quando a fonte não o
fornece. A fase deve manter o texto/status publicado pela agência, além
de qualquer normalização interna.

## 8.3 Objeto de previsão sazonal

> {\
> \"aoi_id\": \"serra-do-mar\",\
> \"variable\": \"precipitation\",\
> \"season\": \"NDJ_2026_2027\",\
> \"category\": \"above_normal\",\
> \"probabilities\": {\
> \"below\": null,\
> \"near\": null,\
> \"above\": null\
> },\
> \"issued_at\": \"YYYY-MM-DD\",\
> \"valid_from\": \"YYYY-MM-DD\",\
> \"valid_to\": \"YYYY-MM-DD\",\
> \"agency\": \"INMET_CPTEC_INPE\",\
> \"source_url\": \"official_bulletin_url\",\
> \"spatial_support\": \"regional\",\
> \"provenance\": \"estimated\"\
> }

Previsões são classificadas como estimated, nunca como measured.

## 8.4 Objeto de precipitação

> {\
> \"aoi_id\": \"serra-do-mar\",\
> \"product\": \"GPM_IMERG\",\
> \"time_window\": \"72h\",\
> \"precipitation_mm\": null,\
> \"anomaly_mm\": null,\
> \"anomaly_percent\": null,\
> \"native_grid_resolution\": \"0.1 degree\",\
> \"observation_start\": \"YYYY-MM-DDTHH:mm:ssZ\",\
> \"observation_end\": \"YYYY-MM-DDTHH:mm:ssZ\",\
> \"quality_flag\": \"source_defined\",\
> \"provenance\": \"measured_or_estimated_by_product\"\
> }

Distinguir chuva medida por pluviômetro de estimativa por satélite. O
rótulo provenance deve refletir o método real do produto, e não presumir
que toda observação orbital seja uma medição direta de superfície.

# 9. API FastAPI proposta

  ---------------------------------------------------------------------------------------
  **Método**              **Endpoint**                            **Finalidade**
  ----------------------- --------------------------------------- -----------------------
  GET                     \`/api/v1/climate/enso/current\`        Estado ENOS atual e
                                                                  metadados

  GET                     \`/api/v1/climate/enso/history\`        Série histórica
                                                                  RONI/ONI

  GET                     \`/api/v1/climate/enso/outlook\`        Probabilidades e
                                                                  temporadas previstas

  GET                     \`/api/v1/climate/outlook/{aoi_id}\`    Previsão sazonal
                                                                  regional por AOI

  GET                     \`/api/v1/climate/rainfall/{aoi_id}\`   Chuva, acumulados e
                                                                  anomalias

  GET                     \`/api/v1/climate/context/{aoi_id}\`    Resumo climático
                                                                  regional com incerteza

  GET                     \`/api/v1/areas/{aoi_id}/evidence\`     Evidências SAR, chuva,
                                                                  relevo e contexto

  GET                     \`/api/v1/areas/{aoi_id}/risk\`         Componentes do risco
                                                                  local e qualidade

  GET                     \`/api/v1/sources/status\`              Atualização,
                                                                  disponibilidade e
                                                                  latência das fontes
  ---------------------------------------------------------------------------------------

Todos os endpoints devem retornar generated_at, source_updated_at,
stale, data_quality, provenance e limitations quando aplicável.
Respostas sem dados devem retornar estado explícito (unavailable,
not_yet_published, stale ou not_applicable) em vez de zero.

# 10. Interface --- Command Center

## 10.1 Navegação

13. Visão geral

14. Monitoramento geográfico

15. Comparador SAR L-band × C-band

16. Climate Intelligence

17. Histórico de deformação

18. Chuva e condições hidrometeorológicas

19. Exposição e infraestrutura

20. Central de alertas e boletins

21. Fontes, qualidade e metodologia

## 10.2 Tela Climate Intelligence

**Faixa superior --- estado do ENOS**

-   Fase oficial e índice (RONI, com ONI histórico opcional).

-   Valor, período de referência, última publicação e fonte.

-   Tendência e probabilidades por temporada, quando disponíveis.

**Painel regional**

-   Previsão sazonal de chuva e temperatura para a área selecionada.

-   Mapa de anomalia regional, com resolução e validade explícitas.

-   Explicação curta de que a previsão não é local nem determinística.

**Painel de chuva observada**

-   Acumulados 24h/72h/7d e mensal.

-   Anomalia frente à climatologia.

-   Série temporal e fonte (IMERG, POWER, pluviômetro/estação).

-   Indicador de cobertura, atraso e qualidade.

**Painel de implicações**

-   Texto de contexto para a AOI, sem transformar ENOS em alerta.

-   Exemplo: "O outlook sazonal aponta maior probabilidade de
    precipitação acima da normal na região. A condição atual do terreno
    deve ser avaliada separadamente por chuva observada, deformação SAR
    e inspeção local."

## 10.3 Mapa integrado

Camadas independentes e alternáveis:

-   deformação LOS NISAR;

-   retroespalhamento e coerência;

-   Sentinel-1;

-   precipitação acumulada;

-   anomalia de precipitação;

-   outlook sazonal;

-   declividade;

-   população/edificações;

-   polígonos de eventos históricos.

O mapa deve exibir legenda, período, resolução, fonte e proveniência
para a camada selecionada. Não sobrepor previsão sazonal e chuva
observada com a mesma simbologia.

# 11. Boletim de triagem para Defesa Civil

O boletim deve conter:

22. Área analisada e horário da geração.

23. Resumo das evidências observadas.

24. Tendência SAR e qualidade geométrica/interferométrica.

25. Chuva recente e fonte/resolução.

26. Contexto ENOS e previsão sazonal, com validade e incerteza.

27. Declividade, exposição e ativos potencialmente afetados.

28. Dados ausentes e limitações.

29. Ação sugerida: "priorizar verificação técnica", "acompanhar
    atualização" ou "sem evidência suficiente".

30. Links para fontes e responsável pela validação.

Não usar "evacuar", "barragem segura" ou "deslizamento previsto" como
conclusão automática do algoritmo. A decisão formal pertence às
autoridades competentes.

# 12. Qualidade, incerteza e governança científica

## 12.1 Proveniência

Manter os rótulos do projeto:

-   measured: observação direta ou produto que representa medição,
    explicitando o instrumento/método;

-   derived: variável calculada a partir de dados de origem;

-   estimated: estimativa, previsão, interpolação ou proxy.

Recomendação adicional: manter source_method para distinguir medição in
situ, retrieval satelital, modelo, previsão e cálculo derivado. Isso
evita tratar estimativas por satélite como se fossem pluviômetros.

## 12.2 Qualidade por variável

Cada variável precisa de:

-   flag de qualidade do produto;

-   cobertura espacial e temporal;

-   data de aquisição e data de publicação;

-   resolução nativa;

-   incerteza/limitação conhecida;

-   regra de mascaramento;

-   versão do algoritmo.

## 12.3 Ausência de dados

Ausência não é risco zero. Se NISAR não tiver cena válida, mostrar "sem
observação válida"; se o outlook não tiver sido publicado, mostrar "não
disponível"; se uma fonte estiver desatualizada, sinalizar stale. Não
preencher lacunas com valores fictícios.

## 12.4 Auditoria e reprodutibilidade

Guardar parâmetros, versões, commit do código, data de execução,
identificadores dos granules, filtros, transformações e fontes. Um
resultado precisa ser reproduzível a partir do conjunto de entradas e da
versão do pipeline.

# 13. Validação científica e plano experimental

## Experimento A --- Contexto ENOS e precipitação

-   Construir série histórica de índices ENOS e precipitação regional.

-   Comparar episódios El Niño, La Niña e neutros por estação do ano.

-   Calcular anomalias por região e testar diferenças com métodos
    estatísticos adequados.

-   Não inferir causalidade de uma correlação simples.

## Experimento B --- Chuva e eventos de encosta

-   Compilar inventário confiável de eventos, data e localização.

-   Avaliar acumulados antecedentes (24h, 72h, 7d e janelas
    justificadas).

-   Testar desempenho fora da amostra e evitar vazamento
    temporal/espacial.

-   Considerar viés de inventário: áreas com mais registros não são
    necessariamente as únicas com eventos.

## Experimento C --- Deformação SAR

-   Verificar geometria de aquisição, coerência, qualidade e incerteza.

-   Comparar banda L e C somente em áreas, datas e condições
    compatíveis.

-   Não comparar valores de produtos diferentes sem harmonização.

## Experimento D --- Valor adicional do ENOS

-   Baseline: modelo local sem variáveis ENOS.

-   Modelo experimental: mesmo modelo + contexto sazonal ENOS.

-   Validar por blocos temporais e geográficos.

-   Avaliar calibração, Brier score/log loss quando aplicável,
    precisão/recall, falsos alarmes e antecedência.

-   Só promover a variável ENOS para o modelo se houver ganho
    consistente, explicável e replicável.

# 14. Segurança, resiliência e operação

-   Manter arquitetura DEMO_CACHE_FIRST; cache deve incluir data e
    versão.

-   Separar credenciais Earthdata e chaves de serviços do código.

-   Timeouts, retries com backoff e circuit breaker por fonte.

-   Ingestão assíncrona; não fazer download/processamento pesado durante
    requisição de usuário.

-   APIs com versionamento e contratos tipados.

-   Registrar logs sem credenciais ou dados pessoais.

-   Modo offline deve mostrar o timestamp do cache e avisar que não
    representa o estado atual.

-   Não enviar notificações públicas automaticamente nesta etapa;
    qualquer integração de alerta deve ter validação humana, autorização
    e trilha de auditoria.

# 15. Stack recomendada

  -----------------------------------------------------------------------
  **Camada**                          **Tecnologia**
  ----------------------------------- -----------------------------------
  Frontend                            React, Vite, TypeScript, Tailwind

  Mapa                                MapLibre GL; COG/raster tiles e
                                      GeoJSON

  Gráficos                            Recharts

  API                                 Python, FastAPI, Pydantic

  Geoprocessamento                    GDAL, Rasterio, xarray, NumPy,
                                      GeoPandas

  SAR                                 Ferramentas e produtos oficiais
                                      compatíveis com ASF/NISAR;
                                      registrar versão

  ML/estatística                      scikit-learn; modelos explicáveis e
                                      validação temporal/espacial

  Armazenamento                       COG, GeoJSON/GeoParquet,
                                      PostgreSQL/PostGIS para escala

  Cache                               Arquivos locais versionados; Redis
                                      opcional para operação

  Testes                              pytest, Vitest, Playwright

  Observabilidade                     logs estruturados, métricas de
                                      atualização e status de fontes
  -----------------------------------------------------------------------

A stack é modular: não é necessário introduzir todos os serviços para a
demonstração. Priorizar conectores reproduzíveis, dados reais e
rastreabilidade antes de adicionar infraestrutura.

# 16. Estrutura de repositório sugerida

> terraalerta/\
> backend/\
> app/\
> api/v1/\
> climate.py\
> rainfall.py\
> evidence.py\
> risk.py\
> sources.py\
> schemas/\
> climate.py\
> rainfall.py\
> provenance.py\
> services/\
> enso_service.py\
> seasonal_outlook_service.py\
> rainfall_service.py\
> evidence_fusion.py\
> repositories/\
> main.py\
> data_cache/\
> climate/\
> rainfall/\
> sar/\
> terrain/\
> exposure/\
> data_pipeline/\
> connectors/\
> noaa_cpc/\
> inmet_inpe/\
> gpm_imerg/\
> nasa_power/\
> asf_nisar/\
> climate/\
> ingest_enso.py\
> ingest_seasonal_outlook.py\
> rainfall_anomalies.py\
> regional_context.py\
> sar/\
> fetch_sar_datasets.py\
> sar_processor.py\
> terrain/\
> validation/\
> frontend/\
> src/\
> pages/\
> ClimateIntelligence.tsx\
> components/\
> climate/\
> EnsoStatusCard.tsx\
> SeasonalOutlookPanel.tsx\
> RainfallAnomalyChart.tsx\
> RegionalContextPanel.tsx\
> map/\
> evidence/\
> docs/\
> architecture/\
> climate-intelligence.md\
> data-dictionary.md\
> scientific-methodology.md\
> validation-plan.md\
> tests/\
> unit/\
> integration/\
> scientific/

# 17. Plano de implementação por fases

**Fase 1 --- Integração de contexto (MVP)**

-   Criar conectores para NOAA CPC/PSL e boletins oficiais brasileiros.

-   Mostrar fase/índice, data de publicação e link da fonte.

-   Implementar página Climate Intelligence com contexto regional.

-   Manter ENOS fora do score local.

**Fase 2 --- Chuva e climatologia**

-   Ingerir GPM IMERG e manter NASA POWER como complemento regional.

-   Calcular acumulados e anomalias com período-base declarado.

-   Adicionar estações oficiais quando houver acesso e qualidade
    verificados.

**Fase 3 --- Fusão de evidências**

-   Integrar contexto climático, chuva, SAR e território na ficha de
    cada AOI.

-   Exibir evidências, qualidade e incerteza separadamente.

-   Gerar boletim de triagem com revisão humana.

**Fase 4 --- Validação retrospectiva**

-   Construir inventário de eventos e séries históricas.

-   Comparar baseline e modelo com ENOS.

-   Só então avaliar se variáveis climáticas agregam valor preditivo.

**Fase 5 --- Operação assistida**

-   Atualização agendada, monitoramento de fontes e auditoria.

-   Piloto com Defesa Civil e especialistas geotécnicos/hidrológicos.

-   Avaliação independente antes de qualquer uso operacional.

# 18. Critérios de aceite

-   \[ \] Estado ENOS exibido com índice, data, agência e link da fonte.

-   \[ \] RONI identificado como índice operacional NOAA vigente; ONI
    histórico claramente rotulado.

-   \[ \] Previsões sazonais exibidas com período, probabilidade, escala
    regional e validade.

-   \[ \] Chuva observada e previsão sazonal visualmente diferenciadas.

-   \[ \] Resolução nativa preservada e visível em cada camada.

-   \[ \] Nenhum aumento automático do score causado apenas pelo El
    Niño.

-   \[ \] Dados ausentes e desatualizados não são convertidos em zero.

-   \[ \] Cada variável tem proveniência, fonte, unidade e timestamp.

-   \[ \] O caso Brumadinho não reutiliza sem validação o modelo de
    encosta como modelo de segurança de barragem.

-   \[ \] Boletim declara limitações e exige validação humana.

-   \[ \] Cache offline mostra data de atualização e status de
    defasagem.

-   \[ \] Testes cobrem falha de fonte, mudança de esquema, ausência de
    dados e consistência temporal.

# 19. Linguagem recomendada para a demonstração NASA

**Mensagem principal:** "TerraAlerta conecta a mudança observada na
superfície pelo radar NISAR às condições hidrometeorológicas e ao
contexto climático de grande escala. O El Niño não é tratado como um
alerta local: ele contextualiza padrões sazonais, enquanto chuva
observada e evidências geofísicas sustentam a triagem territorial."

**Diferencial científico:** "A plataforma mantém separadas observação,
derivação e estimativa. Cada camada preserva sua resolução, período,
fonte e incerteza. O sistema não transforma uma previsão sazonal em uma
previsão de deslizamento."

**Impacto:** "A ferramenta ajuda equipes de proteção e defesa civil a
priorizar onde investigar, cruzando evidências orbitais e ambientais em
uma interface rastreável."

# 20. Fontes oficiais e referências técnicas

31. NOAA Climate Prediction Center --- ENSO Diagnostic Discussion:
    https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml

32. NOAA Physical Sciences Laboratory --- ENSO Dashboard / índices:
    https://www.psl.noaa.gov/enso/dashboard.html

33. NOAA CPC --- RONI probabilities:
    https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/probabilities.php

34. NASA GPM --- IMERG: https://gpm.nasa.gov/data/imerg

35. NASA GPM --- FAQ e resolução IMERG:
    https://gpm.nasa.gov/resources/faq

36. NASA POWER --- Data FAQs:
    https://power.larc.nasa.gov/docs/faqs/data/

37. INMET --- Temporais no Sul e Sudeste e influência do El Niño
    (11/11/2026):
    https://portal.inmet.gov.br/noticias/temporais-no-sul-e-sudeste-entenda-a-influ%C3%AAncia-do-el-ni%C3%B1o-nos-eventos-meteorol%C3%B3gicos-extremos

38. INMET --- Painel El Niño / boletim de outubro de 2026:
    https://portal.inmet.gov.br/noticias/painel-el-nino-boletim-de-outubro-e-divulgado

39. MIDR --- Painel El Niño, boletim nº 5 (11/11/2026):
    https://www.gov.br/mdr/pt-br/noticias/painel-el-nino-novo-boletim-traz-previsoes-e-possiveis-impactos

40. INPE --- Nota técnica conjunta sobre El Niño 2026:
    https://www.gov.br/inpe/pt-br/assuntos/ultimas-noticias/nota-tecnica-conjunta-aponta-alta-probabilidade-de-el-nino-no-segundo-semestre-de-2026

41. ASF DAAC --- busca e dados SAR: https://search.asf.alaska.edu/

42. NASA Earthdata --- documentação e acesso a dados:
    https://www.earthdata.nasa.gov/

**Nota de atualização:** boletins climáticos e probabilidades mudam. A
aplicação deve consumir a publicação mais recente disponível, armazenar
o histórico e nunca fixar os valores deste documento como estado
permanente. A data de referência desta especificação é 14/11/2026.

# Decisão arquitetural final

O El Niño amplia o valor do TerraAlerta quando é tratado como
**inteligência climática contextual**, não como um atalho para prever
deslizamentos. A contribuição mais sólida para a NASA é demonstrar como
dados de radar, precipitação, clima e território podem ser integrados
sem apagar diferenças de escala, incerteza ou proveniência. A plataforma
deve transformar dados complexos em evidências compreensíveis e
auditáveis para apoiar a priorização de ações humanas.
