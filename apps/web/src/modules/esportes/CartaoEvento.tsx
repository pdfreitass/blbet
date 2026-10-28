import type { SportEvent } from '@blbet/contracts';
import { Link } from 'wouter';

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
 * **A area que navega e o CABECALHO, nao o cartao inteiro.** A seccao 9.2 do
 * design-system previa "toda a superficie" como area de navegacao, mas isso entra em
 * conflito com CA-003.3: cobrir as odds com uma ligacao fa-las responder ao clique, e
 * quem clica numa odd e nao percebe para onde foi pode ler aquilo como selecao. A odd
 * e texto marcado como dado, e continua a nao reagir a nada. O cabecalho -- equipas,
 * competicao, hora -- e area generosa e inequivoca.
 *
 * O indicador de favorito fica ACIMA da area da ligacao, para continuar a ser um
 * controle proprio (e por isso nao esta dentro do `<a>`, que seria marcacao invalida).
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
            <span>{evento.competition.sport === 'soccer' ? 'Futebol' : evento.competition.sport}</span>
            <Etiqueta variante="informacao">{situacao}</Etiqueta>
          </p>
          <p className={estilos.participantes}>
            <Link href={`/eventos/${encodeURIComponent(evento.id)}`} className={estilos.ligacao}>
              <span>{evento.homeTeam.name}</span>
              <span>{evento.awayTeam.name}</span>
            </Link>
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
