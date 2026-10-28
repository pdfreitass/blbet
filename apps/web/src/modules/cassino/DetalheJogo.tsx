import { Link, useParams } from 'wouter';

import { Etiqueta } from '../../shared/componentes/Etiqueta';
import { IndicadorFavorito } from '../../shared/componentes/IndicadorFavorito';
import { NaoEncontrado } from '../../app/NaoEncontrado';
import { rotularCategoria } from './categorias';
import { JOGOS_DEMONSTRATIVOS } from './dadosDemonstrativos';
import estilos from './DetalheJogo.module.css';

/**
 * Detalhe de um jogo do catalogo (RF-004).
 *
 * O catalogo e demonstrativo (ver `docs/integracoes.md`), por isso o jogo vem do
 * conjunto local e nao da api. Um id que nao existe cai na tela de endereco
 * desconhecido, em vez de um ecra vazio.
 *
 * NAO ha afordancia de jogar, aqui como na listagem (RN-004, CA-004.4): o unico
 * controle e o indicador de favorito.
 */
export function DetalheJogo() {
  const { id = '' } = useParams<{ id: string }>();
  const jogo = JOGOS_DEMONSTRATIVOS.find((candidato) => candidato.id === id);

  if (jogo === undefined) {
    return <NaoEncontrado />;
  }

  return (
    <article aria-label={jogo.nome}>
      <nav className={estilos.trilho} aria-label="Onde está">
        <Link href="/cassino" className={estilos.ligacaoTrilho}>
          Cassino
        </Link>
        <span aria-hidden="true">›</span>
        <span>{rotularCategoria(jogo.categoria)}</span>
      </nav>

      <header className={estilos.cabecalho}>
        <h1 className={estilos.nome}>{jogo.nome}</h1>
        <div className={estilos.linha}>
          <Etiqueta variante="demonstrativo">Jogo demonstrativo</Etiqueta>
          <IndicadorFavorito tipo="jogo" id={jogo.id} nome={jogo.nome} />
        </div>
      </header>

      <p className={estilos.nota}>
        Este jogo é fictício e não pode ser jogado. Não há aposta, saldo, crédito nem
        prémio associado.
      </p>
    </article>
  );
}
