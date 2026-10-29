// Contratos partilhados entre apps/api e apps/web (esquemas Zod e tipos derivados).
// Convenções acordadas na T-004 e, em `sports.ts`, a proposta do modelo esportivo (T-014),
// ainda à espera da revisão do `frontend`. Mudanças aqui exigem revisão cruzada (DT-005).
export * from './accounts.js';
export * from './envelope.js';
export * from './primitives.js';
export * from './sports.js';
