import { useState } from 'react';
import { Link } from 'wouter';

import { alterarSenha } from '../../shared/api/contas';
import { ExigeSessao } from './ExigeSessao';
import { Acao, AvisoErro, AvisoSucesso, CampoTexto, Formulario, Painel, Saidas } from './Formulario';
import { mensagemDeConta } from './mensagens';
import { useEnvio } from './useEnvio';
import { APOIO_SENHA, erroDeSenha } from './validacao';

export function AlterarSenha() {
  return (
    <ExigeSessao>
      <Conteudo />
    </ExigeSessao>
  );
}

/**
 * Alteracao de senha (`POST /api/accounts/password`).
 *
 * A senha atual e a reautenticacao: ter a sessao aberta nao chega. A api derruba as
 * OUTRAS sessoes e mantem esta, e o ecra diz as duas coisas -- quem troca a senha por
 * suspeitar de acesso alheio precisa de saber que os outros dispositivos cairam.
 */
function Conteudo() {
  const envio = useEnvio();
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [validado, setValidado] = useState(false);
  const [alterada, setAlterada] = useState(false);

  const erroAtual = validado && atual === '' ? 'Indique a senha atual.' : undefined;
  const erroNova = validado ? erroDeSenha(nova) : undefined;

  function submeter() {
    setValidado(true);

    if (atual === '' || erroDeSenha(nova) !== undefined) {
      return;
    }

    envio.enviar(
      () => alterarSenha({ currentPassword: atual, newPassword: nova }),
      () => {
        setAlterada(true);
        setAtual('');
        setNova('');
        setValidado(false);
      },
    );
  }

  return (
    <Painel
      titulo="Alterar a senha"
      descricao="Precisa da senha atual. Ao alterar, as sessões nos outros dispositivos terminam; esta continua."
    >
      <Formulario onEnviar={submeter}>
        {envio.falha === null ? null : <AvisoErro>{mensagemDeConta(envio.falha, 'senha')}</AvisoErro>}
        {alterada && envio.falha === null ? (
          <AvisoSucesso>
            Senha alterada. As sessões nos outros dispositivos foram terminadas.
          </AvisoSucesso>
        ) : null}

        <CampoTexto
          rotulo="Senha atual"
          tipo="password"
          valor={atual}
          onAlterar={setAtual}
          erro={erroAtual}
          autoComplete="current-password"
        />
        <CampoTexto
          rotulo="Senha nova"
          tipo="password"
          valor={nova}
          onAlterar={setNova}
          erro={erroNova}
          autoComplete="new-password"
          apoio={APOIO_SENHA}
        />

        <Acao pendente={envio.pendente} rotuloPendente="A alterar…">
          Alterar a senha
        </Acao>
      </Formulario>

      <Saidas>
        <Link href="/conta/dispositivos">Dispositivos autenticados</Link>
        <Link href="/perfil">Voltar ao perfil</Link>
      </Saidas>
    </Painel>
  );
}
