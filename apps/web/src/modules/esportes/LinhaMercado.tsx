import estilos from './LinhaMercado.module.css';
import { ValorDemonstrativo } from '../../shared/componentes/ValorDemonstrativo';
import { formatarOdd } from '../../shared/formato/odd';
import type { MercadoDemonstrativo } from './tipos';

interface LinhaMercadoProps {
  mercado: MercadoDemonstrativo;
}

/**
 * Mercado em lista de descricao: o nome da opcao e o termo, a cotacao e a definicao.
 * Somente leitura, sem excecao -- ver o comentario do CSS e CA-003.3.
 */
export function LinhaMercado({ mercado }: LinhaMercadoProps) {
  return (
    <section className={estilos.mercado} aria-label={`Mercado: ${mercado.nome}`}>
      <h4 className={estilos.nome}>{mercado.nome}</h4>
      <dl className={estilos.opcoes}>
        {mercado.opcoes.map((opcao) => (
          <div className={estilos.opcao} key={opcao.id}>
            <dt className={estilos.rotulo}>{opcao.nome}</dt>
            <dd className={estilos.cotacao}>
              <ValorDemonstrativo numerico descricao={`cotação de ${opcao.nome}`}>
                {formatarOdd(opcao.odd)}
              </ValorDemonstrativo>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
