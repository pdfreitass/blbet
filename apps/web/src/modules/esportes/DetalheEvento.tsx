import { useCallback } from 'react';
import { Link, useParams } from 'wouter';

import { obterEvento } from '../../shared/api/esportes';
import { useRecurso } from '../../shared/api/useRecurso';
import { Etiqueta } from '../../shared/componentes/Etiqueta';
import { EsqueletoLista, EstadoErro } from '../../shared/componentes/Estados';
import { IndicadorFavorito } from '../../shared/componentes/IndicadorFavorito';
import { ValorDeDado } from '../../shared/componentes/ValorDeDado';
import { descreverInstante, formatarDiaMes, formatarHora } from '../../shared/formato/dataHora';
import estilos from './DetalheEvento.module.css';
import { MercadosDoEvento } from './LinhaMercado';

/** Situacao do evento. Hoje so existe `scheduled` (DT-010); PC-014 preve mais valores. */
const ROTULO_SITUACAO: Record<string, string> = {
  scheduled: 'Agendado',
};

/**
 * Detalhe de um evento (RF-002, RF-003).
 *
 * O evento e pedido a api pelo id do endereco, e nao passado pela listagem: com
 * enderecos, esta tela pode ser aberta diretamente, sem nunca ter havido listagem.
 * A CA-002.3 exige que o conteudo nao divirja do da listagem; as duas rotas servem da
 * mesma origem no `backend`, e a confirmacao disso esta pedida no quadro.
 */
export function DetalheEvento() {
  const { id = '' } = useParams<{ id: string }>();

  const carregar = useCallback(
    (opcoes: { signal: AbortSignal }) => obterEvento(id, opcoes),
    [id],
  );
  const { carregando, dados, falha, repetir } = useRecurso(carregar, [id]);

  if (carregando) {
    return <EsqueletoLista descricao="o jogo" linhas={3} />;
  }

  if (falha !== null) {
    return (
      <div className={estilos.falha}>
        {/*
          O `issue` `event_started` (T14-A1) tem tela, finalmente. Sem ele, um jogo
          que comecou entre a listagem e o clique daria "nao encontrámos", sobre um
          jogo que existe.
        */}
        <EstadoErro
          mensagem={falha.mensagem}
          {...(repetir === null ? {} : { onTentarNovamente: repetir })}
        />
        <Link href="/" className={estilos.voltar}>
          Ver os jogos disponíveis
        </Link>
      </div>
    );
  }

  if (dados === null) {
    return null;
  }

  const evento = dados.data;
  const descricao = `${evento.homeTeam.name} contra ${evento.awayTeam.name}`;
  const situacao = ROTULO_SITUACAO[evento.status] ?? evento.status;

  return (
    <article aria-label={descricao}>
      <nav className={estilos.trilho} aria-label="Onde está">
        <Link href="/" className={estilos.ligacaoTrilho}>
          Esportes
        </Link>
        <span aria-hidden="true">›</span>
        <span>{evento.competition.name}</span>
      </nav>

      <header className={estilos.cabecalho}>
        {/* Contexto e participantes andam juntos: em desktop o cabecalho vira linha,
            e sem este agrupamento os tres blocos espalhavam-se pela largura. */}
        <div className={estilos.identificacao}>
          <p className={estilos.contexto}>
            <span>
              {evento.competition.sport === 'soccer' ? 'Futebol' : evento.competition.sport}
            </span>
            <Etiqueta variante="informacao">{situacao}</Etiqueta>
          </p>
          <h1 className={estilos.participantes}>
            <span>{evento.homeTeam.name}</span>
            <span className={estilos.contra}>contra</span>
            <span>{evento.awayTeam.name}</span>
          </h1>
        </div>
        <p className={estilos.instante}>
          <ValorDeDado
            numerico
            origin={evento.origin}
            descricao={`início em ${descreverInstante(evento.startsAt)}`}
          >
            {`${formatarDiaMes(evento.startsAt)} ${formatarHora(evento.startsAt)}`}
          </ValorDeDado>
          {/* O estado de favorito e visivel na listagem E no detalhe (RF-006). */}
          <IndicadorFavorito tipo="evento" id={evento.id} nome={descricao} />
        </p>
      </header>

      <MercadosDoEvento
        markets={evento.markets}
        origin={evento.origin}
        descricaoEvento={descricao}
      />

      <p className={estilos.rodape}>
        Cotações meramente informativas, de uma fonte externa. Não há apostas: nada aqui
        pode ser jogado nem pago.
      </p>
    </article>
  );
}
