import { Etiqueta } from '../../shared/componentes/Etiqueta';
import { ValorDemonstrativo } from '../../shared/componentes/ValorDemonstrativo';
import { descreverInstante, formatarDiaMes, formatarHora } from '../../shared/formato/dataHora';
import estilos from './CartaoEvento.module.css';
import { LinhaMercado } from './LinhaMercado';
import type { EventoDemonstrativo } from './tipos';

interface CartaoEventoProps {
  evento: EventoDemonstrativo;
}

/**
 * Cartao de evento com os seus mercados.
 *
 * A superficie NAO e operavel nesta etapa: o design-system (9.2) preve que ela leve
 * ao detalhe do evento, mas essa tela nao existe e nao ha roteamento decidido. Um
 * cartao clicavel que nao navega para lugar nenhum e pior do que um cartao de
 * leitura, por isso fica de leitura ate haver a rota de detalho.
 */
export function CartaoEvento({ evento }: CartaoEventoProps) {
  const [casa, visitante] = evento.participantes;
  const encerrado = evento.situacao === 'encerrado';

  return (
    <article className={estilos.cartao} aria-label={`${casa} contra ${visitante}`}>
      <div className={estilos.cabecalho}>
        <div>
          <p className={estilos.contexto}>
            {/* A competicao NAO entra aqui: e o titulo do grupo em ListaEventos,
                e repeti-la poria o mesmo texto duas vezes na arvore de acessibilidade. */}
            <span>{evento.esporte}</span>
            {/* Situacao como etiqueta com icone E texto, nunca so cor. */}
            <Etiqueta variante={encerrado ? 'neutra' : 'informacao'}>
              {encerrado ? 'Encerrado' : 'Agendado'}
            </Etiqueta>
          </p>
          <p className={estilos.participantes}>
            <span>{casa}</span>
            <span>{visitante}</span>
          </p>
        </div>
        <p className={estilos.instante}>
          <ValorDemonstrativo numerico descricao={`início em ${descreverInstante(evento.inicio)}`}>
            {`${formatarDiaMes(evento.inicio)} ${formatarHora(evento.inicio)}`}
          </ValorDemonstrativo>
        </p>
      </div>
      {evento.mercados.map((mercado) => (
        <LinhaMercado mercado={mercado} key={mercado.id} />
      ))}
    </article>
  );
}
