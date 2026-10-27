# Requisitos — blbet

> Requisitos do **protótipo demonstrativo**. Derivado de [`docs/visao.md`](visao.md). Nenhum requisito aqui está implementado: o repositório contém apenas documentação.

**Status:** rascunho inicial · **Última atualização:** 2026-10-26

Identificadores são estáveis: **RF-xxx** (funcional), **RNF-xxx** (não funcional), **RN-xxx** (regra de negócio), **CA-xxx** (critério de aceitação). Nunca reutilizar um identificador aposentado.

---

## 1. Requisitos funcionais

### RF-001 — Navegação pela página inicial

A home é o ponto de entrada e dá acesso às duas áreas do produto.

- Apresenta acesso claro às áreas de **esportes** e **cassino**.
- Exibe seções de destaque com eventos e jogos demonstrativos.
- Disponibiliza a busca (RF-005) e o acesso ao perfil demonstrativo (RF-007).
- Mantém a navegação principal visível e utilizável em todas as larguras de tela.
- Sinaliza que o conteúdo exibido é demonstrativo (RN-002).

### RF-002 — Visualização de eventos esportivos demonstrativos

- Lista eventos esportivos agrupados por esporte e competição.
- Cada evento exibe, no mínimo: participantes, competição, data e hora, e situação (por exemplo, agendado ou encerrado).
- Permite navegar de uma listagem para o detalhe de um evento.
- Permite filtrar ou alternar entre esportes e competições disponíveis.
- A ordenação da listagem é previsível e documentada no código.

### RF-003 — Visualização de mercados e odds informativas

- No detalhe de um evento, exibe os mercados disponíveis e suas opções.
- Cada opção apresenta um valor de odd vindo da fonte externa, **meramente informativo**, em formato de exibição consistente em toda a aplicação (DT-013).
- As odds são **somente leitura**: não existe seleção que componha aposta, cupom, bilhete ou valor a apostar (RN-003).
- Deixa explícito que as odds são informativas e que não há apostas (RN-002).

### RF-004 — Navegação pelo catálogo de cassino

- Apresenta o catálogo de jogos em listagem navegável.
- Cada jogo exibe, no mínimo: nome, categoria e imagem ou elemento visual representativo.
- Permite navegar por **categorias** de jogos.
- Permite abrir o detalhe de um jogo com suas informações demonstrativas.
- Nenhum jogo é executável nesta fase: não há jogo real, rodada ou resultado (RN-004).

### RF-005 — Busca e filtragem de jogos

- Campo de busca que localiza itens por nome.
- A busca cobre o catálogo de cassino e, quando aplicável, eventos esportivos — escopo exato é pendência **PD-003**.
- Filtragem por categoria, combinável com o termo buscado.
- Resultados atualizados conforme o critério informado, com feedback de carregamento (RF-008).
- Ausência de resultados produz estado vazio explicativo, não tela em branco (RF-008).
- Permite limpar busca e filtros e retornar à listagem completa.

### RF-006 — Gerenciamento local de favoritos

- Permite marcar e desmarcar como favorito um jogo e um evento esportivo.
- O estado de favorito é visível no item, tanto na listagem como no detalhe.
- Existe uma visualização que reúne os itens favoritados.
- Os favoritos são persistidos **localmente no navegador** — sem servidor e sem conta de usuário (RN-005).
- A ausência de favoritos produz estado vazio explicativo.
- Falha de leitura ou escrita do armazenamento local não quebra a interface: a aplicação segue funcional sem favoritos.

### RF-007 — Perfil de demonstração

- Área de perfil com dados **fictícios**, sem autenticação real.
- Exibe informações ilustrativas de conta e preferências de interface, quando houver.
- Não coleta, exibe nem armazena dados pessoais verdadeiros (RN-006).
- Quando exibir saldo ou histórico, estes são explicitamente fictícios e sem qualquer operação associada (RN-001).
- Não oferece depósito, saque, pagamento, alteração de dados cadastrais reais nem verificação de identidade.

### RF-008 — Estados de carregamento, erro e ausência de resultados

Aplicável a **todas** as áreas que carregam ou filtram dados.

- **Carregando** — indicação visual enquanto os dados não estão disponíveis, sem deslocamento abrupto do layout ao concluir.
- **Erro** — mensagem compreensível, sem detalhe técnico interno, com ação de nova tentativa quando a operação for repetível (RNF-004).
- **Vazio** — mensagem explicativa que diferencia "nada cadastrado" de "nada encontrado para este critério", com caminho de saída (limpar filtros, voltar à listagem).
- Nenhum estado produz tela em branco, travada ou sem rota de retorno.

---

## 2. Requisitos não funcionais

### RNF-001 — Responsividade

Todas as telas utilizáveis em mobile, tablet e desktop, sem perda de conteúdo ou de função. Sem rolagem horizontal indesejada. Alvos de toque adequados ao uso em mobile.

### RNF-002 — Acessibilidade

Alvo: **WCAG 2.2 nível AA**. Navegação completa por teclado com foco visível, HTML semântico, nomes acessíveis em controles e imagens, contraste suficiente e hierarquia de títulos coerente. Estados de RF-008 anunciáveis por leitor de tela.

### RNF-003 — Desempenho

Interface percebida como rápida em conexões e dispositivos modestos: listagens longas sem travamento, interação responsiva, imagens dimensionadas e carregadas sob demanda.

> **Metas numéricas pendentes (PD-001).** Sem elas este requisito não é mensurável; verificação fica qualitativa até a definição.

### RNF-004 — Segurança

- Nenhum segredo ou credencial no frontend ou no controle de versão.
- Validação de toda entrada do usuário nas fronteiras do sistema.
- Mensagens de erro sem rastreio técnico, caminho de arquivo ou detalhe interno.
- Conteúdo de origem externa tratado como não confiável e devidamente escapado.

### RNF-005 — Manutenção

Código modular, organizado por domínio, com responsabilidades separadas. Sem duplicação de lógica entre áreas. Componentes de interface reutilizáveis em vez de variantes divergentes.

### RNF-006 — Tipagem

Modelos de dados tipados, incluindo eventos, mercados, odds, jogos, categorias, favoritos e perfil. Tipos como contrato único entre dados demonstrativos e interface, sem escapes de tipo para contornar erros.

### RNF-007 — Testabilidade

Lógica de negócio separada da apresentação e testável isoladamente. Dados demonstrativos substituíveis por dados de teste. Cobertura mínima e ferramentas conforme `docs/arquitetura.md`.

### RNF-008 — Identificação visual dos dados demonstrativos

O caráter fictício dos dados é perceptível na interface de forma consistente — mesmo tratamento visual em todas as áreas, sem depender de leitura de texto auxiliar. Implementa RN-002.

---

## 3. Regras de negócio

### RN-001 — Ausência de transações financeiras reais

Não existe depósito, saque, pagamento, transferência, saldo real ou crédito. Valores monetários exibidos são ilustrativos e não representam crédito, obrigação ou direito. Nenhuma integração com meio de pagamento, carteira ou processador.

### RN-002 — Dados demonstrativos identificados

Os dados esportivos (eventos, competições e cotações) vêm de fonte externa real e são **meramente informativos**. O cassino e todos os restantes valores (perfil, conta, prêmios) são fictícios e identificáveis como tais na interface (RNF-008). A interface declara de forma permanente que é uma plataforma demonstrativa, sem apostas nem transações. Redação revista pela [DT-013](decisoes-tecnicas.md#dt-013--dados-esportivos-reais-informativos-e-restantes-dados-fictícios), 2026-10-27.

### RN-003 — Odds sem composição de aposta

Odds são informação de exibição. Não há seleção que componha aposta, cupom, bilhete, valor apostado, confirmação ou liquidação. Nenhuma aposta é registrada em qualquer forma.

### RN-004 — Jogos não executáveis

O cassino é um catálogo. Nenhum jogo é executado, nem em modo demonstrativo com rodadas: não há rodada, resultado, prêmio ou RNG.

### RN-005 — Favoritos apenas locais

Favoritos vivem no armazenamento local do navegador do usuário. Não trafegam para servidor, não são compartilhados entre dispositivos e podem ser perdidos ao limpar os dados do navegador — comportamento aceito nesta fase.

### RN-006 — Perfil sem dados pessoais reais

O perfil é demonstrativo. Não há autenticação real, cadastro, coleta de dados pessoais verdadeiros, KYC ou verificação de identidade.

### RN-007 — Sem funcionalidade dependente de autorização regulatória

Nenhuma funcionalidade que exija licenciamento, parecer jurídico ou conformidade regulatória entra em escopo nesta fase — incluindo verificação de idade com efeito operacional, restrição por jurisdição e ferramentas de jogo responsável com efeito operacional.

---

## 4. Critérios de aceitação

Condições verificáveis. "Verificável" significa demonstrável por teste automatizado ou por percurso manual reproduzível.

### RF-001 — Página inicial

- **CA-001.1** A partir da home é possível alcançar a área de esportes e a área de cassino, cada uma em um clique ou toque.
- **CA-001.2** A navegação principal permanece acessível e utilizável em larguras de mobile, tablet e desktop.
- **CA-001.3** A busca é alcançável a partir da home.
- **CA-001.4** A identificação de conteúdo demonstrativo está presente na home.

### RF-002 — Eventos esportivos

- **CA-002.1** A listagem exibe eventos agrupados por esporte e competição.
- **CA-002.2** Cada item exibe participantes, competição, data e hora, e situação.
- **CA-002.3** Selecionar um evento abre seu detalhe com os mesmos dados da listagem, sem divergência.
- **CA-002.4** Alternar de esporte ou competição atualiza a listagem de acordo com a seleção.
- **CA-002.5** Recarregar a página mantém a listagem coerente com a rota acessada.

### RF-003 — Mercados e odds

- **CA-003.1** O detalhe do evento exibe pelo menos um mercado com suas opções e odds.
- **CA-003.2** O formato de exibição das odds é idêntico em todas as telas onde aparecem.
- **CA-003.3** Nenhum elemento da interface permite selecionar uma odd para compor aposta, cupom ou valor.
- **CA-003.4** A tela indica que as odds vêm de fonte externa, são meramente informativas e não permitem apostas (DT-013).

### RF-004 — Catálogo de cassino

- **CA-004.1** O catálogo lista jogos com nome, categoria e elemento visual.
- **CA-004.2** É possível navegar por categorias e a listagem reflete a categoria escolhida.
- **CA-004.3** Selecionar um jogo abre seu detalhe demonstrativo.
- **CA-004.4** Nenhum elemento da interface inicia execução de jogo, rodada ou resultado.

### RF-005 — Busca e filtros

- **CA-005.1** Buscar um termo existente retorna os itens correspondentes.
- **CA-005.2** Buscar um termo sem correspondência exibe o estado vazio de "nada encontrado", distinto do estado de erro.
- **CA-005.3** Busca e filtro de categoria combinados retornam a interseção dos critérios.
- **CA-005.4** Limpar busca e filtros restaura a listagem completa.
- **CA-005.5** A busca é operável por teclado, com foco visível.

### RF-006 — Favoritos

- **CA-006.1** Marcar um item como favorito atualiza seu indicador imediatamente na tela.
- **CA-006.2** Recarregar a página preserva os favoritos marcados.
- **CA-006.3** Desmarcar remove o item da visualização de favoritos.
- **CA-006.4** Sem favoritos, a visualização exibe estado vazio explicativo.
- **CA-006.5** Com o armazenamento local indisponível ou bloqueado, a aplicação continua navegável e não exibe erro técnico ao usuário.

### RF-007 — Perfil demonstrativo

- **CA-007.1** A área de perfil é alcançável pela navegação principal.
- **CA-007.2** Todos os dados exibidos são fictícios e identificados como tal.
- **CA-007.3** Não existe na interface ação de depósito, saque, pagamento ou verificação de identidade.
- **CA-007.4** Nenhum campo coleta dado pessoal verdadeiro.

### RF-008 — Estados

- **CA-008.1** Cada tela que carrega dados exibe indicação de carregamento antes do conteúdo.
- **CA-008.2** Falha de carregamento exibe mensagem compreensível sem detalhe técnico, com nova tentativa quando a operação for repetível.
- **CA-008.3** Os estados "nada cadastrado" e "nada encontrado" são textualmente distintos.
- **CA-008.4** Nenhum estado resulta em tela em branco ou sem caminho de retorno.

### Não funcionais

- **CA-RNF-001** Todas as telas do escopo inicial percorridas em mobile, tablet e desktop sem perda de conteúdo, sobreposição ou rolagem horizontal indesejada.
- **CA-RNF-002** Percurso completo por teclado em todas as telas, com foco sempre visível; verificação automatizada de acessibilidade sem violações de nível A ou AA.
- **CA-RNF-003** Metas de desempenho verificadas após a definição de **PD-001**; até então, avaliação qualitativa registrada na revisão.
- **CA-RNF-004** Varredura do repositório sem segredos ou credenciais; mensagens de erro da interface sem rastreio técnico.
- **CA-RNF-006** Verificação de tipos sem erros, sem escapes de tipo introduzidos para contornar falhas.
- **CA-RNF-007** Testes automatizados executando e passando, com resultados reais reportados.

---

## 5. Prioridade

| Prioridade | Significado |
|---|---|
| **Essencial (MVP)** | Sem isto a primeira entrega não cumpre o escopo inicial da visão |
| **Importante** | Eleva a qualidade da entrega; pode ficar para imediatamente depois do MVP |
| **Futuro** | Fora da primeira entrega |

| Requisito | Prioridade |
|---|---|
| RF-001 Página inicial | Essencial |
| RF-002 Eventos esportivos | Essencial |
| RF-003 Mercados e odds | Essencial |
| RF-004 Catálogo de cassino | Essencial |
| RF-005 Busca e filtragem | Essencial |
| RF-006 Favoritos locais | Essencial |
| RF-007 Perfil demonstrativo | Essencial |
| RF-008 Estados de carregamento, erro e vazio | Essencial |
| RNF-001 Responsividade | Essencial |
| RNF-004 Segurança | Essencial |
| RNF-005 Manutenção | Essencial |
| RNF-006 Tipagem | Essencial |
| RNF-008 Identificação dos dados demonstrativos | Essencial |
| RNF-002 Acessibilidade | Importante |
| RNF-003 Desempenho | Importante |
| RNF-007 Testabilidade | Importante |

**Futuro** — fora da primeira entrega, conforme seções 8 e 9 de [`docs/visao.md`](visao.md): autenticação real e favoritos sincronizados por conta, provedores reais de esportes e cassino, eventos ao vivo, internacionalização, personalização por histórico, qualquer operação financeira, e tudo que dependa de autorização jurídica e regulatória.

---

## 6. Pendências

| # | Pendência | Bloqueia | Origem |
|---|---|---|---|
| **PD-001** | Metas numéricas de desempenho | RNF-003, CA-RNF-003 | P4 da visão |
| **PD-002** | Definição do público-alvo | Linguagem, densidade de informação e priorização de interface | P1 da visão |
| **PD-003** | Escopo da busca: apenas cassino ou cassino e esportes | RF-005, CA-005.x | Escopo inicial da visão menciona busca sem delimitar |
| ~~**PD-004**~~ | ~~Quais mercados esportivos modelar e em que profundidade~~ | RF-003 | **Resolvida** — DT-010: resultado final e mais/menos golos |
| **PD-005** | Conjunto de categorias do catálogo de cassino | RF-004, RF-005 | Não definido |
| **PD-006** | Campos exatos do perfil demonstrativo e se exibe saldo fictício | RF-007 | Não definido |
| ~~**PD-007**~~ | ~~Formato de exibição das odds (decimal, fracionário, americano) e se é alternável~~ | RF-003, CA-003.2 | **Resolvida** — DT-010: decimal com 2 casas, sem alternância |
| **PD-008** | Idiomas e formato de data, hora e números | RF-002 | Não definido |
| **PD-009** | Forma visual de identificar dados demonstrativos | RNF-008, RN-002 | Depende de `docs/design-system.md`, inexistente |
| **PD-010** | Ferramentas e cobertura mínima de teste | RNF-007, CA-RNF-007 | Depende de `docs/arquitetura.md` |
| **PD-011** | Restrições de idade e jurisdição aplicáveis | Escopo futuro, RN-007 | P3 da visão |

> Uma pendência não resolvida **não** autoriza decisão por omissão: solicitar esclarecimento antes de implementar o item afetado.
