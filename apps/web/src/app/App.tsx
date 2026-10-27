import { useCallback, useState } from 'react';

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
import { NavegacaoPrincipal, type IdDestino } from '../shared/componentes/NavegacaoPrincipal';
import { FavoritosProvider } from '../shared/favoritos/contexto';
import { CatalogoJogos } from '../modules/cassino/CatalogoJogos';
import { JOGOS_DEMONSTRATIVOS } from '../modules/cassino/dadosDemonstrativos';
import { ListaEventos } from '../modules/esportes/ListaEventos';
import { ListaFavoritos } from '../modules/favoritos/ListaFavoritos';
import { Perfil } from '../modules/perfil/Perfil';
import estilos from './App.module.css';

export function App() {
  return (
    <FavoritosProvider>
      <Aplicacao />
    </FavoritosProvider>
  );
}

/**
 * Casca da aplicacao: faixa permanente, cabecalho, conteudo do destino ativo e
 * navegacao principal.
 *
 * O destino ativo e estado local porque nao ha roteamento decidido. Quando houver,
 * passa a vir da rota e o resto fica.
 */
function Aplicacao() {
  const [destino, setDestino] = useState<IdDestino>('esportes');
  const [termo, setTermo] = useState('');

  return (
    <div className={estilos.aplicacao}>
      <FaixaDemonstrativa />
      <header className={estilos.cabecalho}>
        <span className={estilos.marca}>blbet</span>
        <span className={estilos.subtitulo}>protótipo demonstrativo</span>
      </header>
      <NavegacaoPrincipal destinoAtivo={destino} onNavegar={setDestino} />
      <main className={estilos.conteudo}>
        {destino === 'esportes' ? <Esportes /> : null}
        {destino === 'busca' ? <Busca termo={termo} onAlterar={setTermo} /> : null}

        {destino === 'cassino' ? (
          <>
            <h1 className={estilos.titulo}>Cassino</h1>
            <CatalogoJogos jogos={JOGOS_DEMONSTRATIVOS} />
          </>
        ) : null}

        {destino === 'favoritos' ? (
          <>
            <h1 className={estilos.titulo}>Favoritos</h1>
            <ListaFavoritos jogos={JOGOS_DEMONSTRATIVOS} />
          </>
        ) : null}

        {destino === 'perfil' ? (
          <>
            <h1 className={estilos.titulo}>Perfil</h1>
            <Perfil />
          </>
        ) : null}
      </main>
    </div>
  );
}

/** Quantos eventos pedir de uma vez. Abaixo do maximo de 100 do contrato (PC-008). */
const EVENTOS_POR_PAGINA = 30;

function Esportes() {
  const carregar = useCallback(
    (cursor: string | undefined, opcoes: { signal: AbortSignal }) =>
      obterEventos({ limit: EVENTOS_POR_PAGINA, ...(cursor === undefined ? {} : { cursor }) }, opcoes),
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
          // Sem busca aplicada: o conjunto esta mesmo vazio (CA-008.3). Acontece
          // quando a fonte nao tem jogos futuros nas competicoes disponiveis.
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

interface BuscaProps {
  termo: string;
  onAlterar: (termo: string) => void;
}

function Busca({ termo, onAlterar }: BuscaProps) {
  // O termo que chega a api e o adiado; o campo responde a cada tecla.
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
      <CampoBusca termo={termo} onAlterar={onAlterar} contagem={lista.itens.length} />

      {lista.carregando ? <EsqueletoLista descricao="os resultados" linhas={3} /> : null}

      {!lista.carregando && lista.falha !== null ? (
        <EstadoErro
          mensagem={lista.falha.mensagem}
          {...(lista.repetir === null ? {} : { onTentarNovamente: lista.repetir })}
        />
      ) : null}

      {!lista.carregando && lista.falha === null ? (
        lista.itens.length === 0 && procurado !== '' ? (
          // Termo bem formado sem correspondencia: `200` com lista vazia (regra A7),
          // e nao erro.
          <NadaEncontrado
            criterio={`“${procurado}”`}
            rotuloLimpar="Ver todos os jogos"
            onLimpar={() => onAlterar('')}
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
