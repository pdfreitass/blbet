import { useState } from 'react';
import { Link, useSearchParams } from 'wouter';

import { redefinirSenha } from '../../shared/api/contas';
import { useConta } from '../../shared/conta/contexto';
import { Acao, AvisoErro, AvisoSucesso, CampoTexto, Formulario, Painel, Saidas } from './Formulario';
import { mensagemDeConta } from './mensagens';
import { useEnvio } from './useEnvio';
import { APOIO_SENHA, erroDeSenha } from './validacao';

/**
 * Redefinicao com o token do e-mail (`POST /api/accounts/password-reset/confirm`).
 *
 * **Isto derruba TODAS as sessoes da conta, incluindo a deste navegador** (seccao
 * 7.2). O ecra di-lo antes e depois, e o estado local passa a anonimo sem chamar a
 * api: o cookie ja nao vale nada e perguntar outra vez so traria um `401`.
 */
export function Redefinir() {
  const [parametros] = useSearchParams();
  const token = parametros.get('token') ?? '';
  const { marcarSaida } = useConta();
  const envio = useEnvio();

  const [senha, setSenha] = useState('');
  const [validado, setValidado] = useState(false);
  const [redefinida, setRedefinida] = useState(false);

  const erroSenha = validado ? erroDeSenha(senha) : undefined;

  function submeter() {
    setValidado(true);

    if (erroDeSenha(senha) !== undefined) {
      return;
    }

    envio.enviar(
      () => redefinirSenha({ token, password: senha }),
      () => {
        setRedefinida(true);
        marcarSaida();
      },
    );
  }

  if (token === '') {
    return (
      <Painel
        titulo="Definir uma senha nova"
        descricao="Esta página precisa da ligação que lhe enviámos por e-mail."
      >
        <AvisoErro>
          Esta ligação está incompleta. Abra a mensagem que lhe enviámos, ou peça outra.
        </AvisoErro>
        <Saidas>
          <Link href="/conta/recuperar">Pedir outra ligação</Link>
        </Saidas>
      </Painel>
    );
  }

  if (redefinida) {
    return (
      <Painel titulo="Senha alterada" descricao="Todas as sessões foram terminadas.">
        <AvisoSucesso>
          A senha foi alterada e todas as sessões desta conta foram terminadas, incluindo a
          deste navegador. Entre de novo com a senha nova.
        </AvisoSucesso>
        <Saidas>
          <Link href="/conta/entrar">Entrar</Link>
        </Saidas>
      </Painel>
    );
  }

  return (
    <Painel
      titulo="Definir uma senha nova"
      descricao="Ao confirmar, todas as sessões desta conta terminam — incluindo a deste navegador."
    >
      <Formulario onEnviar={submeter}>
        {envio.falha === null ? null : (
          <AvisoErro>{mensagemDeConta(envio.falha, 'redefinicao')}</AvisoErro>
        )}
        <CampoTexto
          rotulo="Senha nova"
          tipo="password"
          valor={senha}
          onAlterar={setSenha}
          erro={erroSenha}
          autoComplete="new-password"
          apoio={APOIO_SENHA}
        />
        <Acao pendente={envio.pendente} rotuloPendente="A alterar…">
          Alterar a senha
        </Acao>
      </Formulario>
      <Saidas>
        <Link href="/conta/entrar">Voltar à entrada</Link>
      </Saidas>
    </Painel>
  );
}
