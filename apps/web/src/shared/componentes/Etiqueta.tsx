import estilos from './Etiqueta.module.css';

/**
 * Variantes de design-system 9.8. A variante `real` **nao existe e nao e para criar**:
 * a DT-014 escolheu a opcao A -- marca-se so o dado ficticio.
 */
export type VarianteEtiqueta =
  | 'neutra'
  | 'sucesso'
  | 'aviso'
  | 'erro'
  | 'informacao'
  | 'demonstrativo';

/** Marca visual por variante. Acompanha SEMPRE o texto, nunca o substitui. */
const MARCA_POR_VARIANTE: Record<VarianteEtiqueta, string> = {
  neutra: '•',
  sucesso: '✓',
  aviso: '!',
  erro: '×',
  informacao: 'i',
  demonstrativo: '◇',
};

interface EtiquetaProps {
  variante?: VarianteEtiqueta;
  children: string;
}

export function Etiqueta({ variante = 'neutra', children }: EtiquetaProps) {
  return (
    <span className={`${estilos.etiqueta} ${estilos[variante]}`}>
      <span className={estilos.marca} aria-hidden="true">
        {MARCA_POR_VARIANTE[variante]}
      </span>
      {children}
    </span>
  );
}
