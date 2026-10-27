import type { Competition, SportEvent } from '@blbet/contracts';
import { toCompetition, toSportEvent } from './sportsbook/adapter.js';
import type { SportsProvider } from './sportsbook/client.js';

// Cache em memória sobre o provedor (DT-012): cada competição é atualizada no máximo uma vez por
// `refreshMs`, e só quando há um pedido; a lista de competições, uma vez por dia. Com o plano
// gratuito (150 pedidos/dia) não há margem para chamar o provedor a cada pedido do cliente.

const DAY_MS = 24 * 60 * 60 * 1000;
const EVENTS_WINDOW_MS = 14 * DAY_MS;

export interface SportsCatalogDeps {
  readonly provider: SportsProvider;
  /** Nomes curtos do provedor (`EPL`), pela ordem em que aparecem na lista. */
  readonly competitions: readonly string[];
  /** DT-010 — a única fonte de odds usada. */
  readonly source: string;
  readonly refreshMs: number;
  readonly now: () => Date;
  readonly log: { warn(context: object, message: string): void };
}

export interface SportsCatalog {
  competitions(): Promise<readonly Competition[]>;
  /** Todos os eventos em cache, incluindo os que já começaram: o filtro é do serviço. */
  events(): Promise<readonly SportEvent[]>;
}

interface Entry<T> {
  readonly value: T;
  readonly fetchedAt: number;
}

/** Valor em cache que se renova sozinho quando expira, partilhando a chamada em curso. */
function cached<T>(maxAgeMs: number, deps: SportsCatalogDeps, label: string, load: () => Promise<T>): () => Promise<T> {
  let entry: Entry<T> | undefined;
  let inFlight: Promise<T> | undefined;

  const refresh = async (): Promise<T> => {
    try {
      const value = await load();
      entry = { value, fetchedAt: deps.now().getTime() };
      return value;
    } catch (error: unknown) {
      if (!entry) throw error;
      deps.log.warn({ err: error, cache: label }, 'provedor falhou; a servir dados em cache');
      // Recomeça a contagem: tentar a cada pedido gastaria a quota durante uma falha (ex.: 429).
      entry = { value: entry.value, fetchedAt: deps.now().getTime() };
      return entry.value;
    } finally {
      inFlight = undefined;
    }
  };

  return () => {
    if (entry && deps.now().getTime() - entry.fetchedAt < maxAgeMs) return Promise.resolve(entry.value);
    inFlight ??= refresh();
    return inFlight;
  };
}

export function createSportsCatalog(deps: SportsCatalogDeps): SportsCatalog {
  const competitions = cached(DAY_MS, deps, 'competitions', async () => {
    const all = await deps.provider.listCompetitions();
    return deps.competitions.flatMap((shortName) => {
      const raw = all.find((competition) => competition.shortName === shortName);
      const competition = raw ? toCompetition(raw) : null;
      if (!competition) deps.log.warn({ competition: shortName }, 'competição configurada indisponível no provedor');
      return competition ? [{ shortName, competition }] : [];
    });
  });

  const eventsByCompetition = new Map<string, () => Promise<readonly SportEvent[]>>();
  const eventsOf = (shortName: string, competition: Competition) => {
    let load = eventsByCompetition.get(shortName);
    if (!load) {
      load = cached(deps.refreshMs, deps, `events:${shortName}`, async () => {
        const from = deps.now();
        const raw = await deps.provider.listEvents(shortName, { from, to: new Date(from.getTime() + EVENTS_WINDOW_MS) });
        return raw.flatMap((event) => toSportEvent(event, competition, deps.source) ?? []);
      });
      eventsByCompetition.set(shortName, load);
    }
    return load();
  };

  return {
    async competitions() {
      return (await competitions()).map((item) => item.competition);
    },
    async events() {
      const configured = await competitions();
      const lists = await Promise.all(configured.map((item) => eventsOf(item.shortName, item.competition)));
      return lists.flat();
    },
  };
}
