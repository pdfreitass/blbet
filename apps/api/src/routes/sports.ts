import { eventsQuerySchema, idSchema } from '@blbet/contracts';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import type { SportsCatalog } from '../modules/sports/sports-catalog.js';
import { getEvent, listCompetitions, listEvents } from '../modules/sports/sports-service.js';
import { AppError, parseInput } from '../shared/errors.js';

// Rotas de esportes (api-contract.md, secção 7.1; T-014).

export interface SportsRoutesOptions {
  /** Ausente quando o provedor não está configurado (sem SPORTS_PROVIDER_API_KEY). */
  readonly sports: SportsCatalog | undefined;
  readonly now: () => Date;
}

const eventParamsSchema = z.strictObject({ id: idSchema });

export const sportsRoutes: FastifyPluginAsync<SportsRoutesOptions> = async (app, options) => {
  const catalog = (): SportsCatalog => {
    if (!options.sports) throw new AppError('UPSTREAM_UNAVAILABLE', 'sports provider not configured');
    return options.sports;
  };

  app.get('/api/competitions', async () => listCompetitions(catalog()));

  app.get('/api/events', async (request) => {
    const query = parseInput(eventsQuerySchema, request.query, 'query');
    return listEvents(catalog(), query, options.now());
  });

  app.get('/api/events/:id', async (request) => {
    const { id } = parseInput(eventParamsSchema, request.params, 'path');
    return { data: await getEvent(catalog(), id, options.now()) };
  });
};
