import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LinhaMercado } from './LinhaMercado';
import type { MercadoDemonstrativo } from './tipos';

const MERCADO: MercadoDemonstrativo = {
  id: 'mkt-teste',
  nome: 'Resultado final',
  opcoes: [
    { id: 'opc-1', nome: 'Atlético Exemplo', odd: '2.35' },
    { id: 'opc-2', nome: 'Empate', odd: '3.10' },
  ],
};

describe('LinhaMercado', () => {
  it('mostra as cotações formatadas pelo ponto único', () => {
    render(<LinhaMercado mercado={MERCADO} />);

    expect(screen.getByText('2,35')).toBeTruthy();
    expect(screen.getByText('3,10')).toBeTruthy();
  });

  /*
   * Os três testes seguintes são a salvaguarda de RN-003 e CA-003.3: a odd é texto
   * marcado como dado, e nada mais. Se alguém transformar uma cotação em controle,
   * mesmo desativado, estes testes falham.
   */
  it('não contém nenhum botão', () => {
    render(<LinhaMercado mercado={MERCADO} />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('não contém nenhuma ligação nem elemento operável', () => {
    const { container } = render(<LinhaMercado mercado={MERCADO} />);

    expect(container.querySelectorAll('a, button, input, select, textarea')).toHaveLength(0);
  });

  it('não contém elemento desativado que sugira seleção possível', () => {
    const { container } = render(<LinhaMercado mercado={MERCADO} />);

    expect(container.querySelectorAll('[disabled], [aria-disabled], [role="button"]')).toHaveLength(
      0,
    );
  });

  it('usa lista de descrição, não lista de ações', () => {
    const { container } = render(<LinhaMercado mercado={MERCADO} />);

    expect(container.querySelector('dl')).not.toBeNull();
  });

  it('cada cotação declara ao leitor de tela que é demonstrativa', () => {
    render(<LinhaMercado mercado={MERCADO} />);

    expect(screen.getByText(/cotação de Empate, valor demonstrativo/)).toBeTruthy();
  });
});
