import { useState } from 'react';
import { Link } from 'wouter';

import { pedirRecuperacao } from '../../shared/api/contas';
import { Acao, AvisoErro, AvisoSucesso, CampoTexto, Formulario, Painel, Saidas } from './Formulario';
import { mensagemDeConta } from './mensagens';
import { useEnvio } from './useEnvio';
import { erroDeEmail } from './validacao';

/**
 * Pedido de recuperacao de senha (`POST /api/accounts/password-reset`).
 *
 * Como o cadastro, responde `202` exista ou nao a conta (A-A2): a confirmacao e
 * condicional de proposito -- "se este endereco puder ser usado" -- e nao confirma
 * nem desmente que ele esteja registado.
 */
export function Recuperar() {
  const envio = useEnvio();
  const [email, setEmail] = useState('');
  const [validado, setValidado] = useState(false);
  const [pedido, setPedido] = useState(false);

  const erroEmail = validado ? erroDeEmail(email) : undefined;

  function submeter() {
    setValidado(true);

    if (erroDeEmail(email) !== undefined) {
      return;
    }

    envio.enviar(
      () => pedirRecuperacao(email),
      () => setPedido(true),
    );
  }

  if (pedido) {
    return (
      <Painel titulo="Verifique o seu e-mail" descricao="O pedido foi registado.">
        <AvisoSucesso>
          Se este endereço puder ser usado, enviámos-lhe uma mensagem com uma ligação para
          definir uma senha nova.
        </AvisoSucesso>
        <Saidas>
          <Link href="/conta/entrar">Voltar à entrada</Link>
        </Saidas>
      </Painel>
    );
  }

  return (
    <Painel
      titulo="Recuperar a senha"
      descricao="Indique o e-mail da conta e enviamos-lhe uma ligação para definir uma senha nova."
    >
      <Formulario onEnviar={submeter}>
        {envio.falha === null ? null : (
          <AvisoErro>{mensagemDeConta(envio.falha, 'recuperacao')}</AvisoErro>
        )}
        <CampoTexto
          rotulo="E-mail"
          tipo="email"
          valor={email}
          onAlterar={setEmail}
          erro={erroEmail}
          autoComplete="username"
        />
        <Acao pendente={envio.pendente} rotuloPendente="A enviar…">
          Enviar ligação
        </Acao>
      </Formulario>
      <Saidas>
        <Link href="/conta/entrar">Voltar à entrada</Link>
      </Saidas>
    </Painel>
  );
}
