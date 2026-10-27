import { fetchJson } from '../../../shared/http/fetch-json.js';
import {
  competitionsResponseSchema,
  eventsResponseSchema,
  type SportsbookCompetition,
  type SportsbookEvent,
} from './schema.js';

// Chamadas à Sportsbook API via RapidAPI. A chave vai só em cabeçalho (C9) e nunca é registada:
// o fetchJson só descreve origem e caminho nos erros.

export interface TimeWindow {
  readonly from: Date;
  readonly to: Date;
}

/** O que o catálogo precisa de um provedor. Nos testes é substituído por uma versão em memória. */
export interface SportsProvider {
  listCompetitions(): Promise<readonly SportsbookCompetition[]>;
  /** `competition` é o nome curto (`EPL`), não a chave: é o que a rota v1 aceita. */
  listEvents(competition: string, window: TimeWindow): Promise<readonly SportsbookEvent[]>;
}

export interface SportsbookClientConfig {
  readonly apiKey: string;
  readonly host: string;
  readonly timeoutMs: number;
}

// A API aceita YYYY-MM-DDTHH:mm:ssZ, sem milissegundos.
function toProviderDate(date: Date): string {
  return `${date.toISOString().slice(0, 19)}Z`;
}

export function createSportsbookClient(config: SportsbookClientConfig): SportsProvider {
  const headers = { 'x-rapidapi-key': config.apiKey, 'x-rapidapi-host': config.host };
  const options = { headers, timeoutMs: config.timeoutMs };
  const urlOf = (path: string) => new URL(path, `https://${config.host}`);

  return {
    async listCompetitions() {
      const body = await fetchJson(urlOf('/v0/competitions/'), competitionsResponseSchema, options);
      return body.competitions;
    },

    async listEvents(competition, window) {
      const url = urlOf(`/v1/competitions/${encodeURIComponent(competition)}/events`);
      // As duas datas são obrigatórias na prática: sem elas a API responde 400.
      url.searchParams.set('startTimeFrom', toProviderDate(window.from));
      url.searchParams.set('startTimeTo', toProviderDate(window.to));
      const body = await fetchJson(url, eventsResponseSchema, options);
      return body.events;
    },
  };
}
