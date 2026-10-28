import { useState } from 'react';
import { Link } from 'wouter';

import { EsqueletoLista, EstadoErro } from '../../shared/componentes/Estados';
import { Etiqueta } from '../../shared/componentes/Etiqueta';
import { useConta } from '../../shared/conta/contexto';
import { descreverInstante } from '../../shared/formato/dataHora';
import estilos from './ResumoConta.module.css';

/**
 * A conta real, no topo do perfil (DT-020).
 *
 * Fica ACIMA do perfil demonstrativo de RF-007 e nao se mistura com ele: o que esta
 * aqui e dado verdadeiro da pessoa que entrou, e o que esta abaixo continua ficticio
 * e marcado como tal. Juntar os dois num so bloco apagaria a distincao que o
 * `design-system` 6.3 existe para manter.
 */
export function ResumoConta() {
  const { estado, sair, recarregar } = useConta();
  const [aSair, setASair] = useState(false);

  if (estado.situacao === 'carregando') {
    return (
      <section className={estilos.bloco}>
        <EsqueletoLista descricao="a sua conta" linhas={1} />
      </section>
    );
  }

  /*
   * Sem base de dados configurada, a api nem regista as rotas de conta (DT-021). Aqui
   * isso e uma nota curta, nao um bloco de erro: o resto do perfil funciona, e nada
   * do que o utilizador fez deu errado.
   */
  if (estado.situacao === 'indisponivel') {
    return (
      <section className={estilos.bloco}>
        <p className={estilos.nota}>
          Esta instalação está a correr sem a área de contas. Não é possível entrar nem criar
          conta; o resto da plataforma funciona.
        </p>
      </section>
    );
  }

  if (estado.situacao === 'falha') {
    return (
      <section className={estilos.bloco}>
        <EstadoErro
          mensagem={estado.falha.mensagem}
          {...(estado.falha.retryable ? { onTentarNovamente: recarregar } : {})}
        />
      </section>
    );
  }

  if (estado.situacao === 'anonimo') {
    return (
      <section className={estilos.bloco} aria-labelledby="conta-anonima">
        <h2 className={estilos.titulo} id="conta-anonima">
          A sua conta
        </h2>
        <p className={estilos.nota}>
          Não está autenticado. Uma conta blbet serve para entrar nos seus dispositivos; não
          há carteira, depósitos nem saques.
        </p>
        <p className={estilos.ligacoes}>
          <Link href="/conta/entrar">Entrar</Link>
          <Link href="/conta/criar">Criar conta</Link>
        </p>
      </section>
    );
  }

  const { conta } = estado;

  return (
    <section className={estilos.bloco} aria-labelledby="conta-autenticada">
      <h2 className={estilos.titulo} id="conta-autenticada">
        A sua conta
      </h2>

      <dl className={estilos.campos}>
        <div className={estilos.campo}>
          <dt className={estilos.rotulo}>E-mail</dt>
          <dd className={estilos.valor}>{conta.email}</dd>
        </div>
        <div className={estilos.campo}>
          <dt className={estilos.rotulo}>E-mail confirmado</dt>
          <dd className={estilos.valor}>
            {conta.emailVerified ? (
              'Sim'
            ) : (
              <Etiqueta variante="aviso">Por confirmar</Etiqueta>
            )}
          </dd>
        </div>
        <div className={estilos.campo}>
          <dt className={estilos.rotulo}>Conta criada</dt>
          <dd className={`${estilos.valor} numeric`}>{descreverInstante(conta.createdAt)}</dd>
        </div>
      </dl>

      <p className={estilos.ligacoes}>
        <Link href="/conta/alterar-senha">Alterar a senha</Link>
        <Link href="/conta/dispositivos">Dispositivos autenticados</Link>
      </p>

      <button
        type="button"
        className={estilos.sair}
        disabled={aSair}
        onClick={() => {
          setASair(true);
          void sair().finally(() => setASair(false));
        }}
      >
        {aSair ? 'A sair…' : 'Sair'}
      </button>
    </section>
  );
}
