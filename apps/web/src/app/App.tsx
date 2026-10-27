import { useMemo, useState } from 'react';

import { CampoBusca } from '../shared/componentes/CampoBusca';
import { NadaCadastrado, NadaEncontrado } from '../shared/componentes/Estados';
import { FaixaDemonstrativa } from '../shared/componentes/FaixaDemonstrativa';
import { NavegacaoPrincipal, type IdDestino } from '../shared/componentes/NavegacaoPrincipal';
import { EVENTOS_DEMONSTRATIVOS } from '../modules/esportes/dadosDemonstrativos';
import { ListaEventos } from '../modules/esportes/ListaEventos';
import type { EventoDemonstrativo } from '../modules/esportes/tipos';
import estilos from './App.module.css';

/**
 * Casca da aplicacao: faixa permanente, cabecalho, conteudo do destino ativo e
 * navegacao principal.
 *
 * O destino ativo e estado local porque nao ha roteamento decidido -- ver o comentario
 * de NavegacaoPrincipal. Quando houver, o estado passa a vir da rota e o resto fica.
 */
export function App() {
  const [destino, setDestino] = useState<IdDestino>('esportes');
  const [termo, setTermo] = useState('');

  const encontrados = useMemo(() => filtrarEventos(EVENTOS_DEMONSTRATIVOS, termo), [termo]);

  return (
    <div className={estilos.aplicacao}>
      <FaixaDemonstrativa />
      <header className={estilos.cabecalho}>
        <span className={estilos.marca}>blbet</span>
        <span className={estilos.subtitulo}>protótipo demonstrativo</span>
      </header>
      {/* A navegacao vem ANTES do <main> no DOM: e a ordem que o leitor de tela
          percorre, e `position: sticky` so prende ao topo um elemento que ja esta no
          topo do fluxo. Abaixo de 600px ela e `fixed` no fundo, onde a posicao no
          DOM nao conta. */}
      <NavegacaoPrincipal destinoAtivo={destino} onNavegar={setDestino} />
      <main className={estilos.conteudo}>
        {destino === 'esportes' ? (
          <>
            <h1 className={estilos.titulo}>Esportes</h1>
            <ListaEventos eventos={EVENTOS_DEMONSTRATIVOS} />
            <p className={estilos.rodapeBloco}>
              Conjunto demonstrativo: participantes, competições, datas e cotações são
              fictícios e não correspondem a eventos reais.
            </p>
          </>
        ) : null}

        {destino === 'busca' ? (
          <>
            <h1 className={estilos.titulo}>Busca</h1>
            <CampoBusca termo={termo} onAlterar={setTermo} contagem={encontrados.length} />
            {termo.length > 0 && encontrados.length === 0 ? (
              <NadaEncontrado
                criterio={`“${termo}”`}
                // Nome diferente do "Limpar a busca" do campo, de proposito: dois
                // controles com o mesmo nome acessivel na mesma tela sao
                // indistinguiveis para quem navega por lista de botoes.
                rotuloLimpar="Ver todos os eventos"
                onLimpar={() => setTermo('')}
              />
            ) : (
              <ListaEventos eventos={termo.length > 0 ? encontrados : EVENTOS_DEMONSTRATIVOS} />
            )}
          </>
        ) : null}

        {destino === 'cassino' ? (
          <>
            <h1 className={estilos.titulo}>Cassino</h1>
            <NadaCadastrado conjunto="jogos" />
          </>
        ) : null}

        {destino === 'favoritos' ? (
          <>
            <h1 className={estilos.titulo}>Favoritos</h1>
            <NadaCadastrado conjunto="favoritos" />
          </>
        ) : null}

        {destino === 'perfil' ? (
          <>
            <h1 className={estilos.titulo}>Perfil</h1>
            <NadaCadastrado conjunto="dados de perfil" />
          </>
        ) : null}
      </main>
    </div>
  );
}

/**
 * Filtra por participante, competicao ou esporte. Sem acentuacao normalizada de
 * proposito nesta etapa: o escopo da busca e PD-003, aberto, e nao decido por omissao
 * o que conta como correspondencia.
 */
function filtrarEventos(
  eventos: readonly EventoDemonstrativo[],
  termo: string,
): readonly EventoDemonstrativo[] {
  const procurado = termo.trim().toLocaleLowerCase('pt-BR');

  if (procurado.length === 0) {
    return eventos;
  }

  return eventos.filter((evento) => {
    const campos = [evento.esporte, evento.competicao, ...evento.participantes];
    return campos.some((campo) => campo.toLocaleLowerCase('pt-BR').includes(procurado));
  });
}
