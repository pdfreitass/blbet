import type { Competition, EventsQuery, PaginationMeta, SportEvent } from '@blbet/contracts';
import { AppError } from '../../shared/errors.js';
import type { SportsCatalog } from './sports-catalog.js';

// Regras das rotas de esportes (api-contract.md, secção 7.1) sobre o catálogo em cache.

export interface Page<T> {
  readonly data: readonly T[];
  readonly meta: PaginationMeta;
}

interface CursorState {
  readonly offset: number;
  readonly filter: string;
}

/** A6 — o cursor fica preso aos filtros com que foi emitido. */
function filterKey(query: EventsQuery): string {
  return JSON.stringify([query.competitionId ?? null, query.q ?? null]);
}

function encodeCursor(state: CursorState): string {
  return Buffer.from(JSON.stringify(state)).toString('base64url');
}

function invalidCursor(): AppError {
  return new AppError('VALIDATION_FAILED', 'invalid cursor', [{ field: 'query.cursor', issue: 'invalid_cursor' }]);
}

function decodeOffset(cursor: string | undefined, filter: string): number {
  if (cursor === undefined) return 0;
  try {
    const state = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as Partial<CursorState>;
    if (state.filter === filter && Number.isInteger(state.offset) && (state.offset ?? -1) >= 0) return state.offset!;
  } catch {
    // Cai no erro abaixo: um cursor ilegível é tão inválido como um adulterado.
  }
  throw invalidCursor();
}

function paginate<T>(items: readonly T[], limit: number, offset: number, filter: string): Page<T> {
  const end = offset + limit;
  return {
    data: items.slice(offset, end),
    meta: { nextCursor: end < items.length ? encodeCursor({ offset: end, filter }) : null },
  };
}

// Busca sem distinguir maiúsculas nem acentos.
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function matches(event: SportEvent, q: string): boolean {
  const needle = normalize(q);
  return [event.homeTeam.name, event.awayTeam.name, event.competition.name].some((name) => normalize(name).includes(needle));
}

function hasStarted(event: SportEvent, now: Date): boolean {
  return Date.parse(event.startsAt) <= now.getTime();
}

export async function listCompetitions(catalog: SportsCatalog): Promise<Page<Competition>> {
  return { data: await catalog.competitions(), meta: { nextCursor: null } };
}

export async function listEvents(catalog: SportsCatalog, query: EventsQuery, now: Date): Promise<Page<SportEvent>> {
  const filter = filterKey(query);
  const offset = decodeOffset(query.cursor, filter);
  const upcoming = (await catalog.events())
    .filter((event) => !hasStarted(event, now))
    .filter((event) => query.competitionId === undefined || event.competition.id === query.competitionId)
    .filter((event) => query.q === undefined || matches(event, query.q))
    .toSorted((a, b) => a.startsAt.localeCompare(b.startsAt) || a.id.localeCompare(b.id));
  return paginate(upcoming, query.limit, offset, filter);
}

export async function getEvent(catalog: SportsCatalog, id: string, now: Date): Promise<SportEvent> {
  const event = (await catalog.events()).find((candidate) => candidate.id === id);
  if (!event) throw new AppError('NOT_FOUND', 'event not found');
  // T14-A1 — o jogo existe, mas deixou de ser mostrado (DT-010).
  if (hasStarted(event, now)) throw new AppError('NOT_FOUND', 'event started', [{ field: 'path.id', issue: 'event_started' }]);
  return event;
}
