# Protocolo de Colaboração entre Agentes — blbet

> Regras de convivência entre dois agentes Claude Code trabalhando no mesmo repositório. Este documento governa **como** trabalhar em paralelo; o **que** construir está em [`docs/requisitos.md`](requisitos.md) e [`docs/roadmap.md`](roadmap.md).

**Status:** ativo · **Última atualização:** 2026-10-26

---

## 1. Os dois agentes

| | **Agente Backend** | **Agente Frontend** |
|---|---|---|
| Onde executa | Terminal | Claude Code Desktop |
| Identificador nos documentos | `backend` | `frontend` |

Stack e fronteiras aprovadas em [DT-001](decisoes-tecnicas.md#dt-001--stack-do-projeto): monorepo pnpm com `apps/web/` (frontend), `apps/api/` (backend) e `packages/contracts/` (contratos, escritos pelo backend).

### 1.1 Agente Backend (terminal)

Responsável, com exclusividade, por `apps/api/` e `packages/contracts/`:

- Regras de negócio e lógica de domínio.
- APIs e seus contratos — rotas, métodos, parâmetros, respostas, códigos de status.
- Persistência e acesso a dados, incluindo as fixtures demonstrativas e os adaptadores de provedor.
- Validação de entradas nas fronteiras do servidor.
- Testes do servidor: unitários, de integração e de contrato.
- Modelos e tipos de domínio que o frontend consome.

### 1.2 Agente Frontend (Desktop)

Responsável, com exclusividade, por `apps/web/`:

- Identidade visual e sistema de design: tokens, tipografia, cor, espaçamento.
- Páginas e rotas de interface.
- Componentes de interface e seus estados (carregamento, erro, vazio).
- Responsividade e acessibilidade.
- Integração da interface com os contratos publicados pelo backend.
- Testes de interface e de componentes.

### 1.3 O que nenhum dos dois decide sozinho

- A stack do projeto — decidida pelo Pedro em DT-001; qualquer mudança é nova decisão dele.
- A escolha do provedor esportivo e do agregador de cassino (DT-002).
- Integração na `main` e commits (DT-003, DT-004).
- Alteração de contrato já acordado em [`docs/api-contract.md`](api-contract.md) — exige acordo entre os dois, registado.
- Qualquer item marcado como pendência em `docs/requisitos.md` (PD-xxx) ou `docs/arquitetura.md` (DP-xxx).
- Escopo: nada entra além do definido em `docs/visao.md`.

---

## 2. Propriedade dos arquivos

**Nenhum agente modifica arquivo exclusivo do outro sem autorização explícita.** Autorização explícita significa: pedido registado em [`docs/agent-handoff.md`](agent-handoff.md) e aceitação registada pelo dono do arquivo — ou instrução direta do Pedro.

Fronteira por diretório, conforme DT-001 (resolve PA-001):

| Área | Dono | Observação |
|---|---|---|
| `apps/api/**` — servidor, rotas, domínio, adaptadores de provedor, validação, testes do servidor, `package.json` e configuração próprios | `backend` | Exclusivo |
| `apps/web/**` — interface, páginas, componentes, estilos, tokens, testes de interface, `package.json` e configuração próprios | `frontend` | Exclusivo |
| `packages/contracts/**` — esquemas Zod e tipos partilhados | `backend` **escreve** | `frontend` só importa; pede mudanças pelo quadro, com revisão cruzada (4.5) |
| Raiz do monorepo — `package.json` raiz, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, configurações base de TypeScript, lint e formatação, `.gitignore`, exemplos de variáveis de ambiente | **compartilhado, com aviso prévio** | Ver linha de configuração compartilhada abaixo. Instalar ou atualizar dependência em qualquer app **altera o lockfile** e tem de ser anunciado |
| Testes end-to-end (Playwright) — `e2e/` na raiz | `frontend` | DT-015 (resolve PA-008). O `backend` dá à api um modo de teste com respostas gravadas |
| [`docs/api-contract.md`](api-contract.md) | `backend` **escreve** | `frontend` propõe mudanças pelo quadro, não edita direto |
| `docs/integracoes.md` | `backend` | Ainda não existe |
| `docs/design-system.md` | `frontend` | Ainda não existe |
| [`docs/agent-handoff.md`](agent-handoff.md) | **compartilhado** | Cada agente escreve **apenas na sua seção**; a seção de integração exige que quem escreve se identifique |
| [`docs/agent-tasks.md`](agent-tasks.md) | **compartilhado** | Cada agente atualiza o status das **suas** tarefas |
| `docs/visao.md`, `docs/requisitos.md`, `docs/roadmap.md`, `docs/arquitetura.md` | **Pedro** | Agente propõe alteração pelo quadro; não edita por iniciativa própria |
| [`docs/decisoes-tecnicas.md`](decisoes-tecnicas.md) | **compartilhado** | Registo cronológico; ninguém reescreve registo alheio |
| `CLAUDE.md` | **Pedro** | — |
| Configuração compartilhada da raiz | **compartilhado, com aviso prévio** | Avisar no quadro **antes** de editar; um agente de cada vez; commit isolado |

> **Concordância pendente.** Esta tabela foi atualizada pelo `backend` a partir da DT-001. O critério da T-003 exige que o `frontend` registe no quadro que leu e concorda.

---

## 3. Consultar antes de começar

Conforme [DT-006](decisoes-tecnicas.md#dt-006--consulta-ao-quadro-de-coordenação), a leitura é obrigatória **no início de cada sessão**, **antes de iniciar cada tarefa** e **antes de cada commit**. Cada agente lê, na ordem:

1. [`docs/agent-handoff.md`](agent-handoff.md) — o que o outro fez desde a última vez.
2. [`docs/agent-tasks.md`](agent-tasks.md) — o que lhe cabe, o que está bloqueado.
3. O documento da área afetada, conforme a tabela de `CLAUDE.md`.
4. [`docs/api-contract.md`](api-contract.md), sempre que a tarefa toque a integração.

Ler é obrigatório mesmo que o agente "já saiba": o outro pode ter alterado o repositório entre as duas leituras. Com worktrees separadas (DT-003), o quadro de cada worktree só mostra o que já foi integrado na branch dela — em caso de dúvida, comparar com a `main`.

As atualizações ao quadro são concisas: estado, ficheiros afetados, bloqueios e dependências.

---

## 4. Comunicação

### 4.1 Os arquivos compartilhados são o único canal

**Toda mudança que afete a integração é comunicada pelos arquivos compartilhados** — `agent-handoff.md`, `agent-tasks.md` e `api-contract.md`. Mudança comunicada apenas em conversa com o Pedro, ou apenas no código, **não foi comunicada**.

Afeta a integração, entre outros: criar, alterar ou remover rota; mudar formato de resposta ou de erro; mudar nome, tipo ou obrigatoriedade de campo; mudar código de status; mudar formato de data, número ou identificador; alterar o significado de um valor existente.

### 4.2 Nenhum agente presume que o outro sabe

Os dois agentes executam em processos separados — terminal e Desktop — e **não compartilham contexto nem histórico de conversa**. Portanto:

- Nenhum agente presume que o outro recebeu uma mensagem.
- Nenhum agente presume que o outro leu uma alteração que ainda não consultou.
- Nenhum agente presume que o outro já terminou algo porque "deveria" estar pronto.
- Nenhum agente age com base no que supõe que o outro vai fazer.

Quem precisa de uma ação do outro **registra o pedido explicitamente** na seção "Pendências para o outro agente" do quadro. Pedido não registado não existe.

### 4.3 Estado real é o disco

Quando houver dúvida ou divergência sobre o estado do projeto, verificar **no repositório** — arquivos, `git status`, `git diff` — e não no que o quadro afirma. O quadro pode estar desatualizado; o disco não mente. Em caso de conflito entre quadro e disco, o disco vence e o quadro é corrigido.

### 4.4 Bloqueio

Agente bloqueado registra o bloqueio no quadro, com o que precisa e de quem, e **não contorna** o bloqueio reimplementando a área do outro nem inventando o contrato que falta. Trabalha no que não depende do bloqueio ou para e reporta ao Pedro.

### 4.5 Revisão cruzada

Conforme [DT-005](decisoes-tecnicas.md#dt-005--revisão-cruzada), é **obrigatória** para mudanças que afetem `packages/contracts/`, [`docs/api-contract.md`](api-contract.md) ou a integração entre frontend e backend. Antes da integração:

1. Quem propõe descreve no quadro (seção de integração) o motivo e o impacto.
2. O outro agente verifica a compatibilidade e regista a sua análise no quadro.
3. Os problemas identificados são resolvidos antes da integração.
4. A aprovação final do merge é do Pedro.

A revisão **não** autoriza editar ficheiros do outro agente: quem revê aponta, o dono corrige.

---

## 5. Divergências técnicas

Quando os dois agentes discordarem — sobre um contrato, um formato, uma responsabilidade:

1. **Registrar como pendência** na seção de integração do quadro: o ponto em disputa, a posição de cada lado e o impacto de cada opção.
2. **Nenhuma alteração unilateral** em contrato já acordado. Quem discorda propõe; não altera.
3. Enquanto a pendência estiver aberta, **o acordo vigente continua válido** e os dois trabalham sobre ele.
4. A decisão é do Pedro quando houver impacto em produto, escopo ou prazo; quando for puramente técnica e interna a uma área, decide o dono da área, registando o motivo.
5. Decisão tomada vira registo em `docs/decisoes-tecnicas.md` e o contrato é atualizado pelo dono do arquivo.

---

## 6. Verificação

Cada agente, ao concluir uma tarefa:

- Executa as verificações relevantes à sua área — tipos, lint, testes, build.
- **Registra os resultados reais** no quadro: o comando executado e o que aconteceu, incluindo falhas, testes que não existem ainda e passos saltados.
- Não declara concluído o que não verificou. "Deve funcionar" não é resultado.
- Verificação que não foi possível executar é registada como tal, com o motivo.

Conforme `CLAUDE.md`, nada é dado por concluído sem verificação relevante passando e resultado reportado.

---

## 7. Regras de git

Derivadas de experiência anterior com sessões paralelas no mesmo repositório e das decisões [DT-003](decisoes-tecnicas.md#dt-003--branches-e-worktrees-separados) e [DT-004](decisoes-tecnicas.md#dt-004--resolução-de-conflitos):

**Branches e worktrees**

- Cada agente trabalha na **sua própria branch** e na **sua própria worktree**, em diretórios de trabalho independentes.
- **Nenhum agente muda a branch de trabalho de outra sessão** nem opera na worktree do outro.
- A integração na `main` é **controlada pelo Pedro**.
- Worktrees e branches só são criadas na T-012, depois de o repositório estar na localização definitiva (DT-007). Nomes e caminhos: PA-006. Mecanismo de integração: PA-007.

**Conflitos**

- O dono do ficheiro resolve os conflitos nos ficheiros que lhe pertencem.
- Conflito em ficheiro compartilhado (lockfile e configuração da raiz incluídos) é comunicado no quadro e só é resolvido definitivamente com aprovação do Pedro.

**Operações**

- **`git add` com caminhos explícitos.** Nunca `git add -A` nem `git add .` — arrasta trabalho em andamento do outro agente.
- **Nunca** `git stash`, `git reset`, `git rebase`, `git checkout` de arquivos alheios, nem qualquer operação destrutiva.
- **Nenhum commit sem aprovação explícita do Pedro.**
- Commitar apenas arquivos da própria área. Arquivo compartilhado é commitado por quem o alterou, isoladamente.
- Antes de commitar, ler o quadro (DT-006) e correr `git status` para confirmar que nada do outro agente entrou por engano.
- Push, pull request e qualquer operação que publique continuam exigindo aprovação do Pedro.

---

## 8. Fora deste protocolo

Nesta etapa **não** existem automações, hooks, servidores MCP ou processos em segundo plano para coordenar os agentes. A coordenação é inteiramente documental e manual. Introduzir qualquer automação é decisão à parte, do Pedro.

---

## 9. Pendências deste protocolo

| # | Pendência | Situação |
|---|---|---|
| **PA-001** | Fronteira de propriedade de arquivos | **Resolvida** — DT-001; tabela da seção 2. Falta a concordância do `frontend` (T-003) |
| **PA-002** | Mesma branch ou branches separadas | **Resolvida** — DT-003 |
| **PA-003** | Quem resolve conflito | **Resolvida** — DT-004 |
| **PA-004** | Revisão cruzada | **Resolvida** — DT-005; seção 4.5 |
| **PA-005** | Frequência de leitura do quadro | **Resolvida** — DT-006; seção 3 |
| **PA-006** | Nomes das branches e caminhos das worktrees | Aberta — definir na T-012, com aprovação do Pedro |
| **PA-007** | Mecanismo de integração na `main`: merge local ou pull request no GitHub | Aberta — decisão do Pedro |
| **PA-008** | Local e dono dos testes end-to-end, que atravessam frontend e backend | Aberta — definir na T-013 |
