import { useState } from 'react';
import { Link, useSearchParams } from 'wouter';

import { verificarEmail } from '../../shared/api/contas';
import { useConta } from '../../shared/conta/contexto';
import { Acao, AvisoErro, AvisoSucesso, Formulario, Painel, Saidas } from './Formulario';
import { mensagemDeConta } from './mensagens';
import { useEnvio } from './useEnvio';

/**
 * Verificacao de e-mail (seccao 7.2, `POST /api/accounts/verify`).
 *
 * **A confirmacao e um ato explicito, nao um efeito de abrir a pagina.** Tres razoes,
 * e nenhuma e estetica: o token e de USO UNICO, o `StrictMode` monta cada efeito duas
 * vezes em desenvolvimento -- o que gastaria o token e faria o segundo pedido falhar
 * sobre um token que estava bom --, e varios clientes de e-mail e antivirus visitam as
 * ligacoes das mensagens antes de o destinatario lhes tocar.
 */
export function VerificarEmail() {
  const [parametros] = useSearchParams();
  const token = parametros.get('token') ?? '';
  const { recarregar } = useConta();
  const envio = useEnvio();
  const [verificado, setVerificado] = useState(false);

  function submeter() {
    envio.enviar(
      () => verificarEmail(token),
      () => {
        setVerificado(true);
        // A conta pode estar autenticada noutro separador: repor o que a api diz.
        recarregar();
      },
    );
  }

  if (token === '') {
    return (
      <Painel
        titulo="Confirmar o e-mail"
        descricao="Esta página precisa da ligação que lhe enviámos por e-mail."
      >
        <AvisoErro>
          Esta ligação está incompleta. Abra a mensagem que lhe enviámos e use a ligação
          que vem lá.
        </AvisoErro>
        <Saidas>
          <Link href="/conta/entrar">Ir para a entrada</Link>
          <Link href="/perfil">Voltar ao perfil</Link>
        </Saidas>
      </Painel>
    );
  }

  if (verificado) {
    return (
      <Painel titulo="E-mail confirmado" descricao="A sua conta está pronta a usar.">
        <AvisoSucesso>E-mail confirmado. Já pode entrar na sua conta.</AvisoSucesso>
        <Saidas>
          <Link href="/conta/entrar">Entrar</Link>
          <Link href="/perfil">Voltar ao perfil</Link>
        </Saidas>
      </Painel>
    );
  }

  return (
    <Painel
      titulo="Confirmar o e-mail"
      descricao="Carregue no botão para terminar a confirmação da sua conta."
    >
      <Formulario onEnviar={submeter}>
        {envio.falha === null ? null : (
          <AvisoErro>{mensagemDeConta(envio.falha, 'verificacao')}</AvisoErro>
        )}
        <Acao pendente={envio.pendente} rotuloPendente="A confirmar…">
          Confirmar o meu e-mail
        </Acao>
      </Formulario>
      <Saidas>
        <Link href="/perfil">Voltar ao perfil</Link>
      </Saidas>
    </Painel>
  );
}
