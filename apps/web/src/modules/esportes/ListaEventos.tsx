import type { SportEvent } from '@blbet/contracts';

import { CartaoEvento } from './CartaoEvento';
import estilos from './ListaEventos.module.css';

interface ListaEventosProps {
  eventos: readonly SportEvent[];
}

/**
 * Lista de eventos agrupada por competicao (CA-002.1).
 *
 * O agrupamento e so sobre o que esta nesta pagina: com paginacao por cursor, um grupo
 * pode ficar cortado entre paginas (DIV-F02), e por isso nao se mostra contagem por
 * grupo, que seria enganadora.
 *
 * Esta lista nao trata o caso vazio: quem chama sabe se foi uma busca sem resultados
 * ou um conjunto vazio, e CA-008.3 exige que os dois sejam textualmente distintos.
 */
export function ListaEventos({ eventos }: ListaEventosProps) {
  return (
    <>
      {agruparPorCompeticao(eventos).map(([competicao, daCompeticao]) => (
        <section key={competicao} aria-labelledby={idDoGrupo(competicao)}>
          <h3 className={estilos.competicao} id={idDoGrupo(competicao)}>
            {competicao}
          </h3>
          {daCompeticao.map((evento) => (
            <CartaoEvento evento={evento} key={evento.id} />
          ))}
        </section>
      ))}
    </>
  );
}

/** Identificador estavel do titulo do grupo, para o `aria-labelledby` da seccao. */
function idDoGrupo(competicao: string): string {
  return `competicao-${competicao.replace(/\s+/g, '-').toLocaleLowerCase('pt-BR')}`;
}

/**
 * Agrupa preservando a ordem de primeira aparicao da competicao -- a ordem da api, que
 * e por `startsAt` ascendente, sem reordenar por nome.
 */
function agruparPorCompeticao(eventos: readonly SportEvent[]): [string, SportEvent[]][] {
  const grupos = new Map<string, SportEvent[]>();

  for (const evento of eventos) {
    const existente = grupos.get(evento.competition.name);

    if (existente === undefined) {
      grupos.set(evento.competition.name, [evento]);
    } else {
      existente.push(evento);
    }
  }

  return [...grupos.entries()];
}
