import { Link } from 'wouter';

import { EsqueletoLista, EstadoErro } from '../../shared/componentes/Estados';
import { useConta } from '../../shared/conta/contexto';
import { AvisoErro, Painel, Saidas } from './Formulario';

/**
 * Porta dos ecras que exigem sessao.
 *
 * Nao e seguranca: a api e que decide, e qualquer um destes ecras daria `401` sem
 * cookie. Isto existe para que o utilizador veja "entre primeiro" em vez de um erro
 * tecnico, e para nao gastar um pedido que ja se sabe que falha.
 */
export function ExigeSessao({ children }: { children: React.ReactNode }) {
  const { estado, recarregar } = useConta();

  if (estado.situacao === 'carregando') {
    return <EsqueletoLista descricao="a sua conta" linhas={2} />;
  }

  if (estado.situacao === 'indisponivel') {
    return <ContasDesligadas />;
  }

  if (estado.situacao === 'falha') {
    return (
      <EstadoErro
        mensagem={estado.falha.mensagem}
        {...(estado.falha.retryable ? { onTentarNovamente: recarregar } : {})}
      />
    );
  }

  if (estado.situacao === 'anonimo') {
    return (
      <Painel titulo="É preciso entrar" descricao="Esta área é da sua conta.">
        <AvisoErro>Entre na sua conta para ver esta página.</AvisoErro>
        <Saidas>
          <Link href="/conta/entrar">Entrar</Link>
          <Link href="/conta/criar">Criar conta</Link>
          <Link href="/perfil">Voltar ao perfil</Link>
        </Saidas>
      </Painel>
    );
  }

  return <>{children}</>;
}

/**
 * A api so regista as rotas de conta quando tem base de dados configurada (DT-021).
 * Sem ela as contas nao existem -- e isso e um estado previsto, que se diz por
 * palavras em vez de aparecer como "não encontrámos o que procurava".
 */
export function ContasDesligadas() {
  return (
    <Painel
      titulo="Contas indisponíveis"
      descricao="Esta instalação do blbet está a correr sem a área de contas."
    >
      <AvisoErro>
        O servidor não tem a área de contas ligada, por isso não é possível entrar nem
        criar conta. O resto da plataforma funciona normalmente.
      </AvisoErro>
      <Saidas>
        <Link href="/">Ver os jogos</Link>
      </Saidas>
    </Painel>
  );
}
