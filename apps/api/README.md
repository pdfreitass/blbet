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

## Executar

| Comando (na raiz) | O que faz |
|---|---|
| `pnpm dev:api` | Servidor em modo de desenvolvimento, com recarga automática |
| `pnpm --filter @blbet/api build` | Compila para `apps/api/dist` |
| `pnpm --filter @blbet/api start` | Corre a versão compilada |
| `pnpm typecheck` | Verificação de tipos em todos os pacotes |
| `pnpm test` | Testes (Vitest) em todos os pacotes |

Verificação rápida: `curl http://127.0.0.1:3333/health` → `{"status":"ok"}`.

## Rotas

| Rota | Tipo | Observação |
|---|---|---|
| `GET /health` | Operacional | Diz só se o processo responde. Não faz parte do contrato de domínio |

Rotas de domínio só depois do contrato aprovado ([`docs/api-contract.md`](../../docs/api-contract.md)). A API esportiva real está bloqueada até o provedor ser identificado (BLQ-001, T-010). Não existe nenhum adaptador simulado.
