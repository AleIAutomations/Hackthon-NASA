# TerraAlerta NISAR - 3-Minute Pitch Script & Slide Deck / Roteiro do Pitch e Slides

> **Languages / Idiomas**: [English](#english) | [Português](#português)

---

<a name="english"></a>
## English

### Timing Breakdown (3 Minutes)
- **[0:00 - 0:20] The Problem**:
  In February 2023, extreme rainfall triggered catastrophic landslides along the northern coast of São Paulo. The slopes had been deforming for weeks—millimeters at a time—invisible to optical sensors and hidden beneath dense Atlantic forest.
- **[0:20 - 0:50] The Solution (NISAR L-band)**:
  TerraAlerta taps into NISAR, the NASA/ISRO SAR mission. Unlike Sentinel-1 C-band (~5.6 cm) which bounces off leaves and turns to noise, L-band (~24 cm) penetrates through dense canopy directly to the bedrock. Every point on our map is a 30-meter cell scored 0 to 100.
- **[0:50 - 1:30] C vs L Band Comparison**:
  Side-by-side comparison: on forested slopes, C-band coherence collapses (noise), while NISAR L-band maintains ground coherence.
- **[1:30 - 2:10] Physics, Rain & Civil Defense Alert**:
  We fuse radar interferometry with real NASA POWER rainfall and NASADEM slope. Simulating an extreme 200 mm storm flips vulnerable slopes to red. In under 5 seconds, the Civil Defense bulletin is generated: exposed population, critical slopes, and actionable evacuation guidelines.
- **[2:10 - 2:40] Generalization (Brumadinho)**:
  With zero code changes, we monitor Brumadinho: tailings dams and mining subsidence.
- **[2:40 - 3:00] Conclusion & Honesty**:
  All cells transparently declare if data is measured, derived, or estimated. Next step: municipal civil defense pilot. Thank you.

### 7 Slides Outline
1. **Title**: TerraAlerta NISAR - L-band radar watching slopes beneath the forest.
2. **The Problem**: Pre-failure ground motion is invisible under dense canopies.
3. **The Solution**: Multi-source fusion (NISAR + NASA POWER + NASADEM) to risk score.
4. **NASA Data Used**: NISAR (GCOV/GUNW), Sentinel-1, NASADEM, NASA POWER.
5. **Interactive Demo**: 3D Risk Map, C vs L Swipe, Rainfall vs Displacement timeseries.
6. **Civil Defense & Impact**: Immediate actionable dispatch, exposed population estimates.
7. **Team, Disclosure & References**: Full scientific citations, open source Apache 2.0.

---

<a name="português"></a>
## Português

### Divisão do Tempo de Apresentação (3 Minutos)
- **[0:00 - 0:20] O Problema**:
  Em fevereiro de 2023, chuvas extremas provocaram deslizamentos devastadores no litoral norte de São Paulo. O solo daqueles morros estava se movendo havia semanas — milímetros por semana — mas de forma invisível a olho nu e completamente oculto pela densa Mata Atlântica.
- **[0:20 - 0:50] A Solução (Banda L do NISAR)**:
  O TerraAlerta utiliza o satélite NISAR (NASA/ISRO). Enquanto a banda C do Sentinel-1 (~5,6 cm) reflete na folhagem e se perde em ruído, a banda L (~24 cm) atravessa o dossel da mata e atinge o solo e a rocha matriz. Cada ponto colorido no mapa é uma célula de 30 metros com score de risco calculado de 0 a 100.
- **[0:50 - 1:30] Comparativo Banda C vs Banda L**:
  Demonstração lado a lado: na mata densa, a coerência da banda C despenca para perto de zero (ruído total), enquanto a banda L do NISAR preserva a coerência do solo.
- **[1:30 - 2:10] Física do Solo, Chuva e Boletim da Defesa Civil**:
  Cruzamos a interferometria com a chuva diária real da NASA POWER e com a declividade do NASADEM. Simulando uma tempestade extrema de 200 mm, os taludes vulneráveis mudam para alerta vermelho. Em menos de 5 segundos, o painel da Defesa Civil gera o boletim operacional: número de taludes críticos, população exposta e diretrizes de evacuação preventiva.
- **[2:10 - 2:40] Generalização (Brumadinho)**:
  Sem alterar uma linha de código, monitoramos o Quadrilátero Ferrífero: barragens de rejeitos e subsidência de mineração.
- **[2:40 - 3:00] Conclusão e Transparência**:
  Toda célula indica se a grandeza foi medida ou estimada. Próximo passo: projeto-piloto com uma Defesa Civil municipal. Muito obrigado.

### Conteúdo dos 7 Slides
1. **Slide 1 - Capa**: TerraAlerta NISAR - Radar de banda L vigiando encostas sob a copa das árvores.
2. **Slide 2 - O Problema**: A deformação do terreno precede a ruptura, mas é invisível sob florestas densas.
3. **Slide 3 - A Solução**: Fusão multi-sensores (NISAR + Chuva NASA POWER + Relevo NASADEM) em score de risco.
4. **Slide 4 - Dados da NASA**: Produtos NISAR (GCOV/GUNW), Sentinel-1, NASADEM e NASA POWER.
5. **Slide 5 - Demonstração Interativa**: Globo 3D, divisor deslizante C vs L e gráfico de deformação x chuva.
6. **Slide 6 - Impacto e Defesa Civil**: Geração instantânea de boletins com cálculo de população em risco.
7. **Slide 7 - Equipe e Referências**: Divulgação de uso de IA, referências científicas e licença aberta Apache 2.0.
