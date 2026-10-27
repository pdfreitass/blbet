# Visão do Produto — blbet

> Documento de referência da visão do produto. Decisões de marca (nome, logotipo, cores), de stack e de arquitetura definitiva **não** pertencem a este documento.

**Status:** rascunho inicial · **Última atualização:** 2026-10-26

---

## 1. Resumo do produto

O blbet é uma **plataforma web de entretenimento** organizada em duas áreas principais:

- **Esportes** — eventos esportivos com mercados e odds demonstrativas.
- **Cassino** — catálogo de jogos navegável por categorias.

Na fase atual o produto é um **protótipo demonstrativo**: toda a informação exibida é fictícia e serve para validar experiência, navegação e qualidade da interface. Não há movimentação de dinheiro em nenhum ponto do fluxo.

## 2. Problema e proposta de valor

> Nenhuma pesquisa de mercado foi realizada para este projeto. Esta seção descreve a **experiência pretendida**, não conclusões sobre o mercado.

A experiência que a plataforma pretende oferecer:

- **Encontrar conteúdo rápido** — chegar a um evento esportivo ou a um jogo de cassino em poucos passos, sem navegação confusa.
- **Leitura clara da informação** — eventos, mercados e odds apresentados de forma legível e previsível, incluindo em telas pequenas.
- **Continuidade** — favoritos e preferências preservados entre visitas, para que o retorno à plataforma não comece do zero.
- **Interface profissional e consistente** — mesmo padrão visual e de comportamento em todas as áreas, sem a sensação de partes montadas separadamente.
- **Transparência sobre a natureza demonstrativa** — o usuário entende, ao olhar a tela, que os dados são fictícios.

A proposta de valor em uma frase: **uma plataforma de entretenimento cuja navegação e apresentação da informação são o diferencial perceptível**, construída sobre uma base técnica organizada que permita evolução.

## 3. Público-alvo

> **Pendente de definição.** O público-alvo ainda não foi definido para este projeto.

Nenhuma faixa etária, perfil demográfico, região ou nível de familiaridade com o tema deve ser presumido em decisões de produto ou de interface até que esta seção seja preenchida.

Quando a definição existir, registrar aqui:

- Público pretendido e contexto de uso.
- Dispositivos e condições de acesso predominantes.
- Restrições de idade e jurisdição aplicáveis — item de impacto direto em requisitos legais.

## 4. Objetivos do produto

| Objetivo | O que significa |
|---|---|
| **Experiência intuitiva** | O usuário entende o que está vendo e como navegar sem instrução prévia. Caminhos curtos para as ações principais. |
| **Interface profissional** | Padrão visual consistente, hierarquia clara, estados tratados (carregamento, vazio, erro) em vez de telas quebradas. |
| **Desempenho** | Carregamento e interação percebidos como rápidos, inclusive em conexões e dispositivos modestos. |
| **Organização modular** | Áreas e componentes independentes e reutilizáveis, para que uma mudança em uma área não exija retrabalho nas outras. |

## 5. Escopo inicial

A primeira entrega contempla:

- **Home** — ponto de entrada com acesso às áreas e destaques.
- **Esportes** — navegação por esportes e competições.
- **Eventos e odds demonstrativas** — eventos esportivos com seus mercados e odds fictícios.
- **Cassino** — área dedicada ao catálogo de jogos.
- **Catálogo de jogos** — listagem navegável.
- **Busca** — localizar eventos e jogos.
- **Categorias** — agrupamento e filtragem do catálogo.
- **Favoritos** — marcar e recuperar itens de interesse.
- **Perfil demonstrativo** — área de perfil com dados fictícios, sem autenticação real nem informação pessoal verdadeira.

Todo dado exibido nessas áreas é demonstrativo e deve ser **identificável como tal na interface**.

## 6. Diferenciais pretendidos

> Registrados como **hipóteses não validadas**. Nenhum item desta seção deve ser tratado como vantagem comprovada ou como requisito aprovado.

- **H1 — Clareza da informação como diferencial.** Hipótese: apresentar eventos, mercados e odds de forma mais legível que o padrão do segmento melhora a percepção de qualidade. *Não validada.*
- **H2 — Navegação de baixa fricção.** Hipótese: reduzir o número de passos até o conteúdo aumenta o tempo de uso. *Não validada.*
- **H3 — Consistência entre áreas.** Hipótese: esportes e cassino sob o mesmo sistema visual aumentam a sensação de produto único e confiável. *Não validada.*
- **H4 — Qualidade em telas pequenas.** Hipótese: tratar o mobile com o mesmo cuidado do desktop é percebido como diferencial. *Não validada.*
- **H5 — Personalização leve.** Hipótese: favoritos e preferências simples bastam para criar continuidade, sem necessidade de recomendação automatizada. *Não validada.*

Validar uma hipótese exige evidência registrada em `docs/decisoes-tecnicas.md`.

## 7. Limites

- **Protótipo demonstrativo.** Sem dinheiro real em nenhum fluxo.
- **Sem apostas reais.** Nenhuma aposta é registrada, liquidada ou paga.
- **Sem depósitos, saques ou pagamentos.** Nenhuma integração com meios de pagamento, carteiras ou processadores.
- **Sem dados pessoais reais.** O perfil é demonstrativo; não há coleta de informação pessoal verdadeira.
- **Saldos e prêmios fictícios.** Qualquer valor exibido é ilustrativo e não representa crédito, obrigação ou direito.

## 8. Fora do escopo inicial

- Operação financeira de qualquer natureza — depósitos, saques, saldo real, conciliação, antifraude financeiro.
- Apostas reais — registro, liquidação, pagamento de prêmios.
- Integração com provedores reais de esportes ou de cassino em ambiente de produção.
- Autenticação de usuários reais, KYC e verificação de identidade.
- Verificação de idade e restrição por jurisdição.
- Ferramentas de jogo responsável com efeito operacional (limites, autoexclusão).
- Funcionalidades administrativas de operação (gestão de risco, backoffice, relatórios regulatórios).
- Qualquer funcionalidade que dependa de **autorização jurídica e regulatória** — nenhuma delas entra em escopo sem parecer jurídico e licenciamento aplicável.

## 9. Visão futura

> Possibilidades de evolução. **Nada aqui está implementado, aprovado ou planejado com data.**

- Substituição dos dados demonstrativos por provedores reais, via adaptadores, em ambiente autorizado.
- Contas de usuário com autenticação e preferências persistidas no servidor.
- Personalização baseada em histórico de navegação.
- Expansão do catálogo e das modalidades esportivas cobertas.
- Acompanhamento de eventos ao vivo.
- Internacionalização — múltiplos idiomas e moedas de exibição.
- Operação real, condicionada a licenciamento, parecer jurídico, conformidade regulatória e ferramentas de jogo responsável.

## 10. Critérios de sucesso

A primeira entrega é considerada bem-sucedida quando:

| Critério | Verificação |
|---|---|
| **Experiência consistente** | Mesmo padrão visual e de comportamento nas áreas de esportes e cassino; componentes reaproveitados em vez de variantes divergentes. |
| **Navegação funcional** | Todos os caminhos do escopo inicial percorríveis ponta a ponta, sem becos sem saída nem links quebrados. |
| **Responsividade** | Todas as telas utilizáveis em mobile, tablet e desktop, sem perda de conteúdo ou de função. |
| **Qualidade técnica** | Código modular e tipado, verificações automatizadas passando, estados de carregamento, erro e vazio tratados em todas as áreas. |
| **Natureza demonstrativa explícita** | O caráter fictício dos dados é perceptível na interface. |

## Pendências deste documento

| # | Pendência | Impacto |
|---|---|---|
| P1 | Definição do público-alvo (seção 3) | Decisões de interface, linguagem e priorização |
| P2 | Validação das hipóteses de diferencial (seção 6) | Priorização do roadmap |
| P3 | Restrições de idade e jurisdição aplicáveis | Requisitos legais e escopo futuro |
| P4 | Metas numéricas de desempenho | Torna verificável o objetivo "desempenho" da seção 4 — a detalhar em `docs/requisitos.md` |
