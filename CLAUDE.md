# CLAUDE.md — blbet

Instruções permanentes para o Claude Code neste repositório.

## Natureza do projeto

O blbet começa como **protótipo de entretenimento, exclusivamente demonstrativo**.

- **Não existem** apostas com dinheiro real, depósitos, saques ou pagamentos.
- Qualquer saldo, aposta ou prémio é fictício e serve apenas para demonstração.
- Não implementar integração com meios de pagamento, KYC financeiro ou liquidação monetária sem decisão explícita registada em `docs/decisoes-tecnicas.md`.
- Os dados esportivos vêm de uma **API esportiva real** (DT-002). O provedor está identificado: **Sportsbook API**, via RapidAPI, **só para desenvolvimento e testes** (DT-009). Tudo o que lhe diz respeito — endpoints, autenticação, limites e formatos — vive em `docs/integracoes.md`; fora do que lá está documentado, não inventar, e não criar chamadas fictícias que se apresentem como reais. A adoção de um provedor para publicação é decisão posterior.
- **O âmbito dos dados esportivos é o da DT-010:** resultado final e mais/menos golos, odds decimais com 2 casas em texto, uma fonte fixa e só jogos futuros. Nada fora disto entra sem decisão registada.

## Documentos de referência

Consultar o documento **antes** de trabalhar na área correspondente:

| Documento | Consultar antes de |
|---|---|
| `docs/visao.md` | implementar funcionalidades que afetem o produto |
| `docs/requisitos.md` | assumir qualquer comportamento esperado |
| `docs/arquitetura.md` | alterar a estrutura técnica |
| `docs/design-system.md` | criar ou modificar interfaces |
| `docs/integracoes.md` | trabalhar com provedores externos |
| `docs/roadmap.md` | iniciar trabalho — respeitar a fase atual |
| `docs/agent-protocol.md` | agir quando há dois agentes em paralelo |
| `docs/agent-handoff.md` | iniciar qualquer tarefa — ver o que o outro agente fez |
| `docs/agent-tasks.md` | escolher no que trabalhar |
| `docs/api-contract.md` | tocar a integração entre frontend e backend |

Decisões relevantes (técnicas, de produto ou de escopo) são registadas em `docs/decisoes-tecnicas.md`.

**Estado atual:** existem todos os documentos da tabela acima, incluindo `design-system.md` (do `frontend`) e `integracoes.md` (do `backend`, já com o provedor avaliado e escolhido). Um documento inexistente **não** é uma decisão tomada — sinalizar a pendência e pedir esclarecimento em vez de assumir conteúdo.

**Stack aprovada (DT-001):** monorepo pnpm — `apps/web/` (React + Vite + TypeScript), `apps/api/` (Node.js + Fastify + TypeScript), `packages/contracts/` (Zod); Vitest e Playwright. Worktrees e versões: DT-008.

**Código existente:** `apps/api/` com as rotas de esportes a funcionar (instruções em `apps/api/README.md`); `packages/contracts/` com o envelope, as primitivas e o modelo esportivo; `apps/web/` com esportes e busca a consumir as rotas reais, cassino com catálogo demonstrativo e favoritos locais; o perfil (RF-007) ainda é só um estado vazio. Em desenvolvimento, o servidor do Vite encaminha `/api` para a api local (`127.0.0.1:3333`), e **sem a chave do provedor no `apps/api/.env` as rotas de esportes respondem `503`** — que é um estado previsto, não um defeito.

## Como trabalhar

- Inspecionar o código existente antes de modificar ficheiros; seguir os padrões já presentes.
- Priorizar código simples, modular, tipado, reutilizável e testável.
- Evitar dependências desnecessárias, duplicação de código e refatorações fora do escopo pedido.
- Nunca inventar contratos de API, credenciais, funcionalidades ou requisitos. Se não está documentado nem no código, está em aberto.
- Pedir esclarecimento quando uma decisão importante não estiver definida, em vez de escolher por omissão.

## Trabalho com dois agentes em paralelo

Este projeto é trabalhado por **dois agentes Claude Code simultâneos**, com áreas exclusivas:

- **`backend`** (terminal) — regras de negócio, APIs, persistência, validações e testes do servidor. Dono de `apps/api/` e de `packages/contracts/`.
- **`frontend`** (Desktop) — identidade visual, páginas, componentes, responsividade e integração da interface com os contratos do backend. Dono de `apps/web/`.

Regras completas em `docs/agent-protocol.md`. O essencial:

- **Respeitar a própria área.** Não modificar arquivo exclusivo do outro agente sem autorização explícita registada no quadro ou instrução direta do Pedro.
- **Ler antes de agir.** Consultar `docs/agent-handoff.md` e `docs/agent-tasks.md` no início de cada tarefa relevante — o repositório pode ter mudado desde a última leitura.
- **Atualizar o quadro** ao concluir algo relevante: tarefa, arquivos modificados, contratos alterados, bloqueios, verificações com resultados reais e próxima ação.
- **Os agentes não se comunicam automaticamente.** Processos separados, sem contexto partilhado. Nada presumir sobre o que o outro recebeu, leu ou já terminou.
- **Pedir explicitamente.** Precisando de ação do outro agente, registar o pedido em "Pendências para o outro agente" no quadro. Pedido não registado não existe.
- **Contrato não muda unilateralmente.** Alteração em `docs/api-contract.md` exige anúncio e concordância registada. Divergência vira pendência; o acordo vigente continua válido até ser substituído.
- **Em caso de dúvida, verificar no disco** (arquivos, `git status`) em vez de confiar no quadro, que pode estar desatualizado.
- **Git:** cada agente na sua branch e na sua worktree (DT-003); integração na `main` controlada pelo Pedro; **nenhum commit sem aprovação explícita do Pedro**; `git add` com caminhos explícitos, nunca `-A` ou `.`; sem `stash`, `reset`, `rebase` ou `checkout` de arquivos alheios; commitar apenas a própria área.
- **Revisão cruzada** obrigatória em mudanças de contrato ou de integração (DT-005). Ler o quadro no início da sessão, antes de cada tarefa e antes de cada commit (DT-006).

## Segurança

- Nunca expor segredos ou credenciais no frontend nem no controlo de versão.
- Segredos vivem em variáveis de ambiente fora do repositório; versionar apenas exemplos sem valores reais.
- Validar entrada do utilizador nas fronteiras do sistema.

## Antes de dar algo por concluído

- Executar os testes e verificações relevantes (tipos, lint, build) e **reportar os resultados reais** — incluindo falhas e passos saltados.
- Atualizar a documentação afetada quando uma decisão ou um comportamento documentado mudar.
- Indicar quais ficheiros foram alterados.
