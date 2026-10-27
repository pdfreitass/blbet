// Contratos partilhados entre apps/api e apps/web (esquemas Zod e tipos derivados).
// Só convenções acordadas na T-004. Ainda não há modelos de domínio: dependem do provedor
// esportivo (T-010). Mudanças aqui exigem revisão cruzada (DT-005).
export * from './envelope.js';
export * from './primitives.js';
