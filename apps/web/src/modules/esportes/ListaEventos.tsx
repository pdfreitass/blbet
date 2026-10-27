import { NadaCadastrado } from '../../shared/componentes/Estados';
import { CartaoEvento } from './CartaoEvento';
import estilos from './ListaEventos.module.css';
import type { EventoDemonstrativo } from './tipos';

interface ListaEventosProps {
  eventos: readonly EventoDemonstrativo[];
}

/**
 * Lista de eventos agrupada por competicao (CA-002.1). O rodape identifica a origem
 * demonstrativa do conjunto, para que a marcacao nao se repita em cada celula
 * (design-system 6.2).
 */
export function ListaEventos({ eventos }: ListaEventosProps) {
  if (eventos.length === 0) {
    return <NadaCadastrado conjunto="eventos" />;
  }

  const porCompeticao = agruparPorCompeticao(eventos);

  return (
    <>
      {porCompeticao.map(([competicao, daCompeticao]) => (
        <section key={competicao} aria-labelledby={idDoGrupo(competicao)}>
          {/* O titulo do grupo e VISIVEL: com ele oculto, a competicao tinha de se
              repetir em cada cartao para o utilizador vidente a ver, e passava a
              aparecer duas vezes na arvore de acessibilidade. */}
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

/** Identificador estavel do titulo do grupo, para o `aria-labelledby` da secao. */
function idDoGrupo(competicao: string): string {
  return `competicao-${competicao.replace(/\s+/g, '-').toLocaleLowerCase('pt-BR')}`;
}

/**
 * Agrupa preservando a ordem de primeira aparicao da competicao -- a ordem da origem,
 * sem reordenar por nome, que mudaria o significado da lista.
 */
function agruparPorCompeticao(
  eventos: readonly EventoDemonstrativo[],
): [string, EventoDemonstrativo[]][] {
  const grupos = new Map<string, EventoDemonstrativo[]>();

  for (const evento of eventos) {
    const existente = grupos.get(evento.competicao);

    if (existente === undefined) {
      grupos.set(evento.competicao, [evento]);
    } else {
      existente.push(evento);
    }
  }

  return [...grupos.entries()];
}
