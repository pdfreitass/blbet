import type { SportEvent } from '@blbet/contracts';

import { Etiqueta } from '../../shared/componentes/Etiqueta';
import { IndicadorFavorito } from '../../shared/componentes/IndicadorFavorito';
import { ValorDeDado } from '../../shared/componentes/ValorDeDado';
import { descreverInstante, formatarDiaMes, formatarHora } from '../../shared/formato/dataHora';
import estilos from './CartaoEvento.module.css';
import { MercadosDoEvento } from './LinhaMercado';

interface CartaoEventoProps {
  evento: SportEvent;
}

/** Situacao do evento. Hoje so existe `scheduled` (DT-010); PC-014 preve mais valores. */
const ROTULO_SITUACAO: Record<string, string> = {
  scheduled: 'Agendado',
};

/**
 * Cartao de evento com os seus mercados.
 *
 * A superficie NAO e operavel: o design-system preve que leve ao detalhe, mas essa
 * tela nao existe e nao ha roteamento decidido. O unico controle e o indicador de
 * favorito, como a seccao 9.2 autoriza.
 */
export function CartaoEvento({ evento }: CartaoEventoProps) {
  const descricao = `${evento.homeTeam.name} contra ${evento.awayTeam.name}`;
  // Valor desconhecido NAO quebra a interface e NAO e escondido: mostra-se como veio,
  // que e o compromisso da PC-014.
  const situacao = ROTULO_SITUACAO[evento.status] ?? evento.status;

  return (
    <article className={estilos.cartao} aria-label={descricao}>
      <div className={estilos.cabecalho}>
        <div>
          <p className={estilos.contexto}>
            {/* A competicao e o titulo do grupo em ListaEventos; aqui fica o esporte. */}
            <span>{evento.competition.sport === 'soccer' ? 'Futebol' : evento.competition.sport}</span>
            <Etiqueta variante="informacao">{situacao}</Etiqueta>
          </p>
          <p className={estilos.participantes}>
            <span>{evento.homeTeam.name}</span>
            <span>{evento.awayTeam.name}</span>
          </p>
        </div>
        <p className={estilos.instante}>
          <ValorDeDado
            numerico
            origin={evento.origin}
            descricao={`início em ${descreverInstante(evento.startsAt)}`}
          >
            {`${formatarDiaMes(evento.startsAt)} ${formatarHora(evento.startsAt)}`}
          </ValorDeDado>
          <IndicadorFavorito tipo="evento" id={evento.id} nome={descricao} />
        </p>
      </div>
      <MercadosDoEvento
        markets={evento.markets}
        origin={evento.origin}
        descricaoEvento={descricao}
      />
    </article>
  );
}
