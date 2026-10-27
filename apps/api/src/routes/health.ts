import type { FastifyPluginAsync } from 'fastify';

// Rota operacional: diz apenas se o processo responde. Não consulta provedores
// nem faz parte do contrato de domínio (docs/api-contract.md).
export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => ({ status: 'ok' as const }));
};
