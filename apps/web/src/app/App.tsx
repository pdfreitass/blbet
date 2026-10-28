import { useCallback } from 'react';
import { Route, Switch, useSearchParams } from 'wouter';

import { obterCompeticoes, obterEventos } from '../shared/api/esportes';
import { useListaPaginada } from '../shared/api/useListaPaginada';
import { useRecurso } from '../shared/api/useRecurso';
import { useTermoAdiado } from '../shared/api/useTermoAdiado';
import { CampoBusca } from '../shared/componentes/CampoBusca';
import {
  EsqueletoLista,
  EstadoErro,
  NadaCadastrado,
  NadaEncontrado,
} from '../shared/componentes/Estados';
import { FaixaDemonstrativa } from '../shared/componentes/FaixaDemonstrativa';
import { MaisResultados } from '../shared/componentes/MaisResultados';
import { NaoEncontrado } from '../shared/componentes/NaoEncontrado';
import { NavegacaoPrincipal } from '../shared/componentes/NavegacaoPrincipal';
import { ContaProvider } from '../shared/conta/contexto';
import { FavoritosProvider } from '../shared/favoritos/contexto';
import { CatalogoJogos } from '../modules/cassino/CatalogoJogos';
import { JOGOS_DEMONSTRATIVOS } from '../modules/cassino/dadosDemonstrativos';
import { DetalheJogo } from '../modules/cassino/DetalheJogo';
import { DetalheEvento } from '../modules/esportes/DetalheEvento';
import { FiltroCompeticao } from '../modules/esportes/FiltroCompeticao';
import { ListaEventos } from '../modules/esportes/ListaEventos';
import { AlterarSenha } from '../modules/conta/AlterarSenha';
import { CriarConta } from '../modules/conta/CriarConta';
import { Dispositivos } from '../modules/conta/Dispositivos';
import { Entrar } from '../modules/conta/Entrar';
import { Recuperar } from '../modules/conta/Recuperar';
import { Redefinir } from '../modules/conta/Redefinir';
import { ResumoConta } from '../modules/conta/ResumoConta';
import { VerificarEmail } from '../modules/conta/VerificarEmail';
import { Perfil } from '../modules/perfil/Perfil';
import estilos from './App.module.css';
import { ListaFavoritos } from './ListaFavoritos';


export function App() {
  return (
    <ContaProvider>
      <FavoritosProvider>
        <Aplicacao />
      </FavoritosProvider>
    </ContaProvider>
  );
}

/**
 * Casca da aplicacao: faixa permanente, cabecalho, conteudo da rota e navegacao.
 *
 * O destino deixou de ser estado local e passou a vir do endereco (DT-016): o botao
 * "voltar" do navegador volta a listagem em vez de sair da aplicacao, e recarregar
 * mantem o sitio onde se estava.
 */
function Aplicacao() {
  return (
    <div className={estilos.aplicacao}>
      <FaixaDemonstrativa />
      <header className={estilos.cabecalho}>
        <span className={estilos.marca}>blbet</span>
        <span className={estilos.subtitulo}>protótipo demonstrativo</span>
      </header>
      <NavegacaoPrincipal />
      <main className={estilos.conteudo}>
        <Switch>
          <Route path="/" component={Esportes} />
          <Route path="/eventos/:id" component={DetalheEvento} />
          <Route path="/cassino" component={Cassino} />
          <Route path="/cassino/:id" component={DetalheJogo} />
          <Route path="/busca" component={Busca} />
          <Route path="/favoritos" component={Favoritos} />
          <Route path="/perfil" component={PerfilDaRota} />
          {/*
            Os ecras de conta (DT-020). Nao sao um sexto destino da navegacao: RF-001
            e CA-001.2 fixam cinco, e `ehDestinoAtivo` marca o Perfil tambem em /conta.
            Os caminhos `/conta/verificar` e `/conta/nova-senha` NAO sao escolha minha:
            sao os que a api ja poe nos links dos e-mails
            (`accounts-service.ts`, sobre `PUBLIC_URL`). Mudar um deles parte um e-mail
            ja enviado, por isso ficam onde a api os espera -- e o pedido para os
            escrever no contrato esta no quadro.
          */}
          <Route path="/conta/entrar" component={Entrar} />
          <Route path="/conta/criar" component={CriarConta} />
          <Route path="/conta/verificar" component={VerificarEmail} />
          <Route path="/conta/recuperar" component={Recuperar} />
          <Route path="/conta/nova-senha" component={Redefinir} />
          <Route path="/conta/alterar-senha" component={AlterarSenha} />
          <Route path="/conta/dispositivos" component={Dispositivos} />
          {/* Endereco desconhecido tem saida, como tudo o resto (CA-008.4). */}
          <Route component={NaoEncontrado} />
        </Switch>
      </main>
    </div>
  );
}

/** Quantos eventos pedir de uma vez. Abaixo do maximo de 100 do contrato (PC-008). */
const EVENTOS_POR_PAGINA = 30;

function Esportes() {
  /*
   * A competicao filtrada vive no endereco, com o NOME DO PARAMETRO DO CONTRATO
   * (`competitionId`, regra A7), como o termo de busca. Recarregar mantem o filtro e o
   * endereco pode ser guardado ou partilhado.
   */
  const [parametros, definirParametros] = useSearchParams();
  const competicaoId = parametros.get('competitionId') ?? undefined;

  const carregarCompeticoes = useCallback(
    (opcoes: { signal: AbortSignal }) => obterCompeticoes(opcoes),
    [],
  );
  const competicoes = useRecurso(carregarCompeticoes, []);

  const carregar = useCallback(
    (cursor: string | undefined, opcoes: { signal: AbortSignal }) =>
      obterEventos(
        {
          limit: EVENTOS_POR_PAGINA,
          ...(competicaoId === undefined ? {} : { competitionId: competicaoId }),
          ...(cursor === undefined ? {} : { cursor }),
        },
        opcoes,
      ),
    [competicaoId],
  );
  const lista = useListaPaginada(carregar, [competicaoId]);

  const alterarCompeticao = useCallback(
    (id: string | undefined) => {
      definirParametros(id === undefined ? {} : { competitionId: id });
    },
    [definirParametros],
  );

  const disponiveis = competicoes.dados?.data ?? [];
  /* Filtro desconhecido no endereco: mostra-se o identificador, que e o que se sabe. */
  const nomeFiltrado =
    disponiveis.find((competicao) => competicao.id === competicaoId)?.name ?? competicaoId;

  /*
   * O filtro aparece com DUAS competicoes ou mais. Com uma so, um `select` de uma
   * opcao nao filtra nada e sugere uma escolha que nao existe. A excecao e haver
   * filtro no endereco: ai o controle tem de estar la, ou nao ha como o desfazer.
   *
   * Uma falha a carregar as competicoes NAO estraga a pagina: o filtro desaparece e a
   * listagem continua -- e o que ela mostra sem filtro e a lista completa.
   */
  const mostrarFiltro = disponiveis.length > 1 || competicaoId !== undefined;

  return (
    <>
      <h1 className={estilos.titulo}>Esportes</h1>

      {mostrarFiltro ? (
        <FiltroCompeticao
          competicoes={disponiveis}
          selecionada={competicaoId}
          onAlterar={alterarCompeticao}
        />
      ) : null}

      {lista.carregando ? <EsqueletoLista descricao="os jogos" linhas={4} /> : null}

      {!lista.carregando && lista.falha !== null ? (
        <EstadoErro
          mensagem={lista.falha.mensagem}
          {...(lista.repetir === null ? {} : { onTentarNovamente: lista.repetir })}
        />
      ) : null}

      {!lista.carregando && lista.falha === null ? (
        lista.itens.length === 0 && competicaoId !== undefined ? (
          /* Ha filtro aplicado: CA-008.3 exige texto distinto do conjunto vazio, e
             CA-005.2 e CA-005.4 exigem mostrar o critério e dar saída. */
          <NadaEncontrado
            criterio={nomeFiltrado ?? ''}
            rotuloLimpar="Ver todas as competições"
            onLimpar={() => alterarCompeticao(undefined)}
          />
        ) : lista.itens.length === 0 ? (
          <NadaCadastrado conjunto="jogos" />
        ) : (
          <>
            <ListaEventos eventos={lista.itens} />
            <MaisResultados
              carregarMais={lista.carregarMais}
              carregando={lista.carregandoMais}
              falha={lista.falhaAoCarregarMais}
              conjunto="jogos"
            />
            <p className={estilos.rodapeBloco}>
              Cotações meramente informativas, de uma fonte externa. Não há apostas: nada
              aqui pode ser jogado nem pago.
            </p>
          </>
        )
      ) : null}
    </>
  );
}

function Cassino() {
  return (
    <>
      <h1 className={estilos.titulo}>Cassino</h1>
      <CatalogoJogos jogos={JOGOS_DEMONSTRATIVOS} />
    </>
  );
}

function Favoritos() {
  return (
    <>
      <h1 className={estilos.titulo}>Favoritos</h1>
      <ListaFavoritos jogos={JOGOS_DEMONSTRATIVOS} />
    </>
  );
}

function PerfilDaRota() {
  return (
    <>
      <h1 className={estilos.titulo}>Perfil</h1>
      {/* A conta real primeiro; o perfil demonstrativo de RF-007 a seguir, intacto. */}
      <ResumoConta />
      <Perfil />
    </>
  );
}

function Busca() {
  /*
   * O termo vive no endereco (`?q=`), com o mesmo nome do parametro do contrato
   * (regra A7). Recarregar a pagina mantem a busca, e o endereco pode ser guardado.
   *
   * A escrita usa `replace`: sem isso, cada tecla deixaria uma entrada no historico e
   * o "voltar" teria de ser carregado uma vez por letra para sair da busca.
   */
  const [parametros, definirParametros] = useSearchParams();
  const termo = parametros.get('q') ?? '';

  const alterar = useCallback(
    (novo: string) => {
      definirParametros(novo === '' ? {} : { q: novo }, { replace: true });
    },
    [definirParametros],
  );

  const procurado = useTermoAdiado(termo).trim();

  const carregar = useCallback(
    (cursor: string | undefined, opcoes: { signal: AbortSignal }) =>
      obterEventos(
        { q: procurado, limit: EVENTOS_POR_PAGINA, ...(cursor === undefined ? {} : { cursor }) },
        opcoes,
      ),
    [procurado],
  );
  const lista = useListaPaginada(carregar, [procurado]);

  return (
    <>
      <h1 className={estilos.titulo}>Busca</h1>
      {/*
        A contagem e a dos resultados JA CARREGADOS, nao a do total: `meta.total` e
        opcional (A6) e a interface nao depende dele.
      */}
      <CampoBusca termo={termo} onAlterar={alterar} contagem={lista.itens.length} />

      {lista.carregando ? <EsqueletoLista descricao="os resultados" linhas={3} /> : null}

      {!lista.carregando && lista.falha !== null ? (
        <EstadoErro
          mensagem={lista.falha.mensagem}
          {...(lista.repetir === null ? {} : { onTentarNovamente: lista.repetir })}
        />
      ) : null}

      {!lista.carregando && lista.falha === null ? (
        lista.itens.length === 0 && procurado !== '' ? (
          <NadaEncontrado
            criterio={`“${procurado}”`}
            rotuloLimpar="Ver todos os jogos"
            onLimpar={() => alterar('')}
          />
        ) : lista.itens.length === 0 ? (
          <NadaCadastrado conjunto="jogos" />
        ) : (
          <>
            <ListaEventos eventos={lista.itens} />
            <MaisResultados
              carregarMais={lista.carregarMais}
              carregando={lista.carregandoMais}
              falha={lista.falhaAoCarregarMais}
              conjunto="resultados"
            />
          </>
        )
      ) : null}
    </>
  );
}
