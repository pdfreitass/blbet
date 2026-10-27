/*
 * Conjunto DEMONSTRATIVO de eventos esportivos.
 *
 * Tudo aqui e inventado e assumidamente ficticio (RN-002, RF-003): os nomes de clube
 * e de competicao nao existem, de proposito, para que nenhum ecra possa ser lido como
 * informacao real. Nenhuma chamada de rede, nenhum formato de provedor imitado.
 */

import type { EventoDemonstrativo } from './tipos';

/** Horas a partir de agora, para que os eventos nunca apareçam no passado. */
function daquiA(horas: number): Date {
  const instante = new Date();
  instante.setHours(instante.getHours() + horas);
  return instante;
}

export const EVENTOS_DEMONSTRATIVOS: readonly EventoDemonstrativo[] = [
  {
    id: 'evt-fict-001',
    esporte: 'Futebol',
    competicao: 'Copa Fictícia de Demonstração',
    participantes: ['Atlético Exemplo', 'Clube Protótipo'],
    inicio: daquiA(3),
    situacao: 'agendado',
    mercados: [
      {
        id: 'mkt-fict-001',
        nome: 'Resultado final',
        opcoes: [
          { id: 'opc-fict-001', nome: 'Atlético Exemplo', odd: 2.35 },
          { id: 'opc-fict-002', nome: 'Empate', odd: 3.1 },
          { id: 'opc-fict-003', nome: 'Clube Protótipo', odd: 2.8 },
        ],
      },
      {
        id: 'mkt-fict-002',
        nome: 'Total de gols',
        opcoes: [
          { id: 'opc-fict-004', nome: 'Acima de 2,5', odd: 1.95 },
          { id: 'opc-fict-005', nome: 'Abaixo de 2,5', odd: 1.85 },
        ],
      },
    ],
  },
  {
    id: 'evt-fict-002',
    esporte: 'Futebol',
    competicao: 'Copa Fictícia de Demonstração',
    participantes: ['Sociedade Amostra', 'União Maquete'],
    inicio: daquiA(27),
    situacao: 'agendado',
    mercados: [
      {
        id: 'mkt-fict-003',
        nome: 'Resultado final',
        opcoes: [
          { id: 'opc-fict-006', nome: 'Sociedade Amostra', odd: 1.72 },
          { id: 'opc-fict-007', nome: 'Empate', odd: 3.4 },
          { id: 'opc-fict-008', nome: 'União Maquete', odd: 4.25 },
        ],
      },
    ],
  },
  {
    id: 'evt-fict-003',
    esporte: 'Basquete',
    competicao: 'Liga Demonstrativa de Basquete',
    participantes: ['Esboço Basquete Clube', 'Rascunho Esportivo'],
    inicio: daquiA(-2),
    situacao: 'encerrado',
    mercados: [
      {
        id: 'mkt-fict-004',
        nome: 'Vencedor da partida',
        opcoes: [
          { id: 'opc-fict-009', nome: 'Esboço Basquete Clube', odd: 1.45 },
          { id: 'opc-fict-010', nome: 'Rascunho Esportivo', odd: 2.7 },
        ],
      },
    ],
  },
];
