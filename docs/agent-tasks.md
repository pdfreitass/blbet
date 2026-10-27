# Lista de Tarefas dos Agentes — blbet

> Tarefas coordenadas entre os agentes `backend` (terminal) e `frontend` (Desktop). Regras em [`docs/agent-protocol.md`](agent-protocol.md); comunicação em [`docs/agent-handoff.md`](agent-handoff.md); decisões em [`docs/decisoes-tecnicas.md`](decisoes-tecnicas.md).

**Última atualização:** 2026-10-26 · **Por:** `backend` (registo das decisões DT-001 a DT-007 e das tarefas T-010 a T-016)

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
| Concluída | 2 | T-001, T-002 |
| Em andamento | 3 | T-003, T-007, T-008 |
| Não iniciada | 6 | T-004, T-005, T-006, T-009, T-010, T-011 |
| Bloqueada | 5 | T-012, T-013, T-014, T-015, T-016 |

**Ordem crítica:** T-011 (sair do OneDrive) → T-012 (worktrees) → T-013 (monorepo) → T-016 (frontend) e T-015 (backend). A T-010 (provedor esportivo) corre em paralelo e trava a T-014 e a T-015.

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
- **Status:** **em andamento** — tabela atualizada pelo `backend` em 2026-10-26; **falta a concordância do `frontend`**
- **Critérios de conclusão:** a tabela reflete a estrutura da stack aprovada; cada diretório relevante tem dono explícito; **os dois agentes registaram concordância no quadro**.

### T-004 — Definir convenções de contrato de API

- **Descrição:** completar as convenções `PC-xxx` de [`docs/api-contract.md`](api-contract.md) — identificador, data e hora, decimais, paginação, erro — sem definir rotas.
- **Responsável:** `backend`
- **Dependências:** T-001 (concluída). A PC-006 (odds) depende também da T-010.
- **Status:** **não iniciada**
- **Critérios de conclusão:** todas as `PC-xxx` de convenção resolvidas ou explicitamente aceites como abertas; o `frontend` registou no quadro a revisão cruzada (DT-005); nenhuma rota definida.

### T-005 — Criar `docs/design-system.md`

- **Descrição:** documentar a direção estética e os tokens visuais (Fase 2). Resolve o bloqueio da Fase 2 e a PD-009.
- **Responsável:** `frontend`
- **Dependências:** nenhuma para a parte documental; a implementação dos tokens depende da T-013
- **Status:** **não iniciada**
- **Critérios de conclusão:** o ficheiro existe, com direção estética, tokens (cor, tipografia, espaçamento, raio, elevação, estados) e regras de uso; tratamento visual dos dados demonstrativos definido; contraste verificado contra WCAG 2.2 AA; registo no quadro.
- **Observação:** a PD-002 (público-alvo) e a DIV-001 (dados reais vs. demonstrativos) influenciam a direção — risco de retrabalho.

### T-006 — Criar `docs/integracoes.md`

- **Descrição:** documentar a estratégia de integração (adaptadores, conversão para o modelo interno, segredos no servidor, validação de resposta) e, quando a T-010 terminar, o provedor esportivo real. **Sem inventar provedor, endpoint ou contrato.**
- **Responsável:** `backend`
- **Dependências:** T-001 (concluída) para a estratégia; **T-010** para a parte do provedor
- **Status:** **não iniciada** — a parte da estratégia já pode ser feita
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
- **Status:** **em andamento** — decidida e registada (DT-003, DT-004); seção 7 de `docs/agent-protocol.md` atualizada; **falta o `frontend` registar a leitura no quadro**
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
- **Status:** **não iniciada**
- **Critérios de conclusão:** provedor nomeado pelo Pedro; documentação oficial disponível no repositório ou ligada por URL oficial; resumo técnico em `docs/integracoes.md` com a fonte de cada informação; credenciais obtidas e guardadas **fora do repositório**; nada presumido.

### T-011 — Mudar o repositório para fora do OneDrive

- **Descrição:** executar a DT-007.
- **Responsável:** **Pedro** aprova o momento · `backend` executa e verifica
- **Dependências:** nenhuma; tem de terminar **antes** da T-012 e de qualquer instalação de dependências
- **Status:** **não iniciada**
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
- **Dependências:** **T-011**; PA-006 (nomes e caminhos) e PA-007 (mecanismo de integração) decididos
- **Status:** **bloqueada** por T-011
- **Critérios de conclusão:** duas worktrees fora do OneDrive, cada uma na sua branch, a partir da `main`; `git worktree list` regista as duas; cada sessão abre na sua worktree; procedimento e caminhos registados no quadro e no protocolo.

### T-013 — Preparar o monorepo pnpm e as configurações compartilhadas

- **Descrição:** criar a raiz do monorepo (manifesto, workspace, configurações base de TypeScript, lint e testes) e o esqueleto vazio de `apps/api/` e `packages/contracts/`. Confirmar as versões e os comandos exatos. Definir a forma de comunicação local entre web e api e a PA-008.
- **Responsável:** `backend` — raiz, `apps/api/`, `packages/contracts/` · `frontend` — esqueleto de `apps/web/`
- **Dependências:** **T-011**, **T-012**. Os ficheiros da raiz são compartilhados: aviso prévio, um agente de cada vez (seção 2 do protocolo).
- **Status:** **bloqueada** por T-011 e T-012
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
- **Dependências:** **T-013** (esqueleto de `apps/web/`); T-005 (`docs/design-system.md`); DP-006 (estilos e componentes)
- **Status:** **bloqueada** por T-013
- **Critérios de conclusão:** definidos pelo `frontend` na Fase 2 e na Fase 3 do roadmap; os dados demonstrativos são substituídos pelos contratos aprovados assim que existirem, sem simular dados do provedor.
