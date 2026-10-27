# Contrato de API — blbet

> Contrato entre o agente `backend` (terminal) e o agente `frontend` (Desktop). **Dono do arquivo: `backend`.** O `frontend` propõe mudanças pelo [quadro de comunicação](agent-handoff.md), não editando este arquivo.

**Status:** convenções iniciais · **Última atualização:** 2026-10-26

---

## Aviso sobre o estado deste documento

**Nenhuma rota está definida.** Este documento contém, nesta fase, apenas **convenções** — as regras que qualquer rota futura deverá seguir.

Não há rota, resposta ou código de status definido porque:

- **O provedor esportivo não está identificado** e a sua documentação oficial não está disponível (BLQ-001, [DT-002](decisoes-tecnicas.md#dt-002--integração-com-api-esportiva-real-desde-o-início)). O modelo interno de eventos, mercados e odds depende dos dados que o provedor realmente fornece.
- As pendências **PD-003 a PD-008** de [`docs/requisitos.md`](requisitos.md) descrevem exatamente os dados que as rotas transportariam: escopo da busca, mercados esportivos, categorias de cassino, campos do perfil, formato das odds, idioma e formatos. Sem elas, qualquer rota seria invenção.

Rota definida sem essas respostas é contrato inventado — proibido por `CLAUDE.md`.

**Já decidido (DT-001):** a API é servida por `apps/api/` (Fastify), consumida por `apps/web/` por HTTP, e os esquemas e tipos do contrato vivem em `packages/contracts/` (Zod). Este documento descreve as regras; `packages/contracts/` será a sua expressão em código.

**Separação entre provedor e contrato:** este contrato expõe o **modelo interno** da plataforma, nunca o formato do provedor. O formato do provedor é tratado no adaptador de `apps/api/` e documentado em `docs/integracoes.md` (ainda inexistente).

---

## 1. Convenções de rotas e métodos HTTP

### 1.1 Nomenclatura

- Recursos no **plural**, em **minúsculas**, separados por hífen: `/eventos`, `/jogos`, `/categorias-de-jogo`.
- Sem verbo no caminho: a ação é o método HTTP. `GET /eventos`, não `/listarEventos`.
- Hierarquia expressa aninhamento real de posse: `/eventos/{id}/mercados`. Máximo recomendado: dois níveis.
- Identificador sempre como segmento de caminho: `/jogos/{id}`.
- Filtros, ordenação, busca e paginação sempre em **query string**, nunca no caminho.

### 1.2 Métodos

| Método | Uso | Idempotente |
|---|---|---|
| `GET` | Leitura. Nunca altera estado | Sim |
| `POST` | Criação ou operação sem equivalente de leitura | Não |
| `PUT` | Substituição completa de um recurso | Sim |
| `PATCH` | Alteração parcial | Não necessariamente |
| `DELETE` | Remoção | Sim |

**Nesta fase do protótipo, espera-se apenas `GET`**: não há criação, alteração ou remoção de dados no servidor. Favoritos são locais ao navegador (RN-005) e não têm rota. Qualquer necessidade de método que altere estado deve ser justificada e registada antes de implementada.

### 1.3 Proibições

Decorrem de RN-001, RN-003 e RN-004 de [`docs/requisitos.md`](requisitos.md):

- Nenhuma rota de aposta, cupom, bilhete ou seleção de odd.
- Nenhuma rota de depósito, saque, pagamento, saldo real ou transação.
- Nenhuma rota de execução de jogo, rodada ou resultado.
- Nenhuma rota que receba ou devolva dado pessoal verdadeiro.

---

## 2. Formato de respostas e erros

### 2.1 Resposta de sucesso

Toda resposta de sucesso usa um **envelope consistente**, com a carga sob uma chave de dados e metadados separados da carga. Isso permite acrescentar metadados sem quebrar quem consome os dados.

Princípios acordados:

- Carga útil sempre sob uma chave própria, nunca na raiz.
- Metadados de paginação, quando houver, separados da carga.
- Coleção vazia devolve coleção vazia com status de sucesso — **não** é erro e **não** é `404`.
- Campo ausente e campo nulo são situações distintas e não devem ser usadas de forma intercambiável.

> **Pendente PC-001:** nomes exatos das chaves do envelope (dados, metadados, erro).

### 2.2 Resposta de erro

- Erro usa envelope próprio, distinto do de sucesso, com código de erro **estável e legível por máquina**, mensagem destinada ao usuário e, quando aplicável, detalhamento por campo.
- O código de erro é o que o `frontend` usa para decidir comportamento. **Mensagem não é contrato** — pode mudar sem aviso; código de erro não.
- Erro de validação identifica **quais** campos falharam e por quê.
- **Nunca** expor rastreio de pilha, caminho de arquivo, consulta, versão de dependência ou estrutura interna (RNF-004, CA-008.2). Detalhe técnico fica no log do servidor.
- Toda resposta de erro deve ser suficiente para o `frontend` escolher entre os estados de RF-008: erro recuperável com nova tentativa, erro definitivo, ou ausência de resultados.

> **Pendente PC-002:** catálogo de códigos de erro estáveis.
> **Pendente PC-003:** formato do detalhamento de erro por campo.

### 2.3 Convenções de dados

> Todas pendentes. Divergência aqui é causa clássica de defeito de integração, por isso ficam explícitas em vez de implícitas.

| # | Convenção | Situação |
|---|---|---|
| **PC-004** | Formato de identificador (numérico, UUID, texto curto) | Pendente |
| **PC-005** | Formato de data e hora e fuso horário (recomendação do `backend`: ISO 8601 em UTC, conversão no cliente) | Pendente |
| **PC-006** | Representação de números decimais, em especial as odds — texto ou número, e casas decimais. Relacionado a PD-007 e ao formato que o provedor realmente fornece (BLQ-001) | Pendente |
| **PC-007** | Convenção de nomes de campos (`camelCase` ou `snake_case`) — uma só, em toda a API | Pendente |
| **PC-008** | Formato de paginação (limite e deslocamento, ou cursor) e limites máximos | Pendente |
| **PC-009** | Formato de ordenação e filtros em query string | Pendente |
| **PC-010** | Como o dado demonstrativo é sinalizado na resposta — propriedade no modelo ou convenção só de apresentação — e, desde DT-002, como distinguir dado real de terceiro de dado demonstrativo. Relacionado a DP-004, RNF-008 e DIV-001 | Pendente |

---

## 3. Tipagem e validação

- **Fonte única de verdade.** Os tipos consumidos pelo `frontend` derivam do contrato definido pelo `backend`, não de redigitação manual em cada lado. **PC-011 resolvida (DT-001):** pacote comum `packages/contracts/`, com os tipos derivados dos esquemas Zod. O `frontend` importa, não redefine.
- Todo modelo é **tipado** (RNF-006). Sem escapes de tipo para contornar erro de compilação.
- **Validação nas fronteiras** (RNF-004): o `backend` valida toda entrada — parâmetros de caminho, query string, corpo — antes de usá-la, e valida toda resposta de provedor externo antes de convertê-la em modelo interno.
- O `frontend` **não confia** na resposta por ela vir do próprio backend: valida o que consome, para que mudança não anunciada falhe de forma controlada em vez de corromper a tela.
- Campo obrigatório é obrigatório nos dois lados. Tornar obrigatório um campo antes opcional é **mudança incompatível** (seção 6).
- Validação por esquema, com o esquema como origem do tipo quando a ferramenta permitir — evita tipo e validação divergirem.

> **PC-012 resolvida (DT-001):** Zod. O mesmo esquema valida no servidor e no cliente e dá origem ao tipo.

---

## 4. Versionamento

### 4.1 Estratégia

- **Enquanto não houver consumidor externo** — a situação atual, com `frontend` e `backend` no mesmo repositório e evoluindo juntos — não se introduz versionamento na URL. Versionar prematuramente cria custo de manutenção sem benefício.
- **Mudança incompatível** nesta fase é tratada por **coordenação**, conforme a seção 6: anúncio no quadro, acordo, alteração simultânea nos dois lados.
- **Versionamento por caminho** (`/v1/...`) passa a ser obrigatório quando qualquer destes ocorrer: existir consumidor fora deste repositório; o `frontend` publicado precisar continuar funcionando contra um backend já atualizado; ou os dois deixarem de ser publicados juntos.
- Quando houver versão, duas versões podem coexistir temporariamente, com prazo de remoção da antiga registado em `docs/decisoes-tecnicas.md`.

> **Pendente PC-013:** confirmar esta estratégia com o agente `frontend` e registrar o acordo no quadro.

### 4.2 O que é mudança compatível

Pode ser feita sem coordenação prévia, apenas com registro no quadro:

- Acrescentar campo **opcional** à resposta.
- Acrescentar parâmetro **opcional** com comportamento padrão igual ao anterior.
- Acrescentar nova rota.
- Acrescentar novo valor a um conjunto enumerado **se** o `frontend` tratar valor desconhecido com elegância — a confirmar (**PC-014**).

---

## 5. Parâmetros, autenticação e códigos de status

### 5.1 Como documentar cada rota

Quando uma rota for definida, ela é documentada neste arquivo com, no mínimo:

- Método e caminho.
- Propósito, em uma frase, e o requisito que atende (RF-xxx).
- **Parâmetros de caminho:** nome, tipo, obrigatoriedade, formato.
- **Parâmetros de query:** nome, tipo, obrigatoriedade, valor padrão, valores aceitos, exemplo.
- **Corpo da requisição**, quando houver: tipo e esquema de validação.
- **Resposta de sucesso:** status e estrutura.
- **Respostas de erro:** cada status possível com seu código de erro estável.
- Observações de cache ou desempenho relevantes.
- Se a rota exige autenticação — nesta fase, nenhuma exige.

### 5.2 Autenticação

**Não há autenticação nesta fase.** O perfil é demonstrativo e não há conta de usuário real (RN-006). Nenhuma rota exige credencial, token ou sessão.

Quando houver autenticação — fora do escopo inicial, conforme a seção 8 de [`docs/visao.md`](visao.md) — o mecanismo é decisão de arquitetura própria, registada em `docs/decisoes-tecnicas.md`, e este documento passará a especificar: forma de transporte da credencial, tratamento de expiração, e os status `401` e `403` por rota.

**Credencial de provedor externo nunca chega ao cliente** (RNF-004). Segredo vive no servidor, em variável de ambiente fora do repositório.

### 5.3 Códigos de status

Convenção de uso:

| Status | Quando |
|---|---|
| `200` | Leitura bem-sucedida, inclusive coleção vazia |
| `201` | Recurso criado — não esperado nesta fase |
| `204` | Sucesso sem corpo — não esperado nesta fase |
| `400` | Requisição malformada ou parâmetro inválido |
| `404` | Recurso identificado não existe. **Não** usar para coleção vazia |
| `422` | Entrada bem formada mas semanticamente inválida — uso a confirmar (**PC-015**), já que parte das equipes prefere `400` para tudo |
| `429` | Limite de requisições excedido — relevante só com provedor real |
| `500` | Falha inesperada no servidor. Sem detalhe técnico no corpo |
| `503` | Dependência externa indisponível — relevante só com provedor real |

Regra: um mesmo tipo de falha devolve sempre o mesmo status em toda a API. Status escolhido caso a caso torna impossível ao `frontend` tratar erro de forma genérica.

---

## 6. Comunicação de mudanças incompatíveis

Mudança incompatível é a que **quebra** quem já consome: remover ou renomear campo ou rota, mudar tipo ou formato de campo, tornar obrigatório campo antes opcional, mudar significado de valor existente, mudar código de status ou código de erro, endurecer validação.

Procedimento obrigatório, do `backend`:

1. **Registrar antes de implementar**, na seção de integração do [quadro](agent-handoff.md): o que muda, por que, o que quebra e o que o `frontend` precisa ajustar.
2. **Aguardar concordância** do `frontend` registada no quadro. O protocolo proíbe alteração unilateral de contrato acordado.
3. Se houver divergência, registrar como pendência na seção de integração. **O contrato vigente continua valendo** enquanto a pendência estiver aberta.
4. Implementar **só depois** do acordo, atualizando este documento **na mesma mudança** que altera o código. Contrato e código desalinhados é defeito, não pendência.
5. Registrar a decisão em `docs/decisoes-tecnicas.md` quando houver escolha relevante entre alternativas.
6. Registrar no quadro, ao concluir: arquivos alterados, o que mudou no contrato e os resultados reais das verificações.

**Nenhum dos dois agentes presume que o outro leu o anúncio.** Sem concordância registada no quadro, a mudança não está acordada — e o `frontend` não ajusta a interface a um contrato que não viu.

---

## 7. Rotas definidas

**Nenhuma.**

Primeira rota só pode ser definida após:

- ~~**T-001** — stack aprovada (DP-001).~~ Concluída: DT-001.
- **T-010** — provedor esportivo identificado e documentação oficial disponível (BLQ-001), para as rotas de esportes.
- **T-009** — pendências PD-003 a PD-008 resolvidas, que descrevem os dados a transportar.
- **T-004** — convenções `PC-001` a `PC-015` deste documento resolvidas.
- **Revisão cruzada** do `frontend` registada no quadro antes da integração (DT-005).

---

## 8. Pendências deste contrato

| # | Pendência | Bloqueia |
|---|---|---|
| **PC-001** | Nomes das chaves do envelope de resposta | Qualquer resposta |
| **PC-002** | Catálogo de códigos de erro estáveis | Tratamento de erro no frontend (RF-008) |
| **PC-003** | Formato do detalhamento de erro por campo | Validação visível na interface |
| **PC-004** | Formato de identificador | Modelos dos dois lados |
| **PC-005** | Formato de data, hora e fuso | RF-002, exibição de eventos |
| **PC-006** | Representação de decimais e odds | RF-003, CA-003.2, PD-007 |
| **PC-007** | Convenção de nomes de campos | Todos os modelos |
| **PC-008** | Formato de paginação e limites | Listagens longas, RNF-003 |
| **PC-009** | Formato de ordenação e filtros | RF-005 |
| **PC-010** | Sinalização de dado demonstrativo na resposta | RNF-008, RN-002, DP-004 |
| ~~**PC-011**~~ | ~~Forma de compartilhar tipos entre os agentes~~ | **Resolvida** — DT-001: `packages/contracts/` |
| ~~**PC-012**~~ | ~~Biblioteca de validação por esquema~~ | **Resolvida** — DT-001: Zod |
| **PC-013** | Confirmação da estratégia de versionamento | Seção 4 |
| **PC-014** | Se o frontend tolera valor enumerado desconhecido | Classificação de mudança compatível |
| **PC-015** | Uso de `422` ou apenas `400` para erro semântico | Seção 5.3 |

> Pendência aberta não autoriza decisão por omissão durante a implementação. Resolver, registrar no quadro e atualizar este documento.

---

## 9. Proposta do `backend` para a T-004 — **aguarda revisão do `frontend`**

**Estado:** proposta de 2026-10-26. **Não está acordada.** Nenhum esquema destas convenções existe em `packages/contracts/` e nenhuma rota de domínio as usa até o `frontend` registar a sua análise no quadro (DT-005) e o Pedro aprovar a integração. Quando houver acordo, cada PC passa para "Resolvida" na secção 8.

| # | Proposta | Motivo |
|---|---|---|
| **PC-001** | Sucesso: `{ "data": <carga>, "meta": { … } }`, com `meta` presente só quando houver metadados. Erro: `{ "error": { "code", "message", "details"? } }`. Um corpo tem sempre `data` **ou** `error`, nunca os dois | Separa a carga dos metadados (secção 2.1); o frontend distingue sucesso de erro pela chave, não pela forma |
| **PC-002** | Catálogo inicial: `VALIDATION_FAILED` (400), `NOT_FOUND` (404), `RATE_LIMITED` (429), `INTERNAL_ERROR` (500), `UPSTREAM_UNAVAILABLE` (503, provedor externo indisponível ou com resposta inválida). Códigos em `MAIÚSCULAS_COM_SUBLINHADO`, nunca reutilizados | Cobre os estados de RF-008: recuperável (`RATE_LIMITED`, `UPSTREAM_UNAVAILABLE`, `INTERNAL_ERROR`), definitivo (`VALIDATION_FAILED`, `NOT_FOUND`) |
| **PC-003** | `details: [{ "field": "query.limit", "issue": "too_big" }]`. `field` = localização (`path`, `query`, `body`) + caminho com pontos. `issue` = código estável, não um texto | O frontend associa o erro ao campo sem analisar mensagens |
| **PC-004** | Identificadores são **texto opaco**: o frontend não os interpreta, não os ordena nem os converte | O formato dos IDs do provedor é desconhecido (BLQ-001); texto serve para qualquer formato |
| **PC-005** | ISO 8601 em UTC com `Z`, por exemplo `"2026-10-26T22:00:00Z"`. Conversão para a hora local só no frontend | Sem ambiguidade de fuso; o formato de exibição depende da PD-008 |
| **PC-006** | **Dependente de BLQ-001 e PD-007.** Proposta provisória: odds em texto decimal (`"1.85"`) para não perder precisão; a formatação de exibição é feita no frontend | A forma como o provedor entrega as odds é desconhecida; só se fecha com a documentação real |
| **PC-007** | `camelCase` em todos os campos | Nativo de TypeScript nos dois lados; o adaptador converte o formato do provedor |
| **PC-008** | `?limit=` (padrão 20, máximo 100) e `?cursor=` opaco; `meta: { "nextCursor": "<texto>" \| null }` | O cursor serve tanto para um provedor paginado como para dados locais, sem expor deslocamentos |
| **PC-009** | Filtro = parâmetro com o nome do campo; vários valores repetem o parâmetro (`?sport=a&sport=b`). Ordenação: `?sort=campo` (ascendente) ou `?sort=-campo` (descendente). Campos aceites documentados por rota; um valor fora da lista dá `VALIDATION_FAILED` | Previsível e fácil de validar com Zod |
| **PC-010** | **Dependente de DIV-001 (decisão do Pedro).** Proposta provisória: cada recurso tem `origin: "demo" \| "provider"` | Permite misturar dados reais e demonstrativos e testar a sinalização (RNF-008) |
| **PC-013** | Mantém-se sem versão na URL (secção 4.1). Rotas de domínio com o prefixo `/api` (ex.: `/api/eventos`); rotas operacionais (`/health`) sem prefixo | Separa o domínio da operação e permite que o servidor de desenvolvimento do frontend encaminhe `/api` |
| **PC-014** | *Pergunta ao `frontend`:* a interface trata um valor enumerado desconhecido sem quebrar (ex.: mostra-o como "outro")? | Se sim, acrescentar um valor passa a ser uma mudança compatível |
| **PC-015** | Só `400` (`VALIDATION_FAILED`) para entradas inválidas, sem `422` | Uma regra única é mais simples de tratar; o `details` já diz o que falhou |

**Comunicação local entre web e api (pendência da T-013):** proposta — o servidor de desenvolvimento do Vite encaminha `/api` para `http://127.0.0.1:3333`, no ficheiro de configuração do `frontend`. A api não precisa de CORS em desenvolvimento. CORS só entra se a web e a api forem publicadas em origens diferentes (DP-008).
