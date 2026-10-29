import type { Competition } from '@blbet/contracts';

import estilos from './FiltroCompeticao.module.css';

interface FiltroCompeticaoProps {
  competicoes: readonly Competition[];
  /** `undefined` = todas. É o estado por omissão, e não uma opção a mais. */
  selecionada: string | undefined;
  onAlterar: (competitionId: string | undefined) => void;
}

/**
 * Filtro por competicao, sobre o `competitionId` da rota de eventos (seccao 7.1).
 *
 * Um `select` nativo, e nao uma lista de botoes: o numero de competicoes vem da api e
 * nao e conhecido aqui -- com tres cabem em botoes, com trinta nao --, e o controle
 * nativo ja traz navegacao por teclado, busca por letra e o arranjo proprio de cada
 * plataforma em ecra pequeno.
 *
 * A lista de esportes da coluna lateral de `design-system` 9.7 **nao** e isto, e fica
 * para quando houver mais de um esporte: hoje `SPORTS` so tem `soccer`.
 */
export function FiltroCompeticao({ competicoes, selecionada, onAlterar }: FiltroCompeticaoProps) {
  return (
    <div className={estilos.filtro}>
      <label className={estilos.rotulo} htmlFor="filtro-competicao">
        Competição
      </label>
      <select
        id="filtro-competicao"
        className={estilos.selecao}
        value={selecionada ?? ''}
        onChange={(evento) => onAlterar(evento.target.value === '' ? undefined : evento.target.value)}
      >
        <option value="">Todas as competições</option>
        {competicoes.map((competicao) => (
          <option key={competicao.id} value={competicao.id}>
            {competicao.name}
          </option>
        ))}
      </select>
    </div>
  );
}
