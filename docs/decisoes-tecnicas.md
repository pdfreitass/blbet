# Decisões Técnicas — blbet

> Registo cronológico das decisões técnicas, de produto e de escopo. **Dono: compartilhado** ([`docs/agent-protocol.md`](agent-protocol.md), seção 2). Ninguém reescreve registo alheio: decisão revista ganha novo registo e a antiga é marcada como `substituída por DT-xxx`, sem ser apagada.

**Última atualização:** 2026-10-26 · **Por:** `backend` (registo das decisões aprovadas pelo Pedro)

---

## Formato

Cada decisão tem identificador `DT-xxx`, sequencial e estável, nunca reutilizado.

```
### DT-xxx — <título curto>

- **Data:** AAAA-MM-DD
- **Estado:** aprovada | substituída por DT-xxx | revogada
- **Decidido por:** quem tomou a decisão
- **Registado por:** agente ou pessoa que escreveu o registo
- **Resolve:** identificadores de pendência (DP-xxx, PA-xxx, PC-xxx, PD-xxx), se houver

**Contexto** — o problema e as restrições conhecidas.
**Decisão** — o que foi decidido, sem ambiguidade.
**Alternativas consideradas** — e por que não foram escolhidas.
**Consequências** — o que muda nos documentos, no trabalho dos agentes e no código.
**Pendências** — o que a decisão deixa em aberto.
```

---

## Índice

| # | Decisão | Resolve | Estado |
|---|---|---|---|
| [DT-001](#dt-001--stack-do-projeto) | Stack do projeto: monorepo pnpm, React + Vite, Fastify, Zod | DP-001, PA-001; DP-002 em parte; PC-011, PC-012 | aprovada |
| [DT-002](#dt-002--integração-com-api-esportiva-real-desde-o-início) | Integração com API esportiva real desde o início | P-1 | aprovada, com bloqueio BLQ-001 |
| [DT-003](#dt-003--branches-e-worktrees-separados) | Branches e worktrees separados por agente | PA-002 | aprovada |
| [DT-004](#dt-004--resolução-de-conflitos) | Resolução de conflitos | PA-003 | aprovada |
| [DT-005](#dt-005--revisão-cruzada) | Revisão cruzada em contratos e integração | PA-004 | aprovada |
| [DT-006](#dt-006--consulta-ao-quadro-de-coordenação) | Frequência de consulta ao quadro | PA-005 | aprovada |
| [DT-007](#dt-007--repositório-fora-do-onedrive) | Repositório fora do OneDrive antes de instalar dependências | — | aprovada, executada (T-011) |
| [DT-008](#dt-008--worktrees-e-versões-da-fundação) | Worktrees em pastas irmãs; versões da fundação | PA-006 | aprovada |
| [DT-009](#dt-009--sportsbook-api-como-provedor-esportivo-de-testes) | Sportsbook API (RapidAPI, plano gratuito) como provedor esportivo de desenvolvimento e testes | BLQ-001 em parte | aprovada, só para testes |
| [DT-010](#dt-010--âmbito-inicial-dos-dados-esportivos) | Mercados, formato das odds, fonte única e só jogos futuros | PD-004, PD-007, PC-006 | aprovada |
| [DT-012](#dt-012--competições-e-frequência-de-atualização-no-plano-gratuito) | Premier League, La Liga e Serie A, atualizadas de hora em hora | DP-009 | aprovada, só no plano gratuito |
| [DT-013](#dt-013--dados-esportivos-reais-informativos-e-restantes-dados-fictícios) | Cotações esportivas reais e informativas; cassino e restantes valores fictícios. Nova redação da RN-002 | DIV-001 em parte | aprovada |
| [DT-014](#dt-014--marcar-só-o-dado-fictício-opção-a) | Marcar só o dado fictício (opção A do `design-system.md`); o dado real não leva selo | DIV-001 (interface), DP-004, PC-010 | aprovada |
| [DT-015](#dt-015--qualidade-cobertura-integração-contínua-lint-e-e2e) | Cobertura mínima de 80%, GitHub Actions, ESLint na raiz, E2E do `frontend` em `e2e/` | DP-002, DP-003, PA-008 | aprovada |

---

## Registos

### DT-001 — Stack do projeto

- **Data:** 2026-10-26
- **Estado:** aprovada
- **Decidido por:** Pedro
- **Registado por:** `backend`
- **Resolve:** DP-001, PA-001; DP-002 parcialmente; PC-011 e PC-012 de [`docs/api-contract.md`](api-contract.md)

**Contexto** — O repositório não tem código nem stack a preservar. O projeto é trabalhado por dois agentes em paralelo (`backend` no terminal, `frontend` no Desktop), consome uma API esportiva externa com credenciais que não podem chegar ao cliente (RNF-004) e prevê, numa etapa posterior, uma API agregadora de cassino. A recomendação anterior de [`docs/arquitetura.md`](arquitetura.md) (Next.js num projeto único) foi escrita antes da divisão em dois agentes.

**Decisão**

- **Monorepo** gerido por **pnpm workspaces**.
- **Frontend:** React + Vite + TypeScript, em `apps/web/` — propriedade do `frontend`.
- **Backend:** Node.js + Fastify + TypeScript, em `apps/api/` — propriedade do `backend`.
- **Contratos compartilhados:** pacote `packages/contracts/`, com esquemas e tipos em **Zod** — escrito pelo `backend`, consumido pelo `frontend`, que pede mudanças pelo protocolo de coordenação.
- **Testes:** **Vitest** para testes unitários e de integração; **Playwright** para testes end-to-end quando a estrutura estiver pronta.
- Comandos, versões e configurações exatos são confirmados na preparação do ambiente (T-013). Nenhuma dependência foi instalada neste registo.

**Alternativas consideradas**

- **Next.js num projeto único** — rejeitada: páginas e rotas de servidor dividem a mesma árvore e os mesmos ficheiros de configuração, o que torna a fronteira entre os dois agentes ambígua (PA-001). A execução em funções de curta duração também limita o cache e o controlo do consumo da API externa.
- **SPA Vite sem servidor** — rejeitada: as credenciais do provedor exigem servidor (RNF-004).
- **Backend separado noutra linguagem (.NET, Python)** — rejeitada: perde os tipos partilhados num único idioma e exigiria gerar tipos a partir de OpenAPI.

**Consequências**

- A fronteira entre os agentes passa a ser **por diretório** — tabela de propriedade em [`docs/agent-protocol.md`](agent-protocol.md), seção 2. Resolve PA-001.
- `packages/contracts/` é a fonte única dos tipos e da validação partilhados. Resolve PC-011 (forma de partilhar tipos) e PC-012 (biblioteca de validação: Zod).
- DP-002 fica resolvida **quanto às ferramentas**; a cobertura mínima continua em aberto.
- O desenvolvimento local passa a ter dois processos (web e api). A forma de comunicação local entre eles é decidida na T-013.
- Os ficheiros da raiz do monorepo (manifesto raiz, `pnpm-workspace.yaml`, lockfile, configurações base) passam a ser **compartilhados com aviso prévio**.
- Sem renderização no servidor no frontend — aceite: os requisitos não incluem SEO nem renderização no servidor.
- DP-006 (biblioteca de estilos e componentes) continua em aberto e pertence à área do `frontend`.

**Pendências** — versões e comandos exatos (T-013); cobertura mínima de testes (DP-002); local e dono dos testes end-to-end (PA-008); DP-006.

---

### DT-002 — Integração com API esportiva real desde o início

- **Data:** 2026-10-26
- **Estado:** aprovada, com bloqueio **BLQ-001**
- **Decidido por:** Pedro
- **Registado por:** `backend`
- **Resolve:** P-1

**Contexto** — Os documentos de produto assumiam, para esta fase, apenas dados demonstrativos locais (RN-002, RF-003, [`docs/visao.md`](visao.md) seção 9, [`docs/roadmap.md`](roadmap.md) Fase 4). O Pedro decidiu integrar uma API esportiva real desde o início do desenvolvimento.

**Decisão**

- A plataforma integra uma **API esportiva real** desde o início do desenvolvimento.
- O **provedor não está identificado.** Verificação de 2026-10-26: nenhum documento de provedor no repositório; a palavra "provedor" aparece apenas em sentido genérico.
- Nada sobre o provedor é presumido: nome, endpoints, autenticação, parâmetros, limites, campos e formatos de resposta vêm **exclusivamente da documentação oficial**.
- **Não existem chamadas fictícias que se apresentem como reais.** Enquanto o provedor não estiver identificado, nada no código simula a resposta dele como se fosse real.
- A integração com a **API agregadora de cassino continua numa etapa posterior**. Nenhum documento existente indicava decisão diferente.
- A plataforma **continua demonstrativa**: sem apostas, depósitos, saques ou pagamentos. As odds são apenas informação de exibição (RN-001 e RN-003 inalteradas).

**Consequências**

- O provedor fica atrás de um **adaptador** em `apps/api/`, que implementa a interface consumida pelo serviço de esportes. O formato do provedor nunca chega ao frontend: o adaptador converte as respostas para o modelo interno.
- As credenciais vivem apenas no servidor, em variáveis de ambiente fora do repositório; só um exemplo sem valores é versionado.
- A resposta do provedor é entrada não confiável, validada por esquema Zod antes de virar modelo interno.
- `docs/integracoes.md` documenta o provedor quando estiver identificado (T-006, T-010).
- Os dados demonstrativos locais continuam para o cassino e para o frontend enquanto não houver contrato aprovado, **sempre identificados como demonstrativos**.

**Bloqueio BLQ-001** — provedor não identificado e documentação oficial indisponível. Trava a T-014 (contratos esportivos), a T-015 (adaptador real) e a modelação dos dados esportivos.

**Divergência DIV-001** — esta decisão contradiz documentos de produto que pertencem ao Pedro. Ver [Divergências documentais](#divergências-documentais-abertas). Não foi resolvida neste registo.

**Pendências** — nome do provedor; termos de uso (a exibição é permitida? exige atribuição?); plano e limites; credenciais; forma de atualização das odds; como identificar na interface dados reais de terceiros, que RN-002 e RNF-008 não preveem.

---

### DT-003 — Branches e worktrees separados

- **Data:** 2026-10-26
- **Estado:** aprovada
- **Decidido por:** Pedro
- **Registado por:** `backend`
- **Resolve:** PA-002

**Contexto** — Dois agentes no mesmo diretório partilham o mesmo checkout: trocar de branch numa sessão troca também na outra.

**Decisão**

- Cada agente trabalha na **sua própria branch** e na **sua própria worktree**, com diretórios de trabalho independentes.
- A integração na `main` é **controlada pelo Pedro**.
- Nenhum agente muda a branch de trabalho de outra sessão.
- As worktrees e branches **não são criadas** antes de confirmar o estado do repositório e a sua localização definitiva (DT-007, T-011, T-012).

**Alternativas consideradas** — mesma branch e mesma pasta para os dois: rejeitada, pela interferência entre checkouts e commits intercalados.

**Consequências** — seção 7 de [`docs/agent-protocol.md`](agent-protocol.md) atualizada. Os ficheiros partilhados, sobretudo o lockfile, passam a gerar conflito na integração: tratados pela DT-004.

**Pendências** — nomes das branches e caminhos das worktrees (PA-006); mecanismo de integração na `main`, merge local ou pull request no GitHub (PA-007).

---

### DT-004 — Resolução de conflitos

- **Data:** 2026-10-26
- **Estado:** aprovada
- **Decidido por:** Pedro
- **Registado por:** `backend`
- **Resolve:** PA-003

**Decisão**

- O **dono do ficheiro** resolve os conflitos nos ficheiros que lhe pertencem.
- Conflito em **ficheiro compartilhado** é comunicado no quadro e só tem resolução definitiva depois da **aprovação do Pedro**.
- Proibido: `git stash`, `git reset`, `git rebase` e qualquer operação destrutiva; `git add -A` e `git add .`.
- Quando houver autorização para preparar ficheiros para commit, só `git add` com caminhos explícitos.
- **Nenhum commit sem aprovação explícita do Pedro.**

**Consequências** — seção 7 de [`docs/agent-protocol.md`](agent-protocol.md) atualizada.

---

### DT-005 — Revisão cruzada

- **Data:** 2026-10-26
- **Estado:** aprovada
- **Decidido por:** Pedro
- **Registado por:** `backend`
- **Resolve:** PA-004

**Decisão** — a revisão cruzada é **obrigatória** para mudanças que afetem contratos compartilhados (`packages/contracts/`, [`docs/api-contract.md`](api-contract.md)) ou a integração entre frontend e backend. Antes da integração:

1. O agente que propõe a mudança descreve no quadro o motivo e o impacto.
2. O outro agente verifica a compatibilidade e regista a sua análise no quadro.
3. Os problemas identificados são resolvidos antes da integração.
4. A aprovação final do merge é do Pedro.

A revisão **não** autoriza nenhum agente a editar ficheiros do outro.

**Consequências** — seção 4.5 de [`docs/agent-protocol.md`](agent-protocol.md). Diferente do projeto anterior referido no PA-004: aqui a aprovação do revisor **não** basta para commitar; o commit continua a exigir a aprovação do Pedro (DT-004).

---

### DT-006 — Consulta ao quadro de coordenação

- **Data:** 2026-10-26
- **Estado:** aprovada
- **Decidido por:** Pedro
- **Registado por:** `backend`
- **Resolve:** PA-005

**Decisão** — os dois agentes consultam [`docs/agent-handoff.md`](agent-handoff.md), [`docs/agent-tasks.md`](agent-tasks.md) e o protocolo aplicável **no início de cada sessão**, **antes de iniciar cada tarefa** e **antes de cada commit**. As atualizações são concisas: estado, ficheiros afetados, bloqueios e dependências. Não se presume que as mensagens entre sessões são instantâneas nem que existe comunicação automática.

**Consequências** — seção 3 de [`docs/agent-protocol.md`](agent-protocol.md) atualizada.

---

### DT-007 — Repositório fora do OneDrive

- **Data:** 2026-10-26
- **Estado:** aprovada, execução pendente (T-011)
- **Decidido por:** Pedro
- **Registado por:** `backend`

**Contexto** — O repositório está em `C:\Users\pedro\OneDrive\Documentos\blbet`. A sincronização do OneDrive com `node_modules` e várias worktrees gera tráfego pesado e risco de ficheiros bloqueados.

**Decisão** — mover o repositório para um diretório local fora do OneDrive **antes de instalar dependências**.

**Consequências** — destino recomendado: `C:\Users\pedro\blbet`, que não existia em 2026-10-26; reconfirmar no momento da mudança. O procedimento e os cuidados para preservar o trabalho estão na T-011 de [`docs/agent-tasks.md`](agent-tasks.md). Nenhuma mudança foi executada neste registo.

**Execução (2026-10-26, `backend`)** — cópia integral para `C:\Users\pedro\blbet`, verificada por SHA-256 (39/39 ficheiros), `git status`, `git log`, `git remote -v` e `git fsck`. Backup integral em `C:\Users\pedro\blbet-backup-20261026`. A pasta antiga no OneDrive **não foi apagada** e deixou de ser usada.

---

### DT-008 — Worktrees e versões da fundação

- **Data:** 2026-10-26
- **Estado:** aprovada
- **Decidido por:** Pedro (estrutura e corepack); `backend` (versões, conforme a DT-001: "confirmar na preparação do ambiente")
- **Registado por:** `backend`
- **Resolve:** PA-006

**Decisão**

| Pasta | Branch | Uso |
|---|---|---|
| `C:\Users\pedro\blbet` | `main` | Integração, controlada pelo Pedro |
| `C:\Users\pedro\blbet-backend` | `feat/backend-foundation` | Agente `backend` |
| `C:\Users\pedro\blbet-frontend` | `feat/frontend-foundation` | Agente `frontend` |

Versões fixadas na fundação (estáveis em 2026-10-26, compatíveis com o Node 24.16 instalado): pnpm 12.15.0 via corepack (`packageManager`), Fastify ^5.12.7, Zod ^4.6.7, TypeScript ^7.0.2, Vitest ^5.0.5 (exige Vite ^8.3.5 como peer), tsx ^4.23.15, `@types/node` ^24.19.2 (alinhado com o Node 24, não com a versão 26 mais recente).

**Consequências**

- O `corepack enable` global exige administrador. Por isso o pnpm é ativado na pasta global do npm do utilizador (instruções em `apps/api/README.md`).
- O pnpm 12 bloqueia scripts de instalação por omissão. Aprovar um pacote em `allowBuilds` (`pnpm-workspace.yaml`) é uma alteração de ficheiro partilhado. Hoje só o `esbuild` está aprovado.
- `packages/contracts` exporta o código-fonte TypeScript (`./src/index.ts`), o que serve para Vite, tsx e Vitest. Correr a api compilada com contratos importados vai exigir compilar o pacote ou empacotar a api; a decidir quando a api importar os contratos pela primeira vez (T-014).

---

## Divergências documentais abertas

Conflitos entre documentos, registados em vez de resolvidos em silêncio. Os documentos afetados pertencem ao Pedro ([`docs/agent-protocol.md`](agent-protocol.md), seção 2): os agentes não os editam por iniciativa própria.

| # | Divergência | Documentos afetados | Impacto | Quem resolve |
|---|---|---|---|---|
| **DIV-001** — **requisitos e interface resolvidos pela [DT-013](#dt-013--dados-esportivos-reais-informativos-e-restantes-dados-fictícios) e pela [DT-014](#dt-014--marcar-só-o-dado-fictício-opção-a)** | A DT-002 integra uma API esportiva real. Os requisitos e a visão assumiam que **todo** dado é fictício | Em aberto, só o texto: seções 8 e 9 ([`visao.md`](visao.md)); Fase 4 ([`roadmap.md`](roadmap.md)), que admite provedor real só "em ambiente autorizado de demonstração" e com "autorização formal do provedor" | Documental: visão e roadmap descrevem um produto anterior à DT-002 (ver também DIV-002) | Pedro |
| **DIV-002** | [`roadmap.md`](roadmap.md) desatualizado: "4 de 6 documentos", DP-001 como bloqueio, `decisoes-tecnicas.md` inexistente, Fase 4 a pressupor dados locais antes do provedor | `roadmap.md` | Ordem e estado das fases mostram informação velha | Pedro |
| **DIV-003** | PD-010 de [`requisitos.md`](requisitos.md) diz "depende de `docs/arquitetura.md`"; as ferramentas de teste estão agora definidas na DT-001, mas a cobertura mínima continua aberta | `requisitos.md` | Baixo | Pedro |

---

### DT-009 — Sportsbook API como provedor esportivo de testes

- **Data:** 2026-10-26
- **Estado:** aprovada, **só para desenvolvimento e testes**
- **Decidido por:** Pedro
- **Registado por:** `backend`
- **Resolve:** BLQ-001, em parte

**Contexto** — A DT-002 exige uma API esportiva real desde o início. O Pedro indicou a Sportsbook API, no RapidAPI, para começar com o plano gratuito. A avaliação contra os critérios C1 a C16 está na secção 5 de [`docs/integracoes.md`](integracoes.md), com a fonte de cada resposta.

**Decisão** — usar a Sportsbook API, plano Basic gratuito (150 pedidos/dia), como provedor esportivo **de desenvolvimento e testes**. A adoção para publicação fica para uma decisão posterior.

**Alternativas consideradas** — nenhuma avaliada nesta decisão.

**Consequências**

- A T-014 (modelo e contratos de esportes) pode avançar com base na especificação OpenAPI oficial, depois de confirmar com respostas reais o que a especificação não diz (C5, C7, C13).
- A situação do evento (C6) não vem do provedor: o modelo interno tem de o refletir (secção 5 do `integracoes.md`).
- A cache é obrigatória por causa do limite diário (DP-009).
- As rotas `advantages` (arbitragem, "+EV") **não são usadas** (RN-003).

**Pendências** — C1 e C2 (licença de exibição e uso sem apostas) **bloqueiam a publicação**; C5, C7 e C13 confirmam-se com chamadas reais.

**Cobertura brasileira (C3, PD-004) — decisão do Pedro, 2026-10-27:** a falta do Brasileirão **não bloqueia** o desenvolvimento. Desenvolve-se com as competições disponíveis; quando o produto estiver pronto, o Pedro contrata um provedor pago com o futebol brasileiro e faz-se a troca. Consequência: o modelo interno e os contratos **não podem depender** de chaves, nomes ou formatos da Sportsbook API — tudo passa pelo adaptador (secção 3 do [`integracoes.md`](integracoes.md)).

---

### DT-010 — Âmbito inicial dos dados esportivos

- **Data:** 2026-10-27
- **Estado:** aprovada
- **Decidido por:** Pedro
- **Registado por:** `backend`
- **Resolve:** PD-004, PD-007, número de casas da PC-006

**Contexto** — As chamadas reais à Sportsbook API (secção 5 do [`integracoes.md`](integracoes.md)) mostraram cinco tipos de mercado, odds decimais com precisão variável, até 12 fontes por mercado e nenhuma situação do evento (C6).

**Decisão**

1. **Mercados (PD-004):** só **resultado final** (casa, empate, fora — `MONEYLINE_3WAY`) e **mais/menos golos** (`POINT_TOTAL`), ambos no tempo regulamentar. Ficam de fora: golos por equipa, *handicap*, ambas marcam e mercados de 1.ª parte.
2. **Formato das odds (PD-007, PC-006):** **decimal com 2 casas** (`"1.94"`), sem alternância de formato.
3. **Fontes:** **uma odd por resultado, de uma fonte fixa** escolhida no backend. Não se mostram várias casas nem qual paga melhor (RN-003).
4. **Situação do evento:** só **jogos futuros**. Um jogo deixa de aparecer quando começa.

**Alternativas consideradas** — mostrar todos os mercados; mostrar todas as fontes ou um valor agregado; mostrar jogos em curso sem placar. Rejeitadas pelo Pedro.

**Consequências**

- A situação do evento (A4) tem, por agora, um único valor: `scheduled`. Valores novos entram como mudança compatível (PC-014).
- A fonte fixa é configuração do backend e **não** vai no contrato. Se a fonte não tiver odd para um resultado, o valor é `null` (A5).
- O frontend não precisa de lógica de escolha de casa nem de comparação de odds.

---

### DT-012 — Competições e frequência de atualização no plano gratuito

- **Data:** 2026-10-27
- **Estado:** aprovada, **enquanto se usa o plano gratuito** da Sportsbook API (DT-009)
- **Decidido por:** Pedro
- **Registado por:** `backend` (número reservado no quadro, ver DT-011 do `frontend`)
- **Resolve:** DP-009, para esta fase

**Contexto** — O plano gratuito permite 150 pedidos por dia. Uma chamada por competição traz os eventos e as odds.

**Decisão** — Três competições: **Premier League** (`EPL`), **La Liga** (`LA_LIGA`) e **Serie A** (`SERIE_A`). Cada uma é atualizada no máximo **uma vez por hora**, e só quando há um pedido (cache em memória). A lista de competições é atualizada uma vez por dia. Teto: 3 × 24 + 1 = **73 pedidos/dia**.

**Consequências**

- Odds com até 1 hora de atraso. Aceitável para um protótipo sem apostas.
- Se o provedor falhar e houver dados em cache, servem-se os dados antigos; sem cache, a rota dá `503 UPSTREAM_UNAVAILABLE`.
- A fonte fixa da DT-010 é `BET_PARX` (cobertura completa de 1X2 e mais/menos na amostra), configurável.
- Competições, frequência e fonte são variáveis de ambiente. Com o plano pago, sobem sem mudar código.

---

### DT-013 — Dados esportivos reais informativos e restantes dados fictícios

- **Data:** 2026-10-27
- **Estado:** aprovada
- **Decidido por:** Pedro
- **Registado por:** `backend`
- **Resolve:** DIV-001, em parte (RN-002, RF-003, CA-003.4)

**Contexto** — Com a T-015, as cotações esportivas vêm da Sportsbook API (DT-002, DT-009). A faixa permanente da interface dizia "Todos os valores exibidos são fictícios", o que deixou de ser verdade. O `frontend` reescreveu a faixa ao ligar as telas às rotas reais e pediu a decisão do Pedro.

**Decisão** — o Pedro aceitou a nova redação da faixa:

> **Plataforma demonstrativa.** Não há apostas, depósitos, saques nem pagamentos. As cotações esportivas vêm de uma fonte externa e são meramente informativas; o cassino e os restantes valores são fictícios.

A RN-002 passa a ter esta regra: **os dados esportivos (eventos, competições e cotações) vêm de fonte externa real e são só informativos; o cassino e todos os restantes valores são fictícios**. Mantêm-se a RN-001, a RN-003 e a RN-004: não há apostas, transações nem jogos executáveis.

**Alternativas consideradas** — manter "todos os valores são fictícios" (falso desde a T-015).

**Consequências**

- `requisitos.md`: RN-002, RF-003 e CA-003.4 com a nova redação.
- O `frontend` commita a faixa com a ligação às rotas reais.
- A RNF-008 continua a valer para os dados fictícios.

**Pendências** — a marcação item a item (opções A/B do `design-system.md`, DP-004, PC-010) continua aberta; a interface usa a opção A por agora, só com a marca do dado fictício. As secções 8 e 9 do `visao.md` e a Fase 4 do `roadmap.md` continuam desatualizadas (DIV-001, DIV-002). C1 e C2 da DT-009 (licença de exibição) continuam a bloquear a publicação. *(Marcação resolvida pela DT-014.)*

---

### DT-014 — Marcar só o dado fictício (opção A)

- **Data:** 2026-10-27
- **Estado:** aprovada
- **Decidido por:** Pedro
- **Registado por:** `backend`
- **Resolve:** DIV-001 (marcação na interface), DP-004, PC-010 (apresentação)

**Contexto** — O §7 do [`design-system.md`](design-system.md) propõe duas formas de distinguir dado real de dado fictício: **A**, marcar só o fictício (contorno tracejado, §6), e **B**, marcar os dois, com um selo `● ao vivo · <fonte>` no real. A interface já usa a A, de forma provisória.

**Decisão** — **opção A.** O dado fictício leva a marca demonstrativa, e o dado real de terceiros não leva selo. A faixa permanente (DT-013) declara de que tipo é cada área: esportes vêm de uma fonte externa e são informativos; cassino e perfil são fictícios.

**Alternativas consideradas** — **opção B**, rejeitada por agora:
- o selo "ao vivo" seria falso, porque as odds podem ter até 1 hora de atraso (cache da DT-012);
- o nome da fonte seria o de um provedor só de testes (DT-009), que vai ser trocado;
- acrescentaria ruído em listagens densas e no mobile.

**Consequências**

- Fica decidido o componente de procedência do `frontend`: a variante `demonstrativo` é a única que existe.
- O `origin` (A8) continua obrigatório no contrato e serve para decidir a marca. Não muda nada no contrato.
- A RNF-008 continua satisfeita: o dado fictício está sempre marcado da mesma forma.
- O §7 do `design-system.md` (do `frontend`) passa a registar a opção escolhida.

**Pendências** — se os termos do provedor final exigirem atribuição (C1, C2), essa atribuição entra como texto de fonte no rodapé do bloco, previsto na própria opção A. Quando o provedor for definitivo, pode propor-se ao contrato um campo de atualização ("cotações às HH:MM").

---

### DT-015 — Qualidade: cobertura, integração contínua, lint e E2E

- **Data:** 2026-10-27
- **Estado:** aprovada
- **Decidido por:** Pedro
- **Registado por:** `backend`
- **Resolve:** DP-002 (cobertura mínima), DP-003, PA-008

**Contexto** — Arranque da Fase 5 do [`roadmap.md`](roadmap.md). As ferramentas de teste vinham da DT-001, mas faltavam a meta de cobertura, a integração contínua, o lint e um dono para os testes E2E.

**Decisão**

1. **Cobertura (DP-002):** mínimo de **80%** de linhas, instruções, funções e ramos em cada pacote (`apps/api`, `apps/web`, `packages/contracts`), medido com `@vitest/coverage-v8`. Abaixo disso, `pnpm coverage` falha.
2. **Integração contínua (DP-003):** **GitHub Actions** em cada push e PR. Corre install com o lockfile congelado, typecheck, lint, testes com cobertura e build.
3. **Lint:** **ESLint na raiz**, com `typescript-eslint` partilhado pelos pacotes e regras de React em `apps/web`.
4. **E2E (PA-008):** Playwright em `e2e/` na raiz, **dono `frontend`**. O `backend` dá à api um modo de teste com respostas reais gravadas, para os E2E não gastarem a quota do provedor.

**Alternativas consideradas** — 70% de cobertura, ou só medir; nenhuma CI; nenhum lint; E2E do `backend` ou partilhados. Rejeitadas pelo Pedro.

**Consequências**

- A raiz (`.github/`, configuração do ESLint, `package.json`) é partilhada: avisa-se no quadro antes de mexer, e cada mudança vai num commit isolado.
- Cada agente põe a meta de cobertura no seu pacote. Exclusões só com justificação no próprio ficheiro de configuração.
- A T-007 fica concluída.
