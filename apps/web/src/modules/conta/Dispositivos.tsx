import { useCallback, useState } from 'react';
import { Link, useLocation } from 'wouter';

import {
  obterSessoes,
  revogarOutrasSessoes,
  revogarSessao,
  type SessionSummary,
} from '../../shared/api/contas';
import { EsqueletoLista, EstadoErro } from '../../shared/componentes/Estados';
import { useConta } from '../../shared/conta/contexto';
import { descreverInstante } from '../../shared/formato/dataHora';
import { useRecurso } from '../../shared/api/useRecurso';
import estilos from './Dispositivos.module.css';
import { ExigeSessao } from './ExigeSessao';
import { AvisoErro, Painel, Saidas } from './Formulario';
import { mensagemDeConta } from './mensagens';
import { useEnvio } from './useEnvio';

export function Dispositivos() {
  return (
    <ExigeSessao>
      <Conteudo />
    </ExigeSessao>
  );
}

/**
 * Dispositivos autenticados (`GET /api/sessions`) e revogacao.
 *
 * A sessao atual vem marcada com `current` e e tratada a parte: revoga-la e sair, e o
 * botao di-lo. Sem essa distincao, quem carregasse em "terminar" na propria linha
 * ficava de fora sem perceber porque.
 */
function Conteudo() {
  const [, navegar] = useLocation();
  const { marcarSaida } = useConta();
  const envio = useEnvio();

  // Muda quando algo e revogado: e o que faz `useRecurso` voltar a pedir a lista.
  const [versao, setVersao] = useState(0);

  const carregar = useCallback((opcoes: { signal: AbortSignal }) => obterSessoes(opcoes), []);
  const { carregando, dados, falha, repetir } = useRecurso(carregar, [versao]);

  function terminar(sessao: SessionSummary) {
    envio.enviar(
      () => revogarSessao(sessao.id),
      () => {
        if (sessao.current) {
          // Era esta: o cookie foi apagado do lado do servidor e nao ha lista para ver.
          marcarSaida();
          navegar('/perfil');
          return;
        }

        setVersao((valor) => valor + 1);
      },
    );
  }

  function terminarAsOutras() {
    envio.enviar(
      () => revogarOutrasSessoes(),
      () => setVersao((valor) => valor + 1),
    );
  }

  const sessoes = dados?.data ?? [];
  const outras = sessoes.filter((sessao) => !sessao.current).length;

  return (
    <Painel
      titulo="Dispositivos autenticados"
      descricao="Cada entrada na sua conta é uma sessão. Termine as que não reconhecer."
    >
      {envio.falha === null ? null : <AvisoErro>{mensagemDeConta(envio.falha, 'sessoes')}</AvisoErro>}

      {carregando ? <EsqueletoLista descricao="os dispositivos" linhas={2} /> : null}

      {!carregando && falha !== null ? (
        <EstadoErro
          mensagem={falha.mensagem}
          {...(repetir === null ? {} : { onTentarNovamente: repetir })}
        />
      ) : null}

      {!carregando && falha === null ? (
        <>
          <ul className={estilos.lista} role="list">
            {sessoes.map((sessao) => (
              <li className={estilos.item} key={sessao.id}>
                <div className={estilos.descricao}>
                  <span className={estilos.aparelho}>
                    {sessao.userAgent ?? 'Dispositivo não identificado'}
                  </span>
                  {sessao.current ? <span className={estilos.atual}>Este dispositivo</span> : null}
                  <span className={`${estilos.instantes} numeric`}>
                    {`Entrou em ${descreverInstante(sessao.createdAt)} · última atividade em ${descreverInstante(sessao.lastSeenAt)}`}
                  </span>
                </div>
                <button
                  type="button"
                  className={estilos.terminar}
                  disabled={envio.pendente}
                  onClick={() => terminar(sessao)}
                >
                  {sessao.current ? 'Sair deste dispositivo' : 'Terminar'}
                </button>
              </li>
            ))}
          </ul>

          {outras > 0 ? (
            <button
              type="button"
              className={estilos.terminarTodas}
              disabled={envio.pendente}
              onClick={terminarAsOutras}
            >
              {`Terminar as outras ${outras === 1 ? 'sessão' : `${outras} sessões`}`}
            </button>
          ) : null}
        </>
      ) : null}

      <Saidas>
        <Link href="/conta/alterar-senha">Alterar a senha</Link>
        <Link href="/perfil">Voltar ao perfil</Link>
      </Saidas>
    </Painel>
  );
}
