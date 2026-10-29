import { useState } from 'react';
import { Link, useLocation } from 'wouter';

import { useConta } from '../../shared/conta/contexto';
import { Acao, AvisoErro, CampoTexto, Formulario, Painel, Saidas } from './Formulario';
import { mensagemDeConta } from './mensagens';
import { useEnvio } from './useEnvio';
import { erroDeEmail } from './validacao';

/** Entrada (seccao 7.2, `POST /api/sessions`). */
export function Entrar() {
  const [, navegar] = useLocation();
  const { entrar } = useConta();
  const envio = useEnvio();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [validado, setValidado] = useState(false);

  const erroEmail = validado ? erroDeEmail(email) : undefined;
  /*
   * A senha NAO e validada por comprimento aqui. Numa entrada, dizer "a senha tem de
   * ter 8 caracteres" sobre uma senha ja existente nao ajuda ninguem -- e, se a conta
   * for antiga, pode ser falso. Vazio e a unica coisa que vale a pena apanhar.
   */
  const erroSenha = validado && senha === '' ? 'Indique a sua senha.' : undefined;

  function submeter() {
    setValidado(true);

    if (erroDeEmail(email) !== undefined || senha === '') {
      return;
    }

    envio.enviar(
      () => entrar(email, senha),
      () => navegar('/perfil'),
    );
  }

  return (
    <Painel
      titulo="Entrar"
      descricao="Entre com o e-mail e a senha da sua conta blbet."
    >
      <Formulario onEnviar={submeter}>
        {envio.falha === null ? null : (
          <AvisoErro>{mensagemDeConta(envio.falha, 'entrada')}</AvisoErro>
        )}

        <CampoTexto
          rotulo="E-mail"
          tipo="email"
          valor={email}
          onAlterar={setEmail}
          erro={erroEmail}
          autoComplete="username"
        />
        <CampoTexto
          rotulo="Senha"
          tipo="password"
          valor={senha}
          onAlterar={setSenha}
          erro={erroSenha}
          autoComplete="current-password"
        />

        <Acao pendente={envio.pendente} rotuloPendente="A entrar…">
          Entrar
        </Acao>
      </Formulario>

      <Saidas>
        <Link href="/conta/criar">Criar conta</Link>
        <Link href="/conta/recuperar">Esqueci-me da senha</Link>
        <Link href="/perfil">Voltar ao perfil</Link>
      </Saidas>
    </Painel>
  );
}
