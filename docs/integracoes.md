# Integrações — blbet

> Provedores externos e como entram no sistema. **Dono: `backend`** ([`docs/agent-protocol.md`](agent-protocol.md), seção 2). Os princípios (adaptadores, modelo interno soberano, segredos só no servidor, resposta do provedor como entrada não confiável) estão na seção 6 de [`docs/arquitetura.md`](arquitetura.md) e **não se repetem aqui**.

**Status:** estratégia definida; **candidato para testes: Sportsbook API** (DT-009); BLQ-001 reduzido a C5, C6, C7 e à licença para publicar · **Última atualização:** 2026-10-26

---

## 1. Situação

| Integração | Decisão | Situação |
|---|---|---|
| **API esportiva** | Real desde o início ([DT-002](decisoes-tecnicas.md#dt-002--integração-com-api-esportiva-real-desde-o-início)) | **Candidato para testes: Sportsbook API via RapidAPI** (secção 5, DT-009). Por confirmar com uma resposta real: C5, C6, C7. A publicação depende de C1 e C2 |
| **API agregadora de cassino** | Etapa posterior | Fora do escopo atual. O catálogo de cassino usa dados demonstrativos (`origin: "demo"`) |

Os dados de cada provedor entram na secção 5, **sempre com a fonte oficial** de cada informação.

---

## 2. O que exigir do provedor esportivo (critérios para a T-010)

Lista de verificação para o Pedro escolher o provedor. Cada item tem de ser respondido **pela documentação oficial ou pelos termos do provedor**, nunca por suposição. Um "não sei" é registado como pendência.

### 2.1 Bloqueantes — sem resposta, o provedor não serve

| # | Pergunta | Porque importa |
|---|---|---|
| **C1** | Os termos permitem **exibir** os dados num produto público? Exigem atribuição ou logótipo? | Sem licença de exibição, a integração não pode ir para o ar. A atribuição afeta o `design-system.md` |
| **C2** | Os termos permitem uso num **protótipo de entretenimento sem apostas**? Há restrições de jurisdição? | RN-007 e a revisão jurídica da Fase 6 |
| **C3** | Cobre os **esportes e competições** que o produto quer mostrar? | RF-002; ligado à PD-004 |
| **C4** | Fornece **mercados e odds**, ou só eventos e resultados? | RF-003: sem odds, o provedor só resolve metade do problema |
| **C5** | Os **identificadores** de eventos, competições e mercados são **estáveis** no tempo? | Convenção A3: os favoritos locais dependem disso |
| **C6** | A **situação do evento** (agendado, ao vivo, encerrado, adiado, cancelado) vem num campo próprio? | Convenção A4: o cliente não a pode deduzir |
| **C7** | Em que **formato** vêm as odds (decimal, fracionário, americano) e com que precisão? | Convenção A5 e PC-006: define o número de casas |
| **C8** | Há **ambiente de testes** ou plano gratuito para desenvolvimento? | Fase 4: testes com o provedor real só em ambiente autorizado |

### 2.2 Operacionais — definem como o adaptador funciona

| # | Pergunta | Porque importa |
|---|---|---|
| **C9** | **Autenticação:** chave por cabeçalho, por query string, OAuth? | Onde fica a credencial. Uma chave na query string obriga a cuidado redobrado nos logs (o `fetchJson` já a omite das mensagens de erro) |
| **C10** | **Limites:** pedidos por minuto e por dia, quota mensal, custo por pedido | Cache e frequência de atualização (DP-009) |
| **C11** | **Atualização:** consulta periódica, *webhooks* ou *streaming*? Com que latência? | DP-009. Eventos ao vivo estão fora do escopo inicial (visão, seção 9) |
| **C12** | **Paginação e filtros** do lado do provedor | Como o adaptador produz a paginação por cursor (PC-008) |
| **C13** | **Fusos e formato de datas** | O adaptador converte para ISO 8601 UTC (PC-005) |
| **C14** | **Códigos de erro**, indisponibilidades e janelas de manutenção | O que vira `UPSTREAM_UNAVAILABLE` e o que vira `RATE_LIMITED` |
| **C15** | **Idiomas** dos nomes de equipas e competições | PD-008 |
| **C16** | **Preço** e o que acontece quando a quota se esgota | Custo e comportamento em falha |

---

## 3. Como o adaptador entra no código

Estrutura **prevista**, criada só na T-015, depois da T-010 e da T-014:

```
apps/api/src/
├── modules/esportes/          serviço e rotas do domínio (modelo interno)
│   └── sports-source.ts       interface que o serviço consome
├── adapters/<provedor>/       um diretório por provedor
│   ├── client.ts              chamadas HTTP com fetchJson (timeout, validação)
│   ├── schemas.ts             esquemas Zod da resposta do provedor, tirados da documentação oficial
│   └── mapper.ts              conversão do formato do provedor para o modelo interno
└── shared/http/fetch-json.ts  já existe
```

Regras:

- **A interface do serviço (`sports-source.ts`) só é escrita com o modelo interno acordado na T-014.** Escrevê-la antes seria inventar o modelo.
- O mapeador é **puro**, sem rede, e é testado com **exemplos de resposta retirados da documentação oficial** do provedor.
- Uma falha do provedor (`UpstreamError`) chega ao cliente como `503 UPSTREAM_UNAVAILABLE` com `retryable: true`. Isto já está implementado no tratamento de erros da api.
- O adaptador **nunca** devolve dados inventados para tapar uma falha. Sem dados, a resposta é um erro, nunca um falso positivo.

---

## 4. Credenciais

- **Nomes das variáveis:** prefixo `SPORTS_PROVIDER_` (ex.: `SPORTS_PROVIDER_API_KEY`, `SPORTS_PROVIDER_BASE_URL`). O conjunto exato depende da C9.
- São acrescentadas ao esquema de `apps/api/src/config/env.ts` na T-015, **obrigatórias** quando a integração estiver ativa. Se faltarem, o servidor não arranca e mostra só o nome da variável.
- Só `apps/api/.env.example` é versionado, **sem valores**. O `.env` com valores reais fica fora do git (`.gitignore`) e fora de qualquer worktree partilhada.
- A chave nunca chega ao frontend nem aos logs (cabeçalhos com credenciais já são omitidos no logger da api).

---

## 5. Provedor esportivo

### Sportsbook API (via RapidAPI) — **candidato para desenvolvimento e testes** (DT-009)

- **Documentação oficial:** <https://sportsbookapi.com/documentation/> · especificação OpenAPI 3.0.3: <https://api.sportsbookapi.com/documentation/json> (título "Ace", versão 0.0.2), lida a 2026-10-26
- **Página no RapidAPI:** <https://rapidapi.com/sportsbook-api-sportsbook-api-default/api/sportsbook-api2>
- **Termos:** <https://sportsbookapi.com/terms-of-service/> remete só para <https://rapidapi.com/terms/>. Lidos a 2026-10-26
- **Plano escolhido para testes:** Basic, $0/mês: **150 pedidos/dia (limite rígido)**, 1000/hora. Outros planos: Pro $10 (1000/dia), Ultra $20 (7000/dia), Mega $100 (100 000/dia)
- **Rotas úteis:** `GET /v1/competitions/{competition}/events` devolve eventos **com os mercados principais e as odds mais recentes** numa só chamada. `GET /v1/markets/{marketKey}/outcomes/latest` devolve as odds de um mercado. A versão `v0` também existe
- **Fora de uso:** `/v0/advantages` e `/v1/advantages` (arbitragem, "+EV", *middles*). São conselhos de aposta e contrariam a RN-003

| # | Resposta | Fonte |
|---|---|---|
| **C1** licença de exibição | ⚠️ **Não explícita.** Os termos do provedor só remetem para os do RapidAPI; nada sobre exibição pública nem atribuição. As odds são de casas de apostas com marca (BetMGM, DraftKings, Bovada…) | Termos do provedor |
| **C2** uso sem apostas e jurisdição | ⚠️ **Não declarado** | Termos do provedor |
| **C3** cobertura | Mais de 30 ligas, sobretudo dos EUA (NFL, NBA, MLB, NHL…). Futebol: Premier League, La Liga, Serie A, Bundesliga, Ligue 1, MLS, entre outras. **Brasileirão não está listado** — confirmado com chamada real a `GET /v0/competitions/` em 2026-10-27 (38 competições, nenhuma brasileira). Aceite pelo Pedro para desenvolvimento; o provedor final com futebol brasileiro vem depois (DT-009). "Nem todos os mercados e ligas estão disponíveis em todas as casas"; as odds podem só existir com a liga em época | Página do RapidAPI |
| **C4** odds e mercados | ✅ Sim. Mercados por evento (`key`, `type`, `segment`) com `outcomes` por casa (`source`) | OpenAPI |
| **C5** IDs estáveis | ❓ As chaves têm o formato `xxxx-xxxx-xxxx` (ex.: `kXuc-xfma-eRVR`); **a estabilidade não está declarada** | OpenAPI |
| **C6** situação do evento | ❌ **Não há campo de situação nem de placar.** Só `startTime`; o resultado `live: boolean` existe por odd, não por evento | OpenAPI |
| **C7** formato das odds | ⚠️ `payout: number` e `modifier: number` (linha de *spread* ou *total*). **A escala de `payout` não está documentada** (decimal? americano?) | OpenAPI |
| **C8** ambiente de testes | ✅ O plano gratuito serve; o Swagger da documentação permite chamar as rotas com a chave | Documentação |
| **C9** autenticação | ✅ Cabeçalhos `X-RapidAPI-Key` e `X-RapidAPI-Host` (não vai na query string) | Documentação |
| **C10** limites | 150/dia e 1000/hora no plano gratuito, sem tolerância | Preços no RapidAPI |
| **C11** atualização | Só consulta (sem *webhooks* nem *streaming* na especificação). Promete odds "up to the minute" | OpenAPI e página do RapidAPI |
| **C12** paginação | ❓ Nas rotas `v1` de eventos não há paginação, só janela de tempo (`startTimeFrom`, `startTimeTo`) | OpenAPI |
| **C13** datas | `format: date-time` (ISO 8601); **fuso por confirmar** numa resposta real | OpenAPI |
| **C14** erros | Corpo `{ ok, status, name, error }`, com 401 e 404 documentados. O 429 da quota vem do RapidAPI | OpenAPI |
| **C15** idiomas | ❓ Não declarado; os nomes de exemplo estão em inglês | — |
| **C16** preço | Ver plano acima. A FAQ do RapidAPI fala em cartão de crédito para APIs *freemium*: confirmar na subscrição | Preços no RapidAPI |

**Consequências para o projeto:**

- **C6 falha.** Pela A4, a situação do evento é um campo decidido pelo servidor. Com este provedor, o servidor só sabe "agendado" (`startTime` no futuro) ou "já começou". "Encerrado", "adiado" e "cancelado" não existem. É preciso decidir: o modelo interno passa a ter só estes dois estados com este provedor, ou junta-se uma segunda fonte de resultados.
- **C7 por fechar:** a escala de `payout` só se confirma com uma resposta real. Até lá a PC-006 (número de casas) continua aberta.
- **C1 e C2 bloqueiam a publicação, não os testes.** Antes de publicar é preciso perguntar ao provedor (contacto em <https://sportsbookapi.com/contact/>) se a exibição pública é permitida e com que atribuição, e decidir se mostrar odds com a marca de casas de apostas reais é compatível com um protótipo sem apostas (DIV-001, revisão jurídica da Fase 6).
- **Com 150 pedidos/dia, a cache é obrigatória** (DP-009). Uma chamada por competição traz eventos e odds. Por exemplo, 3 competições atualizadas de 30 em 30 minutos já gastam 144 pedidos/dia.
- **Brasileirão ausente:** se a cobertura brasileira for prioritária (PD-004), este provedor não chega.

### Modelo para um provedor novo

```
### <Nome do provedor>

- Documentação oficial: <URL>
- Termos de uso: <URL> · data da leitura
- Plano: <nome> · limites · custo
- Respostas a C1–C16: uma linha por item, com a fonte
- Ambiente de testes: <sim/não, como>
- Decisão de adoção: DT-xxx
```

---

## 6. Pendências

| # | Pendência | Bloqueia | Quem resolve |
|---|---|---|---|
| **BLQ-001** | Provedor esportivo e documentação oficial | T-014, T-015, PC-006 | Pedro (T-010) |
| **DP-009** | Cache, armazenamento e frequência de atualização | T-015 | `backend`, depois de C10 e C11 |
| **DIV-001** | Como a interface distingue dados reais de demonstrativos | Apresentação de `origin` | Pedro |
| — | API agregadora de cassino | Etapa posterior | Pedro |
