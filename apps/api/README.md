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

As variáveis do provedor esportivo estão em [`.env.example`](.env.example).

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

As rotas de domínio seguem a secção 7.1 do contrato, com os esquemas de `@blbet/contracts`. Em
`SPORTS_MODE=live` sem `SPORTS_PROVIDER_API_KEY` respondem `503 UPSTREAM_UNAVAILABLE` — estado
previsto, não defeito.
