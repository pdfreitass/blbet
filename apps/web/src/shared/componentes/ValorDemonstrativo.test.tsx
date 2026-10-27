import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ValorDemonstrativo } from './ValorDemonstrativo';

describe('ValorDemonstrativo', () => {
  it('mostra o valor que recebe', () => {
    render(<ValorDemonstrativo descricao="cotação de Empate">3,10</ValorDemonstrativo>);

    expect(screen.getByText('3,10')).toBeTruthy();
  });

  it('declara o carácter fictício em texto, porque o tracejado é invisível para leitor de tela', () => {
    render(<ValorDemonstrativo descricao="cotação de Empate">3,10</ValorDemonstrativo>);

    expect(screen.getByText(/cotação de Empate, valor demonstrativo/)).toBeTruthy();
  });

  it('esconde o glifo da árvore de acessibilidade: é marca visual, não informação', () => {
    const { container } = render(
      <ValorDemonstrativo descricao="cotação">3,10</ValorDemonstrativo>,
    );

    const glifo = container.querySelector('[aria-hidden="true"]');

    expect(glifo?.textContent).toBe('◇');
  });

  it('marca números com função de dado para tabular-nums (princípio P1)', () => {
    const { container } = render(
      <ValorDemonstrativo numerico descricao="cotação">
        3,10
      </ValorDemonstrativo>,
    );

    expect(container.querySelector('.numeric')).not.toBeNull();
  });
});
