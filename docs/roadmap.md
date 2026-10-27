# Roadmap — blbet

> Plano de fases do protótipo demonstrativo. A situação de cada fase reflete **evidência no repositório** em 2026-10-26, não intenção.

**Status:** Fase 1 em andamento · **Última atualização:** 2026-10-26

**Sem datas e sem estimativas.** Não há informação suficiente para estimar — ritmo de trabalho, disponibilidade e stack (DP-001, ainda não aprovada) são desconhecidos. Estimativa inventada é pior que ausência de estimativa.

**Prioridade da primeira entrega:** identidade visual (Fase 2) e frontend demonstrativo (Fase 3).

## Situação geral

| Fase | Situação | Observação |
|---|---|---|
| 1 — Documentação e planejamento | **Em andamento** | 4 de 6 documentos existem |
| 2 — Identidade visual | **Não iniciada** | Parcialmente bloqueada por DP-001 |
| 3 — Frontend | **Bloqueada** | Depende da Fase 2 e de DP-001 |
| 4 — Dados e integrações de teste | **Bloqueada** | Depende de DP-001 e de `docs/integracoes.md` |
| 5 — Qualidade técnica | **Bloqueada** | Depende de DP-002 e de código existente |
| 6 — Preparação para publicação | **Bloqueada** | Depende de DP-008 e de revisão jurídica |

Legenda: **não iniciada** · **em andamento** · **bloqueada** (dependência externa não resolvida) · **concluída** (apenas com evidência verificável).

---

## Fase 1 — Documentação e planejamento

**Situação: em andamento.**

**Objetivo** — estabelecer a base documental que orienta todo o desenvolvimento, de forma que nenhuma decisão de produto ou técnica seja tomada por omissão.

**Tarefas**

| Tarefa | Situação | Evidência |
|---|---|---|
| Visão do produto | **Concluída** | [`docs/visao.md`](visao.md) existe |
| Requisitos | **Concluída** | [`docs/requisitos.md`](requisitos.md) existe, com RF-001 a RF-008, RNF, regras e critérios |
| Arquitetura | **Concluída como proposta** | [`docs/arquitetura.md`](arquitetura.md) existe; a stack **não está aprovada** (DP-001) |
| Sistema visual | **Não iniciada** | `docs/design-system.md` não existe |
| Documentação das integrações | **Não iniciada** | `docs/integracoes.md` não existe |
| Registro de decisões | **Não iniciada** | `docs/decisoes-tecnicas.md` não existe |

**Dependências** — nenhuma externa. As pendências de conteúdo (público-alvo, metas de desempenho, escopo da busca, entre outras listadas em PD-001 a PD-011 nos requisitos) dependem de informação do responsável pelo produto.

**Critérios de conclusão**

- Os seis documentos existem no repositório.
- A stack está aprovada e registrada em `docs/decisoes-tecnicas.md` (resolve DP-001).
- As pendências que bloqueiam a Fase 2 e a Fase 3 estão resolvidas ou explicitamente aceitas como abertas.

---

## Fase 2 — Identidade visual

**Situação: não iniciada.** Parcialmente bloqueada: a direção estética e os tokens podem ser definidos antes da stack; os componentes-base exigem DP-001 aprovada.

**Objetivo** — definir a linguagem visual do produto e a estrutura de navegação, para que o frontend da Fase 3 seja montado sobre um sistema e não sobre decisões pontuais. Atende o objetivo de interface profissional e o critério de experiência consistente da visão.

**Tarefas**

- Definir a direção estética — registrada em `docs/design-system.md`.
- Estabelecer tokens visuais: cor, tipografia, espaçamento, raio, elevação, estados de interação.
- Definir o tratamento visual que identifica dado demonstrativo (resolve PD-009 e DP-004).
- Definir a estrutura de navegação: navegação principal, hierarquia das áreas, comportamento em mobile.
- Criar os componentes-base: estados de carregamento, erro e vazio (RF-008), cartões de evento e de jogo, campo de busca, indicador de favorito.
- Verificar contraste e foco visível dos tokens e componentes contra RNF-002.

**Dependências**

- `docs/design-system.md` (Fase 1).
- **DP-001** aprovada, para os componentes-base.
- **DP-006** (biblioteca de estilos e componentes).
- Nome de marca, logotipo e paleta — não definidos; a visão explicitamente não os define.
- **PD-002** (público-alvo) influencia linguagem e densidade de informação; a definição estética sem ele carrega risco de retrabalho.

**Critérios de conclusão**

- `docs/design-system.md` descreve direção estética, tokens e regras de uso.
- Tokens implementados e consumidos pelos componentes, sem valores soltos no código.
- Componentes-base existem, são reutilizáveis e cobrem os três estados de RF-008.
- Estrutura de navegação definida e verificada em mobile, tablet e desktop.
- Contraste e foco verificados contra WCAG 2.2 AA.

---

## Fase 3 — Frontend

**Situação: bloqueada** pela Fase 2 e por DP-001.

**Objetivo** — entregar o protótipo demonstrativo navegável ponta a ponta, cumprindo RF-001 a RF-008 com dados demonstrativos.

**Tarefas**

| Tarefa | Requisitos |
|---|---|
| Home | RF-001 |
| Área esportiva: esportes, competições, eventos, mercados e odds | RF-002, RF-003 |
| Catálogo de cassino: listagem, categorias e detalhe | RF-004 |
| Busca e filtros | RF-005 |
| Favoritos com persistência local | RF-006 |
| Perfil demonstrativo | RF-007 |
| Estados responsivos e de erro em todas as áreas | RF-008, RNF-001 |

**Dependências**

- Fase 2 concluída (tokens e componentes-base).
- **DP-001** aprovada.
- **DP-005** (estratégia de estado da interface).
- Fixtures mínimas para alimentar as telas — antecipa parte da Fase 4.
- Pendências de conteúdo: **PD-003** (escopo da busca), **PD-004** (mercados), **PD-005** (categorias), **PD-006** (campos do perfil), **PD-007** (formato das odds), **PD-008** (idioma e formatos).

**Critérios de conclusão**

- Todos os critérios de aceitação CA-001.x a CA-008.x dos requisitos verificados.
- Nenhum caminho sem saída ou link quebrado no escopo inicial.
- CA-RNF-001 (responsividade) verificado em mobile, tablet e desktop.
- Dados demonstrativos identificados na interface em todas as áreas (RNF-008).
- Nenhuma funcionalidade de aposta, depósito, saque ou pagamento presente, nem desabilitada na interface (RN-001, RN-003).

---

## Fase 4 — Dados e integrações de teste

**Situação: bloqueada** por DP-001 e pela ausência de `docs/integracoes.md`.

**Objetivo** — consolidar a camada de dados tipada e os adaptadores, de forma que a origem demonstrativa possa ser trocada por provedores reais sem reescrever a interface.

**Tarefas**

- Modelos tipados completos: eventos, competições, mercados, odds, jogos, categorias, favoritos e perfil (RNF-006).
- Fixtures locais versionadas, tipadas e coerentes com os modelos (resolve DP-007).
- Esquemas de validação nas fronteiras, incluindo leitura do armazenamento local (RNF-004).
- Adaptadores independentes por provedor, com a origem demonstrativa implementando a mesma interface.
- Testes de integração entre serviço, adaptador e origem de dados.
- Testes com provedor real **somente em ambiente autorizado de demonstração**, sem dado real de usuário e sem qualquer operação financeira.

**Dependências**

- `docs/integracoes.md` — **inexistente**. Nenhum provedor, endpoint ou contrato deve ser presumido até existir.
- **DP-001** e **DP-007** aprovadas.
- Autorização formal do provedor para uso de ambiente de demonstração, antes de qualquer teste de integração.

**Critérios de conclusão**

- Modelos tipados cobrindo todo o dado exibido, sem escapes de tipo.
- Fixtures validadas e consumidas exclusivamente pelos serviços.
- Adaptadores substituíveis sem alteração na interface — demonstrável por teste.
- Nenhum segredo no repositório; credenciais de provedor apenas no servidor.
- Testes de integração passando, com resultados reais reportados.

---

## Fase 5 — Qualidade técnica

**Situação: bloqueada** por DP-002 e pela ausência de código.

**Objetivo** — levar o protótipo ao nível de qualidade declarado nos critérios de sucesso da visão.

**Tarefas**

- Testes automatizados nos três níveis previstos na arquitetura: unitário, integração e interface.
- Acessibilidade: percurso por teclado, foco visível, semântica, verificação automatizada (RNF-002).
- Desempenho: medição e correção de listagens longas, imagens e interação (RNF-003).
- Revisão de segurança: varredura de segredos, validação de entradas, mensagens de erro sem detalhe técnico (RNF-004).
- Correção dos erros encontrados nas revisões.

**Dependências**

- Fase 3 concluída.
- **DP-002** (ferramentas e cobertura mínima) e **DP-003** (integração contínua).
- **PD-001** — sem metas numéricas, o item de desempenho não é verificável, apenas qualitativo.

**Critérios de conclusão**

- Testes executando e passando, com cobertura na meta de DP-002 e **resultados reais reportados**.
- Verificação de acessibilidade sem violações de nível A ou AA (CA-RNF-002).
- Verificação de tipos e lint sem erros.
- Revisão de segurança sem achado crítico ou alto em aberto.
- Metas de desempenho atendidas, ou registro explícito de que permanecem qualitativas por PD-001.

---

## Fase 6 — Preparação para publicação

**Situação: bloqueada** por DP-008 e pela revisão jurídica.

**Objetivo** — deixar o protótipo demonstrativo publicável com segurança e observabilidade, sem habilitar qualquer operação real.

**Tarefas**

- Configuração de ambiente: variáveis, build e processo de publicação, com segredos fora do repositório.
- Monitoramento: registro de erros e disponibilidade.
- Verificações de segurança e operação antes da publicação.
- **Revisão jurídica e regulatória aplicável antes de qualquer operação real** — incluindo restrições de idade e jurisdição (PD-011), licenciamento e jogo responsável.

**Dependências**

- Fase 5 concluída.
- **DP-008** (plataforma de publicação).
- Parecer jurídico e licenciamento — **requisito bloqueante** para qualquer operação real, não decisão técnica.

**Critérios de conclusão**

- Ambiente configurado e publicação reproduzível, sem segredo versionado.
- Monitoramento ativo e verificado.
- Verificações de segurança e operação executadas, com resultados registrados.
- Natureza demonstrativa evidente na aplicação publicada.
- Qualquer evolução para operação real **não inicia** sem parecer jurídico e regulatório documentado.

---

## Bloqueios ativos

| Bloqueio | Trava | Responsável |
|---|---|---|
| **DP-001** — stack não aprovada | Fases 2 (parcial), 3, 4 | Pedro |
| `docs/design-system.md` inexistente | Fase 2 | Fase 1 |
| `docs/integracoes.md` inexistente | Fase 4 | Fase 1 |
| `docs/decisoes-tecnicas.md` inexistente | Registro de qualquer decisão | Fase 1 |
| **PD-002** — público-alvo não definido | Decisões da Fase 2 | Pedro |
| **PD-001** — metas de desempenho | Verificação na Fase 5 | Pedro |
| Parecer jurídico e regulatório | Qualquer operação real | Externo |

> Nenhuma fase é marcada como concluída sem evidência verificável no repositório.
