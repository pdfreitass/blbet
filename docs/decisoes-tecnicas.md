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
| [DT-011](#dt-011--tema-escuro-único-com-tokens-semânticos) | Tema escuro único nesta fase, com tokens semânticos para um tema claro posterior | decisão de tema do `design-system.md` | aprovada |
| [DT-012](#dt-012--competições-e-frequência-de-atualização-no-plano-gratuito) | Premier League, La Liga e Serie A, atualizadas de hora em hora | DP-009 | aprovada, só no plano gratuito |
| [DT-013](#dt-013--dados-esportivos-reais-informativos-e-restantes-dados-fictícios) | Cotações esportivas reais e informativas; cassino e restantes valores fictícios. Nova redação da RN-002 | DIV-001 em parte | aprovada |
| [DT-014](#dt-014--marcar-só-o-dado-fictício-opção-a) | Marcar só o dado fictício (opção A do `design-system.md`); o dado real não leva selo | DIV-001 (interface), DP-004, PC-010 | aprovada |
| [DT-015](#dt-015--qualidade-cobertura-integração-contínua-lint-e-e2e) | Cobertura mínima de 80%, GitHub Actions, ESLint na raiz, E2E do `frontend` em `e2e/` | DP-002, DP-003, PA-008 | aprovada |
| [DT-016](#dt-016--wouter-como-biblioteca-de-rotas-do-frontend) | `wouter` como biblioteca de rotas de `apps/web/`; esquema de endereços e fallback para `index.html` | roteamento (RF-002, RF-004) | aprovada |
| [DT-017](#dt-017--estratégia-de-estado-da-interface) | Navegação no endereço, dados do servidor em hooks próprios, Context só para o partilhado, mais cache curto de 30 s | DP-005 | aprovada |
| [DT-018](#dt-018--modo-de-teste-da-api-com-respostas-gravadas) | Modo de teste da api com respostas gravadas e relógio parado, para os E2E | DT-015 (etapa 4), PA-008 | aprovada |
| [DT-019](#dt-019--limite-de-pedidos-na-api-e-teto-do-cursor) | Limite de pedidos por cliente (`@fastify/rate-limit`) e teto de 1024 caracteres no cursor | S-1 e S-2 da revisão de segurança (RNF-004) | aprovada |
| [DT-020](#dt-020--contas-de-utilizador-e-autenticação-mudança-de-escopo) | O blbet passa a ter contas reais: cadastro, autenticação, sessões e auditoria. **Revê a RN-006**; RN-001 e RN-007 ficam | Pedido do Pedro, 2026-10-28 | aprovada |
| [DT-021](#dt-021--persistência-sqlite-agora-postgresql-em-produção) | Persistência relacional com migrações versionadas, atrás de uma costura de repositório | DT-020 | aprovada |
| [DT-022](#dt-022--caminhos-dos-ecrãs-de-conta-na-interface) | Os ecrãs de conta vivem em `/conta/…`, sem sexto destino na navegação; dois caminhos são os que a api já envia por e-mail | DT-016, DT-020 | aprovada |

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

### DT-011 — Tema escuro único, com tokens semânticos

- **Data:** 2026-10-27
- **Estado:** aprovada
- **Decidido por:** Pedro
- **Registado por:** `frontend`
- **Resolve:** a decisão de tema proposta na secção 2 do [`design-system.md`](design-system.md)

**Contexto** — A secção 2 do `design-system.md` propôs, na T-005, um tema escuro único em vez de dois temas. O Pedro aprovou a direção visual em 2026-10-26 e a decisão de tema em 2026-10-27, comunicada pelo `backend` no quadro. Fica registada aqui porque uma decisão aprovada que vive só num documento de desenho não é encontrável por quem procura decisões.

**Decisão** — **tema escuro como tema canónico e único nesta fase.** As custom properties são declaradas em `:root` com `color-scheme: dark`. Os nomes dos tokens são **semânticos** (`surface-raised`, `text-secondary`), não literais (`cinza-900`), precisamente para que um tema claro posterior seja uma redefinição de valores sob um seletor, sem tocar em componente nenhum.

**Alternativas consideradas** — dois temas desde o início, rejeitada por três razões registadas na secção 2:

- dois temas **duplicam a verificação**: cada par de cor tem de ser recalculado contra a WCAG 2.2 AA e cada tela revista duas vezes;
- **nenhum requisito pede tema claro.** A RNF-002 pede contraste, não escolha de tema;
- a **PD-002** (público-alvo) está aberta, e sem saber os dispositivos e as condições de acesso predominantes, prometer dois temas é escolher sem informação.

**Consequências**

- Os 28 pares de contraste calculados na secção 4 do `design-system.md` continuam a ser o conjunto a verificar; não duplicam.
- Acrescentar um tema claro passa a ser redefinir valores sob `[data-theme="light"]`, mais `prefers-color-scheme` se for decidido. É a razão técnica de a nomenclatura ser semântica.
- Nenhum componente lê valor literal de cor — já é regra da secção 5 do `design-system.md` e está verificada por varredura a cada entrega.

**Pendências** — se a **PD-002** vier a mostrar acesso predominantemente diurno em ambiente claro, o tema claro entra e esta decisão é revista. O risco está registado como R2 na secção 10 do `design-system.md`.

**Nota de numeração** — esta decisão foi reservada como DT-009 na T-005 e depois renumerada para DT-010, porque o `backend` usou ambos os números entretanto (provedor esportivo e âmbito dos dados esportivos). Ficou em **DT-011**. Para evitar uma terceira colisão, está proposto no quadro que o número seja reservado aí antes de ser usado.

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

---

### DT-016 — `wouter` como biblioteca de rotas do frontend

- **Data:** 2026-10-27
- **Estado:** aprovada
- **Decidido por:** Pedro
- **Registado por:** `frontend`
- **Resolve:** o roteamento de `apps/web/`, necessário para as telas de detalhe (RF-002, RF-004)

**Contexto** — Até aqui o destino ativo era estado local em `App.tsx`, sem URL. Isso tem três consequências que se tornam graves com telas de detalhe: o botão (e o gesto) "voltar" do navegador **sai da aplicação**, recarregar a página volta ao início, e nenhum ecrã é endereçável. A visão exige caminhos percorríveis "sem becos sem saída", e um "voltar" que fecha o produto é exatamente isso. Nenhum requisito pede URL partilhável e o `index.html` leva `noindex`, por isso não há argumento de SEO: o que decidiu foi o comportamento do histórico, sobretudo em mobile (RNF-001).

**Decisão** — usar **`wouter`** (versão `3.13.0`, publicada em 2026-09-30; licença Unlicense; sem dependências próprias). A proposta com as quatro opções está no quadro, no registo do `frontend` de 2026-10-27.

**Alternativas consideradas**

- **History API à mão**, sem dependência: defensável, e era a alternativa. Rejeitada porque a parte difícil não é emparelhar caminhos — é sincronizar o histórico com o React sem perder eventos, tratar `popstate`, cliques com tecla modificadora e reposição de rolagem. Seria código próprio a manter numa área onde é fácil errar em silêncio.
- **`react-router`**: 17 a 30 kB comprimidos num pacote de ~100 kB, por funcionalidades que este produto não usa (carregadores de dados, rotas aninhadas profundas). Rejeitada pela proporção.
- **Manter o estado local**: não resolve nenhuma das três consequências. Recomendada a recusa, e recusada.

**Consequências**

- Custo no pacote: **~1,5 kB** comprimido, menos de 1,5 % do total.
- **Risco aceite:** o `wouter` tem um só mantenedor. Mitigação: a superfície usada são três ou quatro hooks, a licença é de domínio público, e substituí-lo é trabalho contido.
- O esquema de endereços passa a ser: `/` (esportes), `/eventos/:id`, `/cassino`, `/cassino/:id`, `/busca?q=…`, `/favoritos`, `/perfil`. O termo de busca em `?q=` espelha o parâmetro do contrato (regra A7), e recarregar mantém a busca.
- **Publicação:** o servidor que servir o `dist` tem de devolver `index.html` em qualquer caminho. Em desenvolvimento o Vite já o faz; em produção é configuração de quem publicar, e fica registado aqui para não ser descoberto no primeiro deploy.
- O `404` com `issue: 'event_started'` (T14-A1) passa a ter ecrã onde aparecer: o detalhe de um evento que começou entre a listagem e o clique.

**Pendências** — nenhuma para esta decisão. A **CA-002.3** ("o detalhe exibe os mesmos dados da listagem, sem divergência") depende de `GET /api/events/{id}` e `GET /api/events` servirem o mesmo conteúdo; está pedida confirmação ao `backend` no quadro.

---

### DT-017 — Estratégia de estado da interface

- **Data:** 2026-10-27
- **Estado:** aprovada
- **Decidido por:** Pedro
- **Registado por:** `frontend`
- **Resolve:** DP-005

**Contexto** — A estratégia de estado de `apps/web/` foi-se formando entrega a entrega e nunca foi registada. O instinto inicial era instalar uma biblioteca de estado de servidor (TanStack Query, SWR) por causa do limite de 150 pedidos/dia do plano gratuito. **Verificou-se que esse limite é do `backend` para o provedor, não do `frontend` para o `backend`:** a DT-012 põe cache em memória no servidor, com teto de 73 pedidos/dia, e esse teto não muda por muitas vezes que a interface chame `/api/events`. O argumento mais forte para uma biblioteca de cache no cliente não se aplica a este projeto.

**Decisão** — cada tipo de estado tem um lugar, e é este:

| Tipo | Onde vive | Exemplos |
|---|---|---|
| **Navegação** | O endereço (DT-015) | Tela ativa, id do evento, termo da busca em `?q=` |
| **Dados do servidor** | `useRecurso` e `useListaPaginada`, em `shared/api/` | Eventos, detalhe de evento |
| **Partilhado entre telas** | Context, em `shared/` | Favoritos |
| **Local de um componente** | `useState` | Filtro de categoria, texto do campo de busca |

Mais um **cache em memória de validade curta** (30 s) em `shared/api/cache.ts`, com chave igual ao caminho pedido. Sem dependência. Guarda só respostas bem sucedidas e válidas, e **é ignorado quando o utilizador pede explicitamente para recarregar** — "Tentar novamente", ou a lista a recomeçar depois de um cursor obsoleto —, porque aí servir o cache daria a mesma resposta e o pedido pareceria não ter feito nada.

**Regras que acompanham a decisão**

- **Context só para o que é lido em muitos sítios e muda pouco.** Hoje é só os favoritos. Isto impede que o Context se torne o depósito de tudo, que é como ele costuma estragar o desempenho.
- **Tudo o que faça sentido guardar, partilhar ou recuperar ao recarregar vive no endereço**, não em estado de componente.
- Nenhum dado do servidor é copiado para estado de cliente.

**Alternativas consideradas**

- **TanStack Query** ou **SWR**: rejeitadas por agora. Trazem invalidação por mutação, atualização otimista e revalidação — e este produto **não escreve nada no servidor** (RN-001, RN-004), com os favoritos a serem locais (RN-005). Seria pagar por metade de uma biblioteca que não se usa.
- **Um estado global caseiro** (Zustand-like, ou um Context grande): rejeitado. Não há estado de cliente partilhado para além dos favoritos, e um depósito global atrairia estado que pertence ao endereço.

**Consequências**

- `shared/api/` passa a ser o único sítio que fala com a api: nenhum componente chama `fetch`.
- O cache vive só na memória da página; recarregar limpa-o, e é isso que se quer.
- Nos testes, o cache tem de ser limpo entre casos — vive num módulo e sobreviveria de um teste para o seguinte. Está no `setup.ts`.

**Quando esta decisão deixa de servir** — qualquer um destes sinais justifica reavaliar, e aí a candidata é o TanStack Query ou o SWR, não um estado global caseiro:

- aparecerem **mutações** (escrever no servidor), que trazem invalidação e atualização otimista;
- for preciso **revalidar ao voltar à janela** ou em intervalo;
- o mesmo dado do servidor passar a ser lido por **telas distantes ao mesmo tempo**, com necessidade de sincronia;
- o número de hooks de dados passar de **uma dúzia**.

**Pendências** — nenhuma. A correção da dependência cruzada que esta análise descobriu (a tela de favoritos importava de dois domínios, contra a secção 3 do [`arquitetura.md`](arquitetura.md)) foi feita na mesma entrega: a tela passou para `app/`, que é a casca e cujo papel é compor domínios.

**Nota de numeração** — esta decisão foi registada como DT-016 e renumerada para **DT-017** ao integrar a `main`: o `backend` tinha entretanto usado o DT-015 (qualidade) e o DT-016 passou a ser o roteamento. **Foi a terceira colisão de numeração entre os dois agentes.** A partir daqui, o número é **reservado no quadro antes de ser escrito aqui**.

---

### DT-018 — Modo de teste da api com respostas gravadas

- **Data:** 2026-10-28
- **Estado:** aprovada
- **Decidido por:** `backend`, dentro da etapa 4 da DT-015 já aprovada pelo Pedro
- **Registado por:** `backend` (número reservado no quadro: o `frontend` deixou DT-018 como próximo livre)
- **Resolve:** a dependência dos E2E (PA-008, DT-015) em relação ao provedor real

**Contexto** — Os testes end-to-end são do `frontend` e correm contra a api a sério. Sem alternativa ao provedor, só havia dois caminhos, ambos maus: correr com a chave real, gastando a quota de 150 pedidos/dia do plano gratuito (DT-009) e dependendo de jogos que mudam todos os dias; ou correr sem chave, contra `503`, que só exercita o estado de erro. A api já tinha a costura certa para uma terceira via: o catálogo recebe um `SportsProvider` por injeção, e os testes do `backend` já o substituíam por uma versão em memória.

**Decisão** — a api ganha `SPORTS_MODE`, com dois valores:

| Valor | Comportamento |
|---|---|
| `live` (omissão) | Chama a Sportsbook API. Sem `SPORTS_PROVIDER_API_KEY`, as rotas de esportes dão `503` |
| `recorded` | Serve as respostas gravadas de `apps/api/recordings/`. Não precisa de chave e não faz nenhuma chamada de rede |

Acompanham a decisão:

- **As gravações são respostas reais do provedor, reduzidas.** Nenhuma é inventada, e os dados que saem continuam marcados com `origin: "provider"`, porque é o que são. Isto cumpre a regra do `CLAUDE.md` de não criar chamadas fictícias que se apresentem como reais.
- **O relógio fica parado** no `recordedAt` da gravação. Sem isso, os jogos gravados passariam a "já começados" com o avançar do calendário e as listas esvaziavam-se, porque a DT-010 só mostra jogos futuros. Parar o relógio também impede a cache de expirar: a mesma resposta, sempre.
- **`SPORTS_NOW`** escolhe outro instante. É assim que os E2E alcançam o jogo que já começou — fora da lista e com `404 event_started` no detalhe —, que de outro modo seria inalcançável.
- **A gravação é validada no arranque** pelos mesmos esquemas Zod das respostas reais. Gravação malformada é arranque recusado, com o nome do ficheiro, e nunca uma resposta silenciosamente errada.
- As gravações passam a ser **a única cópia** destes exemplos: os testes do `backend` que antes liam `test/fixtures/` leem agora `recordings/`.

**Alternativas consideradas**

- **Um servidor falso à parte** (MSW, WireMock): rejeitado. Traz dependência nova e um segundo sítio onde a forma das respostas tem de ser mantida a par do provedor.
- **Reescrever as datas das gravações** para as manter sempre no futuro: rejeitado. Alteraria dados gravados, e um dado alterado deixa de ser uma gravação fiel. Parar o relógio obtém o mesmo efeito sem mentir sobre o conteúdo.
- **Semear a cache diretamente**, saltando o provedor: rejeitado. Deixaria o adaptador e a validação por exercitar, que é justamente a parte que os E2E devem atravessar.

**Consequências**

- Os E2E correm sem chave, sem rede e sem gastar quota, e são determinísticos.
- A gravação vale também para desenvolvimento do `frontend` sem consumir quota.
- **A gravação cobre hoje só a `EPL`, com dois jogos** — é o que existe gravado no repositório. Acrescentar competições exige gravar respostas reais com a chave; o formato está preparado (`events-<NOME>.json` mais uma linha no manifesto).
- `SPORTS_MODE=recorded` nunca deve ser usado em publicação. Não há salvaguarda no código a impedi-lo: o modo é explícito e o arranque regista um aviso.

**Pendências** — gravar mais competições e mais jogos quando houver uma sessão com a chave, se os E2E precisarem de mais do que dois jogos.

---

### DT-019 — Limite de pedidos na api e teto do cursor

- **Data:** 2026-10-28
- **Estado:** aprovada
- **Decidido por:** Pedro (mandou avançar com o S-1 e o S-2); `backend` nos valores concretos
- **Registado por:** `backend` (número reservado no quadro)
- **Resolve:** S-1 e S-2 da revisão de segurança de 2026-10-27 (RNF-004)

**Contexto** — A revisão de segurança da api não encontrou nada crítico, mas deixou dois achados. O **S-1 (médio)**: a api não tinha limite de pedidos por cliente. A cache da DT-012 protege a quota do provedor, não a api — um cliente só, em ciclo, sobrecarrega-a sem nunca tocar no provedor. O **S-2 (baixo)**: o `cursor` de `eventsQuerySchema` não tinha tamanho máximo e ia direto a `JSON.parse`.

**Decisão — S-1: limite de pedidos**

`@fastify/rate-limit` 11.2.1, registado na app, com duas variáveis:

| Variável | Omissão | Papel |
|---|---|---|
| `RATE_LIMIT_MAX` | `300` | pedidos por janela e por cliente; `0` desliga |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` | duração da janela |

- O `429` sai no **envelope da PC-001**, com `retryable: true`. Conseguido lançando o `AppError` que já existia, em vez de acrescentar um caminho de erro novo: o plugin lança o que o `errorResponseBuilder` devolver, e um `AppError` cai no tratamento normal.
- As respostas trazem `x-ratelimit-limit`, `x-ratelimit-remaining` e `x-ratelimit-reset` (acrescento A9 do contrato, anunciado no quadro).
- **`RATE_LIMIT_MAX=0` desliga o limite**, e é o que os E2E devem usar. Sem esta saída, um limite apertado tornaria os E2E intermitentes — falhariam por `429` e não por defeito do produto.
- O limite é **global**, incluindo `/health`. Com 300 por minuto, nenhuma sonda razoável se aproxima disso.

**Decisão — S-2: teto do cursor**

`cursor` passa a ter `.max(MAX_CURSOR_LENGTH)`, com `MAX_CURSOR_LENGTH = 1024`.

**O `.max(256)` que a própria revisão propôs estava errado, e medir mostrou-o:** o cursor é a codificação em base64url dos filtros que o emitiram, e como `q` admite 100 unidades UTF-16, o pior caso medido é **272 caracteres com texto latino e 539 com CJK** (3 bytes por caractere). 256 teria recusado cursores legítimos emitidos pela própria api. 1024 cobre o pior caso com folga e continua a travar uma entrada arbitrariamente grande. Um cursor acima do teto dá `400` com `issue: "too_big"`, antes de ser descodificado.

**Alternativas consideradas**

- **S-1 sem dependência**, com um contador caseiro: rejeitado. Limitar pedidos tem detalhes que se acertam mal à primeira — janelas deslizantes, chave por IP com IPv6, cabeçalhos padronizados — e o plugin oficial do Fastify trata-os.
- **Limitar só as rotas de esportes**: rejeitado por agora. O custo de defender também `/health` é nulo, e a regra única é mais fácil de raciocinar.
- **Derivar o teto do cursor dos limites do esquema**, em vez de uma constante: rejeitado. Daria uma expressão difícil de ler para proteger contra um caso que a medição já cobre com folga.

**Consequências**

- **`pnpm-lock.yaml` mudou** (ficheiro partilhado): +30 linhas, só acrescentos, 4 pacotes novos — `@fastify/rate-limit`, `@lukeed/ms`, `toad-cache` e dependências diretas suas. Nenhuma entrada existente foi alterada. Anunciado no quadro.
- **`packages/contracts` mudou**, logo exige **revisão cruzada do `frontend`** (DT-005). A mudança é apertar um limite, não mudar uma forma: nenhum cursor que a api emita é afetado.
- O S-3 da revisão (cabeçalhos de segurança e CORS) **continua aberto**, ligado à plataforma de publicação (DP-008).

**Pendências** — revisão cruzada do `frontend` à mudança em `packages/contracts`; e, antes de publicar, decidir se o limite por omissão serve para o tráfego real, que hoje ninguém conhece.

~~O S-3 continua aberto.~~ **Fechado pela DT-020**, que trouxe os cabeçalhos de segurança e o CORS restrito sem esperar pela DP-008: a lista de origens é configuração, não decisão de arquitetura.

---

### DT-020 — Contas de utilizador e autenticação (mudança de escopo)

- **Data:** 2026-10-28
- **Estado:** aprovada
- **Decidido por:** **Pedro**, 2026-10-28, autorizando expressamente a mudança de escopo depois de lhe ser apresentada a colisão com as regras em vigor
- **Registado por:** `backend`
- **Revê:** **RN-006** do `requisitos.md` e a secção "Natureza do projeto" do `CLAUDE.md`. **RN-001 (sem transações financeiras) e RN-007 (nada que dependa de autorização regulatória) continuam em vigor** — esta decisão cria contas, não dinheiro

**Contexto** — Até aqui o blbet era, por decisão registada, um protótipo demonstrativo: a **RN-006** dizia textualmente "não há autenticação real, cadastro, coleta de dados pessoais verdadeiros, KYC ou verificação de identidade", a **RN-001** proibia qualquer operação financeira e a **RN-007** excluía tudo o que dependesse de autorização regulatória. Nenhum requisito funcional de RF-001 a RF-008 menciona contas. O Pedro pediu um backend de autenticação e segurança; essa colisão foi-lhe apresentada por escrito, com as regras citadas, e ele autorizou a mudança.

**Decisão** — O blbet passa a ter **contas reais**, com o que isso implica em proteção de dados. O que entra **agora**:

| Entrega | Estado |
|---|---|
| Cadastro com validação no servidor e senha em Argon2id | feito |
| Verificação de e-mail, com token de uso único | feito |
| Entrada e saída, com sessão em cookie `HttpOnly`, `Secure`, `SameSite=Strict` | feito |
| Expiração por inatividade **e** teto absoluto da sessão | feito |
| Lista e revogação de sessões, uma a uma ou todas as outras | feito |
| Recuperação e redefinição de senha, que derruba todas as sessões | feito |
| Alteração de senha com reautenticação | feito |
| Travão progressivo por conta e por origem, e limite próprio nas rotas de autenticação | feito |
| Proteção contra enumeração de contas, com respostas genéricas | feito |
| Registo de eventos de segurança, sem segredos nem dados pessoais em claro | feito |
| Cabeçalhos de segurança, CORS restrito e teto do corpo do pedido (fecha o **S-3**) | feito |

O que **fica de fora, e porquê**:

- **MFA, carteira, depósitos, saques, KYC e jogo responsável com efeito operacional.** Nada disto é a mesma fase. A **RN-007** não é revogada por esta decisão: continua a valer para tudo o que dependa de licenciamento. Dinheiro real exige decisão própria, aqui registada, e é anterior ao código.
- **Provedor de e-mail.** Não há nenhum escolhido. A api define a costura (`Mailer`) e, fora de produção, escreve a mensagem na saída; **em produção recusa enviar**, para não fingir que enviou. Escolher o provedor é decisão em aberto.

**Alternativas consideradas**

- **Token assinado (JWT) em vez de sessão na base de dados**: rejeitado. Revogar um token assinado obriga a manter na mesma uma lista do lado do servidor, o que anula a vantagem; e o requisito de "revogação de sessões" e de "invalidar sessões após eventos críticos" é central aqui. Um token opaco, cuja verdade está na base de dados, revoga-se apagando uma linha.
- **Token no corpo da resposta, guardado pela interface**: rejeitado. Qualquer XSS passaria a valer a conta. O cookie `HttpOnly` não é legível por JavaScript.
- **Responder `409` a um cadastro com e-mail repetido**: rejeitado. É a forma mais comum de descobrir quem tem conta numa plataforma. A resposta é a mesma; quem é dono do endereço recebe aviso por e-mail.
- **`scrypt` do `node:crypto`, sem dependência nova**: rejeitado. O pedido do Pedro nomeia Argon2id, e o `@node-rs/argon2` traz binários pré-compilados — não há passo de compilação no Windows.

**Consequências**

- **`packages/contracts` mudou:** dois códigos de erro novos (`UNAUTHENTICATED` 401, `FORBIDDEN` 403) e o módulo `accounts.ts`. **Exige revisão cruzada do `frontend`** (DT-005).
- **O `apps/web` deixou de compilar** por causa disso: `MENSAGEM_POR_CODIGO`, em `apps/web/src/shared/api/erros.ts`, é exaustivo sobre `ErrorCode` e passa a faltar-lhe duas entradas. É ficheiro do `frontend` e **não foi alterado pelo `backend`**; o pedido está no quadro.
- **`pnpm-lock.yaml` mudou** (ficheiro partilhado): `@node-rs/argon2`, `@fastify/cookie`, `@fastify/cors`, `@fastify/helmet`.
- **O `CLAUDE.md` ficou desatualizado** na secção "Natureza do projeto". É ficheiro do Pedro e não foi alterado.
- **Passa a haver dados pessoais.** A LGPD aplica-se a partir de agora: só `accounts` guarda dado pessoal, para a eliminação ser localizada; endereços IP são guardados em resumo com segredo; senhas e tokens nunca aparecem em log.

**Pendências** — escrever os requisitos funcionais das contas, que não existem (RF-001 a RF-008 não os cobrem); escolher o provedor de e-mail; MFA; e a decisão separada, com parecer próprio, antes de qualquer funcionalidade financeira.

---

### DT-021 — Persistência: SQLite agora, PostgreSQL em produção

- **Data:** 2026-10-28
- **Estado:** aprovada
- **Decidido por:** `backend`, dentro da autorização da DT-020
- **Registado por:** `backend`
- **Resolve:** a parte da **DP-009** que faltava — até aqui não havia base de dados nenhuma

**Contexto** — O `arquitetura.md` dizia "nenhum banco de dados definido". Contas sem persistência durável não existem. Foi recomendado PostgreSQL ao Pedro e ele aprovou; mas o PostgreSQL exige um servidor que esta máquina não tem, e esperar por isso deixaria a DT-020 sem nada entregue.

**Decisão** — **Uma costura de repositório** (`AccountsRepository`), que o serviço consome e que é a única coisa que sabe SQL. Por trás dela, **SQLite pela biblioteca `node:sqlite` que vem com o Node 24**: sem dependência nova, sem servidor, e a correr em Windows. Migrações **versionadas e imutáveis**, cada uma numa transação; uma migração aplicada nunca é editada.

**Isto não é a escolha de produção.** O destino continua a ser **PostgreSQL**, e a costura existe exatamente para que a troca não toque no serviço nem nas rotas. O que muda é só a implementação do repositório.

**Alternativas consideradas**

- **PostgreSQL já**: adiado, não rejeitado. Exige um servidor a instalar e configurar antes de existir uma linha de código de contas.
- **Um ORM (Prisma, Drizzle)**: rejeitado por agora. Traria gerador, esquema próprio e um passo de build, para sete tabelas que cabem em SQL simples. A costura deixa a porta aberta.
- **Guardar as sessões em memória**: rejeitado. Morreriam a cada reinício e não sobreviveriam a mais de um processo.

**Consequências**

- `node:sqlite` ainda é marcado como experimental pelo Node: pode emitir aviso no arranque e a sua API pode mudar numa versão maior.
- O SQLite escreve um ficheiro só: não serve para mais de uma instância da api a escrever ao mesmo tempo. Enquanto for uma, chega.

**Pendências** — portar o repositório para PostgreSQL antes de publicar, e decidir onde a base de dados vive (ligado à DP-008).

---

### DT-022 — Caminhos dos ecrãs de conta na interface

- **Data:** 2026-10-28
- **Estado:** aprovada
- **Decidido por:** `frontend`, dentro da sua área (`apps/web/`), sobre caminhos que a api já tinha fixado
- **Registado por:** `frontend`
- **Depende de:** [DT-016](#dt-016--roteamento-com-wouter) (roteamento) e [DT-020](#dt-020--contas-de-utilizador-e-autenticação-mudança-de-escopo)

**Contexto** — A DT-020 trouxe contas reais e sete ecrãs novos à interface. Duas coisas tinham de ser decididas antes de os escrever: onde é que esses ecrãs vivem no endereço, e se passam a ser um destino da navegação principal.

A segunda pergunta já tinha resposta no `requisitos.md`: **RF-001 e CA-001.2 fixam cinco destinos**, e esse documento é do Pedro. Acrescentar um sexto por iniciativa do `frontend` seria mudar um requisito sem decisão dele.

A primeira tinha uma resposta que não era minha: a api **já constrói os links dos e-mails** em `accounts-service.ts`, sobre `PUBLIC_URL`, como `${PUBLIC_URL}/conta/verificar?token=…` e `${PUBLIC_URL}/conta/nova-senha?token=…`. São caminhos da **interface**, escolhidos pelo `backend`, e nunca entraram no `api-contract.md`.

**Decisão**

1. **Os ecrãs de conta vivem em `/conta/…`, e não são um sexto destino.** São sete: `/conta/entrar`, `/conta/criar`, `/conta/verificar`, `/conta/recuperar`, `/conta/nova-senha`, `/conta/alterar-senha` e `/conta/dispositivos`.
2. **`/conta/verificar` e `/conta/nova-senha` são os caminhos que a api já envia**, letra por letra. Não são escolha do `frontend` e **não podem ser mudados de um lado só**: mudá-los parte todos os e-mails já enviados.
3. **O destino Perfil marca-se como ativo em `/conta`**, além de `/perfil` — tal como Esportes já cobria `/eventos/:id`. Sem isto, entrar na conta apagava a marca e a navegação ficava sem destino ativo.
4. **O resumo da conta real fica no topo de `/perfil`, acima do perfil demonstrativo de RF-007, que não é tocado.** O que está em cima é dado verdadeiro de quem entrou; o que está em baixo continua fictício e marcado como tal (`design-system` §6.1 e §6.3).

**Alternativas consideradas**

- **Pendurar tudo em `/perfil/…`** (`/perfil/verificar`, `/perfil/redefinir`): foi o que fiz primeiro, e estava errado — os e-mails da api apontam para `/conta/…`, e os links dariam "página não encontrada". Corrigido antes de qualquer verificação.
- **Um sexto destino "Conta" na navegação**: rejeitado. Muda RF-001 e CA-001.2, que são do Pedro.
- **Fundir a conta real com o perfil demonstrativo num só bloco**: rejeitado. Apaga a distinção entre dado verdadeiro e dado fictício, que é a razão de existir do campo tracejado.

**Consequências**

- **Os caminhos de `/conta/verificar` e `/conta/nova-senha` passam a ser superfície de integração**, partilhada entre os dois agentes, e estão documentados num só sítio: aqui. O pedido para os escrever também na secção 7.2 do contrato é a **A-R5** da revisão cruzada.
- `ehDestinoAtivo`, em `NavegacaoPrincipal.tsx`, ganhou um caso para o Perfil.
- RF-001 a RF-008 continuam **sem cobrir contas**: os requisitos funcionais das contas não existem, e escrevê-los é pendência da DT-020.
