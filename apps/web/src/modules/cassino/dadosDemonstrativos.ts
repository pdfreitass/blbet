/*
 * Catalogo DEMONSTRATIVO de jogos de cassino.
 *
 * Nomes inventados de proposito (RN-002): nenhum corresponde a um jogo real, nem de
 * perto. Nao ha imagens: os jogos nao existem, e inventar arte para eles aproximaria
 * o prototipo de um produto real sem o ser.
 */

import type { JogoDemonstrativo } from './tipos';

export const JOGOS_DEMONSTRATIVOS: readonly JogoDemonstrativo[] = [
  { id: 'jog-fict-001', nome: 'Rolos de Exemplo', categoria: 'slots', origin: 'demo' },
  { id: 'jog-fict-002', nome: 'Giro de Amostra', categoria: 'slots', origin: 'demo' },
  { id: 'jog-fict-003', nome: 'Roleta Maquete', categoria: 'mesa', origin: 'demo' },
  { id: 'jog-fict-004', nome: 'Mesa Protótipo', categoria: 'mesa', origin: 'demo' },
  { id: 'jog-fict-005', nome: 'Cartas de Esboço', categoria: 'cartas', origin: 'demo' },
  { id: 'jog-fict-006', nome: 'Baralho Rascunho', categoria: 'cartas', origin: 'demo' },
  { id: 'jog-fict-007', nome: 'Sorteio Fictício', categoria: 'instantaneos', origin: 'demo' },
  { id: 'jog-fict-008', nome: 'Raspadinha Demo', categoria: 'instantaneos', origin: 'demo' },
];
