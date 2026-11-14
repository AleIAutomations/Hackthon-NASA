# TerraAlerta NISAR — Concorrentes e El Niño

> Fonte: TerraAlerta-NISAR_Concorrentes-e-El-Nino.docx (14/11/2026). Ideias e decisões de apresentação, com atribuição; nenhum código copiado.

**TerraAlerta NISAR**

O melhor dos projetos concorrentes + El Niño na nossa ideia

*Documento à parte do plano principal - NASA Space Apps Challenge 2026,
desafio \"Dancing with the SARs\"\
Preparado em 14/11/2026 (sábado). Submissão até domingo 15/11, 23h59.*

Este documento tem duas partes. A primeira olha projeto por projeto dos
concorrentes que levantamos no mesmo desafio e extrai o que cada um fez
de melhor, sempre com o link e o crédito. A segunda explica o El Niño, o
momento atual do fenômeno e como encaixá-lo no TerraAlerta. No fim de
cada parte, uma lista curta do que vale colocar no nosso projeto até
domingo. Nada aqui é cópia de código: são ideias, abordagens e decisões
de apresentação, com atribuição.

# Parte 1 - O melhor de cada projeto concorrente

Os seis projetos abaixo estão no mesmo desafio (\"Dancing with the
SARs\"). Li os repositórios públicos (README e documentação) em
14/11/2026. Um deles (NISAR, de Narayana1729) não está acessível
publicamente, então só dá para usar o que o Renan descreveu na conversa.

## 1. Nova Matrics VI

*github.com/Fardin-Prodhan/Nova-Matrics\-\--VI*

Painel web com mapa Leaflet, processamento de SAR em Python e detecção
de mudança com IA. Cobre enchentes, deslizamentos, geleiras e vegetação.
É o mais próximo da nossa ideia: os deslizamentos deles cruzam direto
com o nosso projeto.

**O melhor deles:**

-   **Slider \"antes/depois\" no mapa.** A comparação visual entre duas
    datas de imagem SAR é o jeito mais rápido de um juiz entender o que
    mudou no terreno. É simples de fazer com Leaflet e tem impacto
    imediato.

-   **Cobertura multi-desastre.** Enchente, deslizamento, geleira e
    vegetação no mesmo painel. Mostra que o radar serve para vários
    problemas, não só um.

-   **Organização do trabalho.** Eles separaram o projeto em pastas de
    Drive bem definidas (pesquisa, dados, IA, backend, frontend,
    apresentação, vídeo, submissão) e deram um papel claro para cada
    pessoa do time. Para um hackathon de 2 dias, isso evita caos.

O que aproveitar no TerraAlerta: o slider antes/depois na área de risco
de deslizamento e a divisão de papéis por pasta/pessoa.

## 2. Dancing with the SARs: The Hidden Steps

*github.com/dmanpark/dancing-with-the-sars*

Mostra a água de enchente escondida sob a vegetação, que o radar de
banda C (Sentinel-1) não enxerga e o de banda L (NISAR) enxerga. Usa a
enchente recorde do rio Gandak (Bihar) de 27/09/2026, com o NISAR
passando em 28/09 e o Sentinel-1 onze horas depois. É o projeto que mais
disputa o argumento \"banda L vê embaixo da mata\".

**O melhor deles (é muita coisa boa):**

-   **Uma história, um slider.** O app inteiro gira em torno de um único
    momento: você arrasta o slider e a água aparece debaixo das árvores
    onde o outro radar dizia \"seco\". Tudo o mais existe para esse
    momento fazer sentido.

-   **Validação contra satélite óptico.** Eles não pedem para o juiz
    confiar no radar: checam os dois radares contra imagens ópticas de
    datas vizinhas. Isso transforma \"acredita em mim\" em prova.

-   **Mostram o que não confiam.** Em vez de esconder, o app marca os
    pixels duvidosos (ex.: as falhas entre faixas de imageamento do
    NISAR). Paradoxalmente, isso aumenta a confiança no resto.

-   **Vídeo em dois números.** O vídeo de 30 segundos se apoia em duas
    métricas: quantos km² de água escondida o NISAR achou e se ele
    acompanha o Sentinel-1 em água aberta. Métrica simples, fácil de
    memorizar.

-   **App antes, ciência atrás.** Decisão consciente no plano deles:
    juiz local em geral não é especialista em radar, então o que passa
    de fase é algo que qualquer pessoa entende em segundos. A parte
    técnica fica como suporte.

-   **Sonificação.** Dá para tocar num campo e \"ouvir\" o sinal do
    radar mudando com o tempo. É um detalhe barato que torna a demo
    memorável.

O que aproveitar no TerraAlerta: a estrutura de \"um momento central\"
na demo (no nosso caso: o mapa de risco de deslizamento acendendo depois
da chuva), a validação cruzada com dado óptico, a etiqueta de \"área sem
confiança\" e o vídeo apoiado em dois números.

## 3. SARabande (Open Source SAR)

*github.com/Sidvortex/OpenSource-SAR*

Globo 3D com 19 pontos de deformação monitorados pelo NISAR. Se
apresenta como 100% aberto e gratuito: código MIT, dados gratuitos,
nenhuma API paga, nenhuma conta obrigatória no app.

**O melhor deles:**

-   **Tudo grátis e aberto, de ponta a ponta.** Nenhuma API paga,
    nenhuma chave escondida. Em hackathon isso também é estratégia:
    qualquer juiz consegue abrir e rodar.

-   **Dados de demonstração rotulados como sintéticos.** Cada camada de
    demonstração é claramente marcada como sintética, e a documentação
    explica como trocar por dados reais. Honestidade que os juízes
    percebem.

-   **Classificador de \"dança\" com testes.** O classificador de tipos
    de mudança existe em Python e em TypeScript, com o mesmo conjunto de
    testes nos dois. Rigor raro em hackathon.

-   **Explicação em três níveis de leitura.** O mesmo fenômeno explicado
    para leigo, intermediário e técnico (e em três idiomas). Resolve o
    problema de \"juiz não é especialista\" sem esconder a ciência.

-   **Camadas de contexto poderosas.** Água nova vs. água habitual
    (comparando com o histórico 1984-2020 do JRC Global Surface Water),
    tipo de uso do solo sob a área alterada (ESA WorldCover) e população
    exposta (WorldPop/GHSL).

-   **Botão \"óptico\".** Troca a camada de radar pela imagem de verdade
    da NASA GIBS / Sentinel-2 na mesma data, para mostrar as nuvens que
    o radar atravessa.

-   **Links compartilháveis e exportação.** Qualquer tela vira link;
    qualquer camada vira imagem ou CSV. E ainda têm alertas por RSS/ntfy
    e catálogo STAC.

O que aproveitar no TerraAlerta: rótulo claro de \"dado simulado\" onde
usarmos simulação, população exposta como número de destaque, botão
radar/óptico, exportação CSV/GeoTIFF e link compartilhável do mapa.

## 4. MOTUS

*github.com/Tech-Doomsday/dancing-with-sars-eq*

Interferograma real (ALOS PALSAR processado pelo sistema do NISAR) e o
terremoto M7.7 do Panamá de 2026, com cada dado rotulado como real ou
modelado. É o projeto mais forte em honestidade científica: cada
afirmação tem fonte, data de verificação e limite declarado.

**O melhor deles:**

-   **Veredito em uma frase, na primeira tela.** Ex.: \"Nenhum movimento
    detectável. O ruído da ionosfera (72 mm) é maior que o sinal (48
    mm).\" Qualquer pessoa entende; o especialista consegue conferir.

-   **\"Não detectado\" como resultado válido.** Quando o ruído supera o
    sinal, eles dizem isso em vez de forçar uma detecção. Isso é
    cientificamente correto e impressiona juiz técnico.

-   **Rótulos de status com evidência.** Hipóteses de explicação vêm
    marcadas como sustentada / consistente / plausível / evidência
    insuficiente / não sustentada. E deixam explícito que o modelo de
    Okada é um teste de consistência, nunca \"probabilidade de causa\".

-   **Registro de referências.** Um cadastro de 15 fontes liga cada
    afirmação importante ao documento oficial (ATBD do NISAR, guia ASF
    etc.) com a data em que foi verificado.

-   **Real vs. modelado em tudo.** Cada dado diz se é medido ou
    simulado, inclusive com \"emblemas\" nos gráficos.

-   **Tour guiado com roteiro.** Um passeio de \~2 minutos pelos três
    casos principais, com roteiro pronto para gravar o vídeo da demo.

-   **Degradação honesta.** Se um serviço da NASA falha, o app mostra o
    que caiu e continua funcionando com o que tem, em vez de quebrar ou
    fingir.

O que aproveitar no TerraAlerta: o veredito em uma frase no topo do
painel, o rótulo real/simulado em cada camada, a tabela de fontes com
data de verificação (já temos uma no plano principal - vale manter e
destacar) e o roteiro de tour para o vídeo.

## 5. Team Zenith

*github.com/nabil24024004/Team-Zenith-Dancing-With-SARs*

Site em React com foco visual: globo 3D em CesiumJS com terreno, design
escuro de alto contraste, linguagem de \"observatório\". É o projeto
mais bonito do grupo.

**O melhor deles:**

-   **Primeira dobra impecável.** A primeira tela já explica em
    linguagem simples o que o radar faz, com um globo 3D de fundo.
    Visual forte sem sacrificar a mensagem.

-   **Tabela de \"perspectivas\".** Resumiram o que o NISAR enxerga em
    seis linhas (geleira, terremoto, incêndio, área alagada,
    agricultura, visão de radar), cada uma com banda, número-chave e
    região de exemplo. É um formato ótimo para a página do projeto.

-   **Paleta e tipografia consistentes.** Sistema de design definido
    desde o início (cores, fontes, tom). Em 2 dias, quem decide isso
    cedo ganha tempo.

O que aproveitar no TerraAlerta: uma tabela-resumo das nossas camadas
(risco de deslizamento, umidade do solo, chuva, população exposta) com
um número-chave cada, e capricho na primeira tela.

## 6. NISAR (Narayana1729)

*github.com/Narayana1729/NISAR*

O repositório não está público (ou mudou de nome), então não deu para
ler. Pela descrição que recebemos: plataforma multidomínio com validação
cruzada entre sensores.

O que aproveitar no TerraAlerta: a ideia de validação cruzada entre
sensores já aparece em outros projetos (Hidden Steps cruza NISAR com
Sentinel-1 e com óptico; SARabande cruza radar com GIBS/Sentinel-2). Se
formos usar, creditamos o conceito de forma geral, sem citar código que
não vimos.

## Síntese - o que colocar no TerraAlerta até domingo

Em ordem de custo-benefício para as horas que restam:

-   **1. Veredito em uma frase no topo do painel (do MOTUS).** Ex.:
    \"Risco alto de deslizamento em 3 setores. Chuva acumulada de 72h
    acima do limiar e solo saturado.\" Custa pouco e muda a demo.

-   **2. Slider antes/depois no mapa (do Nova Matrics e do Hidden
    Steps).** Uma data seca vs. uma data pós-chuva na área de interesse.

-   **3. Rótulos de confiança (do Hidden Steps, SARabande e MOTUS).**
    Marcar o que é dado real, o que é simulado e onde o modelo não
    confia. Três projetos bons convergiram nisso - é sinal de que os
    juízes valorizam.

-   **4. Dois números para o vídeo (do Hidden Steps).** Definir agora
    quais são os nossos dois números (sugestão: km² em risco alto e
    pessoas expostas nessas áreas via WorldPop).

-   **5. Botão radar/óptico (do SARabande).** Camada NASA GIBS ou
    Sentinel-2 na mesma data para contextualizar.

-   **6. Exportação CSV/GeoTIFF e link compartilhável (do SARabande e do
    MOTUS).** Barato, mostra maturidade técnica.

-   **7. Roteiro de tour para o vídeo (do MOTUS).** Escrever o roteiro
    de 2 minutos antes de gravar, com começo, momento central e os dois
    números.

-   **8. Primeira tela caprichada (do Team Zenith).** Uma frase que
    qualquer pessoa entende + visual forte.

Atribuição: na página do projeto e no README, manter uma seção
\"Inspirações e referências\" citando esses projetos pelo nome e link.
Isso é bem visto no Space Apps e evita qualquer acusação de cópia.

# Parte 2 - El Niño e como colocá-lo no TerraAlerta

## O que é o El Niño

El Niño é a fase quente do ENOS (El Niño-Oscilação Sul), um fenômeno
oceano-atmosfera do Pacífico Equatorial. A temperatura da superfície do
mar fica acima da média na faixa equatorial do Pacífico, e isso muda a
circulação dos ventos, o transporte de umidade e os padrões de chuva no
mundo inteiro, inclusive no Brasil. A fase oposta (fria) é a La Niña. O
acompanhamento oficial é do NOAA CPC (Climate Prediction Center), que
mede o fenômeno pelos índices Niño (anomalias de temperatura em regiões
do Pacífico, como o Niño-3.4).

## O momento atual (verificado em 14/11/2026)

Estamos em El Niño forte e fortalecendo. Segundo o boletim do NOAA CPC
de 12/11/2026:

-   Status: Alerta de El Niño (evento em curso).

-   Índice Niño-3.4 em +2,5°C; Niño-3 em +3,6°C; Niño-1+2 em +4,4°C.

-   Previsão de El Niño forte a muito forte até janeiro-março de 2027
    (probabilidade acima de 79%).

-   Chance de cerca de 60% de evento histórico (o mais forte desde 1950
    pelo critério do RONI) nos trimestres out-dez e nov-jan.

-   Oceano subsuperficial ainda muito quente no Pacífico leste
    (anomalias acima de +10°C em profundidade), ou seja, há
    \"combustível\" para o evento seguir forte no verão 2026/2027.

Tradução prática: o verão de 2026/2027 no Brasil acontece sob um dos El
Niños mais fortes já registrados. Isso é exatamente a janela em que o
TerraAlerta seria usado de verdade.

## O que o El Niño costuma fazer no Brasil

Segundo a nota técnica do Observatório de Clima e Saúde (Fiocruz) com
base em INPE, INMET e OMM:

-   **Região Sul:** mais chuva que a média, com mais tempestades,
    enxurradas, inundações e deslizamentos. O INMET aponta o Rio Grande
    do Sul como uma das regiões mais afetadas pelo ENOS no país.

-   **Norte e norte do Nordeste:** menos chuva, seca, calor, baixa
    umidade, queda dos rios e mais queimadas e fumaça.

-   **Não é automático:** os impactos dependem de outros sistemas
    (Atlântico tropical, ZCIT, ZCAS, frentes frias, bloqueios). El Niño
    aumenta a probabilidade, não garante o evento. As enchentes do RS em
    2024, por exemplo, foram impulsionadas pela fase final de um El Niño
    forte combinada com o Atlântico Sul anormalmente quente.

O desastre do RS em 2024 é o caso de referência: quase 850 mil pessoas
afetadas em 341 municípios só no início da emergência, segundo a OMM. É
o tipo de cenário que o TerraAlerta quer ajudar a antecipar.

## Como o El Niño entra no TerraAlerta

Quatro encaixes, do mais barato ao mais trabalhoso:

-   **1. Contexto no pitch (custo zero, faça isso).** Abrir a
    apresentação com o fato: estamos em um El Niño forte a muito forte
    (NOAA, 12/11/2026), com verão 2026/2027 sob risco elevado de chuvas
    extremas no Sul e Sudeste. O problema que o TerraAlerta ataca -
    deslizamentos e enchentes - está mais provável exatamente agora.
    Isso transforma o projeto de \"exercício\" em resposta a um risco
    real e datado.

-   **2. Umidade do solo como alimentador do risco (já faz parte do
    nosso modelo).** O nosso modelo de risco já usa chuva acumulada
    (NASA POWER) e talude. O El Niño reforça a importância da umidade
    antecedente do solo: solo já saturado escorrega com menos chuva. O
    produto NISAR SME2 (umidade do solo em nível 3, citado no desafio) é
    a fonte ideal quando estiver disponível; até lá, chuva acumulada de
    72h/7 dias serve de proxy. Citar o SME2 no plano mostra que
    conhecemos o catálogo do NISAR.

-   **3. Índice ENSO como camada informativa.** Um cartão no painel com
    o estado atual do ENOS (fonte: NOAA CPC, atualizado mensalmente) e o
    que isso significa para a região monitorada. Não entra na conta do
    risco - é contexto para o usuário e para o juiz.

-   **4. Cenário de demo ancorado em evento real.** Se der tempo, montar
    a demo sobre um evento ligado a El Niño (as enchentes do RS de 2024,
    na fase final do El Niño 2023/24, são o exemplo mais documentado).
    Mesmo sem dados NISAR desse período (o satélite é recente), dá para
    usar chuva (NASA POWER), óptico e o rótulo de simulado onde for o
    caso - seguindo a regra de honestidade dos projetos acima.

## Cuidados para não errar a mão

-   Não afirmar que \"o El Niño causa deslizamentos\". Dizer que ele
    aumenta a probabilidade de chuvas extremas em certas regiões, e que
    chuva extrema em solo saturado é o gatilho típico de deslizamentos.
    A própria Fiocruz/INMET alerta que desastres são multifatoriais.

-   Sempre datar as afirmações (\"boletim NOAA de 12/11/2026\").
    Condições de ENSO mudam mês a mês.

-   Se usarmos dados simulados de chuva ou solo na demo, rotular como
    simulado (regra que o SARabande e o MOTUS seguem e que pega bem com
    os juízes).

## Fontes verificadas em 14/11/2026

-   NOAA CPC - ENSO Diagnostic Discussion, 12/11/2026:
    cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml

-   NOAA CPC - Probabilidades oficiais de ENSO (RONI):
    cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/probabilities/

-   Observatório de Clima e Saúde (Fiocruz) - Nota Técnica sobre o El
    Niño e impactos no Brasil (com INPE, INMET, OMM):
    climaesaude.icict.fiocruz.br

-   NISAR (NASA/JPL) - missão e produtos (GCOV, GUNW, SME2):
    nisar.jpl.nasa.gov

-   Repositórios dos projetos citados na Parte 1 (links em cada seção).
