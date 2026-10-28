import { useCallback } from 'react';
import { Route, Switch, useSearchParams } from 'wouter';

import { obterEventos } from '../shared/api/esportes';
import { useListaPaginada } from '../shared/api/useListaPaginada';
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
import { NavegacaoPrincipal } from '../shared/componentes/NavegacaoPrincipal';
import { FavoritosProvider } from '../shared/favoritos/contexto';
import { CatalogoJogos } from '../modules/cassino/CatalogoJogos';
import { JOGOS_DEMONSTRATIVOS } from '../modules/cassino/dadosDemonstrativos';
import { DetalheJogo } from '../modules/cassino/DetalheJogo';
import { DetalheEvento } from '../modules/esportes/DetalheEvento';
import { ListaEventos } from '../modules/esportes/ListaEventos';
import { ListaFavoritos } from '../modules/favoritos/ListaFavoritos';
import { Perfil } from '../modules/perfil/Perfil';
import estilos from './App.module.css';
import { NaoEncontrado } from './NaoEncontrado';

export function App() {
  return (
    <FavoritosProvider>
      <Aplicacao />
    </FavoritosProvider>
  );
}

/**
 * Casca da aplicacao: faixa permanente, cabecalho, conteudo da rota e navegacao.
 *
 * O destino deixou de ser estado local e passou a vir do endereco (DT-015): o botao
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
  const carregar = useCallback(
    (cursor: string | undefined, opcoes: { signal: AbortSignal }) =>
      obterEventos(
        { limit: EVENTOS_POR_PAGINA, ...(cursor === undefined ? {} : { cursor }) },
        opcoes,
      ),
    [],
  );
  const lista = useListaPaginada(carregar, []);

  return (
    <>
      <h1 className={estilos.titulo}>Esportes</h1>
      {lista.carregando ? <EsqueletoLista descricao="os jogos" linhas={4} /> : null}

      {!lista.carregando && lista.falha !== null ? (
        <EstadoErro
          mensagem={lista.falha.mensagem}
          {...(lista.repetir === null ? {} : { onTentarNovamente: lista.repetir })}
        />
      ) : null}

      {!lista.carregando && lista.falha === null ? (
        lista.itens.length === 0 ? (
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
