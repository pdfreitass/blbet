import { useId, type FormEvent, type ReactNode } from 'react';

import estilos from './Formulario.module.css';

/*
 * Pecas partilhadas pelos ecras de conta.
 *
 * Nao sao componentes-base do sistema visual: vivem no modulo porque so a area de
 * conta tem formularios. Se outra area passar a ter, sobem para `shared/componentes/`
 * e entram na seccao 9 do `design-system.md` -- nao antes.
 */

interface PainelProps {
  titulo: string;
  /** Uma frase a dizer o que este ecra faz. Sempre presente: nenhum ecra fica mudo. */
  descricao: string;
  children: ReactNode;
}

export function Painel({ titulo, descricao, children }: PainelProps) {
  return (
    <section className={estilos.painel}>
      <h1 className={estilos.titulo}>{titulo}</h1>
      <p className={estilos.descricao}>{descricao}</p>
      {children}
    </section>
  );
}

interface FormularioProps {
  onEnviar: () => void;
  children: ReactNode;
}

export function Formulario({ onEnviar, children }: FormularioProps) {
  function submeter(evento: FormEvent<HTMLFormElement>) {
    // `noValidate` no formulario: a validacao e a do contrato, nao a do navegador, e
    // as duas em simultaneo dariam duas mensagens diferentes para o mesmo campo.
    evento.preventDefault();
    onEnviar();
  }

  return (
    <form className={estilos.formulario} onSubmit={submeter} noValidate>
      {children}
    </form>
  );
}

interface CampoTextoProps {
  rotulo: string;
  tipo: 'email' | 'password' | 'text';
  valor: string;
  onAlterar: (valor: string) => void;
  /** Texto de apoio permanente -- a regra do campo, nao uma mensagem de erro. */
  apoio?: string;
  /** Mensagem de erro do campo. Presente => o campo fica marcado como invalido. */
  erro?: string | undefined;
  /** `username` ou `current-password`, por exemplo: ajuda o gestor de senhas. */
  autoComplete?: string;
  obrigatorio?: boolean;
}

export function CampoTexto({
  rotulo,
  tipo,
  valor,
  onAlterar,
  apoio,
  erro,
  autoComplete,
  obrigatorio = true,
}: CampoTextoProps) {
  const id = useId();
  const idApoio = `${id}-apoio`;
  const idErro = `${id}-erro`;

  /*
   * O erro e descrito POR `aria-describedby`, nao so pela cor: quem nao distingue a
   * cor vermelha tem de saber na mesma qual e o campo com problema (RNF-002).
   */
  const descritores = [apoio === undefined ? null : idApoio, erro === undefined ? null : idErro]
    .filter((valorDescritor): valorDescritor is string => valorDescritor !== null)
    .join(' ');

  return (
    <div className={estilos.campo}>
      <label className={estilos.rotulo} htmlFor={id}>
        {rotulo}
      </label>
      <input
        id={id}
        type={tipo}
        className={`${estilos.entrada} ${erro === undefined ? '' : estilos.entradaInvalida}`}
        value={valor}
        onChange={(evento) => onAlterar(evento.target.value)}
        aria-invalid={erro === undefined ? undefined : true}
        {...(descritores === '' ? {} : { 'aria-describedby': descritores })}
        {...(autoComplete === undefined ? {} : { autoComplete })}
        required={obrigatorio}
      />
      {apoio === undefined ? null : (
        <p className={estilos.apoio} id={idApoio}>
          {apoio}
        </p>
      )}
      {erro === undefined ? null : (
        <p className={estilos.erroCampo} id={idErro}>
          {erro}
        </p>
      )}
    </div>
  );
}

/** Falha do pedido inteiro. `role="alert"` porque interrompe o que se ia fazer. */
export function AvisoErro({ children }: { children: ReactNode }) {
  return (
    <p className={estilos.aviso} role="alert">
      {children}
    </p>
  );
}

/** Confirmacao. `role="status"` -- e informacao, nao interrupcao. */
export function AvisoSucesso({ children }: { children: ReactNode }) {
  return (
    <p className={`${estilos.aviso} ${estilos.avisoSucesso}`} role="status">
      {children}
    </p>
  );
}

interface AcaoProps {
  children: ReactNode;
  /** Pedido em curso: o botao fica desativado para nao enviar duas vezes. */
  pendente: boolean;
  /** O que dizer enquanto o pedido corre. */
  rotuloPendente: string;
  variante?: 'principal' | 'perigo';
}

export function Acao({ children, pendente, rotuloPendente, variante = 'principal' }: AcaoProps) {
  return (
    <button
      type="submit"
      className={`${estilos.acao} ${variante === 'perigo' ? estilos.acaoPerigo : ''}`}
      disabled={pendente}
    >
      {pendente ? rotuloPendente : children}
    </button>
  );
}

/** Ligacoes de saida ao fundo de um ecra: nenhum ecra e um beco (CA-008.4). */
export function Saidas({ children }: { children: ReactNode }) {
  return <p className={estilos.saidas}>{children}</p>;
}
