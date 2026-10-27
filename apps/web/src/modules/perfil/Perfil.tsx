import { Etiqueta } from '../../shared/componentes/Etiqueta';
import { ValorDemonstrativo } from '../../shared/componentes/ValorDemonstrativo';
import { useFavoritos } from '../../shared/favoritos/contexto';
import {
  CAMPOS_DEMONSTRATIVOS,
  NOME_DEMONSTRATIVO,
  OPERACOES_INEXISTENTES,
} from './dadosDemonstrativos';
import estilos from './Perfil.module.css';

/**
 * Perfil demonstrativo (RF-007).
 *
 * Quatro coisas que esta tela garante, e que tem teste:
 *   - alcancavel pela navegacao principal (CA-007.1) -- e um dos cinco destinos;
 *   - todo o dado exibido e ficticio e marcado como tal (CA-007.2), com o mesmo campo
 *     tracejado que o resto da aplicacao usa (RNF-008, DT-013);
 *   - nao ha acao de deposito, saque, pagamento ou verificacao de identidade
 *     (CA-007.3) -- e a tela DIZ que nao ha, em vez de ficar calada;
 *   - nenhum campo recolhe dado pessoal (CA-007.4): nao existe `input` nenhum aqui.
 *
 * O que NAO esta aqui, de proposito: saldo e historico. A **PD-006** continua em
 * aberto e inventar um saldo seria decidir por omissao.
 */
export function Perfil() {
  const { disponivel, total } = useFavoritos();

  return (
    <>
      <div className={estilos.cabecalho}>
        <span className={estilos.nome}>{NOME_DEMONSTRATIVO}</span>
        <Etiqueta variante="demonstrativo">Conta demonstrativa</Etiqueta>
      </div>

      <section className={estilos.seccao} aria-labelledby="perfil-conta">
        <h2 className={estilos.titulo} id="perfil-conta">
          Conta
        </h2>
        <dl className={estilos.campos}>
          {CAMPOS_DEMONSTRATIVOS.map((campo) => (
            <div className={estilos.campo} key={campo.id}>
              <dt className={estilos.rotulo}>{campo.rotulo}</dt>
              <dd className={estilos.valor}>
                <ValorDemonstrativo descricao={campo.rotulo}>{campo.valor}</ValorDemonstrativo>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/*
        A contagem de favoritos NAO leva campo tracejado: e informacao da propria
        interface, nao um dado ficticio, e marca-la diluiria o sinal (design-system 6.3).
      */}
      {disponivel ? (
        <section className={estilos.seccao} aria-labelledby="perfil-interface">
          <h2 className={estilos.titulo} id="perfil-interface">
            Nesta interface
          </h2>
          <dl className={estilos.campos}>
            <div className={estilos.campo}>
              <dt className={estilos.rotulo}>Favoritos guardados</dt>
              <dd className={`${estilos.valor} numeric`}>{total}</dd>
            </div>
          </dl>
          <p className={estilos.nota}>
            Os favoritos ficam só neste navegador. Não há conta, servidor nem sincronização
            entre dispositivos.
          </p>
        </section>
      ) : null}

      <section className={estilos.seccao} aria-labelledby="perfil-inexistente">
        <h2 className={estilos.titulo} id="perfil-inexistente">
          O que esta plataforma não faz
        </h2>
        <ul className={estilos.inexistentes} role="list">
          {OPERACOES_INEXISTENTES.map((operacao) => (
            <li className={estilos.inexistente} key={operacao}>
              <span className={estilos.marca} aria-hidden="true">
                ✕
              </span>
              {operacao}
            </li>
          ))}
        </ul>
      </section>

      <p className={estilos.nota}>
        Perfil de demonstração, sem autenticação e sem dados pessoais. Os campos acima são
        fixos e iguais para quem abrir esta página.
      </p>
    </>
  );
}
