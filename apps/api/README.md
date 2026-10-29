# @blbet/api

Backend do blbet: Node.js 24, Fastify 5, TypeScript 7 e Zod 4. Dono: agente `backend`.

## Pré-requisitos

- Node.js 24 ou superior.
- pnpm 12.15.0, gerido pelo corepack: a versão está fixada em `packageManager` no `package.json` da raiz. Para ativar sem permissões de administrador:

  ```
  corepack enable --install-directory "%APPDATA%\npm" pnpm
  ```

## Instalar

Na raiz do monorepo:

```
pnpm install
```

O pnpm só deixa correr os scripts de instalação aprovados em `pnpm-workspace.yaml` (`allowBuilds`). Neste momento só o `esbuild`, necessário ao `tsx`.

## Configurar

```
copy apps\api\.env.example apps\api\.env
```

O `.env` não é versionado. As variáveis são validadas no arranque (`src/config/env.ts`). Se alguma for inválida, o servidor não arranca e mostra **só o nome** da variável, nunca o valor.

| Variável | Omissão | Valores |
|---|---|---|
| `NODE_ENV` | `development` | `development`, `test`, `production` |
| `HOST` | `127.0.0.1` | — |
| `PORT` | `3333` | 1–65535 |
| `LOG_LEVEL` | `info` | `fatal` … `trace`, `silent` |
| `SPORTS_MODE` | `live` | `live`, `recorded` (DT-018) |
| `SPORTS_NOW` | `recordedAt` da gravação | instante ISO, só com `recorded` |
| `RATE_LIMIT_MAX` | `300` | pedidos por janela e por cliente; `0` desliga (DT-019) |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` | 1 ou mais |
| `CORS_ORIGINS` | vazio | origens autorizadas, separadas por vírgula (S-3) |
| `BODY_LIMIT_BYTES` | `65536` | teto do corpo de um pedido (S-3) |
| `DATABASE_FILE` | ausente | ficheiro SQLite, ex.: `data/blbet.db`. A pasta é criada se faltar. **Sem isto não há rotas de conta** (DT-021) |
| `AUTH_IP_HASH_SECRET` | ausente | obrigatório com `DATABASE_FILE`; 32 caracteres ou mais |
| `SESSION_IDLE_MINUTES` | `60` | inatividade até a sessão morrer |
| `SESSION_ABSOLUTE_HOURS` | `168` | teto absoluto da sessão |
| `COOKIE_SECURE` | ligado em produção | em produção não pode ser falso |
| `AUTH_REQUIRE_VERIFIED_EMAIL` | `true` | em produção não pode ser falso |
| `AUTH_RATE_LIMIT_MAX` | `10` | limite próprio das rotas de autenticação |

As restantes estão em [`.env.example`](.env.example), com os valores por omissão.

## Contas e sessões (DT-020)

Com `DATABASE_FILE` definido, a api regista as rotas da secção 7.2 do
[contrato](../../docs/api-contract.md): cadastro, verificação de e-mail, entrada e saída, lista e
revogação de sessões, recuperação e alteração de senha. **Sem `DATABASE_FILE` essas rotas não
existem** e a api serve só esportes — que é o estado anterior a esta decisão.

O ficheiro e a pasta que o contém são criados na primeira abertura, e a base guarda endereços de
e-mail, resumos de senha e sessões: **nunca entra no git**. O [`.gitignore`](.gitignore) deste
pacote cobre `data/` e os ficheiros `*.db*`.

- A senha é guardada em **Argon2id** (19 MiB, 2 passagens), nunca em claro.
- A sessão vai num cookie `HttpOnly`, `Secure` e `SameSite=Strict`; **o token nunca aparece no
  corpo de uma resposta.**
- Cadastro e pedido de recuperação respondem sempre `202 { accepted: true }`, exista ou não a
  conta. É o que impede descobrir quem está registado — a interface não deve dizer o contrário.
- Falhas seguidas travam a conta e a origem: `429` com `too many attempts`, **mesmo com a senha
  certa**. Passa sozinho ao fim de `AUTH_FAILURE_WINDOW_MINUTES`.
- Trocar ou redefinir a senha derruba sessões: a alteração mantém a atual, a redefinição derruba
  todas.

**Não há provedor de e-mail escolhido.** Fora de produção a mensagem é escrita na saída, com o
link e o token, para o fluxo poder ser percorrido inteiro; **em produção o envio falha** em vez de
fingir que foi enviado. Escolher o provedor é decisão em aberto.

A base de dados é **SQLite** pela `node:sqlite` do Node 24, sem dependência nem servidor. O
destino continua a ser **PostgreSQL** (DT-021); é por isso que o serviço fala com
`AccountsRepository` e nunca com SQL. As migrações são versionadas e imutáveis, e correm no
arranque.

## Limite de pedidos (S-1, DT-019)

Cada cliente tem `RATE_LIMIT_MAX` pedidos por janela de `RATE_LIMIT_WINDOW_SECONDS`. Ao passar do
limite, a api responde `429` no envelope de sempre, com `retryable: true`:

```json
{ "error": { "code": "RATE_LIMITED", "message": "too many requests", "retryable": true } }
```

As respostas trazem `x-ratelimit-limit`, `x-ratelimit-remaining` e `x-ratelimit-reset`, para o
cliente se poder conter antes de ser travado.

**`RATE_LIMIT_MAX=0` desliga o limite.** É o que os testes end-to-end devem usar: fazem muitos
pedidos seguidos e não devem apanhar `429` por isso.

Isto protege a **api**. A quota do provedor é protegida por outra coisa — a cache da DT-012 —, e uma
não substitui a outra.

## Modo de teste com respostas gravadas (DT-018)

Com `SPORTS_MODE=recorded` a api não chama o provedor: serve as respostas gravadas de
[`recordings/`](recordings/). Não precisa de chave, não gasta quota e dá sempre o mesmo resultado —
é o modo em que correm os testes end-to-end (`e2e/`, do agente `frontend`).

```
set SPORTS_MODE=recorded && pnpm dev:api
```

O relógio fica parado no `recordedAt` da gravação, para que os jogos gravados continuem por começar
e a cache não expire. `SPORTS_NOW` escolhe outro instante — é assim que se alcança o jogo que já
começou, que desaparece da lista e dá `404 event_started` no detalhe.

As gravações são **respostas reais do provedor, reduzidas**; nenhuma é inventada. Os dados que saem
continuam marcados com `origin: "provider"`, porque é de facto o que são.

| Ficheiro | Conteúdo |
|---|---|
| `recordings/recording.json` | `recordedAt`, fonte das odds (DT-010) e competições gravadas |
| `recordings/competitions.json` | resposta de `GET /v0/competitions/` |
| `recordings/events-<NOME>.json` | resposta de `GET /v1/competitions/<NOME>/events` |

Para acrescentar uma competição: gravar a resposta real em `events-<NOME>.json` e juntar o nome
curto a `competitions` no manifesto. A gravação é validada no arranque pelos mesmos esquemas das
respostas reais — se estiver malformada, o servidor não arranca e diz qual é o ficheiro.

**Cobertura atual da gravação:** só a `EPL`, com dois jogos. É o que existe gravado no repositório.

## Executar

| Comando (na raiz) | O que faz |
|---|---|
| `pnpm dev:api` | Servidor em modo de desenvolvimento, com recarga automática |
| `pnpm build` | Compila todos os pacotes (os contratos antes da api) |
| `pnpm --filter @blbet/api start` | Corre a versão compilada |
| `pnpm typecheck` | Verificação de tipos em todos os pacotes |
| `pnpm test` | Testes (Vitest) em todos os pacotes |

Verificação rápida: `curl http://127.0.0.1:3333/health` → `{"status":"ok"}`.

## Rotas

| Rota | Tipo | Observação |
|---|---|---|
| `GET /health` | Operacional | Diz só se o processo responde. Não faz parte do contrato de domínio |
| `GET /api/competitions` | Domínio | Secção 7.1 de [`docs/api-contract.md`](../../docs/api-contract.md) |
| `GET /api/events` | Domínio | Só jogos por começar (DT-010), com paginação por cursor |
| `GET /api/events/:id` | Domínio | `404 event_started` quando o jogo já começou |
| `/api/accounts/*`, `/api/sessions/*` | Domínio | Secção 7.2 do contrato. Só com `DATABASE_FILE` |

As rotas de domínio seguem a secção 7.1 do contrato, com os esquemas de `@blbet/contracts`. Em
`SPORTS_MODE=live` sem `SPORTS_PROVIDER_API_KEY` respondem `503 UPSTREAM_UNAVAILABLE` — estado
previsto, não defeito.
