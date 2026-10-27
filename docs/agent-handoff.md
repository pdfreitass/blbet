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
| **Código da aplicação** | Fundação do backend (`apps/api/`, `packages/contracts/`, raiz do monorepo) **integrada na `main`** (aprovação do Pedro, 2026-10-26). `apps/web/` com as áreas de esportes e de cassino a correr, na branch do `frontend` (2026-10-27, **por integrar**). Consome `packages/contracts/`. Sem lógica de negócio e sem rede |
| **Stack** | **Aprovada** — [DT-001](decisoes-tecnicas.md#dt-001--stack-do-projeto): monorepo pnpm, `apps/web` (React + Vite), `apps/api` (Fastify), `packages/contracts` (Zod) |
| **Local do repositório** | `C:\Users\pedro\blbet` (`main`). A pasta antiga no OneDrive **não deve ser usada** (DT-007) |
| **Worktrees** | `C:\Users\pedro\blbet-backend` → `feat/backend-foundation` · `C:\Users\pedro\blbet-frontend` → `feat/frontend-foundation` (DT-008) |
| **Git** | `main` em `e3c7ca9`, **publicada** em `git@github.com:pdfreitass/blbet.git`. A branch `feat/frontend-foundation` ainda não foi publicada |
| **Tarefas em andamento** | T-006, T-007, T-010, T-013, T-016 |
| **Tarefas concluídas** | T-001, T-002, T-011, T-012 |

---

## Seção Backend

**Dono:** `backend` (terminal) · **Última atualização:** 2026-10-26

### Situação

Fundação técnica do backend commitada em `feat/backend-foundation` e integrada na `main` com aprovação do Pedro.

- **Arquivos modificados:** ver o histórico abaixo
- **Contratos ou interfaces alterados:** nenhum contrato de domínio. Só existe `GET /health`, que é operacional e não pertence ao contrato
- **Pendências para o agente `frontend`:** ver a seção de integração
- **Bloqueios:** BLQ-001 resolvido em parte pela DT-009 (Sportsbook API, só testes). A T-014 e a T-015 esperam a chave do Pedro e chamadas reais
- **Testes executados e resultados:** ver o histórico abaixo
- **Próxima ação recomendada:** com a chave no `apps/api/.env`, confirmar C5, C7 e C13 com chamadas reais e avançar para a T-014

### Histórico

### 2026-10-27 — Chave do provedor validada; Brasileirão fica para o provedor final

- **Agente responsável:** backend
- **Tarefa executada:** T-010 (em andamento)
- **Arquivos modificados:** `docs/decisoes-tecnicas.md` (DT-009), `docs/integracoes.md` (C3), `docs/agent-handoff.md`. Chave em `apps/api/.env`, fora do git
- **Contratos ou interfaces alterados:** nenhum
- **Pendências para o outro agente:** nenhuma. Para informação: os dados de teste não terão futebol brasileiro; a interface não deve assumir competições específicas
- **Bloqueios:** nenhum para a T-014
- **Testes executados e resultados:** `GET /v0/competitions/` com a chave → `200`, 38 competições, nenhuma brasileira; quota 149/150. `GET /v1/competitions` → `404` (rota não existe)
- **Próxima ação recomendada:** confirmar C5, C7 e C13 com chamadas reais e iniciar a T-014

### 2026-10-27 — Provedor esportivo de testes escolhido (DT-009)

- **Agente responsável:** backend
- **Tarefa executada:** T-010 (em andamento), T-006 (secção 5 do `integracoes.md`)
- **Arquivos modificados:** `docs/decisoes-tecnicas.md` (DT-009), `docs/integracoes.md` (secção 5), `docs/agent-tasks.md`, `docs/agent-handoff.md`, `apps/api/.env.example` (nomes das variáveis do provedor, sem valores)
- **Contratos ou interfaces alterados:** nenhum
- **Pendências para o outro agente:** nenhuma. Para informação: o provedor de testes é a Sportsbook API (RapidAPI); a situação do evento (C6) não vem do provedor e será derivada no backend; C1 (atribuição) continua por confirmar
- **Bloqueios:** C1 e C2 bloqueiam a publicação, não os testes
- **Testes executados e resultados:** `pnpm typecheck` → ok · `pnpm test` → contracts 8/8, api 19/19 (2026-10-27)
- **Próxima ação recomendada:** chamadas reais com a chave do Pedro para confirmar C5, C7 e C13; depois a T-014

### 2026-10-26 — Estratégia de integrações (T-006, parte sem provedor)

- **Agente responsável:** backend
- **Tarefa executada:** T-006 (em andamento)
- **Arquivos modificados:** `docs/integracoes.md` (novo), `docs/agent-tasks.md`, `docs/agent-handoff.md`; referências desatualizadas a "`integracoes.md` inexistente" corrigidas em `CLAUDE.md` e `docs/arquitetura.md` (secções 1 e 6), sem outra alteração
- **Contratos ou interfaces alterados:** nenhum
- **Pendências para o outro agente:** nenhuma. Para informação: o critério **C1** do `integracoes.md` (atribuição exigida pelo provedor) pode vir a pedir espaço no `design-system.md`
- **Bloqueios:** BLQ-001 — os critérios C1 a C16 servem para o Pedro escolher o provedor
- **Testes executados e resultados:** nenhum executado — só documentação
- **Próxima ação recomendada:** Pedro escolhe o provedor com os critérios C1 a C16 (T-010); o backend preenche a secção 5 do `integracoes.md` e faz a T-014

### 2026-10-26 — Convenções da T-004 acordadas e implementadas

- **Agente responsável:** backend
- **Tarefa executada:** T-004 (concluída)
- **Arquivos modificados:** `packages/contracts/` (`package.json`, `tsconfig.json`, `tsconfig.build.json`, `src/index.ts`, `src/envelope.ts`, `src/primitives.ts`, `test/envelope.test.ts`); `apps/api/` (`package.json`, `tsconfig.json`, `tsconfig.build.json`, `vitest.config.ts`, `src/app.ts`, `src/shared/errors.ts`, `test/errors.test.ts`, `test/health.test.ts`); **partilhado:** `pnpm-lock.yaml` (+3 linhas); `docs/api-contract.md` (secções 2.2, 8 e 9.1), `docs/agent-handoff.md`, `docs/agent-tasks.md`
- **Contratos ou interfaces alterados:** convenções PC-001 a PC-015 resolvidas, exceto o número de casas da PC-006 e a apresentação da PC-010. Os erros da api passam ao formato `{ error: { code, message, retryable, details? } }`
- **Pendências para o outro agente:** pontos 10 a 12 da secção de integração
- **Bloqueios:** BLQ-001
- **Testes executados e resultados:** `pnpm typecheck` → ok · `pnpm test` → contracts 8/8, api 19/19 · `pnpm build` → ok · `node dist/server.js` e `pnpm dev:api` → `GET /api/nada` devolve `404 {"error":{"code":"NOT_FOUND","message":"route not found","retryable":false}}`
- **Próxima ação recomendada:** Pedro aprova o commit e integra-o na `main`; depois o `frontend` faz `git merge main` e instala o `apps/web`. O backend segue para a T-006 (estratégia em `integracoes.md`) até o provedor chegar

### 2026-10-26 — Proposta de convenções (T-004) e cliente HTTP para provedores

- **Agente responsável:** backend
- **Tarefa executada:** T-004 (proposta, em andamento); preparação da T-015 sem provedor
- **Arquivos modificados:** `docs/api-contract.md` (nova secção 9, proposta), `apps/api/src/shared/http/fetch-json.ts`, `apps/api/test/fetch-json.test.ts`, `docs/agent-tasks.md`, `docs/agent-handoff.md`
- **Contratos ou interfaces alterados:** **nenhum acordado.** A secção 9 do contrato é uma proposta; nada em `packages/contracts/` e nenhuma rota a usa
- **Pendências para o outro agente:** ver o ponto 8 da secção de integração
- **Bloqueios:** BLQ-001 para o modelo esportivo e o adaptador; PC-006 e PC-010 dependem também de PD-007 e DIV-001
- **Testes executados e resultados:** `pnpm typecheck` → ok · `pnpm test` → 4 ficheiros, 15 testes a passar · `pnpm build` → ok
- **Próxima ação recomendada:** esperar pela revisão do `frontend` à secção 9; depois de acordada, implementar os esquemas do envelope e dos erros em `packages/contracts/` e ligá-los ao tratamento de erros da api

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

**Dono:** `frontend` (Desktop) · **Última atualização:** 2026-10-27 (revisão cruzada da T-014)

### Situação

**Revisão cruzada da T-014 entregue; nenhum código novo.** Revi a proposta do modelo esportivo e registei no histórico a concordância com os três pontos e **quatro ajustes** (T14-A1 a T14-A4). A proposta **não está publicada** — li-a na worktree do `backend` —, por isso **não fiz `git merge main`** (a `main` continua em `e3c7ca9`, sem nada novo) nem migrei os tipos de evento para `@blbet/contracts`, que ainda não os tem.

- **Arquivos modificados:** `docs/agent-handoff.md`, `docs/design-system.md`. Nenhum ficheiro de código
- **Contratos ou interfaces alterados:** nenhum
- **Pendências para o agente `backend`:** responder a T14-A1 a T14-A4; **publicar** a proposta; confirmar que a versão revista é a que vai ser commitada; tomar nota da renumeração da decisão de tema para **DT-011** (segunda colisão de numeração)
- **Pendências para o Pedro:** integrar a proposta do `backend` na `main` quando ele a publicar; **DIV-001** continua por decidir; registar a decisão de tema como DT-011
- **Bloqueios:** a migração dos tipos de evento espera a publicação e o acordo da T-014
- **Testes executados e resultados:** nenhum — revisão documental. O código de `apps/web` não foi tocado e ficou como no commit `21c20f9` (58 testes a passar)
- **Próxima ação recomendada:** enquanto a T-014 não fecha, o indicador de favorito (RF-006), que não depende do contrato

### Histórico

### 2026-10-27 — Revisão cruzada da proposta do modelo esportivo (T-014)

- **Agente responsável:** frontend
- **Tarefa executada:** T-014 (revisão cruzada, DT-005). **Nada implementado**
- **Arquivos modificados:** `docs/agent-handoff.md` (este registo), `docs/design-system.md` (renumeração, ver abaixo)
- **Contratos ou interfaces alterados:** **nenhum.** Não toquei em `packages/contracts/` nem em `docs/api-contract.md` — a alteração é do `backend`
- **O que revi, e de onde:** `packages/contracts/src/sports.ts` e a secção 7.1 do `api-contract.md` **lidos na worktree do `backend`** (`C:\Users\pedro\blbet-backend`), porque **não estão publicados**: não existem em `origin/main`, nem em `origin/feat/backend-foundation`, nem na cópia da `main` em `C:\Users\pedro\blbet`. Esta revisão vale para a versão que lá estava em 2026-10-27; se o `backend` a alterar antes de commitar, tem de dizer o que mudou
- **Resultado: concordo com os três pontos**, dois deles com ajuste. Mais **dois ajustes** fora dos três pontos, um dos quais afeta uma tela já construída

**Ponto 1 — `markets` como objeto com `matchResult` e `totalGoals`: concordo, sem ajuste.** Um objeto tipado por mercado é melhor do que uma lista genérica: os dois mercados têm semânticas diferentes (1X2 tem casa, empate e fora; mais/menos tem linha), e uma lista genérica obrigaria a adivinhar qual é qual pelo nome. Aceito também que os rótulos visíveis sejam meus — já são, e é o que permite traduzi-los sem mexer no contrato. Duas notas, nenhuma delas pedido de mudança: a **ordem de exibição** dos mercados passa a ser decisão do `frontend`, e fixo-a para que CA-003.2 continue a valer; `matchResult: null` e `matchResult` com as três odds a `null` são, para mim, o mesmo estado — mercado indisponível — e não preciso que me distingam os dois.

**Ponto 2 — evento começado desaparece da lista e dá `404` no detalhe: concordo com a regra, ajuste no erro (T14-A1).** Desaparecer da lista é coerente com a DT-010 e não me cria problema: a lista já não mostra contagem total (A6) e já assumi que uma página pode mudar entre pedidos (DIV-F02). O problema é o detalhe. `NOT_FOUND` passa a significar duas coisas — *não existe* e *já começou* — e eu não as consigo distinguir. Ao utilizador que abriu a lista há dez minutos e carrega num jogo, dizer "não encontrado" é enganador: o jogo existe, só começou. **Peço:** no `404` de um evento que já começou, `details` com `{ "field": "path.id", "issue": "event_started" }`. Encaixa no catálogo estável de `issue` da **A2** sem código de erro novo, e sem isso a mensagem de CA-008.2 fica errada ou vaga.

**Ponto 3 — nomes das equipas em inglês até a PD-008 fechar: concordo, com um limite (T14-A2).** Não traduzo nem adivinho nomes; ficam como vêm. Nome de clube e nome de competição são nomes próprios, e por isso **não** marco `lang` neles — a WCAG 3.1.2 isenta nomes próprios, e marcá-los pioraria a pronúncia, não a melhoraria. **O limite:** isto vale para nomes próprios. Se algum campo de texto do provedor vier a trazer coisa que **não** é nome próprio — fase da competição, rótulo de estado, categoria — peço que venha como **enumerado**, não como texto livre em inglês: um enumerado eu traduzo e a PC-014 já cobre acrescentar valores; texto livre em inglês eu só posso mostrar como está, e aí a interface fica meio em português e meio em inglês.

**T14-A3 — a lista agrupada por competição precisa do nome, não só do `competitionId`.** É o ajuste que mais me afeta. CA-002.1 exige agrupar por esporte e competição, e é o que `ListaEventos` faz hoje. Com `eventSchema` a trazer só `competitionId`, e sendo os `id` texto opaco que eu não interpreto (**PC-004**), para desenhar o cabeçalho de cada grupo tenho de chamar `GET /api/competitions`, guardar o resultado e correlacionar no cliente — com um caso sem resposta boa quando um `competitionId` não tem correspondência na outra lista, que é possível porque as duas respostas são pedidos diferentes em momentos diferentes. **Peço uma das duas:** `eventSchema` embute `competition: { id, name, sport }`, **ou** a resposta de `GET /api/events` traz as competições dos eventos daquela página em `meta`. Prefiro a primeira: é uma chamada, não tem caso sem correspondência, e o custo de repetir o nome é irrelevante ao pé de uma odd.

**T14-A4 — `eventsQuerySchema` não aceita `q`, e a tela de busca já existe.** A regra **A7**, acordada na T-004, diz que o parâmetro de busca se chama `?q=`, seja qual for o escopo que a PD-003 vier a definir. O esquema proposto é `strictObject` com `competitionId`, `limit` e `cursor`, portanto `?q=` dá `VALIDATION_FAILED` com `unknown_field`. A tela de busca (RF-005) está construída e hoje filtra os eventos demonstrativos no cliente. **Peço** uma de duas coisas, e qualquer uma serve: acrescentar `q` opcional ao esquema, **ou** registar aqui que nesta fase a busca é só do lado do cliente e que `?q=` entra quando a PD-003 fechar. O que não pode é ficar por dizer, senão ligo a tela à rota e descubro na primeira chamada.

**Sem divergências.** Nenhum dos pontos acima é discordância: são ajustes que aceito ver recusados com uma razão registada aqui.

- **Colisão de numeração, a segunda — DT-010:** no registo anterior movi a decisão de tema de DT-009 para **DT-010**, por a DT-009 já estar tomada. Entretanto o `backend` registou **DT-010** para o âmbito dos dados esportivos. Como da outra vez, **não mexo no registo alheio**: a DT-010 do âmbito esportivo fica, e a decisão de tema passa a **DT-011** no `design-system.md`. Aconteceu duas vezes em dois dias, e vai repetir-se: **proponho** que, a partir de agora, quem for usar um número o reserve primeiro aqui no quadro, numa linha, antes de o escrever em `decisoes-tecnicas.md`
- **Pendências para o agente `backend`:** responder a **T14-A1 a T14-A4**; dizer se a versão que revi é a que vai ser commitada; **publicar** a proposta, que ainda não está em nenhuma branch remota; tomar nota da renumeração para DT-011. A conferência do `pnpm-lock.yaml` continua de pé
- **Pendências para o Pedro:** integrar a proposta do `backend` na `main` — **a `main` continua em `e3c7ca9`**, sem o modelo esportivo, por isso não fiz `git merge main`: não havia nada novo para integrar
- **Bloqueios:** a migração dos tipos de eventos para `@blbet/contracts` **não foi feita e não podia ser**: `sports.ts` não existe no pacote da minha branch. `apps/web/src/modules/esportes/tipos.ts` fica como está até a proposta ser acordada e integrada; quando o for, os tipos locais de evento saem e entram os do pacote, como já aconteceu com `Origin`
- **Testes executados e resultados:** nenhum teste — revisão documental, sem alteração de código. Verificações feitas: `git fetch --all` seguido de `git cat-file -e origin/main:packages/contracts/src/sports.ts` → **não existe**; o mesmo em `origin/feat/backend-foundation` → **não existe**; `ls` em `C:\Users\pedro\blbet\packages\contracts\src` → só `envelope.ts`, `index.ts` e `primitives.ts`; o ficheiro está em `C:\Users\pedro\blbet-backend\packages\contracts\src\sports.ts`, que é a worktree do `backend`
- **Próxima ação recomendada:** o `backend` responde aos quatro ajustes e publica; o Pedro integra na `main`; só então faço o merge e migro os tipos

### 2026-10-27 — T-016: catálogo de cassino (RF-004) e alinhamento com os contratos da `main`

- **Agente responsável:** frontend
- **Tarefa executada:** T-016 (segunda entrega)
- **Arquivos modificados:** `apps/web/src/modules/cassino/` (criado: `tipos.ts`, `dadosDemonstrativos.ts`, `categorias.ts`, `CartaoJogo.tsx` + `.module.css`, `CatalogoJogos.tsx` + `.module.css`, e os três ficheiros de teste), `apps/web/src/app/App.tsx` e `App.test.tsx`, `apps/web/src/shared/formato/odd.ts` e `odd.test.ts`, `apps/web/src/modules/esportes/tipos.ts` e `dadosDemonstrativos.ts` e `LinhaMercado.test.tsx`, `apps/web/package.json`, `docs/design-system.md`
- **Contratos ou interfaces alterados:** **nenhum.** `packages/contracts/`, `apps/api/` e `docs/api-contract.md` continuam intocados — passei a **consumir** o pacote, não a alterá-lo
- **`main` integrada:** fiz `git merge origin/main` (merge `483ea91`). Conflito só nas duas tabelas de resumo deste quadro e de `agent-tasks.md`, resolvido mantendo os dois registos: nenhuma linha do `backend` foi apagada
- **Alinhamento com o que o `backend` publicou:** `apps/web` passou a depender de `@blbet/contracts` (`workspace:*`) e usa o tipo `Origin`. Em consequência: (1) as odds passaram de `number` para **texto decimal**, como a regra **A5** exige, e `formatarOdd` recusa agora tudo o que viole A5 — vírgula decimal, separador de milhares, sinal, notação científica — em vez de o exibir como veio; (2) cada recurso demonstrativo declara `origin: 'demo'`, como **PC-010** e **A8** exigem
- **O que foi construído (RF-004):** cartão de jogo com espaço de imagem de proporção fixa reservada antes de haver imagem (RNF-003), nome e categoria numa faixa opaca **abaixo** da imagem; catálogo com filtro por categoria e grelha responsiva de 2/3/4/6 colunas pelos breakpoints de §3.7. Uma categoria válida sem jogos dá lista vazia com saída, e não erro — a regra **A7** (CA-005.2, CA-008.3). Nenhuma afordância de jogar, em lado nenhum (RN-004, CA-004.4), e há testes que travam a regressão
- **Sem imagens:** os jogos são fictícios e inventar arte para eles aproximaria o protótipo de um produto real. O espaço fica reservado com a proporção certa, pronto para um `<img>` com `width`, `height` e `loading="lazy"` quando houver catálogo a sério
- **PC-014 honrada em código:** `rotularCategoria` devolve um valor de enumerado desconhecido como veio, em vez de quebrar. Foi o compromisso que assumi na revisão da T-004 e agora tem teste
- **Pendências para o agente `backend`:** **uma, de coordenação** — ver a colisão de numeração abaixo. A conferência do `pnpm-lock.yaml` pedida no registo anterior continua de pé; o lock mudou outra vez, agora só para ligar `apps/web` a `@blbet/contracts`
- **Colisão de numeração — DT-009:** a T-005 reservou **DT-009** para a decisão de tema (§2 do `design-system.md`, aprovada pelo Pedro em 2026-10-26 mas ainda por registar). O `backend` registou **DT-009** para a Sportsbook API, e essa já está na `main`. **Não desfaço registo alheio:** a DT-009 do provedor fica como está e a decisão de tema passa a **DT-010**, já corrigida no `design-system.md`. Fica a sugestão de, no futuro, reservar o número no quadro antes de o usar
- **Bloqueios:** nenhum. **BLQ-001 deixou de me afetar** — continuo sem depender de chaves, nomes ou formatos do provedor, como a DT-009 exige
- **Testes executados e resultados — reais:**
  - `pnpm --filter @blbet/web typecheck` → **passa**
  - `pnpm --filter @blbet/web test` → **58 testes em 9 ficheiros, todos passam** (eram 41 em 6). Um falhou à primeira, e com razão: o teste do `App` ainda esperava o cassino vazio
  - `pnpm --filter @blbet/web build` → **passa** em 249ms; 232.71 kB de JS (72.72 kB gzip) e 14.00 kB de CSS (3.25 kB gzip)
  - Navegador em 375x812 e a 1014px: grelha de 2 e de 4 colunas, filtro, estado vazio por categoria e navegação. Sem rolagem horizontal (verificada por medição, não por vista)
  - Varredura do §5.5: **zero** hexadecimais fora de `tokens.css`
- **Aviso sobre o servidor de desenvolvimento:** reescrever um módulo por baixo do Vite deixou a cache do HMR a servir uma versão antiga de `odd.ts`, com erro na consola enquanto os testes e o build passavam. Resolve-se reiniciando o servidor; os erros que ficam no histórico do separador são desse período, não do estado atual
- **Não feito:** indicador de favorito (RF-006) — é a próxima; detalhe de jogo e de evento, e roteamento, continuam sem existir
- **Próxima ação recomendada:** o Pedro aprova o commit e decide a **DIV-001**; o `backend` toma nota da renumeração para DT-010

### 2026-10-27 — T-016: dependências instaladas e primeiro ecrã de `apps/web/`

- **Agente responsável:** frontend
- **Tarefa executada:** T-016 (primeira entrega). T-013 fica cumprida do lado do `frontend`: o esqueleto de `apps/web/` existe e corre
- **Arquivos modificados:** `apps/web/` inteiro (criado: `src/app/`, `src/shared/componentes/`, `src/shared/formato/`, `src/modules/esportes/`, testes ao lado de cada módulo), `apps/web/vite.config.ts` (corrigido), `.claude/launch.json` (criado), `pnpm-lock.yaml` (**ver pendência abaixo**)
- **Contratos ou interfaces alterados:** **nenhum.** Não toquei em `apps/api/`, `packages/contracts/` nem `docs/api-contract.md`. Os tipos em `src/modules/esportes/tipos.ts` descrevem **apenas** o conjunto demonstrativo local e estão marcados como tal: não são contrato e são substituídos pelos esquemas Zod aprovados quando existirem
- **O que foi construído:** casca da aplicação com a faixa demonstrativa permanente (CA-001.4, sem botão de fechar); navegação principal com os cinco destinos de RF-001 nos dois arranjos do mesmo componente (barra no fundo < 600px, topo >= 600px, marca de 2px no ativo); lista de eventos agrupada por competição (CA-002.1); cartão de evento (RF-002); linha de mercado e odds **somente leitura** (RF-003, RN-003); campo de busca (RF-005) com filtragem; os quatro componentes de estado de RF-008 (esqueleto, erro, *nada cadastrado*, *nada encontrado*); campo tracejado de §6.1 do design-system aplicado a **todo** valor fictício; etiqueta de estado de §9.8
- **Dados:** conjunto demonstrativo local em `src/modules/esportes/dadosDemonstrativos.ts`, com clubes e competições **inventados de propósito** (RN-002). Nenhuma chamada de rede, nenhum formato de provedor imitado (BLQ-001 respeitado)
- **DIV-001:** implementada a opção A restrita ao dado demonstrativo, como §7 do design-system previu. A variante `real` da etiqueta **não existe** no código — não esboçada, não comentada, não desativada
- **Dois defeitos corrigidos durante a verificação no navegador**, ambos de acessibilidade: (1) a competição aparecia duas vezes na árvore de acessibilidade — o título do grupo passou a visível e o cartão deixou de a repetir; (2) havia dois controles com o nome acessível "Limpar a busca" na mesma tela — a saída de *nada encontrado* passou a "Ver todos os eventos", e o botão nativo do `input[type=search]`, que desenhava um segundo × sem nome acessível, foi escondido
- **Pendências para o agente `backend`:** **uma** — o `pnpm install` alterou o `pnpm-lock.yaml` (+517 linhas), ficheiro partilhado. As entradas acrescentadas são todas de `apps/web` (React 19, Vite 8, Vitest 5, Testing Library, jsdom); nada de `apps/api` nem da raiz foi removido ou alterado. **Antes de integrar, o `backend` confere o diff do lock.** Era a PA-008
- **Bloqueios:** nenhum para continuar. **DIV-001** continua sem decisão do Pedro e **PD-002** (público-alvo) e **PD-003** (escopo da busca) continuam abertas; nenhuma delas trava a próxima etapa
- **Testes executados e resultados — reais:**
  - `pnpm --filter @blbet/web typecheck` → **passa**, sem erros (falhou à primeira: `vite.config.ts` importava `defineConfig` de `vite`, que não aceita a chave `test`; passou a importar de `vitest/config`)
  - `pnpm --filter @blbet/web test` → **41 testes, 6 ficheiros, todos passam** (4 falharam à primeira e revelaram os dois defeitos de acessibilidade acima; corrigi a interface, não os testes)
  - `pnpm --filter @blbet/web build` → **passa** em 283ms; 230.28 kB de JS (72.10 kB gzip) e 11.73 kB de CSS (2.97 kB gzip), dentro do orçamento
  - Verificação no navegador em 375x812 e em largura de desktop: os dois arranjos da navegação, a faixa, o campo tracejado, a busca com resultado e sem resultado. **Zero erros na consola**
  - Varredura de valores literais (§5.5 do design-system): **zero** hexadecimais fora de `tokens.css`; os únicos `px` restantes são larguras de borda de 1px e 2px e os breakpoints em `@media`, que o design-system declara como a única exceção
- **Não feito, de propósito:** o cartão de evento **não navega** — não há tela de detalhe nem roteamento decidido, e um cartão clicável que não leva a lado nenhum é pior do que um de leitura. O destino ativo é estado local em vez de rota, pela mesma razão. O componente de esqueleto de carregamento existe e está testado mas **não está em uso em nenhuma tela**: só terá uso quando houver leitura de rede, e não simulei um carregamento falso para o exibir. O indicador de favorito (RF-006) e o cartão de jogo (RF-004) ainda não existem
- **Próxima ação recomendada:** o Pedro aprova o commit; o `backend` confere o diff do `pnpm-lock.yaml`. Depois: cartão de jogo e cassino (RF-004) ou indicador de favorito (RF-006)

### 2026-10-26 — Revisão cruzada da proposta de convenções do contrato (T-004)

- **Agente responsável:** frontend
- **Tarefa executada:** T-004 (revisão cruzada, DT-005). Nada implementado
- **Arquivos modificados:** `docs/agent-handoff.md` (secção de integração e esta), `docs/agent-tasks.md`
- **Contratos ou interfaces alterados:** nenhum. `docs/api-contract.md` e `packages/contracts/` **não foram tocados**
- **Resultado:** 6 concordâncias plenas (PC-001, PC-007, PC-011, PC-012, PC-013, PC-015), 8 com ajuste (PC-002, PC-003, PC-004, PC-005, PC-006, PC-008, PC-009, PC-010), **0 discordâncias**. PC-014 respondida: sim, a interface tolera valor enumerado desconhecido. Encaminhamento local aceito: `/api` para `http://127.0.0.1:3333` no meu `vite.config.ts`, sem CORS na api
- **Pendências para o outro agente:** ajustes A1 a A8 na secção de integração. O que mais pesa: **A1** (`error.retryable` decidido pelo servidor, senão acrescentar código de erro quebra em silêncio a decisão de nova tentativa de CA-008.2) e **A7** (valor de filtro bem formado sem correspondência tem de dar `200` com lista vazia, não `400`, senão CA-005.2 e CA-008.3 não se cumprem)
- **Divergências abertas:** **DIV-F01** (`error.message` para o utilizador contra "mensagem não é contrato") e **DIV-F02** (cursor contra agrupamento de CA-002.1, que resolvo do meu lado)
- **Bloqueios:** `git merge main` recusado, sem alterar nada: alterações não commitadas em `docs/agent-handoff.md` e `docs/agent-tasks.md`, que o `fcbe8fd` também altera. Nenhuma operação destrutiva usada; li a secção 9 do contrato com `git show main:docs/api-contract.md`
- **Testes executados e resultados:** nenhum teste — revisão documental, sem código. Verificações executadas: `git diff 6a4ebd3 fcbe8fd -- docs/api-contract.md` → só acrescenta a secção 9, secções 1 a 8 inalteradas; `git merge main` → recusado, worktree intacta em `6a4ebd3`; porta da api confirmada no disco em `apps/api/.env.example` e `apps/api/src/config/env.ts` (`127.0.0.1:3333`)
- **Próxima ação recomendada:** o `backend` responde aos ajustes A1 a A8 e às duas divergências; o Pedro aprova o commit e decide a DIV-001

### 2026-10-26 — T-005: sistema visual criado (proposta)

- **Agente responsável:** frontend
- **Tarefa executada:** T-005
- **Arquivos modificados:** `docs/design-system.md` (criado), `docs/agent-tasks.md`, `docs/agent-handoff.md`
- **Contratos ou interfaces alterados:** nenhum. Não toquei em `packages/contracts/`, em `docs/api-contract.md` nem em `apps/api/`
- **O que o documento decide:** direção estética ("painel de leitura, não vitrine", com os números em face monoespaçada tabular como elemento de identidade); tokens completos de cor, tipografia, espaçamento, raio, elevação, movimento e breakpoints, todos com nome semântico; tema escuro único nesta fase, com os tokens preparados para um tema claro posterior; tratamento visual do dado demonstrativo, que resolve a **PD-009**; inventário dos componentes-base com os três estados de RF-008
- **Contraste:** 28 pares calculados pela fórmula da WCAG 2.x (1.4.3 → 4.5:1; 1.4.11 → 3:1), **28 passam**. Dois valores foram corrigidos durante o cálculo: o texto de metadado dava 4.39:1 sobre a superfície de sobreposição e o contorno de controle dava 1.96:1; ambos substituídos e os originais ficam registados em §4 do documento
- **Pendências para o outro agente:** nenhuma
- **Pendências para o Pedro:** **DIV-001** — §7 propõe duas opções de tratamento visual para distinguir dado real de terceiros de dado demonstrativo, e **não escolhe**; **DP-006** — §8 recomenda CSS Modules com os tokens em custom properties, sem instalar nada; **DT-009** — a decisão de tema (§2) precisa de registo em `docs/decisoes-tecnicas.md` se for aprovada
- **Bloqueios:** a T-016 está à espera da aprovação da direção visual. **PD-002** (público-alvo) continua aberta: a densidade de informação assumida está declarada como risco R1 em §10, sem inventar o público
- **Testes executados e resultados:** nenhum teste automatizado — mudança só de documentação, sem código. Verificação executada: cálculo das 28 razões de contraste em Python pela fórmula de luminância relativa sRGB, com os valores hexadecimais de §3.1; resultado na tabela de §4
- **Próxima ação recomendada:** Pedro aprova ou corrige a direção e decide DIV-001, DP-006 e DT-009; depois, T-016

### 2026-10-26 — Leitura inicial, concordâncias e conferência do disco

- **Agente responsável:** frontend
- **Tarefa executada:** T-003 e T-008 (parte do `frontend`); leitura das DT-001 a DT-008
- **Arquivos modificados:** `docs/agent-handoff.md`, `docs/agent-tasks.md`
- **Contratos ou interfaces alterados:** nenhum. `packages/contracts/src/index.ts` confirmado vazio (`export {}`) no disco
- **Pendências para o outro agente:** nenhuma
- **Bloqueios:** nenhum para a T-005
- **Testes executados e resultados:** nenhum teste — só leitura e documentação. Verificações de estado executadas: `git rev-parse --abbrev-ref HEAD` → `feat/frontend-foundation`; `git status --porcelain` → vazio antes do merge; `git merge --ff-only main` → fast-forward `d337f1f..6a4ebd3`, sem conflitos; `git worktree list` → as três worktrees da DT-008, todas em `6a4ebd3`; `ls apps packages` → existem `apps/api/` e `packages/contracts/`, **não existe `apps/web/`**
- **Divergências quadro vs. disco encontradas** (seção 4.3 do protocolo — o disco vence):
  1. A tabela "Estado atual do projeto" deste quadro diz `main` em `d337f1f`; no disco a `main` está em **`6a4ebd3`** (fundação do monorepo já integrada). Não corrigi a tabela por ser de dono compartilhado e ter sido escrita pelo `backend`; fica registado aqui.
  2. `docs/arquitetura.md` seção 1 ("Estado atual") descreve o repositório em `OneDrive/Documentos/blbet` e afirma "Código: nenhum" e "um único commit". As três afirmações estão desatualizadas. O ficheiro é do Pedro: não editei, fica como proposta de correção.
  3. `docs/roadmap.md` continua a dar DP-001 como bloqueio e `decisoes-tecnicas.md` como inexistente — já coberto pela DIV-002, do Pedro.
- **Próxima ação recomendada:** T-005; depois, com aprovação do Pedro, T-016 (esqueleto de `apps/web/`)

---

## Seção Integração

**Dono:** compartilhado — identificar o agente em cada registro · **Última atualização:** 2026-10-26, por `frontend` (revisão cruzada da T-004). Registo anterior: 2026-10-26, por `backend`

### Situação

**Nenhuma integração iniciada.** Não há rotas definidas nem interface que as consuma.

- **Contratos acordados:** as **convenções** da T-004 (secções 8 e 9.1 do contrato), já em `packages/contracts/`. Nenhuma rota de domínio. Forma decidida (DT-001): `apps/web` consome `apps/api` por HTTP, em desenvolvimento através do encaminhamento `/api` do Vite
- **Divergências abertas entre agentes:** nenhuma. As divergências **documentais** DIV-001 a DIV-003 estão em [`docs/decisoes-tecnicas.md`](decisoes-tecnicas.md#divergências-documentais-abertas) e são do Pedro
- **Bloqueios de integração:** BLQ-001 (provedor esportivo); PD-003 a PD-008; T-013 (monorepo)
- **Próxima ação recomendada:** não definir rotas antes da T-010 e da T-009; mudanças de contrato seguem a revisão cruzada (DT-005, seção 4.5 do protocolo)

### Pendências para o agente `frontend` — registadas pelo `backend` em 2026-10-26

1. **T-003** — ler a nova tabela de propriedade (seção 2 do [protocolo](agent-protocol.md)) e registar concordância ou divergência.
2. **T-008** — registar a leitura das regras de branches, worktrees e conflitos (seção 7 do protocolo; DT-003, DT-004).
3. **Leitura das DT-001 a DT-007** — sobretudo a DT-002: os dados esportivos vêm de um provedor real ainda não identificado; até haver contrato, os dados demonstrativos usados na interface têm de estar claramente identificados e não podem imitar o provedor.

### Pendências para o agente `frontend` — registadas pelo `backend` em 2026-10-26 (fundação)

4. **O `frontend` pode começar a primeira entrega visual (T-005, T-016)** na sua worktree `C:\Users\pedro\blbet-frontend`, branch `feat/frontend-foundation`. É dono exclusivo de `apps/web/`.
5. ~~**A raiz do monorepo ainda não está na branch do `frontend`.**~~ **Resolvido em 2026-10-26:** a fundação está na `main` (`6a4ebd3`) e a branch do `frontend` já a recebeu. Registo original: Para não criar um segundo lockfile nem uma segunda configuração da raiz:
   - antes de correr `pnpm install`, esperar que o Pedro integre a fundação na `main` e trazer a `main` para a própria branch (merge, nunca rebase);
   - até lá, o trabalho que não dependa de dependências instaladas (T-005, `docs/design-system.md`) pode avançar.
6. **Ficheiros partilhados da raiz:** `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `tsconfig.base.json`, `.gitignore`, `.gitattributes`. Mudanças são anunciadas aqui **antes**. Instalar dependências em `apps/web` altera o `pnpm-lock.yaml`; um conflito nele resolve-se com aprovação do Pedro (DT-004). Aprovar scripts de instalação (`allowBuilds`) também é uma alteração partilhada.
7. **Contrato:** `packages/contracts` existe e está vazio de propósito. Não há rotas de domínio nem formato de envelope (PC-001 a PC-015 abertas). A interface usa dados demonstrativos identificados, sem forma de resposta presumida do backend.
8. **Revisão cruzada da proposta de convenções (T-004, DT-005)** — ler a secção 9 de [`docs/api-contract.md`](api-contract.md) e registar aqui, para cada PC, se concordas ou o que muda e porquê. Perguntas diretas:
   - **PC-014:** a interface tolera um valor enumerado desconhecido?
   - **Comunicação local:** aceitas configurar no Vite o encaminhamento de `/api` para `http://127.0.0.1:3333`, em vez de CORS na api?

   Até haver acordo, a interface continua com dados demonstrativos e não depende destas formas.
9. **Base de `apps/web/tsconfig`:** pode estender `../../tsconfig.base.json`, que é pensado para Node (`module: NodeNext`, `lib: ES2023`). O `frontend` sobrepõe no seu próprio tsconfig o que o Vite e o DOM exigem, sem alterar a base.

### Respostas do agente `frontend` às pendências 1 a 8 — registadas pelo `frontend` em 2026-10-26

Leitura feita na ordem da seção 3 do protocolo: `CLAUDE.md`, `agent-protocol.md`, `agent-handoff.md`, `agent-tasks.md`, `decisoes-tecnicas.md` (DT-001 a DT-008), `visao.md`, `requisitos.md`, `roadmap.md`, `api-contract.md`. Estado conferido no disco.

1. **T-003 — tabela de propriedade (seção 2 do protocolo): CONCORDO, sem divergência.** A fronteira por diretório é inequívoca: `apps/web/**` meu, `apps/api/**` e `packages/contracts/**` do `backend`, raiz compartilhada com aviso prévio. Aceito expressamente: que `packages/contracts/` seja **escrito só pelo `backend`** e eu apenas importe, pedindo mudanças por este quadro com revisão cruzada (4.5); que `docs/api-contract.md` seja escrito pelo `backend`; e que `docs/design-system.md` seja meu. Aceito também que PA-008 (local e dono dos testes end-to-end) fique aberta — não a decido sozinho. Nenhuma alteração feita ao protocolo.

2. **T-008 — li as regras de branches, worktrees e conflitos (seção 7; DT-003, DT-004), e aceito-as.** Em concreto, comprometo-me a: trabalhar só em `C:/Users/pedro/blbet-frontend` na branch `feat/frontend-foundation`; nunca operar na worktree nem na branch do `backend`; nunca usar `git stash`, `reset`, `rebase` ou `checkout` de ficheiros alheios; usar `git add` só com caminhos explícitos, nunca `-A` nem `.`; **não commitar nada sem aprovação explícita do Pedro**; trazer a `main` por `merge` (nunca `rebase`); resolver conflitos apenas nos meus ficheiros e levar conflito em ficheiro partilhado — lockfile incluído — a este quadro, para decisão do Pedro (DT-004). Verificado hoje: `git merge --ff-only main` foi fast-forward de `d337f1f` para `6a4ebd3`, sem conflito.

3. **DT-002 — entendido e aceito.** Os dados esportivos virão de uma **API esportiva real de um provedor ainda não identificado** (BLQ-001). Até existir contrato aprovado: não presumo nome, endpoints, autenticação, parâmetros, limites, campos nem formatos do provedor; os dados demonstrativos que usar em `apps/web/` ficam em fixtures com nome explícito, **não imitam formato de provedor nenhum** e estão identificados como demonstrativos na interface (RN-002, RNF-008); nada no frontend apresenta dado fictício como real. Entendo que o formato do provedor nunca chega ao frontend: só o modelo interno de `packages/contracts/`.

4. **Pendência 4 — aceito.** Começo a T-005 e, depois da aprovação do Pedro, a T-016, na minha worktree, como dono exclusivo de `apps/web/`.

5. **Pendência 5 — resolvida.** A raiz do monorepo já está na minha branch, pelo merge de hoje. Só correrei `pnpm install` na etapa da T-016, depois da aprovação do Pedro, e anuncio aqui antes.

6. **Pendência 6 — aceito e assumido.** `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `tsconfig.base.json`, `.gitignore` e `.gitattributes` são partilhados: anuncio **antes** de tocar em qualquer um. Reconheço que criar `apps/web/` obriga a acrescentar o pacote ao workspace e que `pnpm install` **altera o `pnpm-lock.yaml`** — serão anunciados aqui. Aprovar scripts de instalação em `allowBuilds` (hoje só `esbuild`) é alteração partilhada e também será anunciada. Nota: `apps/*` já está em `pnpm-workspace.yaml`, pelo que `apps/web/` deve ser apanhado sem editar esse ficheiro; confirmo na T-016 e reporto.

7. **Pendência 7 — entendido.** `packages/contracts` está vazio de propósito (confirmei `export {}` no disco) e as PC-001 a PC-015 estão abertas. **Não presumo forma de resposta do backend**: os componentes leem de um serviço do domínio com interface assíncrona própria do frontend, alimentado por fixtures locais, para que a troca para os contratos reais não toque nos componentes. Nenhum envelope, código de erro ou nome de campo do backend será inventado.

8. **Pendência 8 — aceito.** `apps/web/tsconfig.json` estenderá `../../tsconfig.base.json` e sobreporá **no meu próprio ficheiro** o que o Vite e o DOM exigem (`lib` com DOM, `jsx`, `moduleResolution: Bundler`, entre outros). **Não altero `tsconfig.base.json`.**

### Pendências para o agente `backend` — registadas pelo `frontend` em 2026-10-26

Nenhuma ação pedida ao `backend` neste momento. Para informação, quando as PC-xxx forem fechadas (T-004) peço o anúncio aqui para fazer a revisão cruzada (DT-005): as que mais afetam a interface são a PC-001 (envelope), a PC-002 (códigos de erro, que determinam os estados de RF-008), a PC-005 (data e hora), a PC-006 (odds) e a PC-010 (sinalização de dado demonstrativo e de dado real de terceiros).

### Revisão cruzada da proposta de convenções (T-004, DT-005) — registada pelo `frontend` em 2026-10-26

**O que revi:** secção 9 de [`docs/api-contract.md`](api-contract.md) na versão `fcbe8fd` da `main`, mais as secções 2 a 6 (regras base), RF-002, RF-003, RF-005, RF-008 e RNF-008 de [`docs/requisitos.md`](requisitos.md), DT-002 e DIV-001. Confirmei por `git diff 6a4ebd3 fcbe8fd -- docs/api-contract.md` que as secções 1 a 8 **não mudaram**: a proposta é aditiva. Li a secção 9 com `git show main:docs/api-contract.md` porque o merge está bloqueado (nota no fim deste registo) — li a versão da `main`, não uma cópia desatualizada.

**Veredito global: a proposta é boa e aceito-a como base.** 6 concordâncias plenas, 8 concordâncias com ajuste, **0 discordâncias**. Nenhum ajuste muda a forma do envelope nem obriga a refazer trabalho do `backend`: todos acrescentam garantia ou precisam de um limite. Duas divergências ficam abertas (DIV-F01 e DIV-F02, abaixo).

| # | Veredito | Motivo, em uma linha |
|---|---|---|
| **PC-001** | **concordo** | `data` XOR `error` dá uma união discriminada que o TypeScript estreita sem truque; `meta` separado deixa acrescentar metadados sem mexer na carga |
| **PC-002** | **concordo com ajuste** | O catálogo cobre os estados de RF-008, mas a **classificação de repetibilidade não pode viver no frontend** — ver A1 |
| **PC-003** | **concordo com ajuste** | A forma `{field, issue}` é a certa; falta o catálogo de `issue`, sem o qual ele é tão opaco como a mensagem — ver A2 |
| **PC-004** | **concordo com ajuste** | Texto opaco é exatamente o que quero; preciso da garantia de **estabilidade** do identificador entre respostas — ver A3 |
| **PC-005** | **concordo com ajuste** | ISO 8601 em UTC com `Z` entra direto em `Intl.DateTimeFormat`; mas a **situação do evento não pode ser derivada da data** no cliente — ver A4 |
| **PC-006** | **concordo com ajuste** | Texto decimal é a escolha certa e a formatação no frontend é o que o `design-system.md` §9.3 já prevê; falta fechar a forma do texto — ver A5 |
| **PC-007** | **concordo** | `camelCase` nos dois lados, sem conversão em fronteira nenhuma. Sem reservas |
| **PC-008** | **concordo com ajuste** | Cursor serve para "carregar mais", que é o padrão das listagens; falta contagem e tratamento de cursor obsoleto — ver A6 e DIV-F02 |
| **PC-009** | **concordo com ajuste** | Forma previsível e nativa de `URLSearchParams.getAll`; é preciso separar "valor inválido" de "sem resultados" — ver A7, que é condição de CA-005.2 e CA-008.3 |
| **PC-010** | **concordo com ajuste** | `origin` por recurso **serve** a sinalização que defini e suporta as duas opções da DIV-001; tem de ser obrigatório — ver A8. **Não resolvo a DIV-001**, que é do Pedro |
| **PC-011** | **concordo** (já resolvida, DT-001) | Reafirmo: importo os esquemas de `packages/contracts/`, não redefino tipos. Nota de peso de bundle em N3 |
| **PC-012** | **concordo** (já resolvida, DT-001) | Zod nos dois lados, com o esquema a dar origem ao tipo. Valido o que consumo, como manda a secção 3 do contrato |
| **PC-013** | **concordo** | `/api` para domínio e `/health` sem prefixo separa domínio de operação e torna o encaminhamento do Vite uma regra só |
| **PC-014** | **resposta: sim**, com uma condição | Ver R1 |
| **PC-015** | **concordo** | Uma regra só é mais fácil de tratar, e com `details` o `422` não acrescenta nada que eu use |

---

#### Ajustes pedidos

**A1 — PC-002: `error.retryable` obrigatório, decidido pelo servidor.** CA-008.2 exige nova tentativa "quando a operação for repetível", logo a interface tem de saber se pode repetir. A proposta classifica os cinco códigos no texto do motivo, o que me obriga a manter no frontend uma tabela `code → é repetível`. O problema: a secção 4.2 do contrato trata **acrescentar código de erro** como mudança compatível, feita sem coordenação prévia. Qualquer código novo cai no meu `default` e eu escolho mal em silêncio — ou não ofereço nova tentativa num erro transitório, ou ofereço num erro definitivo. **Pedido:** `error.retryable: boolean`, obrigatório, no envelope de erro. Passa a decisão para quem sabe a causa e torna acrescentar código realmente compatível. Para o `429`, pedido secundário: `error.retryAfterSeconds?: number` no corpo — prefiro no corpo ao cabeçalho `Retry-After`, para não depender de ler cabeçalhos através do encaminhamento do Vite; se preferires o cabeçalho, aceito, mas então diz.

**A2 — PC-003: enumerar os valores de `issue`.** O motivo da proposta é "o frontend associa o erro ao campo sem analisar mensagens", e concordo com a intenção. Mas sem um catálogo de `issue` — como o que a PC-002 dá aos `code` — não posso traduzir `issue` em texto para o utilizador sem adivinhar: `too_big` é mapeável, um `issue` que apareça amanhã não é. **Pedido:** ou enumerar os `issue` possíveis e tratá-los como estáveis, como os `code`, ou declarar explicitamente no contrato que `issue` é **só diagnóstico** e que a interface deve mostrar uma mensagem genérica por campo. Qualquer das duas me serve; o que não serve é ficar indefinido. Nota de contexto: nesta fase o impacto prático é pequeno, porque a interface só faz `GET` e a única entrada do utilizador é a busca e os filtros (RF-005) — não há formulários. O pedido é para o formato não nascer ambíguo.

**A3 — PC-004: identificador estável entre respostas, e eu trato o encoding.** Texto opaco é a escolha certa e não vou interpretar, ordenar nem converter identificadores. Mas RF-006 persiste favoritos **localmente, por identificador** (RN-005) e CA-006.2 exige que recarregar a página os preserve. Se o identificador do mesmo evento ou jogo mudar entre consultas, os favoritos passam a apontar para nada e o utilizador perde-os sem explicação. **Pedido:** o contrato garante que o identificador de um recurso é estável ao longo do tempo, e avisa no quadro se um provedor não o garantir. Quanto a caracteres: **não peço nada** — assumo que posso receber qualquer texto e aplico `encodeURIComponent` ao montar rotas.

**A4 — PC-005: a situação do evento é campo, não cálculo do cliente.** RF-002 exige que cada evento exiba a situação (agendado, encerrado) e CA-002.3 exige que a listagem e o detalhe não divirjam. Derivar a situação comparando a data com o relógio do cliente quebra as duas coisas: o relógio do utilizador pode estar errado, e "encerrado" é regra de negócio, não aritmética de datas. **Pedido:** a situação vem como campo próprio do modelo interno. É um ajuste a PC-005 porque é exatamente a tentação que o formato de data cria.

**A5 — PC-006: fechar a forma do texto decimal.** Aceito texto para não perder precisão, e a formatação centralizada no frontend é o que o `design-system.md` §9.3 já prevê — uma função única de formatação, que é como torno CA-003.2 (formato idêntico em todas as telas) verificável por teste. Para isso o texto de entrada tem de ser previsível. **Pedido:** ponto como separador decimal, nunca vírgula; sem separador de milhares; sem sinal; sem notação científica; e uma regra declarada sobre casas decimais — ou o `backend` normaliza sempre para um número fixo, ou passa o que o provedor der e eu normalizo na exibição. Qualquer das duas serve, mas tem de estar escrita, porque o princípio P1 do `design-system.md` alinha números em coluna com algarismos de largura fixa e isso depende de saber quantas casas esperar. Mais: se uma odd puder estar indisponível, quero um valor **explícito e distinto** (campo ausente ou `null`, conforme a secção 2.1), nunca texto vazio. Reconheço que esta convenção só fecha com BLQ-001 e PD-007; o pedido é sobre a forma, não sobre o valor.

**A6 — PC-008: contagem e cursor obsoleto.** O cursor opaco serve bem ao padrão "carregar mais", que é o que as listagens longas vão usar, e concordo em não expor deslocamentos. Dois acrescentos:
- **`meta.total?: number`, opcional.** O `design-system.md` §9.5 prevê a contagem de resultados da busca anunciada por região viva, que é o que torna o resultado perceptível por leitor de tela. Com dados demonstrativos locais o total é trivial; com um provedor paginado pode não ser. Por isso **opcional**: declaro aqui que a interface **não depende** dele e esconde a contagem quando ele não vier — não é bloqueio.
- **Cursor usado com filtros diferentes dá erro explícito.** Se eu mudar o filtro e reenviar um cursor antigo — por erro meu ou por navegação para trás — prefiro `VALIDATION_FAILED` a receber em silêncio uma página coerente com o filtro anterior. Dados silenciosamente errados na tela são pior defeito que um erro visível.

**A7 — PC-009: "valor válido sem resultados" não é erro.** Este é o ajuste de que a interface mais depende. CA-005.2 exige que buscar um termo sem correspondência mostre o estado **vazio** de "nada encontrado", explicitamente distinto do estado de **erro**; CA-008.3 exige que "nada cadastrado" e "nada encontrado" sejam textualmente distintos. Isto obriga a uma fronteira clara:
- valor que **viola o esquema** (tipo errado, valor fora do conjunto enumerado, `limit` acima de 100) → `400 VALIDATION_FAILED`, e eu mostro erro;
- valor **bem formado mas sem correspondência** (termo de busca que não existe, categoria válida sem jogos) → **`200` com `data: []`**, e eu mostro o estado vazio.

A proposta diz "um valor fora da lista dá `VALIDATION_FAILED`", o que é correto para o conjunto enumerado, mas não cobre o caso de um valor legítimo sem resultados. Sem esta fronteira escrita, o mesmo caminho do utilizador pode produzir tela de erro num dia e estado vazio noutro. **Pedido:** a regra acima no contrato. Pedido menor: fixar já `?q=` como nome do parâmetro de busca, mesmo com PD-003 em aberto quanto ao **escopo** — a forma pode ser acordada antes do escopo.

**A8 — PC-010: `origin` obrigatório.** A forma proposta serve, e serve melhor do que eu esperava: `origin: "demo" | "provider"` mapeia diretamente nas variantes do componente de procedência do `design-system.md` §9.8, e **suporta as duas opções da DIV-001** sem mudar o contrato — na Opção A ignoro `"provider"` na apresentação, na Opção B dou-lhe selo próprio. Isso é um argumento para aceitar a convenção já agora, antes de o Pedro decidir. **Pedido:** `origin` **obrigatório** em todo recurso, nunca opcional. Campo ausente seria procedência ambígua e RNF-008 exige identificação consistente — a ausência não pode significar nada. Acrescento útil, não requisito: `meta.origin` agregado quando toda a coleção tiver a mesma origem, porque o §6.2 do `design-system.md` marca a origem no rodapé do bloco em listagens densas em vez de repetir a marca em cada célula. Se não vier, derivo-o dos itens.

#### Respostas às duas perguntas diretas

**R1 — PC-014: sim, a interface tolera um valor enumerado desconhecido, e assumo o compromisso.** Como: os esquemas que valido no frontend tratam conjunto enumerado com recuperação para um valor neutro, nunca com falha de validação da resposta inteira; a interface mostra uma etiqueta neutra — a variante `neutra` do componente de §9.8 do `design-system.md` — e nunca fica em branco nem perde o resto do conteúdo do recurso. **Portanto, acrescentar um valor a um conjunto enumerado é mudança compatível**, e a PC-014 pode ser fechada nesse sentido. Uma condição, que não é ressalva técnica mas de produto: regista no quadro quando acrescentares um valor, mesmo sendo compatível. Tolerar sem quebrar não é o mesmo que apresentar bem — um estado de evento novo mostrado como "outro" é degradação aceitável como rede de segurança, não como resultado final.

**R2 — Comunicação local: aceito, e configuro-o no meu `vite.config.ts`.** O servidor de desenvolvimento do Vite encaminha `/api` para `http://127.0.0.1:3333`. Confirmei no disco que é a porta certa: `apps/api/.env.example` tem `PORT=3333` e `HOST=127.0.0.1`, e `apps/api/src/config/env.ts` tem os mesmos valores por omissão. Prefiro isto a CORS na api, por três razões: mesma origem em desenvolvimento, o que elimina pedidos de pré-verificação e a configuração que os acompanha; o código do frontend usa caminhos relativos (`/api/eventos`) e não precisa de variável de ambiente com o endereço da api; e não se acrescenta à api configuração que só existe por causa do ambiente de desenvolvimento. É configuração **minha**, em ficheiro meu — não te pede nada. Duas notas:
- Quando a api estiver em baixo, o encaminhamento devolve um erro **sem o envelope** da PC-001. Trato-o no meu cliente como falha de rede recuperável, com um código sintético local que **não** pertence ao teu catálogo e nunca é confundido com ele. O mesmo vale para qualquer corpo que não cumpra o envelope: a interface degrada para erro recuperável em vez de assumir a forma.
- Em publicação com origens diferentes passa a ser preciso endereço base e aí sim CORS. Depende da DP-008, que está aberta; não é decisão para agora e não a tomo.

#### Notas de implementação do lado do frontend — informação, não pedido

- **N1 — valido o que consumo.** Como manda a secção 3 do contrato, não confio na resposta por ela vir do próprio backend: valido o envelope e a carga com os esquemas de `packages/contracts/`, para que uma mudança não anunciada falhe de forma controlada em vez de corromper a tela.
- **N2 — `400` em parâmetro vindo da URL.** Um `VALIDATION_FAILED` em parâmetro de rota ou de query é quase sempre defeito meu, mas pode vir de URL manipulada pelo utilizador. Nesse caso mostro erro definitivo **com caminho de retorno** (CA-008.4) e não ofereço nova tentativa, porque repetir daria o mesmo resultado.
- **N3 — peso do Zod no bundle.** Importar `packages/contracts/` traz o Zod para o bundle do frontend, o que toca RNF-003. Confirmei que o pacote expõe `./src/index.ts` (DT-008), o que funciona com o Vite e o Vitest sem etapa de compilação. Se o peso se mostrar problema, valido só na fronteira de resposta e não dentro dos componentes. É problema meu, não teu — fica registado para não ser surpresa.
- **N4 — agrupamento e paginação.** Ver DIV-F02: a interface vai agrupar **apenas o que recebeu** e **não vai exibir contagem por grupo**, a menos que venha do servidor. Registo-o para não presumires outro comportamento.

#### Divergências abertas — secção 5 do protocolo

**DIV-F01 — `error.message` é para o utilizador ou é diagnóstico?** A secção 2.2 do contrato diz as duas coisas: que o erro traz "mensagem destinada ao usuário" e que "**mensagem não é contrato** — pode mudar sem aviso". As duas afirmações não podem valer ao mesmo tempo para texto que chega à tela.

- **Posição do `frontend`:** a interface **não exibe** `error.message`. O texto que o utilizador lê é meu, mapeado a partir de `error.code`. Três razões: o idioma e os formatos são a PD-008, ainda aberta, e não posso depender de o servidor acertar no idioma; o tom e o vocabulário fazem parte do sistema visual e têm de ser consistentes com os estados de §9.1 do `design-system.md`; e texto que "pode mudar sem aviso" não deve ser mostrado a ninguém, por definição. `message` fica para diagnóstico, no registo do cliente.
- **Impacto se a posição for aceita:** `message` passa a ser explicitamente diagnóstico; o `backend` não precisa de se preocupar com idioma nem com tom; e cada `code` novo obriga-me a acrescentar texto — que é justamente por isso que pedi o `retryable` em A1, para o caso de eu ainda não ter o texto.
- **Impacto se não for:** o `backend` passa a ser responsável pelo idioma e pelo tom de todas as mensagens visíveis, a PD-008 passa a bloquear o contrato, e a garantia de "pode mudar sem aviso" tem de cair — porque mudar texto visível sem aviso passaria a ser mudança incompatível de facto.
- **Enquanto a divergência estiver aberta:** vale o acordo vigente, isto é, a secção 2.2 como está. Nada na interface depende disto agora, porque não há rotas.

**DIV-F02 — paginação por cursor contra agrupamento por esporte e competição.** CA-002.1 exige que a listagem exiba eventos **agrupados por esporte e competição**. Com paginação por cursor, uma página pode cortar um grupo ao meio: recebo três eventos da Premier League na primeira página e quatro na segunda, sem saber que o grupo tem sete. Qualquer contagem por grupo que eu mostre fica errada, e o cabeçalho de grupo repete-se entre páginas.

- **Posição do `frontend`:** não é bloqueio e **não peço mudança na forma de paginar**. Resolvo-o do meu lado: agrupo apenas o que recebi, não exibo contagem por grupo, e junto um cabeçalho de grupo repetido entre páginas em vez de o duplicar. Registo a restrição aqui porque limita o que a interface pode prometer.
- **A opção alternativa, se um dia incomodar:** uma rota que devolva grupos completos, ou o filtro por competição a fazer o trabalho do agrupamento — RF-002 já pede filtrar ou alternar entre esportes e competições, o que resolve o caso na prática. Fica para quando houver rotas; não decido agora.
- **Impacto de cada opção:** a minha resolução custa uma funcionalidade pequena, a contagem por grupo, que nenhum critério de aceitação exige. Grupos completos no servidor custariam uma forma de paginação por grupo e complicariam a rota, sem requisito que o justifique.

#### Resposta do `backend` aos ajustes — comunicada pelo Pedro em 2026-10-26

Registado aqui pelo `frontend`, com a origem explícita: **esta informação chegou-me pelo Pedro, não por um registo do `backend` neste quadro.** Fica à espera da confirmação dele no contrato, conforme a secção 4.1 do protocolo — mudança comunicada só em conversa não foi comunicada.

- **Os oito ajustes (A1 a A8) foram aceitos.**
- **DIV-F01: resolvida a favor da posição do `frontend`.** `error.message` passa a ser **só técnica**, para diagnóstico, e não vai para a tela; o texto que o utilizador lê é meu, mapeado a partir de `error.code`. Deixa de ser divergência.
- O `backend` registará isto na secção 9 de [`docs/api-contract.md`](api-contract.md) depois de esta branch entrar na `main`. **Até esse registo existir, nenhuma rota ou esquema depende destas formas** e a interface continua com dados demonstrativos locais.
- **DIV-F02 continua aberta**, e resolvo-a do meu lado como descrito acima: agrupo só o que recebi e não exibo contagem por grupo.

#### O que isto não decide

- **DIV-001** continua do Pedro. A PC-010 não a resolve: dá a forma, não a escolha de apresentação. As duas opções de tratamento visual estão em §7 do `design-system.md`.
- **PC-006** continua dependente de BLQ-001 e PD-007. Os ajustes de A5 são sobre a forma do texto; o valor e o formato de exibição não são decididos aqui.
- **Nenhuma rota.** Esta revisão é sobre convenções. Continuo a não presumir rota, recurso ou nome de campo, e a interface segue com dados demonstrativos locais, como a secção 9 do contrato prevê.
- **Não editei `docs/api-contract.md` nem `packages/contracts/`.** São teus. As PC passam a "Resolvida" por tua mão, depois do acordo e com a aprovação do Pedro.

#### Nota de git — merge pendente, trabalho intacto

`git merge main` **recusou** e abortou sem alterar nada, porque tenho alterações não commitadas em dois ficheiros que o `fcbe8fd` também altera: `docs/agent-handoff.md` e `docs/agent-tasks.md`. Mensagem exata: *"Your local changes to the following files would be overwritten by merge."* A minha worktree continua em `6a4ebd3`, com `docs/design-system.md` ainda não commitado e à espera da aprovação do Pedro. **Não usei `stash`, `reset`, `checkout` nem `rebase`**, conforme a secção 7 do protocolo. Por isso li a secção 9 do contrato com `git show main:...`, que não toca na worktree. O merge fica para depois de o Pedro aprovar o commit do meu trabalho; quando acontecer, haverá conflito nestes dois ficheiros — ficheiro de dono compartilhado, logo levo a resolução ao Pedro (DT-004), notando que na prática o `backend` escreveu na secção dele e eu na minha, e os dois acrescentámos à de integração.

**Desfecho, no mesmo dia:** o Pedro aprovou o commit (`a5da2e6`) e autorizou a resolução do conflito, limitada ao quadro. `git merge main` passou a correr: este ficheiro **auto-fundiu-se sem conflito** e o conflito ficou só em `docs/agent-tasks.md`, em dois pontos — a tabela de resumo e o status da T-004. Resolvidos sem apagar nem reescrever registo do `backend`: na tabela ficou o estado combinado, e na T-004 a linha de status do `backend` ficou **intacta**, com a minha linha de revisão cruzada acrescentada por baixo.

### Confirmação do `backend` à revisão da T-004 — registada pelo `backend` em 2026-10-26

Confirmo aqui, por escrito, o que chegou ao `frontend` através do Pedro:

- **A1 a A8 aceites**, incluindo os pedidos secundários: `retryAfterSeconds` no corpo do 429, `null` para uma odd indisponível, `?q=` como parâmetro de busca e `meta.origin` agregado opcional. A regra final de cada um está na **secção 9.1** de [`docs/api-contract.md`](api-contract.md); a secção 8 marca as PC como resolvidas.
- **DIV-F01 resolvida a favor do `frontend`:** a secção 2.2 do contrato já diz que `message` é só técnica e nunca é mostrada.
- **DIV-F02:** registada no contrato como aberta, sem mudança; a resolução do `frontend` fica como está.
- **Ficam pendentes:** a PC-006 (número de casas, BLQ-001 e PD-007) e a apresentação da PC-010 (DIV-001, Pedro).
- **Já implementado** em `packages/contracts/src/` (`envelope.ts`, `primitives.ts`), com testes. A api devolve todos os erros neste formato.

### Pendências para o agente `frontend` — registadas pelo `backend` em 2026-10-26 (contratos)

10. **Ordem do `pnpm install` — o `backend` vai primeiro.** Este commit do `backend` altera o `pnpm-lock.yaml` (3 linhas: a api passa a depender de `@blbet/contracts` com `workspace:*`). Depois de o Pedro o integrar na `main`, fazes `git merge main` e **só então** crias o `apps/web/` e corres `pnpm install`. Assim o lockfile muda num lado de cada vez e não há conflito para resolver.
11. **Como importar `@blbet/contracts` no `apps/web`.** O pacote exporta com a condição `source` (`./src/index.ts`) e, por omissão, o `dist` compilado. Para o Vite e o Vitest usarem o código-fonte sem build:
    - no `vite.config.ts`: `resolve.conditions` com `'source'` à frente das condições por omissão (`defaultClientConditions` de `'vite'`), porque definir a lista substitui a de omissão;
    - no `apps/web/tsconfig.json`: `customConditions: ["source"]`.

    Sem isto, o Vite resolve para `dist/`, que só existe depois de `pnpm --filter @blbet/contracts build`. A config da api serve de exemplo: `apps/api/vitest.config.ts` e `apps/api/tsconfig.json`.
12. **Tolerância a valores desconhecidos (R1):** os esquemas de `packages/contracts` são estritos, porque validam o que o servidor envia. A recuperação para um valor neutro que descreveste fica do teu lado, ao consumir os esquemas, por exemplo com `.catch(...)` num esquema derivado.

### Divergências técnicas abertas

**Uma aberta.** Foram duas, abertas pelo `frontend` em 2026-10-26 na revisão da T-004 acima: a **DIV-F01** (`error.message` é texto para o utilizador ou diagnóstico?) está **resolvida** a favor da posição do `frontend` — `message` passa a ser só técnica — conforme a resposta do `backend` comunicada pelo Pedro e ainda por registar no contrato. Continua aberta a **DIV-F02** (paginação por cursor contra o agrupamento por esporte e competição de CA-002.1). As duas estão descritas acima com a posição do `frontend` e o impacto de cada opção. Nenhuma bloqueia trabalho hoje: não há rotas e a interface usa dados demonstrativos. Enquanto estiverem abertas, vale o acordo vigente — a secção 2.2 do contrato e a forma de paginação propostas, como estão.

Registrar aqui, conforme a seção 5 do protocolo: ponto em disputa, posição de cada agente, impacto de cada opção. Enquanto aberta, o acordo vigente continua válido.

### Histórico

Sem registros.

---

## Bloqueios ativos — os dois agentes

Atualizado pelo `backend` em 2026-10-26. DP-001, PA-001 e PA-002 já não são bloqueios (DT-001, DT-003).

| Bloqueio | Afeta | Quem resolve |
|---|---|---|
| **BLQ-001** — provedor esportivo não identificado; documentação oficial indisponível | T-014, T-015, modelo de dados esportivos, PC-006 | Pedro (T-010) |
| ~~**`frontend` ainda sem a raiz do monorepo na sua branch**~~ | — | **Resolvido** em 2026-10-27: merge feito e `pnpm install` executado; o `pnpm-lock.yaml` mudou e espera conferência do `backend` |
| **PA-007** — mecanismo de integração na `main` (merge local ou pull request) | Todas as integrações | Pedro |
| **Quadro por branch** — cada worktree vê a sua cópia de `docs/`; um registo só chega ao outro agente depois de integrado na `main` | Coordenação | Pedro integra com frequência os commits de coordenação; em caso de dúvida, ler a cópia da `main` em `C:\Users\pedro\blbet` |
| **DIV-001** — dados reais (DT-002) vs. "todo dado é fictício" (RN-002, RF-003, RNF-008) | Identificação de dados na interface, DP-004, PC-010 | Pedro |
| `docs/design-system.md` inexistente | `frontend` (T-016) | `frontend` (T-005) |
| `docs/integracoes.md` inexistente | `backend` (adaptadores) | `backend` (T-006), depois da T-010 para o provedor |
| `docs/decisoes-tecnicas.md` inexistente | Registro de qualquer decisão | compartilhado |
| **DP-002** — ferramentas de teste | Verificações dos dois | Pedro, após DP-001 |
| **PD-002** — público-alvo não definido | Decisões visuais do `frontend` | Pedro |
