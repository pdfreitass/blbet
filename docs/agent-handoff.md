# Quadro de Comunicação entre Agentes — blbet

> Canal **único** de comunicação entre o agente `backend` (terminal) e o agente `frontend` (Desktop). Regras de uso em [`docs/agent-protocol.md`](agent-protocol.md).

**Última atualização geral:** 2026-10-26 · **Por:** `backend` (registo das decisões DT-001 a DT-007)

---

## Como usar este quadro

1. **Ler antes de começar** qualquer tarefa relevante. O outro agente não sabe o que você fez; você não sabe o que ele fez.
2. **Escrever apenas na sua seção.** `backend` na seção de backend, `frontend` na de frontend. A seção de integração é compartilhada e exige identificação de quem escreveu.
3. **Registro novo vai no topo** do histórico da seção, com data. Não apagar nem reescrever registo alheio.
4. **Pedido ao outro agente** vai em "Pendências para o outro agente". Pedido não registado aqui **não existe**.
5. **Resultados de verificação são reais** — comando e resultado, incluindo falhas. Sem "deve funcionar".
6. Em caso de divergência entre este quadro e o repositório, **o repositório vence** e o quadro é corrigido.

### Modelo de registro

```
### AAAA-MM-DD — <título curto da tarefa>

- **Agente responsável:** backend | frontend
- **Tarefa executada:** (ID de agent-tasks.md, se houver)
- **Arquivos modificados:** lista explícita
- **Contratos ou interfaces alterados:** o que mudou, ou "nenhum"
- **Pendências para o outro agente:** o que precisa, de quem, por quê — ou "nenhuma"
- **Bloqueios:** o que impede o avanço, ou "nenhum"
- **Testes executados e resultados:** comando e resultado real, ou "nenhum executado" com o motivo
- **Próxima ação recomendada:** —
```

---

## Estado atual do projeto

| | |
|---|---|
| **Fase do roadmap** | Fase 1 — Documentação e planejamento, **em andamento** |
| **Código da aplicação** | Fundação do backend (`apps/api/`, `packages/contracts/`, raiz do monorepo) **integrada na `main`** (aprovação do Pedro, 2026-10-26). Sem lógica de negócio |
| **Stack** | **Aprovada** — [DT-001](decisoes-tecnicas.md#dt-001--stack-do-projeto): monorepo pnpm, `apps/web` (React + Vite), `apps/api` (Fastify), `packages/contracts` (Zod) |
| **Local do repositório** | `C:\Users\pedro\blbet` (`main`). A pasta antiga no OneDrive **não deve ser usada** (DT-007) |
| **Worktrees** | `C:\Users\pedro\blbet-backend` → `feat/backend-foundation` · `C:\Users\pedro\blbet-frontend` → `feat/frontend-foundation` (DT-008) |
| **Git** | `main` em `d337f1f` (documentação), sem push |
| **Tarefas em andamento** | T-003, T-007, T-008, T-013 |
| **Tarefas concluídas** | T-001, T-002, T-011, T-012 |

---

## Seção Backend

**Dono:** `backend` (terminal) · **Última atualização:** 2026-10-26

### Situação

Fundação técnica do backend commitada em `feat/backend-foundation` e integrada na `main` com aprovação do Pedro.

- **Arquivos modificados:** ver o histórico abaixo
- **Contratos ou interfaces alterados:** nenhum contrato de domínio. Só existe `GET /health`, que é operacional e não pertence ao contrato
- **Pendências para o agente `frontend`:** ver a seção de integração
- **Bloqueios:** BLQ-001 (provedor esportivo não identificado) para a T-014 e a T-015
- **Testes executados e resultados:** ver o histórico abaixo
- **Próxima ação recomendada:** Pedro aprova o commit da fundação e integra-o na `main`; depois, a parte de estratégia da T-006 e a T-004

### Histórico

### 2026-10-26 — Mudança para fora do OneDrive, worktrees e fundação do backend

- **Agente responsável:** backend
- **Tarefa executada:** T-011 e T-012 (concluídas); T-013 (parte do backend)
- **Arquivos modificados:** raiz — `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `tsconfig.base.json`, `.gitignore`, `.gitattributes` (compartilhados, criados com instrução direta do Pedro) · `apps/api/**` (`package.json`, `tsconfig.json`, `tsconfig.build.json`, `.env.example`, `README.md`, `src/app.ts`, `src/server.ts`, `src/config/env.ts`, `src/routes/health.ts`, `test/*.test.ts`) · `packages/contracts/**` (`package.json`, `tsconfig.json`, `src/index.ts` vazio) · `docs/decisoes-tecnicas.md` (DT-007 executada, DT-008), `docs/agent-tasks.md`, `docs/agent-handoff.md`, `CLAUDE.md`
- **Contratos ou interfaces alterados:** nenhum. `packages/contracts` existe mas não exporta nada
- **Pendências para o outro agente:** ver a seção de integração
- **Bloqueios:** BLQ-001 — a fundação já está integrada na `main`, com aprovação do Pedro
- **Testes executados e resultados:** `pnpm install` → ok · `pnpm typecheck` → ok (2 pacotes) · `pnpm test` → 3 ficheiros, 7 testes a passar · `pnpm build` → ok · `pnpm dev:api` + `curl /health` → `200 {"status":"ok"}` · `PORT=abc NODE_ENV=staging` → arranque recusado com "Variáveis de ambiente inválidas: NODE_ENV, PORT", exit 1
- **Próxima ação recomendada:** integrar a fundação na `main`, para o `frontend` herdar a raiz do monorepo

### 2026-10-26 — Registo das decisões DT-001 a DT-007 e reorganização das tarefas

- **Agente responsável:** backend
- **Tarefa executada:** T-001 e T-002 (concluídas); T-003 e T-008 (em andamento); T-007 (parcial); T-010 a T-016 criadas
- **Arquivos modificados:** `docs/decisoes-tecnicas.md` (criado), `docs/arquitetura.md`, `docs/agent-protocol.md`, `docs/agent-tasks.md`, `docs/agent-handoff.md` (seções gerais, backend e integração), `docs/api-contract.md`, `CLAUDE.md` — todos por instrução direta do Pedro, incluindo os ficheiros que são dele
- **Contratos ou interfaces alterados:** nenhuma rota; PC-011 e PC-012 resolvidas; PC-006 e PC-010 ligadas a BLQ-001 e DIV-001
- **Pendências para o outro agente:** ver a seção de integração
- **Bloqueios:** BLQ-001; DIV-001 a DIV-003 à espera do Pedro
- **Testes executados e resultados:** nenhum executado — mudança só de documentação, sem código
- **Próxima ação recomendada:** T-011, com aprovação do Pedro

---

## Seção Frontend

**Dono:** `frontend` (Desktop) · **Última atualização:** nenhuma

### Situação

**Nenhuma tarefa iniciada.** O agente `frontend` ainda não executou trabalho neste repositório.

- **Arquivos modificados:** nenhum
- **Contratos ou interfaces alterados:** nenhum
- **Pendências para o agente `backend`:** nenhuma
- **Bloqueios:** DP-001 (stack não aprovada) e ausência de `docs/design-system.md` impedem iniciar a interface
- **Testes executados e resultados:** nenhum — não há código nem ferramenta de teste definida (DP-002)
- **Próxima ação recomendada:** aguardar aprovação de DP-001; enquanto isso, avançar na tarefa documental do sistema visual atribuída em [`docs/agent-tasks.md`](agent-tasks.md)

### Histórico

Sem registros.

---

## Seção Integração

**Dono:** compartilhado — identificar o agente em cada registro · **Última atualização:** 2026-10-26, por `backend`

### Situação

**Nenhuma integração iniciada.** Não há rotas definidas nem interface que as consuma.

- **Contratos acordados:** nenhum. Forma decidida (DT-001): `apps/web` consome `apps/api` por HTTP; tipos e esquemas em `packages/contracts/`, escritos pelo `backend`
- **Divergências abertas entre agentes:** nenhuma. As divergências **documentais** DIV-001 a DIV-003 estão em [`docs/decisoes-tecnicas.md`](decisoes-tecnicas.md#divergências-documentais-abertas) e são do Pedro
- **Bloqueios de integração:** BLQ-001 (provedor esportivo); PD-003 a PD-008; T-013 (monorepo)
- **Próxima ação recomendada:** não definir rotas antes da T-010 e da T-009; mudanças de contrato seguem a revisão cruzada (DT-005, seção 4.5 do protocolo)

### Pendências para o agente `frontend` — registadas pelo `backend` em 2026-10-26

1. **T-003** — ler a nova tabela de propriedade (seção 2 do [protocolo](agent-protocol.md)) e registar concordância ou divergência.
2. **T-008** — registar a leitura das regras de branches, worktrees e conflitos (seção 7 do protocolo; DT-003, DT-004).
3. **Leitura das DT-001 a DT-007** — sobretudo a DT-002: os dados esportivos vêm de um provedor real ainda não identificado; até haver contrato, os dados demonstrativos usados na interface têm de estar claramente identificados e não podem imitar o provedor.

### Pendências para o agente `frontend` — registadas pelo `backend` em 2026-10-26 (fundação)

4. **O `frontend` pode começar a primeira entrega visual (T-005, T-016)** na sua worktree `C:\Users\pedro\blbet-frontend`, branch `feat/frontend-foundation`. É dono exclusivo de `apps/web/`.
5. **A raiz do monorepo ainda não está na branch do `frontend`.** Vive em `feat/backend-foundation` até o Pedro a integrar na `main`. Para não criar um segundo lockfile nem uma segunda configuração da raiz:
   - antes de correr `pnpm install`, esperar que o Pedro integre a fundação na `main` e trazer a `main` para a própria branch (merge, nunca rebase);
   - até lá, o trabalho que não dependa de dependências instaladas (T-005, `docs/design-system.md`) pode avançar.
6. **Ficheiros partilhados da raiz:** `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `tsconfig.base.json`, `.gitignore`, `.gitattributes`. Mudanças são anunciadas aqui **antes**. Instalar dependências em `apps/web` altera o `pnpm-lock.yaml`; um conflito nele resolve-se com aprovação do Pedro (DT-004). Aprovar scripts de instalação (`allowBuilds`) também é uma alteração partilhada.
7. **Contrato:** `packages/contracts` existe e está vazio de propósito. Não há rotas de domínio nem formato de envelope (PC-001 a PC-015 abertas). A interface usa dados demonstrativos identificados, sem forma de resposta presumida do backend.
8. **Base de `apps/web/tsconfig`:** pode estender `../../tsconfig.base.json`, que é pensado para Node (`module: NodeNext`, `lib: ES2023`). O `frontend` sobrepõe no seu próprio tsconfig o que o Vite e o DOM exigem, sem alterar a base.

### Divergências técnicas abertas

Nenhuma. Registrar aqui, conforme a seção 5 do protocolo: ponto em disputa, posição de cada agente, impacto de cada opção. Enquanto aberta, o acordo vigente continua válido.

### Histórico

Sem registros.

---

## Bloqueios ativos — os dois agentes

Atualizado pelo `backend` em 2026-10-26. DP-001, PA-001 e PA-002 já não são bloqueios (DT-001, DT-003).

| Bloqueio | Afeta | Quem resolve |
|---|---|---|
| **BLQ-001** — provedor esportivo não identificado; documentação oficial indisponível | T-014, T-015, modelo de dados esportivos, PC-006 | Pedro (T-010) |
| **`frontend` ainda sem a raiz do monorepo na sua branch** | `pnpm install` em `apps/web` | `frontend`: `git merge main` na própria worktree (fast-forward), antes de instalar |
| **PA-007** — mecanismo de integração na `main` (merge local ou pull request) | Todas as integrações | Pedro |
| **Quadro por branch** — cada worktree vê a sua cópia de `docs/`; um registo só chega ao outro agente depois de integrado na `main` | Coordenação | Pedro integra com frequência os commits de coordenação; em caso de dúvida, ler a cópia da `main` em `C:\Users\pedro\blbet` |
| **DIV-001** — dados reais (DT-002) vs. "todo dado é fictício" (RN-002, RF-003, RNF-008) | Identificação de dados na interface, DP-004, PC-010 | Pedro |
| `docs/design-system.md` inexistente | `frontend` (T-016) | `frontend` (T-005) |
| `docs/integracoes.md` inexistente | `backend` (adaptadores) | `backend` (T-006), depois da T-010 para o provedor |
| `docs/decisoes-tecnicas.md` inexistente | Registro de qualquer decisão | compartilhado |
| **DP-002** — ferramentas de teste | Verificações dos dois | Pedro, após DP-001 |
| **PD-002** — público-alvo não definido | Decisões visuais do `frontend` | Pedro |
