import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EsqueletoLista, EstadoErro, NadaCadastrado, NadaEncontrado } from './Estados';

describe('EsqueletoLista', () => {
  it('marca o contentor como ocupado e anuncia o que carrega (CA-008.1)', () => {
    const { container } = render(<EsqueletoLista descricao="eventos" />);

    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.getByText('Carregando eventos')).toBeTruthy();
  });

  it('respeita o número de linhas pedido, para ter a altura do conteúdo futuro', () => {
    const { container } = render(<EsqueletoLista descricao="eventos" linhas={5} />);

    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(5);
  });
});

describe('EstadoErro', () => {
  it('anuncia como alerta', () => {
    render(<EstadoErro mensagem="Não foi possível obter os eventos agora." />);

    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('não oferece nova tentativa quando a operação não é repetível', () => {
    render(<EstadoErro mensagem="Não foi possível obter os eventos agora." />);

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('oferece nova tentativa quando há como repetir', () => {
    const tentar = vi.fn();
    render(<EstadoErro mensagem="Falhou." onTentarNovamente={tentar} />);

    screen.getByRole('button', { name: 'Tentar novamente' }).click();

    expect(tentar).toHaveBeenCalledOnce();
  });
});

describe('estados vazios', () => {
  it('são textualmente distintos entre si (CA-008.3)', () => {
    const cadastrado = render(<NadaCadastrado conjunto="eventos" />);
    const textoCadastrado = cadastrado.container.textContent ?? '';
    cadastrado.unmount();

    const encontrado = render(<NadaEncontrado criterio="“xyz”" onLimpar={() => {}} />);
    const textoEncontrado = encontrado.container.textContent ?? '';

    expect(textoCadastrado).not.toBe(textoEncontrado);
    expect(textoCadastrado).toContain('Ainda não há eventos');
    expect(textoEncontrado).toContain('Nada encontrado');
  });

  it('nada encontrado mostra o critério aplicado (CA-005.2)', () => {
    render(<NadaEncontrado criterio="“xyz”" onLimpar={() => {}} />);

    expect(screen.getByText('“xyz”')).toBeTruthy();
  });

  it('nada encontrado oferece saída, para que a tela nunca fique sem saída (CA-008.4)', () => {
    const limpar = vi.fn();
    render(<NadaEncontrado criterio="“xyz”" onLimpar={limpar} />);

    screen.getByRole('button', { name: 'Limpar filtros' }).click();

    expect(limpar).toHaveBeenCalledOnce();
  });
});
