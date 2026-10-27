# Arquitetura — blbet

> Arquitetura **aprovada quanto à stack** ([DT-001](decisoes-tecnicas.md#dt-001--stack-do-projeto)). **Nada neste documento está implementado.** Derivado de [`docs/visao.md`](visao.md), [`docs/requisitos.md`](requisitos.md), `CLAUDE.md` e [`docs/decisoes-tecnicas.md`](decisoes-tecnicas.md).

**Status:** stack aprovada, estrutura a confirmar na preparação do ambiente (T-013) · **Última atualização:** 2026-10-26

---

## 1. Estado atual

Inspeção do repositório em 2026-10-26:

```
blbet/                       C:\Users\pedro\OneDrive\Documentos\blbet (mudança prevista: DT-007)
├── CLAUDE.md
├── README.md                uma linha ("# blbet")
└── docs/
    ├── visao.md  requisitos.md  arquitetura.md  roadmap.md
    ├── decisoes-tecnicas.md
    └── agent-protocol.md  agent-handoff.md  agent-tasks.md  api-contract.md
```

- **Código: nenhum.** Não há `package.json`, lockfile, `tsconfig.json` nem código-fonte. Nenhuma dependência foi instalada.
- **Histórico:** um único commit (`Initial commit`). `CLAUDE.md` e `docs/` ainda não estão no git.
- **Existem desde 2026-10-26:** `docs/design-system.md` (do `frontend`) e `docs/integracoes.md` (do `backend`, sem provedor identificado).

---

## 2. Stack aprovada

### 2.1 Decisão

Registada em [DT-001](decisoes-tecnicas.md#dt-001--stack-do-projeto):

| Camada | Tecnologia | Local | Dono |
|---|---|---|---|
| Gestão do monorepo | pnpm workspaces | raiz | compartilhado, com aviso prévio |
| Frontend | React + Vite + TypeScript | `apps/web/` | `frontend` |
| Backend | Node.js + Fastify + TypeScript | `apps/api/` | `backend` |
| Contratos | Zod (esquemas e tipos) | `packages/contracts/` | `backend` escreve; `frontend` consome |
| Testes unitários e de integração | Vitest | em cada app e pacote | dono da app |
| Testes end-to-end | Playwright, quando a estrutura estiver pronta | a definir (PA-008) | a definir |

Versões, comandos e configurações exatos são confirmados na T-013. As alternativas rejeitadas (Next.js num projeto único, SPA sem servidor, backend noutra linguagem) e os motivos estão na DT-001.

### 2.2 Responsabilidades

- **`apps/web/`** — renderização das telas, navegação, estados de RF-008, acessibilidade (RNF-002), responsividade (RNF-001), estado local de interface e favoritos (RF-006, RN-005). Não guarda segredos e não fala diretamente com provedores externos.
- **`apps/api/`** — único ponto de contacto com provedores externos. Guarda as credenciais, chama o provedor, valida e converte as respostas para o modelo interno, aplica cache e respeita os limites do provedor, e expõe os dados ao frontend segundo [`docs/api-contract.md`](api-contract.md).
- **`packages/contracts/`** — esquemas Zod e tipos derivados do modelo interno, partilhados pelos dois lados. Não contém lógica de negócio nem chamadas de rede.
- **Persistência** — **nenhum banco de dados definido.** Favoritos vivem no navegador (RN-005). Se o cache das respostas do provedor exigir armazenamento, isso é decidido em **DP-009**, depois de conhecidos os limites reais do provedor.
- **Integrações** — API esportiva real desde o início (DT-002), com o provedor **ainda não identificado** (BLQ-001). Cassino numa etapa posterior.

---

## 3. Módulos de domínio

Cada módulo é um domínio autocontido; o que é compartilhado vive em módulo comum. Os mesmos domínios aparecem nos dois lados, cada um na sua app.

| Módulo | Responsabilidade | Requisitos |
|---|---|---|
| **home** | Ponto de entrada, destaques, acesso às áreas | RF-001 |
| **esportes** | Esportes, competições, eventos, mercados e odds | RF-002, RF-003 |
| **cassino** | Área de cassino e navegação por categorias | RF-004 |
| **catalogo** | Listagem, categorias, busca e filtragem de jogos | RF-004, RF-005 |
| **favoritos** | Marcação, leitura e persistência local (só no frontend) | RF-006 |
| **perfil** | Perfil demonstrativo | RF-007 |
| **compartilhado** | Componentes de interface, estados de RF-008, tipos e utilitários comuns | RF-008, RNF-005, RNF-008 |

Regra de dependência: os módulos de domínio podem depender de **compartilhado**, mas não uns dos outros. Uma necessidade cruzada resolve-se por contrato em **compartilhado**, não por importação direta entre domínios.

---

## 4. Organização do código

Estrutura de referência, **a confirmar na T-013**. Apenas o primeiro nível (`apps/web`, `apps/api`, `packages/contracts`) está decidido (DT-001); a organização interna de cada app é decidida pelo seu dono.

```
blbet/
├── apps/
│   ├── web/                      frontend — dono: frontend
│   │   └── src/
│   │       ├── app/              rotas e páginas
│   │       ├── modules/<dominio>/
│   │       ├── shared/
│   │       └── styles/           tokens e estilos globais
│   └── api/                      backend — dono: backend
│       └── src/
│           ├── modules/<dominio>/  rotas, serviços e regras do domínio
│           ├── adapters/           um adaptador por provedor externo
│           └── shared/             configuração, erros, utilitários
├── packages/
│   └── contracts/                esquemas Zod e tipos — dono: backend
├── docs/
├── package.json                  raiz — compartilhado, com aviso prévio
└── pnpm-workspace.yaml           compartilhado, com aviso prévio
```

Convenções:

- **Diretórios** por domínio, não por tipo de ficheiro. Nomes em minúsculas, sem acentos.
- **Componentes** pequenos e focados; apresentação separada da lógica. Um componente que serve mais de um domínio vai para `shared/`.
- **Serviços** concentram o acesso a dados. No frontend, nenhum componente chama a API diretamente: passa sempre pelo serviço do domínio.
- **Tipos** (RNF-006) derivados dos esquemas de `packages/contracts/`. Sem escapes de tipo para contornar erros.
- **Validação** por esquema nas fronteiras (RNF-004): entradas no servidor, respostas do provedor e dados lidos do armazenamento local.
- **Limites de tamanho** conforme `CLAUDE.md`: funções enxutas, ficheiros focados, sem duplicação entre módulos.

---

## 5. Fluxo de dados

### 5.1 Esportes — provedor real (DT-002)

```
provedor esportivo → adaptador (apps/api) → validação Zod → modelo interno
  → serviço do domínio → rota da api → frontend valida → serviço → componente → tela
```

- O frontend **nunca** consome o formato do provedor; só o modelo interno definido em `packages/contracts/`.
- **Bloqueado por BLQ-001:** sem o provedor e a sua documentação oficial não há adaptador, modelo esportivo nem rotas (T-010, T-014, T-015).
- A forma de atualização das odds (consulta periódica, envio pelo provedor) depende da documentação real (DP-009).

### 5.2 Cassino e dados demonstrativos

- O cassino continua com **dados demonstrativos locais** até à etapa da API agregadora.
- Enquanto não houver contrato aprovado, o frontend pode usar dados demonstrativos para desenvolver a interface (T-016), **sempre identificados como demonstrativos** (RN-002, RNF-008) e sem se apresentarem como dados do provedor.
- Os serviços expõem uma interface assíncrona desde já, para que os estados de carregamento e erro (RF-008) sejam reais.
- **Favoritos** seguem caminho próprio: estado em memória espelhado no armazenamento local; leitura validada e tolerante a falha (CA-006.5).

> **Divergência DIV-001.** Os requisitos dizem que todo dado é fictício (RN-002, RF-003, RNF-008); a DT-002 traz dados reais de terceiros para esportes. **Resolvida na interface pela DT-013 e pela DT-014:** marca-se só o dado fictício. Ver [`docs/decisoes-tecnicas.md`](decisoes-tecnicas.md#divergências-documentais-abertas).

---

## 6. Integrações

- **API esportiva** — real desde o início (DT-002). **Provedor não identificado; documentação oficial indisponível** (BLQ-001). Nenhum endpoint, nome de provedor, autenticação, limite ou formato pode ser presumido.
- **API agregadora de cassino** — numa etapa posterior. Nenhum detalhe definido.
- **Adaptadores independentes** — cada provedor fica atrás do seu próprio adaptador em `apps/api/src/adapters/`, que implementa a interface consumida pelo serviço do domínio. Trocar ou adicionar provedor não altera o frontend nem os outros domínios.
- **O modelo interno manda** — o adaptador converte as respostas para o modelo interno; uma mudança no provedor fica contida no adaptador.
- **Segredos só no servidor** — a credencial do provedor nunca chega ao cliente (RNF-004).
- **A resposta do provedor é entrada não confiável** — validada por esquema antes de virar modelo interno.
- **Sem simulação apresentada como real** — nenhum adaptador devolve dados inventados como se viessem do provedor.

Os detalhes de provedores, termos de uso, limites e ambientes ficam em [`docs/integracoes.md`](integracoes.md), que tem também os critérios para escolher o provedor (T-006, T-010).

---

## 7. Segurança

- **Segredos exclusivamente no servidor** (`apps/api/`), em variáveis de ambiente fora do repositório. Versionar apenas exemplos sem valores reais. Nenhum segredo no código de `apps/web/` nem em variável exposta ao navegador.
- **Validação de entradas** nas fronteiras (RNF-004): parâmetros de rota, termos de busca, filtros, dados lidos do armazenamento local e respostas de provedores.
- **Controle de acesso** — não aplicável nesta fase: não há autenticação nem dado de utilizador real (RN-006). Quando surgir, é uma decisão de arquitetura própria, registada em `docs/decisoes-tecnicas.md`.
- **Tratamento seguro de erros** — o utilizador recebe uma mensagem compreensível; o rastreio e o detalhe técnico ficam no log do servidor (CA-008.2).
- **Conteúdo não confiável** escapado por padrão, incluindo textos vindos do provedor; sem injeção de HTML a partir de dados externos.
- **Consumo do provedor** — respeitar os limites documentados pelo provedor, quando conhecidos (DP-009).
- **Dependências** — o mínimo necessário, conforme `CLAUDE.md`.

---

## 8. Testes

Ferramentas definidas na DT-001; cobertura mínima pendente (**DP-002**).

| Nível | Ferramenta | Alvo | Exemplos |
|---|---|---|---|
| **Unitário** | Vitest | Lógica isolada | Filtragem e busca (RF-005), favoritos (RF-006), formatação de odds (RF-003), esquemas de `packages/contracts/` |
| **Integração** | Vitest | Serviço com a sua origem de dados; rotas da api | Adaptador a converter uma resposta **documentada** do provedor; rota a devolver o envelope do contrato; tolerância a falha do armazenamento local (CA-006.5) |
| **Interface** | Vitest | Comportamento de componentes | Estados de RF-008, favorito refletido na tela, navegação por teclado (RNF-002) |
| **End-to-end** | Playwright | Percursos completos | Quando a estrutura estiver pronta; local e dono pendentes (PA-008) |

Princípios:

- Os testes do adaptador usam exemplos de resposta **retirados da documentação oficial** do provedor, nunca respostas inventadas.
- Os dados de teste são independentes dos dados demonstrativos da interface.
- Verificação automatizada de acessibilidade no nível de interface (CA-RNF-002).
- Verificação de tipos e lint como porta de qualidade, junto com os testes.
- `CLAUDE.md` exige reportar **resultados reais**, incluindo falhas.

---

## 9. Ambientes

| Ambiente | Finalidade | Situação |
|---|---|---|
| **Desenvolvimento local** | Dois processos (`apps/web` e `apps/api`); credenciais do provedor em variáveis de ambiente locais, fora do repositório | A preparar na T-013, **depois** de mudar o repositório para fora do OneDrive (DT-007, T-011) |
| **Testes** | Testes, tipos e lint, local e em integração contínua | CI pendente (**DP-003**) |
| **Publicação futura** | Ambiente hospedado do protótipo demonstrativo | **Não definido** (DP-008) |

Regras:

- Nenhum segredo no repositório em nenhum ambiente.
- Cada agente trabalha na sua worktree (DT-003); as variáveis de ambiente locais não são versionadas em nenhuma delas.
- Publicar com provedores reais exige, antes, o parecer jurídico e regulatório previsto na visão — não é uma decisão técnica.

---

## 10. Decisões pendentes

| # | Decisão | Situação | Bloqueia |
|---|---|---|---|
| **DP-001** | Stack do projeto | **Resolvida** — [DT-001](decisoes-tecnicas.md#dt-001--stack-do-projeto) | — |
| ~~**DP-002**~~ | ~~Ferramentas e cobertura mínima de teste~~ | **Resolvida** — ferramentas na DT-001; cobertura mínima de 80% na DT-015 | Seção 8; RNF-007; PD-010 |
| ~~**DP-003**~~ | ~~Integração contínua~~ | **Resolvida** — DT-015: GitHub Actions em cada push e PR | Seção 9 |
| ~~**DP-004**~~ | ~~Como marcar dados demonstrativos~~ | **Resolvida** — DT-014: marca-se só o dado fictício (opção A); o dado real de terceiros não leva selo | RNF-008; RN-002; PC-010 |
| **DP-005** | Estratégia de estado da interface | Aberta — área do `frontend` | Seção 3; RNF-005 |
| **DP-006** | Biblioteca de estilos e componentes | Aberta — área do `frontend`; depende de `docs/design-system.md` | Fase 2 |
| **DP-007** | Formato dos dados demonstrativos locais | Aberta — módulos TypeScript validados pelos esquemas de `packages/contracts/` ou ficheiros JSON validados em tempo de execução | Seção 5.2 |
| **DP-008** | Plataforma de publicação | Aberta | Seção 9 |
| **DP-009** | Cache, armazenamento e forma de atualização dos dados do provedor | Aberta — depende dos limites e do modelo de atualização documentados pelo provedor (BLQ-001) | Seções 2.2 e 5.1 |

> Nenhum item desta tabela pode ser resolvido por omissão durante a implementação. Uma decisão tomada vira registo em `docs/decisoes-tecnicas.md` e atualização deste documento.
