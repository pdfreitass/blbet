# Sistema Visual — blbet

> Direção estética, tokens e regras de uso da interface. **Dono: `frontend`** ([`docs/agent-protocol.md`](agent-protocol.md), seção 2). Consultar **antes** de criar ou modificar qualquer interface (`CLAUDE.md`).

**Status:** proposta, à espera de aprovação do Pedro · **Última atualização:** 2026-10-26 · **Por:** `frontend` (T-005)

**Nada neste documento está implementado.** `apps/web/` ainda não existe. A implementação é a T-016 e só começa depois da aprovação desta direção.

---

## 0. O que este documento decide e o que deixa em aberto

| Decide | Deixa em aberto |
|---|---|
| Direção estética e seus princípios (§1) | **PD-009 resolvida** em §6; a **DIV-001** foi decidida pelo Pedro (opção A, [DT-014](decisoes-tecnicas.md)) e §7 passou a registar a escolha |
| Tokens de cor, tipografia, espaçamento, raio, elevação, movimento e breakpoints (§3) | **PD-002** — público-alvo: o risco assumido está em §10 |
| Tema (§2) | **PD-003 a PD-008** — escopo da busca, mercados, categorias, campos do perfil, formato das odds, idioma e formatos |
| Tratamento visual do dado demonstrativo, resolvendo **PD-009** (§6) | Conteúdo de marca: nome visual, logotipo e símbolo — a visão explicitamente não os define |
| Recomendação para **DP-006** (abordagem de estilos) (§8) | ~~**DP-005**~~ — resolvida pela [DT-016](decisoes-tecnicas.md) |
| Inventário dos componentes-base e seus estados (§9) | Cobertura mínima de testes (DP-002) |

Nenhuma pendência desta tabela foi resolvida por omissão.

---

## 1. Direção estética

### 1.1 A proposta, numa frase

**Painel de leitura, não vitrine.** A interface comporta-se como um painel de informação esportiva — estrutura tabular, números alinhados, hierarquia por peso e por espaço — e trata a cor como sinal, não como decoração.

### 1.2 Por que esta direção, e não o padrão do segmento

O padrão visual do segmento é reconhecível: fundo escuro saturado, verde ou laranja em grandes áreas, cartões muito arredondados com sombra forte e gradiente, tudo em negrito, animação de brilho a chamar atenção para cada bloco. Esse vocabulário tem dois problemas para este produto:

1. **Compete com a informação.** Quando cada bloco grita, nada tem prioridade. A visão coloca a clareza da informação como diferencial pretendido (H1) e exige densidade legível em telas pequenas (H4). Decoração de alto contraste em área grande trabalha contra as duas coisas.
2. **É indistinguível.** A visão pede interface profissional e consistente, "sem a sensação de partes montadas separadamente", e o pedido desta tarefa é evitar o visual genérico de template. Adotar o vocabulário do segmento entrega exatamente o genérico.

A direção escolhida inverte isso: a identidade vem da **estrutura e do tratamento dos números**, que são o conteúdo real do produto, e não de uma camada decorativa aplicada por cima.

### 1.3 Os cinco princípios

**P1 — Os números são a voz da marca.** Toda quantidade — odd, hora, data, contagem, placar — é composta em face monoespaçada com algarismos de largura fixa (`tabular-nums`), alinhada à direita em contexto de coluna. Consequência prática: os números alinham verticalmente entre linhas e **não deslocam o layout quando mudam**, que é exigência explícita de RF-008 ("sem deslocamento abrupto do layout ao concluir"). É o elemento de identidade mais visível do produto e aparece em todas as áreas, o que atende H3 (consistência entre esportes e cassino).

**P2 — Estrutura por régua e linha, não por caixa flutuante.** A separação entre itens é feita por divisor de 1px e pelo espaçamento da escala, não por cartões empilhados com sombra. Permite listas densas sem ruído e sem que cada item pareça um botão — o que também serve P5, porque num produto sem apostas nada deve parecer clicável para apostar. Elevação existe, mas só onde há sobreposição real (§3.5).

**P3 — Cor é semântica, nunca enfeite.** A cor de marca marca **só** o que é interativo, ativo ou focado. As cores de estado aparecem **só** em feedback. Superfícies e blocos são neutros. Nenhum bloco de conteúdo recebe fundo colorido para "destacar": destaque faz-se com peso tipográfico, espaço e posição.

**P4 — O mesmo cuidado nas duas pontas.** O layout é desenhado primeiro na largura de telemóvel e depois ganha colunas; nunca é o desktop encolhido. A densidade de informação é a mesma nas duas pontas: muda o arranjo, não o conteúdo. Regra dura: nenhuma informação do escopo inicial desaparece em mobile (RNF-001, CA-RNF-001).

**P5 — Sinal honesto.** A natureza fictícia do dado é parte do desenho, não um aviso colado por cima (§6). E nenhum elemento visual sugere ação que não existe: nada que pareça botão de aposta, cupão, bilhete ou saldo operável (RN-001, RN-003, RN-004, CA-003.3).

### 1.4 O que esta direção proíbe

- Gradiente em área de conteúdo.
- Sombra como forma de separar itens de uma mesma lista.
- Cor de marca como fundo de bloco grande.
- Negrito como recurso padrão: peso forte é exceção com significado.
- Animação que se repete sozinha, sem o utilizador ter agido (§3.6).
- Mais de uma família tipográfica para texto corrido.
- Ícone sozinho como único portador de significado, sem nome acessível (RNF-002).
- Qualquer afordância que se pareça com seleção de odd, mesmo desativada (CA-003.3; a visão proíbe até a presença desabilitada na interface).

---

## 2. Tema

**Decisão proposta: tema escuro como tema canónico e único nesta fase, com os tokens definidos de forma semântica para que um tema claro possa ser acrescentado depois sem tocar nos componentes.**

Justificação:

- O conteúdo é denso e numérico, lido em sequência e em listagem longa, que é o caso dominante do produto. Superfície escura com texto claro reduz a área de luminância alta nesse cenário.
- Dois temas **duplicam o trabalho de verificação**: cada par de cor tem de ser recalculado contra WCAG 2.2 AA (§4) e cada tela tem de ser revista duas vezes. Com um só agente de frontend e as Fases 3 e 5 ainda por fazer, é custo imediato contra benefício não requerido — **nenhum requisito pede tema claro**: RNF-002 pede contraste, não escolha de tema.
- **PD-002 (público-alvo) está aberto.** Sem saber dispositivos e condições de acesso predominantes, prometer dois temas é escolher sem informação. Um tema verificado vale mais que dois por verificar.
- O custo de adiar é baixo **porque** os tokens são semânticos (`surface-raised`, `text-secondary`) e não literais (`cinza-900`): acrescentar o tema claro passa a ser redefinir valores num só lugar, sob um seletor de tema, sem alterar componente nenhum. Esta é a razão técnica de a nomenclatura de §3.1 ser como é.

**Implementação prevista:** as custom properties são declaradas em `:root`, com `color-scheme: dark` para que os controles nativos do navegador acompanhem. Um tema claro futuro entra como bloco de redefinição sob `[data-theme="light"]`, mais `prefers-color-scheme` se e quando for decidido. Nenhum componente lê valor literal de cor.

**Aprovada e registada** pelo Pedro em 2026-10-27, como [**DT-011**](decisoes-tecnicas.md#dt-011--tema-escuro-único-com-tokens-semânticos). Deixa de ser proposta: o tema escuro único é a decisão vigente, e um tema claro só entra se a **PD-002** mostrar que é preciso — o risco está registado como R2 em §10.

> **Nota de numeração.** Esta decisão foi reservada como **DT-009** quando esta secção foi escrita, e renumerada duas vezes no mesmo dia: o `backend` registou a DT-009 (provedor esportivo) e depois a DT-010 (âmbito dos dados esportivos). Nenhuma delas foi alterada; a decisão de tema ficou em **DT-011**. Para evitar uma terceira colisão, está proposto no quadro que o número seja reservado aí antes de ser usado.

---

## 3. Tokens

Os tokens são a **única** fonte de valores visuais. Nenhum valor de cor, tamanho, raio, sombra ou duração aparece solto num componente — é critério de conclusão da Fase 2 do roadmap ("tokens implementados e consumidos pelos componentes, sem valores soltos no código").

### 3.1 Cor

Nome semântico, nunca literal: o valor muda entre temas, o nome não.

**Superfícies**

| Token | Valor | Uso |
|---|---|---|
| `--color-surface-sunken` | `#070A0E` | Área recuada: trilho de campo de busca, faixa de tabela |
| `--color-surface-canvas` | `#0B0E13` | Fundo da página. Superfície base |
| `--color-surface-raised` | `#141922` | Bloco de conteúdo: cartão de evento, cartão de jogo, linha de mercado |
| `--color-surface-overlay` | `#1C222D` | Sobreposição real: menu em mobile, painel, diálogo |
| `--color-surface-inset` | `#10151D` | Fundo de controle dentro de bloco elevado |

**Texto**

| Token | Valor | Uso |
|---|---|---|
| `--color-text-primary` | `#EEF1F6` | Texto principal, números, títulos |
| `--color-text-secondary` | `#A7B0BF` | Texto de apoio: competição, categoria, rótulo |
| `--color-text-muted` | `#848E9D` | Metadado de menor peso: data, contagem |
| `--color-text-on-brand` | `#0B0E13` | Texto sobre a cor de marca |

**Marca e traço**

| Token | Valor | Uso |
|---|---|---|
| `--color-brand` | `#B8F135` | Ação primária, item ativo, anel de foco, favorito marcado |
| `--color-brand-strong` | `#9CD41E` | Estado pressionado da ação primária |
| `--color-brand-quiet` | `#1E2A12` | Fundo discreto de item ativo. **Só** atrás de `--color-text-primary` |
| `--color-border-subtle` | `#252C38` | Divisor entre itens de lista. **Decorativo** |
| `--color-border-strong` | `#3A4452` | Contorno de bloco, separador de seção. **Decorativo** |
| `--color-border-interactive` | `#616E7E` | Contorno de controle operável: campo, botão secundário, caixa. Verificado contra 1.4.11 (§4) |

A escolha do lima-LED (`#B8F135`) como cor de marca é deliberada: resolve a identidade sem recorrer ao verde-garrafa nem ao laranja do segmento, lê como painel iluminado — coerente com §1.1 — e tem luminância alta, o que lhe dá 14.42:1 sobre o fundo da página e permite usá-la em texto e em ícone pequeno, não apenas em área grande.

**Estados**

| Token | Valor | Uso |
|---|---|---|
| `--color-success` | `#35C98A` | Confirmação de ação do utilizador |
| `--color-warning` | `#F2B33D` | Alerta que não impede continuar |
| `--color-danger` | `#FF6E6E` | Erro de carregamento, falha de operação |
| `--color-info` | `#63AEFF` | Informação neutra, nota de contexto |

**Regras de cor (vinculativas)**

1. `--color-brand` nunca é fundo de bloco de conteúdo. Fundo de marca existe apenas em controle de ação primária e em `--color-brand-quiet`.
2. Os quatro tokens de estado aparecem **só** em feedback — nunca para classificar conteúdo, nunca como cor de um esporte, de uma categoria ou de um valor de odd.
3. **A cor nunca é o único portador de informação** (WCAG 1.4.1). Todo estado traz ícone e texto. Isto também neutraliza a proximidade de matiz entre `--color-brand` (lima, ~75°) e `--color-warning` (âmbar, ~42°): não aparecem como par de significados concorrentes e nenhum dos dois significa algo sozinho.
4. `--color-border-subtle` e `--color-border-strong` são **decorativos** por definição: não cumprem 3:1 (§4) e por isso é **proibido** usá-los como contorno de controle operável. O contorno de controle é `--color-border-interactive`.
5. Nenhuma cor "de esporte", "de casa" ou "de categoria" é introduzida. Diferenciação de conteúdo é por texto e por estrutura.

### 3.2 Tipografia

Duas famílias, com papéis separados, carregadas com `font-display: swap` e com pilha de recurso do sistema — nenhuma tela depende de fonte remota para ser legível.

| Token | Valor | Papel |
|---|---|---|
| `--font-ui` | `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` | Toda a interface: títulos, rótulos, texto corrido |
| `--font-numeric` | `"JetBrains Mono", ui-monospace, "SF Mono", "Cascadia Mono", Consolas, monospace` | **Só** números com função de dado: odds, hora, data, contagem, placar (P1) |

`--font-numeric` aplica-se com `font-variant-numeric: tabular-nums`. `--font-ui` também recebe `tabular-nums` em qualquer contexto de coluna numérica, mesmo quando o número está dentro de texto.

**Escala** — base 16px, razão aproximada de 1.2, em `rem` para respeitar o tamanho de fonte definido pelo utilizador no sistema (RNF-002). `line-height` sem unidade.

| Token | Tamanho | Altura de linha | Uso |
|---|---|---|---|
| `--text-3xl` | `2rem` / 32px | 1.15 | Título de página, um por tela |
| `--text-2xl` | `1.5rem` / 24px | 1.2 | Título de seção |
| `--text-xl` | `1.25rem` / 20px | 1.3 | Título de bloco, nome de evento no detalhe |
| `--text-lg` | `1.125rem` / 18px | 1.4 | Odd em destaque, número principal |
| `--text-md` | `1rem` / 16px | 1.5 | Texto corrido. **Mínimo para texto de leitura** |
| `--text-sm` | `0.875rem` / 14px | 1.45 | Rótulo, metadado, texto de apoio |
| `--text-xs` | `0.75rem` / 12px | 1.4 | Etiqueta curta em maiúsculas. **Nunca para frase** |

| Peso | Token | Uso |
|---|---|---|
| 400 | `--weight-regular` | Padrão de tudo |
| 500 | `--weight-medium` | Rótulo, nome de participante, valor de odd |
| 600 | `--weight-semibold` | Título. **Limite superior** — não existe 700 ou acima (§1.4) |

Regras: nenhum texto abaixo de `--text-xs`; `--text-xs` só em etiqueta de uma a três palavras, com `letter-spacing: 0.04em`; a hierarquia de títulos (`h1`–`h3`) segue a estrutura semântica do documento e nunca é escolhida pelo tamanho desejado (RNF-002).

### 3.3 Espaçamento

Régua de **4px**, um único eixo de valores para margem, preenchimento e intervalo.

| Token | Valor | Token | Valor |
|---|---|---|---|
| `--space-0` | `0` | `--space-5` | `1.25rem` / 20px |
| `--space-1` | `0.25rem` / 4px | `--space-6` | `1.5rem` / 24px |
| `--space-2` | `0.5rem` / 8px | `--space-8` | `2rem` / 32px |
| `--space-3` | `0.75rem` / 12px | `--space-10` | `2.5rem` / 40px |
| `--space-4` | `1rem` / 16px | `--space-12` | `3rem` / 48px |
| | | `--space-16` | `4rem` / 64px |

Aplicação: espaço interno de item de lista `--space-3`; de bloco `--space-4`; entre seções `--space-8` em mobile e `--space-12` acima de `--bp-md`; margem lateral da página `--space-4` em mobile, `--space-6` em tablet, `--space-8` em desktop. Nenhum valor fora da régua.

**Alvos de toque** — mínimo **44×44px** para qualquer controle. A WCAG 2.2 exige 24×24 em 2.5.8 (*Target Size (Minimum)*); 44 é a folga que adoto, por RNF-001 ("alvos de toque adequados ao uso em mobile"). Quando o elemento visual é menor que isso, a área clicável é ampliada por preenchimento ou pseudo-elemento, sem alterar o layout.

### 3.4 Raio

Discreto, por coerência com P2: a estrutura não é feita de pastilhas.

| Token | Valor | Uso |
|---|---|---|
| `--radius-none` | `0` | Divisor, barra |
| `--radius-sm` | `4px` | Etiqueta, caixa, indicador |
| `--radius-md` | `6px` | Controle: botão, campo, item selecionável |
| `--radius-lg` | `10px` | Bloco: cartão, painel |
| `--radius-full` | `999px` | **Só** indicador circular e avatar. Nunca em botão |

### 3.5 Elevação

Elevação indica **sobreposição real**, nunca importância (P2). Três níveis, e nada entre eles.

| Token | Valor | Uso |
|---|---|---|
| `--elevation-0` | `none` | Bloco em fluxo. **Padrão do cartão de evento e do cartão de jogo** |
| `--elevation-1` | `0 1px 2px rgb(0 0 0 / 0.40)` | Elemento fixo sobre conteúdo que rola: navegação, barra de filtro |
| `--elevation-2` | `0 8px 24px rgb(0 0 0 / 0.55)` | Sobreposição que se fecha: menu em mobile, diálogo, painel |

A diferença de plano entre cartão e página vem da cor da superfície (`raised` sobre `canvas` = 1.10:1): suficiente para separar plano, insuficiente para transportar informação — que fica a cargo do texto, como manda a regra 3 de §3.1.

### 3.6 Movimento

Movimento serve para explicar uma mudança de estado. Não existe animação ambiente.

| Token | Valor | Uso |
|---|---|---|
| `--duration-instant` | `80ms` | Realce de estado: hover, pressionado |
| `--duration-quick` | `140ms` | Transição de cor, opacidade, foco |
| `--duration-moderate` | `220ms` | Entrada e saída de sobreposição |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0.3, 1)` | Padrão |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Saída |

Regras:

1. Nada acima de `--duration-moderate`.
2. **Nenhuma animação em laço** sem ação do utilizador. O indicador de carregamento é a única exceção justificada (§9.1).
3. `prefers-reduced-motion: reduce` é **obrigatório**: todas as transições e animações passam a `0.01ms` e nenhuma informação se perde com isso — nenhum estado depende de movimento para ser compreendido.
4. Nada que mude a posição do conteúdo depois de ele estar legível (RF-008).

### 3.7 Breakpoints

Mobile primeiro: o estilo base é o da largura menor; as consultas de média só acrescentam.

| Token | Valor | Faixa | Arranjo |
|---|---|---|---|
| — | — | `< 600px` | Telemóvel: uma coluna, navegação principal persistente, filtros em linha rolável |
| `--bp-sm` | `600px` | 600–899 | Telemóvel grande e tablet em retrato: duas colunas no catálogo |
| `--bp-md` | `900px` | 900–1279 | Tablet e portátil: navegação horizontal visível, três colunas no catálogo |
| `--bp-lg` | `1280px` | 1280–1679 | Desktop: coluna lateral de esportes, quatro colunas no catálogo |
| `--bp-xl` | `1680px` | `>= 1680` | Desktop largo: conteúdo limitado a `1440px` e centrado |

Largura máxima de texto corrido: `72ch`. Larguras de verificação obrigatória: **360, 390, 768, 1024, 1440 e 1920** (CA-RNF-001).

---

## 4. Contraste verificado — WCAG 2.2 AA

Razões **calculadas**, não estimadas, pela fórmula de luminância relativa da WCAG 2.x — `(L1 + 0.05) / (L2 + 0.05)` com linearização sRGB — a partir dos valores hexadecimais de §3.1. Critérios aplicados: **1.4.3 Contrast (Minimum)**, 4.5:1 para texto normal; **1.4.11 Non-text Contrast**, 3:1 para contorno de componente de interface e para indicador de foco.

| Frente | Fundo | Hex frente | Hex fundo | Razão | Mínimo | Resultado |
|---|---|---|---|---|---|---|
| `text-primary` | `canvas` | #EEF1F6 | #0B0E13 | **17.07:1** | 4.5 | passa |
| `text-primary` | `raised` | #EEF1F6 | #141922 | **15.56:1** | 4.5 | passa |
| `text-primary` | `overlay` | #EEF1F6 | #1C222D | **14.09:1** | 4.5 | passa |
| `text-secondary` | `canvas` | #A7B0BF | #0B0E13 | **8.84:1** | 4.5 | passa |
| `text-secondary` | `raised` | #A7B0BF | #141922 | **8.06:1** | 4.5 | passa |
| `text-secondary` | `overlay` | #A7B0BF | #1C222D | **7.30:1** | 4.5 | passa |
| `text-muted` | `canvas` | #848E9D | #0B0E13 | **5.83:1** | 4.5 | passa |
| `text-muted` | `raised` | #848E9D | #141922 | **5.32:1** | 4.5 | passa |
| `text-muted` | `overlay` | #848E9D | #1C222D | **4.82:1** | 4.5 | passa |
| `brand` | `canvas` | #B8F135 | #0B0E13 | **14.42:1** | 4.5 | passa |
| `brand` | `raised` | #B8F135 | #141922 | **13.15:1** | 4.5 | passa |
| `brand` | `overlay` | #B8F135 | #1C222D | **11.91:1** | 4.5 | passa |
| `text-on-brand` | `brand` | #0B0E13 | #B8F135 | **14.42:1** | 4.5 | passa |
| `text-on-brand` | `brand-strong` | #0B0E13 | #9CD41E | **10.91:1** | 4.5 | passa |
| `success` | `canvas` | #35C98A | #0B0E13 | **9.09:1** | 4.5 | passa |
| `success` | `raised` | #35C98A | #141922 | **8.28:1** | 4.5 | passa |
| `warning` | `canvas` | #F2B33D | #0B0E13 | **10.39:1** | 4.5 | passa |
| `warning` | `raised` | #F2B33D | #141922 | **9.47:1** | 4.5 | passa |
| `danger` | `canvas` | #FF6E6E | #0B0E13 | **7.09:1** | 4.5 | passa |
| `danger` | `raised` | #FF6E6E | #141922 | **6.47:1** | 4.5 | passa |
| `info` | `canvas` | #63AEFF | #0B0E13 | **8.31:1** | 4.5 | passa |
| `info` | `raised` | #63AEFF | #141922 | **7.58:1** | 4.5 | passa |
| `border-interactive` | `canvas` | #616E7E | #0B0E13 | **3.72:1** | 3.0 | passa |
| `border-interactive` | `raised` | #616E7E | #141922 | **3.39:1** | 3.0 | passa |
| `border-interactive` | `overlay` | #616E7E | #1C222D | **3.07:1** | 3.0 | passa |
| `brand` (foco) | `canvas` | #B8F135 | #0B0E13 | **14.42:1** | 3.0 | passa |
| `brand` (foco) | `raised` | #B8F135 | #141922 | **13.15:1** | 3.0 | passa |
| `brand` (foco) | `overlay` | #B8F135 | #1C222D | **11.91:1** | 3.0 | passa |

**28 pares verificados, 28 passam.** Dois valores foram corrigidos durante este cálculo e os originais ficam registados para não se repetirem: `text-muted` era `#7D8795` e dava **4.39:1** sobre `overlay`, abaixo dos 4.5 exigidos; o contorno de controle era `#3A4452` e dava **1.96:1**, muito abaixo dos 3:1 de 1.4.11 — daí a separação entre traço decorativo e `--color-border-interactive` na regra 4 de §3.1.

**Não verificados por não serem exigidos:** `border-subtle` (1.38:1) e `border-strong` (1.96:1) são decorativos e o critério 1.4.11 isenta elemento puramente decorativo; a regra 4 de §3.1 proíbe usá-los onde o critério se aplicaria. A diferença `raised`/`canvas` (1.10:1) é separação de plano, não informação.

**Indicador de foco** — `outline: 2px solid var(--color-brand)` com `outline-offset: 2px`, aplicado por `:focus-visible` em todo elemento operável. O contorno **nunca** é removido. Atende 2.4.7 (*Focus Visible*), 1.4.11 e, pelo deslocamento de 2px, também 2.4.13 (*Focus Appearance*, AAA) sem custo extra.

**O que ainda não está verificado e será na implementação:** texto sobre imagem de jogo do catálogo. Nenhum par pode ser calculado antes de a imagem existir; a regra de desenho é não assentar texto diretamente sobre imagem — o nome do jogo vive numa faixa de superfície opaca abaixo dela.

---

## 5. Uso dos tokens

1. Componente consome token, nunca valor. Valor literal em componente é defeito, não estilo.
2. Token novo entra neste documento **antes** de entrar no código, com a razão de contraste calculada se for cor.
3. Token não é renomeado sem atualizar este documento na mesma mudança.
4. Nenhum componente define cor, raio, sombra ou duração próprios.
5. Verificação automatizada prevista para a Fase 5: varredura de `apps/web/` por valores hexadecimais e por `px` fora dos ficheiros de token.

---

## 6. Dados demonstrativos — PD-009 e RNF-008

RNF-008 exige que o caráter fictício seja perceptível **sem depender de leitura de texto auxiliar** e com o **mesmo tratamento em todas as áreas**. O tratamento abaixo resolve a PD-009.

### 6.1 O tratamento: campo tracejado

Todo valor fictício é apresentado dentro de um **campo tracejado** com três marcas simultâneas e redundantes:

1. **Contorno tracejado** de 1px — `1px dashed var(--color-border-interactive)` com `--radius-sm`. O tracejado é a convenção corrente de "provisório, não definitivo" e funciona sem cor.
2. **Hachura diagonal** muito discreta no fundo — listras a 45° com 4px de passo, em `#141922` sobre `#10151D`, ou seja 1.07:1. É textura, não informação: deliberadamente quase invisível, para dar a sensação de campo marcado sem reduzir o contraste do número que está por cima, que continua a ser `text-primary` sobre `surface-inset` e por isso continua a cumprir AA.
3. **Glifo fixo** — um losango vazado `◇` imediatamente antes do valor, em `--color-text-muted`, com `aria-hidden="true"`.

Os três funcionam em monocromático, sob qualquer forma de daltonismo e com imagens desligadas, porque nenhum depende de matiz. Satisfaz 1.4.1 por redundância.

### 6.2 Camada de contexto

- **Faixa persistente** no topo de todas as telas: texto curto declarando que a plataforma é demonstrativa e que os valores são fictícios, com `--color-info` e ícone. Não é fechável — é o cumprimento de CA-001.4, não uma notificação.
- **Nome acessível** — todo campo tracejado carrega texto para leitor de tela ("valor demonstrativo"), em elemento visualmente oculto mas presente na árvore de acessibilidade, porque o tracejado e a hachura são invisíveis para quem usa leitor de tela.
- **Rodapé de bloco** em listagens: uma linha com `--text-xs` e `--color-text-muted` identificando a origem demonstrativa do conjunto, para que a marcação não precise de se repetir em cada célula de uma tabela densa.

### 6.3 Onde se aplica

Em todas as áreas, sem exceção e sem variação: odds e mercados (RF-003, CA-003.4), data e hora e situação de evento (RF-002), informação de jogo do catálogo (RF-004), saldo ou histórico do perfil se vierem a existir (RF-007, PD-006 aberto), e qualquer número do conjunto demonstrativo.

**Não se aplica** a elementos da própria interface — rótulos, títulos de seção, contagem de resultados da busca, mensagens de estado — porque não são dados fictícios e marcá-los diluiria o sinal até à inutilidade.

---

## 7. Dados reais de terceiros — **resolvido: opção A** (DIV-001, DT-014)

**Decidido pelo Pedro em 2026-10-27 e registado como [DT-014](decisoes-tecnicas.md#dt-014--marcar-só-o-dado-fictício-opção-a): opção A.** O dado fictício leva a marca demonstrativa de §6; o dado real de terceiros **não leva selo**. A contradição documental que esta secção registava — RN-002 dizia que *todo* dado era fictício, enquanto a DT-002 traz dados reais — foi resolvida antes, pela [DT-013](decisoes-tecnicas.md), que reescreveu a RN-002, a RF-003 e a CA-003.4.

**O que isto fixa na implementação:**

- o componente de procedência tem **uma só variante**, `demonstrativo`. A variante `real` **não é para criar** — nem esboçada, nem comentada, nem desativada;
- a decisão de marcar ou não é tomada **num só lugar** (`ValorDeDado`), a partir do `origin` do contrato (`demo` ou `provider`, obrigatório por A8). Nenhum componente que mostre um valor decide isto por si;
- quem explica *de que tipo* é cada área é a faixa permanente da DT-013, não uma marca por item: esportes vêm de fonte externa e são informativos, cassino e perfil são fictícios;
- a RNF-008 continua satisfeita, porque o dado fictício está sempre marcado da mesma forma, em todas as áreas.

### Por que não a opção B

A opção B — marcar os dois, com um selo `● ao vivo · <fonte>` no dado real — foi rejeitada por agora, com três razões registadas na DT-014:

- **o selo seria falso:** as odds podem ter até uma hora de atraso por causa da cache (DT-012), e "ao vivo" afirmaria o contrário;
- **a fonte nomeada seria a errada:** o provedor atual é só de testes (DT-009) e vai ser trocado;
- **acrescentaria ruído** em listagem densa e sobretudo em mobile, contra o princípio P1 e o requisito RNF-001.

### O que fica em aberto, e já tem lugar previsto

Se os termos do provedor definitivo exigirem **atribuição** (C1 e C2 da DT-009), ela entra como texto de fonte no **rodapé do bloco** — que a opção A já previa e que a listagem já usa para a nota de procedência. Não é preciso marca por item para isso.

Quando o provedor for definitivo, pode propor-se ao contrato um campo com o instante da última atualização, para a interface poder dizer "cotações às HH:MM" em vez de sugerir tempo real. Isso **seria** mudança de contrato e exige revisão cruzada (DT-005).

---

## 8. Abordagem de estilos — recomendação para DP-006

**Recomendação: CSS Modules com os tokens em custom properties CSS. Nenhuma biblioteca nova.**

Nada foi instalado; esta é uma recomendação à espera de decisão.

| Opção | A favor | Contra |
|---|---|---|
| **CSS Modules + custom properties** (recomendada) | Suporte nativo do Vite, **zero dependências novas** e zero runtime; o escopo por ficheiro atende RNF-005; os tokens em custom properties são a fonte única e um valor solto fica visível na revisão e detetável por varredura; CSS puro dá acesso direto a `@media`, `:focus-visible`, `prefers-reduced-motion` e `@supports`, de que §3.6 e §4 dependem; a redefinição de tema sob um seletor (§2) é o mecanismo natural | Mais verboso; sem purga automática de CSS não usado; exige disciplina de nomes, que este documento define; nenhuma biblioteca de componentes pronta — os componentes de §9 são escritos à mão |
| **Tailwind CSS** | Rápido a montar; consistência por omissão; a versão 4 assenta em custom properties, o que casaria com os tokens; ecossistema grande | Dependência nova e etapa de build própria, contra a orientação do `CLAUDE.md` de evitar dependência desnecessária; os *arbitrary values* (`p-[13px]`) permitem furar a régua de §3.3 com facilidade e são difíceis de barrar em revisão; classes longas no marcador reduzem a legibilidade de componentes densos; auditar "todos os componentes usam só tokens" passa a exigir ferramenta própria |
| **vanilla-extract** | Tokens tipados, verificados pelo compilador de tipos — alinhado com RNF-006; zero runtime | Dependência e integração de build adicionais; o benefício principal, tipar tokens, é modesto para um conjunto desta dimensão, e o custo recai sobre o único agente de frontend |
| **CSS-in-JS com runtime** (styled-components, emotion) | Ergonómico para variantes | Custo de runtime contra RNF-003, sem benefício que as outras opções não dêem; rejeitada |

Se aprovada, a decisão deve ser registada em [`docs/decisoes-tecnicas.md`](decisoes-tecnicas.md) e resolver a DP-006 em [`docs/arquitetura.md`](arquitetura.md). Não registei nada: é decisão do Pedro.

**Estrutura de ficheiros prevista** (§4 de `docs/arquitetura.md`): `apps/web/src/styles/tokens.css` com as custom properties, `reset.css` e `global.css`; cada componente com o seu `.module.css` ao lado. Nenhum token duplicado em JavaScript — quando um valor for preciso em código, lê-se a custom property.

---

## 9. Componentes-base previstos

Inventário e estados, não implementação. Todos cumprem: foco visível por `:focus-visible` (§4), alvo de toque de 44px (§3.3), nome acessível, e tokens em vez de valores.

### 9.1 Estados de carregamento, erro e vazio — RF-008

Os três são componentes de primeira classe, não variações improvisadas, e aplicam-se a **todas** as áreas que carregam ou filtram dados.

- **Carregando** — esqueleto com a **forma e a altura exatas** do conteúdo que vai substituir, para que não haja deslocamento de layout ao concluir (RF-008, e é a razão de P1). Pulsação de opacidade entre 0.6 e 1 em 1200ms, única animação em laço permitida (§3.6, regra 2), suprimida por `prefers-reduced-motion`. `aria-busy="true"` no contentor e região viva polida para anunciar a conclusão (CA-008.1, RNF-002).
- **Erro** — ícone em `--color-danger`, título curto, mensagem compreensível **sem detalhe técnico** (RNF-004, CA-008.2) e ação de nova tentativa apenas quando a operação for repetível. Anunciado por `role="alert"`. Nenhum rastreio, caminho de ficheiro ou código interno chega à tela.
- **Vazio** — **dois componentes distintos**, não um com texto variável, porque CA-008.3 exige que sejam textualmente distintos: *nada cadastrado* (o conjunto está vazio) e *nada encontrado* (há critério de busca ou filtro aplicado). O segundo mostra o critério aplicado e oferece o caminho de saída: limpar filtros ou voltar à listagem (CA-005.2, CA-005.4). Nenhum dos dois deixa a tela sem saída (CA-008.4).

### 9.2 Cartão de evento — RF-002

Participantes em `--text-md` e `--weight-medium`; competição e esporte em `--text-sm` e `--color-text-secondary`; data e hora em `--font-numeric`; situação (agendado, encerrado) como etiqueta com ícone e texto, **nunca só cor** (regra 3 de §3.1). Em mobile os participantes empilham e a hora alinha à direita; acima de `--bp-md` passam a colunas alinhadas. Toda a superfície é a área de navegação para o detalhe, como um só elemento operável — não há controles concorrentes dentro dela além do indicador de favorito. `--elevation-0`, separação por divisor.

### 9.3 Linha de mercado e odds — RF-003, RN-003

**O ponto mais sensível do sistema.** Nome do mercado em `--text-sm`; cada opção numa linha com nome à esquerda e odd à direita em `--font-numeric`, `--text-lg`, `--weight-medium`, dentro do campo tracejado de §6.

**Somente leitura, sem exceção:** nenhum elemento é botão, ligação, caixa ou controle de qualquer tipo; nenhum estado de hover, pressionado ou selecionado; nenhum elemento desativado que sugira seleção possível — a visão proíbe a presença mesmo desabilitada (CA-003.3). A odd é texto marcado como dado e nada mais. Marcação semântica de lista de descrição ou tabela, nunca de lista de ações.

O formato de exibição das odds **não está definido** (PD-007, e PC-006 no contrato). Fica encapsulado numa única função de formatação, para que a decisão posterior mude um só lugar e CA-003.2 — formato idêntico em todas as telas — passe a ser verificável por teste.

### 9.4 Cartão de jogo — RF-004

Imagem com proporção fixa e `aspect-ratio` reservado antes do carregamento, `loading="lazy"` e dimensões explícitas (RNF-003); nome e categoria numa faixa de superfície opaca **abaixo** da imagem, nunca sobre ela (§4); indicador de favorito no canto. Grelha responsiva segundo §3.7. Nenhuma afordância de "jogar": o cartão navega para o detalhe e nada mais (RN-004, CA-004.4).

### 9.5 Campo de busca — RF-005

`input` com rótulo associado e visível ou, em mobile, rótulo acessível com marcador visual equivalente; contorno `--color-border-interactive`; ícone decorativo com `aria-hidden`; botão de limpar que aparece só com conteúdo e tem nome acessível. Contagem de resultados anunciada por região viva polida. Totalmente operável por teclado com foco visível (CA-005.5). O escopo da busca é PD-003, aberto: o componente é agnóstico quanto ao que pesquisa.

### 9.6 Indicador de favorito — RF-006

Botão de alternância com `aria-pressed`, nome acessível que descreve a ação e o alvo, e **duas marcas**: a forma do ícone muda entre contorno e preenchido, e a cor passa a `--color-brand`. A forma, não a cor, é o portador principal (1.4.1). Mudança de estado imediata na tela (CA-006.1). Falha de leitura ou escrita do armazenamento local **não quebra a interface**: o indicador degrada para não disponível, sem erro técnico ao utilizador (CA-006.5, RF-006).

### 9.7 Navegação principal — RF-001, CA-001.2

Um só conjunto de destinos — esportes, cassino, busca, favoritos, perfil — em dois arranjos do **mesmo** componente, sem duplicação de lógica (RNF-005):

- **`< 600px`** — barra persistente com ícone e rótulo curto visível, sempre ao alcance, com área de 44px e respeito às áreas seguras do dispositivo.
- **`>= 600px`** — navegação horizontal no topo, com o item ativo marcado por `aria-current="page"`, `--color-brand` no texto e uma marca de 2px na mesma cor. A marca, e não só a cor, é o que identifica o ativo.

Acima de `--bp-lg`, os esportes ganham uma coluna lateral com a lista de esportes e competições — que é navegação adicional, não substituição: os mesmos destinos continuam acessíveis.

### 9.8 Etiqueta de estado e de procedência

Componente único usado pelo estado de evento, pela categoria de jogo e pela marcação de procedência de §6 e §7. `--text-xs` em maiúsculas, `--radius-sm`, ícone mais texto. Variantes: `neutra`, `sucesso`, `aviso`, `erro`, `informação`, `demonstrativo`. A variante `real` existirá apenas se o Pedro escolher a Opção B de §7.

---

## 10. Riscos assumidos

| # | Risco | Origem | O que fica em causa se a premissa mudar |
|---|---|---|---|
| R1 | **Densidade de informação alta** — a direção assume um utilizador confortável com listagem densa e leitura de tabela numérica | **PD-002** aberto; derivado de H1 e H4 da visão, que são hipóteses não validadas | Se o público for de baixa familiaridade com o tema, a densidade e o tratamento tabular precisam de baixar: muda a escala tipográfica (§3.2), o espaçamento de item de lista (§3.3) e o arranjo do cartão de evento (§9.2). Os tokens de cor e o tratamento de §6 sobrevivem. **Assumido como risco, por instrução: não invento o público** |
| R2 | **Tema escuro único** | §2, com PD-002 aberto | Se o acesso predominante for diurno em ambiente claro, entra um tema claro. O custo está contido pela nomenclatura semântica (§2) |
| ~~R3~~ | ~~**Tratamento de dado real**~~ | ~~**DIV-001**~~ | **Fechado** em 2026-10-27 pela **DT-014**: opção A. O selo de procedência da opção B, que mexeria no espaço vertical de §9.2, §9.3 e §9.4, não é para criar |
| R4 | **Formato das odds** | **PD-007**, **PC-006** | Contido pela função única de formatação de §9.3 |
| R5 | **Marca visual inexistente** — não há nome visual, logotipo nem símbolo aprovados | A visão não os define, por decisão própria | O lima-LED de §3.1 pode não sobreviver a uma identidade de marca posterior. Contido: é um token, e muda num só lugar |
| R6 | **Tipografia** — Inter e JetBrains Mono são escolha minha, sem licença verificada nem decisão de marca | Nenhum documento define tipografia | As duas são de licença aberta (SIL OFL), mas **não verifiquei os termos** e não o afirmo. A verificar antes de servir as fontes; a pilha de recurso do sistema garante que nenhuma tela depende delas |

---

## 11. Pendências deste documento

| # | Pendência | Quem resolve |
|---|---|---|
| ~~**DIV-001**~~ | ~~Opção A ou Opção B para dados reais de terceiros (§7)~~ | **Resolvida** — opção A, [DT-014](decisoes-tecnicas.md), 2026-10-27 |
| ~~**DP-006**~~ | ~~Confirmar CSS Modules + custom properties (§8)~~ | **Resolvida** — aprovada pelo Pedro em 2026-10-26 e em uso desde então |
| ~~**DT-011**~~ | ~~Registar a decisão de tema (§2)~~ | **Registada** em `docs/decisoes-tecnicas.md` em 2026-10-27, depois da aprovação do Pedro. O número mudou duas vezes (era DT-009, depois DT-010) porque o `backend` usou ambos entretanto |
| **PD-002** | Público-alvo — ver R1 | **Pedro** |
| **PD-007** | Formato de exibição das odds (§9.3) | **Pedro** (T-009) |
| **PD-003**, **PD-005**, **PD-006 (requisitos)**, **PD-008** | Escopo da busca, categorias de cassino, campos do perfil, idioma e formatos | **Pedro** (T-009) |
| R6 | Verificar a licença das duas famílias tipográficas antes de as servir | `frontend`, na T-016 |
| — | Contraste de texto sobre imagem de jogo, quando as imagens existirem (§4) | `frontend`, na T-016 |

> Pendência aberta não autoriza decisão por omissão. Resolver, registar no quadro e atualizar este documento.
