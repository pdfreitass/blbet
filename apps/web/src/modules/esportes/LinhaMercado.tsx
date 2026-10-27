import type { EventMarkets, Origin } from '@blbet/contracts';

import { ValorDeDado } from '../../shared/componentes/ValorDeDado';
import { formatarOdd } from '../../shared/formato/odd';
import estilos from './LinhaMercado.module.css';
import {
  ROTULO_ABAIXO,
  ROTULO_ACIMA,
  ROTULO_CASA,
  ROTULO_EMPATE,
  ROTULO_FORA,
  ROTULO_RESULTADO_FINAL,
  rotularTotalGolos,
} from './mercados';

interface MercadosDoEventoProps {
  markets: EventMarkets;
  origin: Origin;
  /** Para o nome acessivel dizer de que jogo e a cotacao. */
  descricaoEvento: string;
}

/**
 * Os mercados de um evento, em lista de descricao.
 *
 * Somente leitura, sem excecao: nenhum elemento e botao, ligacao ou controle, nenhum
 * tem estado de hover ou selecionado, e nao existe elemento desativado que sugira que
 * a selecao seria possivel (RF-003, RN-003, CA-003.3).
 *
 * Um evento sem mercado nenhum NAO mostra seccao vazia: acontece com frequencia nos
 * jogos mais distantes, onde a fonte ainda nao tem cotacoes, e uma seccao vazia
 * pareceria defeito.
 */
export function MercadosDoEvento({ markets, origin, descricaoEvento }: MercadosDoEventoProps) {
  const temResultadoFinal = markets.matchResult !== null;
  const totais = markets.totalGoals;

  if (!temResultadoFinal && totais.length === 0) {
    return (
      <p className={estilos.semMercados}>Ainda não há cotações publicadas para este jogo.</p>
    );
  }

  return (
    <>
      {markets.matchResult !== null ? (
        <section className={estilos.mercado} aria-label={ROTULO_RESULTADO_FINAL}>
          <h4 className={estilos.nome}>{ROTULO_RESULTADO_FINAL}</h4>
          <dl className={estilos.opcoes}>
            <Opcao
              rotulo={ROTULO_CASA}
              odd={markets.matchResult.home}
              origin={origin}
              descricaoEvento={descricaoEvento}
            />
            <Opcao
              rotulo={ROTULO_EMPATE}
              odd={markets.matchResult.draw}
              origin={origin}
              descricaoEvento={descricaoEvento}
            />
            <Opcao
              rotulo={ROTULO_FORA}
              odd={markets.matchResult.away}
              origin={origin}
              descricaoEvento={descricaoEvento}
            />
          </dl>
        </section>
      ) : null}

      {/* Ordenado por linha: o contrato nao garante ordem, e uma lista que muda de
          ordem entre pedidos e mais dificil de ler. */}
      {[...totais]
        .sort((um, outro) => Number(um.line) - Number(outro.line))
        .map((total) => (
          <section
            className={estilos.mercado}
            key={total.line}
            aria-label={rotularTotalGolos(total.line)}
          >
            <h4 className={estilos.nome}>{rotularTotalGolos(total.line)}</h4>
            <dl className={estilos.opcoes}>
              <Opcao
                rotulo={ROTULO_ACIMA}
                odd={total.over}
                origin={origin}
                descricaoEvento={descricaoEvento}
              />
              <Opcao
                rotulo={ROTULO_ABAIXO}
                odd={total.under}
                origin={origin}
                descricaoEvento={descricaoEvento}
              />
            </dl>
          </section>
        ))}
    </>
  );
}

interface OpcaoProps {
  rotulo: string;
  /** `null` quando a fonte nao tem a cotacao (A5): e um valor legitimo, nao um erro. */
  odd: string | null;
  origin: Origin;
  descricaoEvento: string;
}

function Opcao({ rotulo, odd, origin, descricaoEvento }: OpcaoProps) {
  return (
    <div className={estilos.opcao}>
      <dt className={estilos.rotulo}>{rotulo}</dt>
      <dd className={estilos.cotacao}>
        <ValorDeDado
          numerico
          origin={origin}
          descricao={`${rotulo} em ${descricaoEvento}`}
        >
          {formatarOdd(odd)}
        </ValorDeDado>
      </dd>
    </div>
  );
}
