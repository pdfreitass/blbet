import { useState } from 'react';
import { Link } from 'wouter';

import { criarConta } from '../../shared/api/contas';
import { Acao, AvisoErro, AvisoSucesso, CampoTexto, Formulario, Painel, Saidas } from './Formulario';
import { mensagemDeConta } from './mensagens';
import { useEnvio } from './useEnvio';
import { APOIO_SENHA, erroDeEmail, erroDeSenha } from './validacao';

/**
 * Cadastro (seccao 7.2, `POST /api/accounts`).
 *
 * **A api responde `202 { accepted: true }` exista ou nao a conta** (A-A2), e este
 * ecra nunca diz "este e-mail ja existe" -- nao o sabe, e saber seria precisamente a
 * forma de descobrir quem esta registado. Quem for dono do endereco recebe aviso por
 * e-mail; quem nao for, fica a saber apenas o que ja sabia.
 */
export function CriarConta() {
  const envio = useEnvio();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [validado, setValidado] = useState(false);
  const [aceite, setAceite] = useState(false);

  const erroEmail = validado ? erroDeEmail(email) : undefined;
  const erroSenha = validado ? erroDeSenha(senha) : undefined;

  function submeter() {
    setValidado(true);

    if (erroDeEmail(email) !== undefined || erroDeSenha(senha) !== undefined) {
      return;
    }

    envio.enviar(
      () => criarConta({ email, password: senha }),
      () => setAceite(true),
    );
  }

  if (aceite) {
    return (
      <Painel
        titulo="Confirme o seu e-mail"
        descricao="Falta um passo antes de poder entrar."
      >
        <AvisoSucesso>
          Se este endereço puder ser usado, enviámos-lhe uma mensagem com uma ligação de
          confirmação. Abra-a para terminar o cadastro.
        </AvisoSucesso>
        <Saidas>
          <Link href="/conta/entrar">Ir para a entrada</Link>
          <Link href="/perfil">Voltar ao perfil</Link>
        </Saidas>
      </Painel>
    );
  }

  return (
    <Painel
      titulo="Criar conta"
      descricao="Basta um e-mail e uma senha. Não pedimos nome, telefone, documento nem meio de pagamento."
    >
      <Formulario onEnviar={submeter}>
        {envio.falha === null ? null : (
          <AvisoErro>{mensagemDeConta(envio.falha, 'cadastro')}</AvisoErro>
        )}

        <CampoTexto
          rotulo="E-mail"
          tipo="email"
          valor={email}
          onAlterar={setEmail}
          erro={erroEmail}
          autoComplete="username"
          apoio="Maiúsculas e espaços à volta são ignorados: o endereço é tratado em minúsculas."
        />
        <CampoTexto
          rotulo="Senha"
          tipo="password"
          valor={senha}
          onAlterar={setSenha}
          erro={erroSenha}
          autoComplete="new-password"
          apoio={APOIO_SENHA}
        />

        <Acao pendente={envio.pendente} rotuloPendente="A criar…">
          Criar conta
        </Acao>
      </Formulario>

      <Saidas>
        <Link href="/conta/entrar">Já tenho conta</Link>
        <Link href="/perfil">Voltar ao perfil</Link>
      </Saidas>
    </Painel>
  );
}
