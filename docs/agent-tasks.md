# Lista de Tarefas dos Agentes — blbet

> Tarefas coordenadas entre os agentes `backend` (terminal) e `frontend` (Desktop). Regras em [`docs/agent-protocol.md`](agent-protocol.md); comunicação em [`docs/agent-handoff.md`](agent-handoff.md); decisões em [`docs/decisoes-tecnicas.md`](decisoes-tecnicas.md).

**Última atualização:** 2026-10-27 · **Por:** `frontend` (T-016 iniciada: `apps/web/` com o primeiro ecrã a correr; parte do `frontend` na T-013 cumprida). Registo anterior: `frontend` (T-005 concluída e aprovada; revisão cruzada da T-004 registada; comunicação local da T-013 acordada). Registo anterior: `backend` (decisões DT-001 a DT-007 e tarefas T-010 a T-016)

---

## Convenções

- **Identificador:** `T-xxx`, sequencial e **estável**. Nunca é reutilizado, mesmo se a tarefa for cancelada.
- **Responsável:** `backend`, `frontend`, `compartilhado` ou `Pedro`.
- **Status:** `não iniciada` · `em andamento` · `bloqueada` · `concluída`.
- **`concluída` exige evidência verificável** no repositório. Status não é intenção.
- Cada agente atualiza o status **apenas das suas** tarefas; uma tarefa `compartilhado` é atualizada por quem a executou, identificando-se.
- Consultar esta lista no início da sessão, antes de cada tarefa e antes de cada commit (DT-006).

---

## Resumo

| Status | Quantidade | Tarefas |
|---|---|---|
| Concluída | 8 | T-001, T-002, T-003, T-004, T-005, T-008, T-011, T-012 |
| Em andamento | 5 | T-006, T-007, T-010, T-013, T-016 |
| Não iniciada | 1 | T-009 |
| Bloqueada | 2 | T-014, T-015 |

**Ordem crítica:** T-016 (frontend) em andamento; a parte do `frontend` na T-013 está cumprida e commitada — falta a conferência do `pnpm-lock.yaml` pelo `backend` e a integração na `main`. A T-010 deixou de travar: a **DT-009** escolheu a Sportsbook API para desenvolvimento e testes, e a T-014 e a T-015 podem avançar.

---

## Tarefas de documentação e decisão

### T-001 — Definir e registar a stack do projeto

- **Responsável:** `compartilhado` — decisão do Pedro
- **Dependências:** nenhuma
- **Status:** **concluída** — 2026-10-26, registada pelo `backend`
- **Evidência:** [DT-001](decisoes-tecnicas.md#dt-001--stack-do-projeto); [`docs/arquitetura.md`](arquitetura.md) seções 2, 4 e 10 atualizadas.

### T-002 — Criar `docs/decisoes-tecnicas.md`

- **Responsável:** `compartilhado`
- **Dependências:** nenhuma
- **Status:** **concluída** — 2026-10-26, pelo `backend`
- **Evidência:** [`docs/decisoes-tecnicas.md`](decisoes-tecnicas.md) existe, com formato, índice, DT-001 a DT-007 (todas aprovadas pelo Pedro) e as divergências documentais DIV-001 a DIV-003. Nenhuma decisão inventada.

### T-003 — Rever a fronteira de propriedade de ficheiros

- **Descrição:** rever a tabela da seção 2 de [`docs/agent-protocol.md`](agent-protocol.md) conforme a stack aprovada. Resolve PA-001.
- **Responsável:** `compartilhado`
- **Dependências:** T-001 (concluída)
- **Status:** **concluída** — 2026-10-26. Tabela atualizada pelo `backend`; concordância do `frontend` registada no quadro (seção de integração, resposta 1), sem divergência. Resolve PA-001
- **Critérios de conclusão:** a tabela reflete a estrutura da stack aprovada; cada diretório relevante tem dono explícito; **os dois agentes registaram concordância no quadro**.

### T-004 — Definir convenções de contrato de API

- **Descrição:** completar as convenções `PC-xxx` de [`docs/api-contract.md`](api-contract.md) — identificador, data e hora, decimais, paginação, erro — sem definir rotas.
- **Responsável:** `backend`
- **Dependências:** T-001 (concluída). A PC-006 (odds) depende também da T-010.
- **Status:** **concluída** — 2026-10-26, pelo `backend`. Evidência: secções 8 e 9.1 de `docs/api-contract.md` (todas as PC resolvidas; a PC-006 e a PC-010 aceites como parcialmente abertas, à espera de BLQ-001 e da DIV-001); esquemas em `packages/contracts/src/`; nenhuma rota definida. Registo anterior: em andamento, à espera da revisão do `frontend`
- **Revisão cruzada do `frontend` (DT-005): feita** — 2026-10-26, registada na secção de integração de [`docs/agent-handoff.md`](agent-handoff.md). 6 concordâncias plenas, 8 com ajuste, 0 discordâncias; PC-014 respondida; duas divergências abertas (DIV-F01, DIV-F02). O status acima é do `backend` e **não o alterei**: a revisão que ele aguardava está entregue, e este critério de conclusão fica cumprido pelo lado do `frontend`; os restantes são dele
- **Critérios de conclusão:** todas as `PC-xxx` de convenção resolvidas ou explicitamente aceites como abertas; o `frontend` registou no quadro a revisão cruzada (DT-005); nenhuma rota definida.

### T-005 — Criar `docs/design-system.md`

- **Descrição:** documentar a direção estética e os tokens visuais (Fase 2). Resolve o bloqueio da Fase 2 e a PD-009.
- **Responsável:** `frontend`
- **Dependências:** nenhuma para a parte documental; a implementação dos tokens depende da T-013
- **Status:** **concluída** — 2026-10-26, pelo `frontend`. **Direção aprovada pelo Pedro**, incluindo o tema escuro (DT-009) e a recomendação de estilos (DP-006: CSS Modules com os tokens em custom properties). Ressalva registada: a **DIV-001 continua sem escolha** entre as opções A e B de §7 — não a resolvo por omissão, e a implementação avança só com a marcação do dado demonstrativo, que é o único que vai existir
- **Evidência:** [`docs/design-system.md`](design-system.md) existe, com direção estética, tokens (cor, tipografia, espaçamento, raio, elevação, movimento, breakpoints) e regras de uso; tratamento visual do dado demonstrativo definido (resolve **PD-009**); contraste verificado contra WCAG 2.2 AA com 28 pares calculados, 28 a passar (§4); registo no quadro feito
- **Critérios de conclusão:** o ficheiro existe, com direção estética, tokens (cor, tipografia, espaçamento, raio, elevação, estados) e regras de uso; tratamento visual dos dados demonstrativos definido; contraste verificado contra WCAG 2.2 AA; registo no quadro.
- **Observação:** a PD-002 (público-alvo) e a DIV-001 (dados reais vs. demonstrativos) influenciam a direção — risco de retrabalho.

### T-006 — Criar `docs/integracoes.md`

- **Descrição:** documentar a estratégia de integração (adaptadores, conversão para o modelo interno, segredos no servidor, validação de resposta) e, quando a T-010 terminar, o provedor esportivo real. **Sem inventar provedor, endpoint ou contrato.**
- **Responsável:** `backend`
- **Dependências:** T-001 (concluída) para a estratégia; **T-010** para a parte do provedor
- **Status:** **em andamento** — 2026-10-26, pelo `backend`: estratégia, critérios C1 a C16 para escolher o provedor, estrutura do adaptador e convenção das credenciais em `docs/integracoes.md`. **Falta a parte do provedor**, que depende da T-010
- **Critérios de conclusão:** o ficheiro existe; a estratégia está descrita; os dados do provedor vêm citados da documentação oficial, com a respetiva fonte; o que não estiver documentado fica marcado como pendente.

### T-007 — Definir ferramentas e cobertura de teste

- **Descrição:** resolver a DP-002.
- **Responsável:** `compartilhado`
- **Dependências:** T-001 (concluída)
- **Status:** **em andamento** — ferramentas definidas na DT-001 (Vitest, Playwright); **falta a cobertura mínima**, que é decisão do Pedro, e o local e dono dos testes end-to-end (PA-008)
- **Critérios de conclusão:** cobertura mínima registada em `docs/decisoes-tecnicas.md`; seção 8 de `docs/arquitetura.md` atualizada; os dois agentes concordaram no quadro.

### T-008 — Definir a estratégia de branches dos agentes

- **Descrição:** resolver PA-002 e PA-003.
- **Responsável:** `compartilhado` — decisão do Pedro
- **Dependências:** nenhuma
- **Status:** **concluída** — 2026-10-26. Decidida e registada (DT-003, DT-004); seção 7 de `docs/agent-protocol.md` atualizada; leitura e aceitação do `frontend` registadas no quadro (seção de integração, resposta 2)
- **Critérios de conclusão:** estratégia registada em `docs/decisoes-tecnicas.md`; seção 7 do protocolo atualizada; os dois agentes registaram a leitura no quadro.

### T-009 — Resolver pendências de requisitos que descrevem dados

- **Descrição:** obter definição para PD-003 (escopo da busca), PD-004 (mercados esportivos), PD-005 (categorias de cassino), PD-006 (campos do perfil), PD-007 (formato das odds) e PD-008 (idioma e formatos).
- **Responsável:** `compartilhado` — **as definições vêm do Pedro**; os agentes registam
- **Dependências:** nenhuma. A PD-004 e a PD-007 devem ser compatíveis com o que o provedor fornece (T-010).
- **Status:** **não iniciada**
- **Critérios de conclusão:** cada pendência resolvida e refletida em `docs/requisitos.md`, ou explicitamente aceite como aberta com o impacto registado.

### T-010 — Identificar a API esportiva e obter a documentação oficial

- **Descrição:** escolher o provedor esportivo e reunir a sua documentação oficial: autenticação, endpoints, parâmetros, campos, formatos, limites, termos de uso (a exibição é permitida? exige atribuição?) e ambiente de testes. Resolve o **BLQ-001**.
- **Responsável:** **Pedro** (escolha e credenciais) · `backend` (análise e registo em `docs/integracoes.md`)
- **Dependências:** nenhuma
- **Status:** **em andamento** — 2026-10-26: Pedro escolheu a Sportsbook API (RapidAPI, plano gratuito) para testes (DT-009); avaliação C1 a C16 na secção 5 do `docs/integracoes.md`. **Falta:** chave do Pedro fora do repositório; chamadas reais para confirmar C5, C7 e C13; resposta do provedor a C1 e C2 antes de publicar
- **Critérios de conclusão:** provedor nomeado pelo Pedro; documentação oficial disponível no repositório ou ligada por URL oficial; resumo técnico em `docs/integracoes.md` com a fonte de cada informação; credenciais obtidas e guardadas **fora do repositório**; nada presumido.

### T-011 — Mudar o repositório para fora do OneDrive

- **Descrição:** executar a DT-007.
- **Responsável:** **Pedro** aprova o momento · `backend` executa e verifica
- **Dependências:** nenhuma; tem de terminar **antes** da T-012 e de qualquer instalação de dependências
- **Status:** **concluída** — 2026-10-26, pelo `backend`
- **Evidência:** repositório em `C:\Users\pedro\blbet`; 39/39 ficheiros com SHA-256 igual à origem; `git status`, `git log` (`9fa52c8`), `git remote -v` iguais; `git fsck` sem erros. Backup integral em `C:\Users\pedro\blbet-backup-20261026`, também verificado por SHA-256. Pasta antiga no OneDrive mantida, sem uso. A documentação foi commitada na `main` com aprovação do Pedro (`d337f1f`), sem push.
- **Situação verificada em 2026-10-26:**
  - Caminho atual: `C:\Users\pedro\OneDrive\Documentos\blbet`.
  - Branch `main`, um commit (`9fa52c8`), remoto `origin` = `git@github.com:pdfreitass/blbet.git`, nenhuma worktree extra.
  - **Não rastreados:** `CLAUDE.md` e todo o `docs/`. Não existem em nenhum commit nem no GitHub: **só existem neste disco**.
  - Destino recomendado: `C:\Users\pedro\blbet`. Não existia a 2026-10-26; reconfirmar antes de mover.
- **Procedimento proposto:**
  1. Fechar as duas sessões (terminal e Desktop) abertas no caminho antigo e registar no quadro que a mudança vai começar.
  2. Garantir que todos os ficheiros estão no disco e não apenas na nuvem: no OneDrive, "Manter sempre neste dispositivo" na pasta `blbet`. Depois pausar a sincronização durante a mudança.
  3. Segurança, à escolha do Pedro: **(a)** commitar `CLAUDE.md` e `docs/` antes de mover, com aprovação e `git add` com caminhos explícitos; ou **(b)** fazer uma cópia de segurança da pasta inteira para fora do OneDrive.
  4. Mover a **pasta inteira, com o `.git`**. Os ficheiros não rastreados vão junto; o remoto fica guardado em `.git/config` e viaja com ela. Não usar `git clone` como forma de mudança: o clone não traz os ficheiros não rastreados.
  5. Verificar no destino: `git status` igual ao de origem; `git remote -v` igual; `git log` com o mesmo commit; mesma lista de ficheiros com os mesmos tamanhos.
  6. Reabrir as duas sessões no novo caminho.
  7. Apagar a pasta antiga **só depois** da verificação e com aprovação do Pedro.
- **Critérios de conclusão:** repositório no destino com histórico, remoto e ficheiros não rastreados intactos, verificado pelos comandos do passo 5 e com os resultados registados no quadro.

### T-012 — Preparar o git para worktrees e branches independentes

- **Descrição:** executar a DT-003: uma branch e uma worktree por agente.
- **Responsável:** `backend` executa, com aprovação do Pedro
- **Dependências:** **T-011**; PA-006 (nomes e caminhos) decidida em DT-008
- **Status:** **concluída** — 2026-10-26, pelo `backend`
- **Evidência:** `git worktree list` → `C:/Users/pedro/blbet [main]`, `C:/Users/pedro/blbet-backend [feat/backend-foundation]`, `C:/Users/pedro/blbet-frontend [feat/frontend-foundation]`, todas a partir de `d337f1f`. A PA-007 (mecanismo de integração na `main`) continua aberta.
- **Critérios de conclusão:** duas worktrees fora do OneDrive, cada uma na sua branch, a partir da `main`; `git worktree list` regista as duas; cada sessão abre na sua worktree; procedimento e caminhos registados no quadro e no protocolo.

### T-013 — Preparar o monorepo pnpm e as configurações compartilhadas

- **Descrição:** criar a raiz do monorepo (manifesto, workspace, configurações base de TypeScript, lint e testes) e o esqueleto vazio de `apps/api/` e `packages/contracts/`. Confirmar as versões e os comandos exatos. Definir a forma de comunicação local entre web e api e a PA-008.
- **Responsável:** `backend` — raiz, `apps/api/`, `packages/contracts/` · `frontend` — esqueleto de `apps/web/`
- **Dependências:** **T-011**, **T-012** (concluídas). Os ficheiros da raiz são compartilhados: aviso prévio, um agente de cada vez (seção 2 do protocolo).
- **Status:** **em andamento** — parte do `backend` concluída em 2026-10-26, na branch `feat/backend-foundation`, commitada e integrada na `main` com aprovação do Pedro. **Parte do `frontend` cumprida em 2026-10-27**: `apps/web/` existe, instala e corre (typecheck, 41 testes e build a passar). **PA-008 resolvida** — o `pnpm install` correu e alterou o `pnpm-lock.yaml` (+517 linhas, todas de `apps/web`); falta a conferência do diff pelo `backend` antes da integração.
- **Comunicação local entre web e api: acordada** — 2026-10-26, pelo `frontend`, em resposta à proposta do `backend`: o servidor de desenvolvimento do Vite encaminha `/api` para `http://127.0.0.1:3333`, configurado no `vite.config.ts` do `frontend`, sem CORS na api. Porta confirmada no disco (`apps/api/.env.example`, `apps/api/src/config/env.ts`). Registo na secção de integração do quadro.
- **Evidência da parte do backend:** `pnpm install` sem erros (pnpm 12.15.0); `pnpm typecheck` passa nos 2 pacotes; `pnpm test` → 3 ficheiros, 7 testes a passar; `pnpm build` passa; servidor em dev respondeu `GET /health` → `200 {"status":"ok"}`; arranque com variáveis inválidas falhou só com os nomes das variáveis. Versões em DT-008.
- **Critérios de conclusão:** `pnpm install` corre sem erros; os scripts de tipos, lint e testes correm em todos os pacotes, com os resultados reais registados; nenhuma funcionalidade implementada; versões registadas em `docs/decisoes-tecnicas.md`.

### T-014 — Definir os contratos a partir da documentação real da API

- **Descrição:** modelar eventos, competições, mercados e odds no modelo interno e definir as rotas de esportes em `packages/contracts/` e em [`docs/api-contract.md`](api-contract.md), com base no que o provedor **realmente** fornece.
- **Responsável:** `backend` · revisão cruzada do `frontend` (DT-005)
- **Dependências:** **T-010**, **T-013**, T-004, T-009 (PD-004, PD-007)
- **Status:** **bloqueada** por T-010 e T-013
- **Critérios de conclusão:** esquemas Zod em `packages/contracts/` e rotas documentadas segundo a seção 5.1 do contrato; cada campo rastreável até à documentação do provedor ou a um requisito; revisão do `frontend` registada no quadro; aprovação do Pedro antes da integração.

### T-015 — Preparar o backend para a integração real

- **Descrição:** implementar em `apps/api/` o adaptador do provedor esportivo e as rotas da T-014: credenciais em variáveis de ambiente, validação das respostas, tratamento de erros e de limites.
- **Responsável:** `backend`
- **Dependências:** **T-010**, **T-013**, **T-014**, T-006; DP-009 (cache e forma de atualização)
- **Status:** **bloqueada** por T-010, T-013 e T-014
- **Critérios de conclusão:** o adaptador chama o provedor real com credenciais fora do repositório; os testes usam exemplos de resposta retirados da documentação oficial; nenhuma resposta inventada apresentada como real; tipos, lint e testes a passar, com os resultados reais registados.

### T-016 — Iniciar o desenvolvimento visual do frontend em paralelo

- **Descrição:** construir os tokens, os componentes-base e as telas em `apps/web/`, usando os contratos aprovados e, enquanto não existirem, dados demonstrativos **claramente identificados como tal**.
- **Responsável:** `frontend`
- **Dependências:** a raiz do monorepo da T-013 (pronta na branch do `backend`, ver a seção de integração do quadro); T-005 (`docs/design-system.md`); DP-006 (estilos e componentes)
- **Status:** **em andamento** — primeira entrega em 2026-10-27, na worktree `C:\Users\pedro\blbet-frontend`, **por commitar** (aguarda aprovação do Pedro). Entregue: casca da aplicação, faixa demonstrativa permanente (CA-001.4), navegação principal nos dois arranjos (RF-001, CA-001.2), lista de eventos agrupada por competição (CA-002.1), cartão de evento (RF-002), linha de mercado e odds somente leitura (RF-003, RN-003, CA-003.3), campo de busca com filtragem (RF-005), os quatro componentes de estado de RF-008 e o campo tracejado de §6.1 do design-system em todo valor fictício. Dados demonstrativos locais, com clubes e competições inventados; nenhuma chamada de rede e nenhum formato de provedor imitado. **Falta:** cartão de jogo e cassino (RF-004), indicador de favorito (RF-006), tela de detalhe e roteamento
- **Critérios de conclusão:** definidos pelo `frontend` na Fase 2 e na Fase 3 do roadmap; os dados demonstrativos são substituídos pelos contratos aprovados assim que existirem, sem simular dados do provedor.
